"use client"

import {useCallback, useEffect, useRef, useState} from "react"
import {formatMessageTimestamp} from "@/utils/date-formatter"
import {ConversationsService} from "@/services/conversations"
import {signalRService} from "@/services/signalr"
import {useSignalR} from "@/contexts/signalr-context"
import {Message, MessageDto, MessageWithConversationIdDto} from "@/types/messagem";
import {Conversation, ConversationDetailsDto, ConversationListItemDto} from "@/types/conversa";

export const createFrontendMessage = (messageDto: MessageDto): Message => {
    const date = new Date(messageDto.timestamp);

    let formattedTimestamp: string;
    let adjustedDate: string;

    if (messageDto.remetenteTipo === "Cliente") {
        adjustedDate = date.toISOString()
        formattedTimestamp = date.toLocaleTimeString("pt-BR", {
            hour: "2-digit",
            minute: "2-digit",
            hour12: false,
        })
    } else {
        formattedTimestamp = formatMessageTimestamp(messageDto.timestamp)

        let messageDate: Date
        const normalized = messageDto.timestamp.endsWith("Z") ? messageDto.timestamp.slice(0, -1) : messageDto.timestamp
        messageDate = new Date(normalized)

        adjustedDate = messageDate.toISOString()
    }

    return {
        id: messageDto.id,
        content: messageDto.texto,
        timestamp: formattedTimestamp,
        isFromClient: messageDto.remetenteTipo === "Cliente",
        date: adjustedDate,
        anexoUrl: messageDto.anexoUrl,
    };
}

export const createFrontendMessageFromSignalR = (messageDto: MessageWithConversationIdDto): Message => ({
    id: messageDto.id,
    content: messageDto.texto,
    timestamp: formatMessageTimestamp(messageDto.timestamp),
    isFromClient: messageDto.remetenteTipo === "Cliente",
    date: new Date(messageDto.timestamp).toISOString(),
    anexoUrl: messageDto.anexoUrl,
})

export const createFrontendConversation = (dto: ConversationListItemDto): Conversation => ({
    id: dto.id,
    contatoNome: dto.contatoNome,
    lastMessage: dto.ultimaMensagemPreview,
    timestamp: formatMessageTimestamp(dto.ultimaMensagemTimestamp),
    avatar: `/placeholder.svg?height=40&width=40`,
    status: dto.status,
    agentName: dto.agenteNome || undefined,
    atendimentoId: dto.atendimentoId || "",
    sessaoWhatsappAtiva: dto.sessaoWhatsappAtiva,
    sessaoWhatsappExpiraEm: dto.sessaoWhatsappExpiraEm || null,
    contatoId: dto.contatoId,
    unread: dto.mensagensNaoLidas || 0,
})

const sortMessagesByTimestamp = (messages: Message[]): Message[] => {
    return [...messages].sort((a, b) =>
        new Date(a.date).getTime() - new Date(b.date).getTime()
    );
};

export function useConversations() {
    const { isConnected: signalRConnected } = useSignalR()
    const [selectedConversation, setSelectedConversation] = useState<string | null>(null)
    const [conversationDetails, setConversationDetails] = useState<ConversationDetailsDto | null>(null)
    const [messages, setMessages] = useState<Message[]>([])
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const messageIdsRef = useRef(new Set<string>())

    const convertToFrontendFormat = useCallback((dto: ConversationListItemDto): Conversation => {
        return createFrontendConversation(dto)
    }, [])

    const convertMessagesToFrontend = useCallback((dtoMessages: MessageDto[]): Message[] => {
        return dtoMessages.map(createFrontendMessage)
    }, [])

    const loadConversation = useCallback(async (conversationId: string) => {
        setLoading(true)
        setError(null)
        messageIdsRef.current.clear()

        try {
            const details = await ConversationsService.buscarConversa(conversationId) as ConversationDetailsDto

            setConversationDetails(details)
            const frontendMessages = convertMessagesToFrontend(details.mensagens)
            // Ordena as mensagens ao carregar a conversa
            const sortedMessages = sortMessagesByTimestamp(frontendMessages)
            setMessages(sortedMessages)

            sortedMessages.forEach((msg) => messageIdsRef.current.add(msg.id))

            if (signalRConnected) {
                try {
                    await signalRService.joinConversationGroup(conversationId)
                } catch (signalRError) {
                    console.warn("⚠️ Error joining SignalR group:", signalRError)
                }
            }
        } catch (err) {
            setError(err instanceof Error ? err.message : "Error loading conversation")
            console.error("❌ Error loading conversation:", err)
        } finally {
            setLoading(false)
        }
    }, [convertMessagesToFrontend, signalRConnected])

    const sendMessage = useCallback(async (content: string, file?: File) => {
        if (!selectedConversation) return

        try {
            const formData = new FormData()
            formData.append("Texto", content)
            formData.append("RemetenteTipo", "Agente")

            if (file) {
                formData.append("Anexo", file)
            }

            const newMessage = await ConversationsService.adicionarMensagem(
                selectedConversation,
                formData
            ) as MessageDto

            const frontendMessage: Message = {
                id: newMessage.id,
                content: newMessage.texto,
                timestamp: new Date(newMessage.timestamp).toLocaleTimeString("pt-BR", {
                    hour: "2-digit",
                    minute: "2-digit"
                }),
                isFromClient: false,
                date: new Date(newMessage.timestamp).toISOString(),
                anexoUrl: newMessage.anexoUrl,
            }

            if (!messageIdsRef.current.has(frontendMessage.id)) {
                messageIdsRef.current.add(frontendMessage.id)
                setMessages((prev) => {
                    const updatedMessages = [...prev, frontendMessage];
                    return sortMessagesByTimestamp(updatedMessages);
                })
            }
        } catch (err) {
            setError(err instanceof Error ? err.message : "Error sending message")
            console.error("❌ Error sending message:", err)
        }
    }, [selectedConversation])

    const startConversation = useCallback(async (
        contactId: string,
        templateName: string,
        bodyParameters: string[]
    ) => {
        try {
            const response = await ConversationsService.iniciarConversaPorTemplate({
                contactId,
                templateName,
                bodyParameters,
            })

            if (!response) {
                throw new Error("Error starting conversation with template")
            }

            return response
        } catch (err) {
            console.error("❌ Error starting conversation with template:", err)
            throw err
        }
    }, [])

    useEffect(() => {
        if (!signalRConnected || !selectedConversation) {
            return
        }

        const handleNewMessage = (messageWithConvId: MessageWithConversationIdDto) => {
            if (messageWithConvId.conversationId !== selectedConversation) {
                console.log("📨 Message is not for current conversation, ignoring in chat")
                return
            }

            const frontendMessage: Message = createFrontendMessageFromSignalR(messageWithConvId)

            if (!messageIdsRef.current.has(frontendMessage.id)) {
                messageIdsRef.current.add(frontendMessage.id)
                setMessages((prev) => {
                    const updatedMessages = [...prev, frontendMessage];
                    return sortMessagesByTimestamp(updatedMessages);
                })
            }
        }

        const unsubscribe = signalRService.on("ReceiveMessage", handleNewMessage)

        return () => {
            unsubscribe()
            console.log("📨 Cleanup: Removing SignalR message listener")
        }
    }, [signalRConnected, selectedConversation])

    const selectConversation = useCallback(async (conversationId: string | null) => {
        if (selectedConversation && signalRConnected) {
            try {
                await signalRService.leaveConversationGroup(selectedConversation)
            } catch (error) {
                console.warn("⚠️ Error leaving SignalR group:", error)
            }
        }

        setSelectedConversation(conversationId)

        if (conversationId) {
            await loadConversation(conversationId)
        } else {
            setConversationDetails(null)
            setMessages([])
            messageIdsRef.current.clear()
        }
    }, [selectedConversation, loadConversation, signalRConnected])

    useEffect(() => {
        return () => {
            if (selectedConversation && signalRConnected) {
                signalRService.leaveConversationGroup(selectedConversation)
            }
        }
    }, [selectedConversation, signalRConnected])

    const resolveConversation = useCallback((id: string) => {
        return ConversationsService.resolverConversa(id)
    }, [])

    const assignAgent = useCallback((conversationId: string, agentId: string) => {
        return ConversationsService.atribuirAgente(conversationId, agentId)
    }, [])

    const transferConversation = useCallback((
        conversationId: string,
        data: { novoAgenteId?: string; novoSetorId?: string }
    ) => {
        return ConversationsService.transferirConversa(conversationId, data)
    }, [])

    return {
        selectedConversation,
        conversationDetails,
        messages,
        loading,
        error,
        signalRConnected,
        selectConversation,
        sendMessage,
        startConversation,
        resolveConversation,
        assignAgent,
        transferConversation,
        convertToFrontendFormat,
        convertMessagesToFrontend,
    }
}
