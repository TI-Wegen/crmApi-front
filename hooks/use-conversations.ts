import React, {SetStateAction, useCallback, useEffect, useRef, useState} from "react"
import {ConversationsService} from "@/services/conversations"
import {signalRService} from "@/services/signalr"
import {messageMapper} from "@/mappers/message-mapper"
import {Conversation, ConversationDetailsDto} from "@/types/conversa"
import type {Message, MessageDto, MessageWithConversationIdDto} from "@/types/messagem"
import {sortMessagesByDate, sortMessagesByTimestamp} from "@/utils/sort-messages-by-date"
import {useSignalRConnectionStatus} from "@/hooks/use-signalR-connection-status";

export interface UseConversationsReturn {
    selectedConversation: string | null
    conversationDetails: ConversationDetailsDto | null
    messages: Message[]
    loading: boolean
    error: string | null
    isConnected: boolean
    selectConversation: (conversationId: string | null) => Promise<void>
    sendMessage: (content: string, file?: File) => Promise<void>
    loadConversation: (conversationId: string) => Promise<void>
    startConversation: (contactId: string, templateName: string, bodyParameters: string[]) => Promise<void>
    loadConversationByContact: (contactId: string, page: number) => Promise<void>
    resolveConversation: (id: string) => Promise<unknown>
    loadMoreMessages: () => Promise<void>
    hasMoreMessages: boolean,
    setConversationDetails: React.Dispatch<SetStateAction<ConversationDetailsDto | null>>
}

export function useConversations(): UseConversationsReturn {
    const {isConnected} = useSignalRConnectionStatus()
    const [selectedConversation, setSelectedConversation] = useState<string | null>(null)
    const [conversationDetails, setConversationDetails] = useState<ConversationDetailsDto | null>(null)
    const [messages, setMessages] = useState<Message[]>([])
    const [loading, setLoading] = useState<boolean>(false)
    const [error, setError] = useState<string | null>(null)
    const messageIdsRef = useRef<Set<string>>(new Set<string>())
    const [hasMoreMessages, setHasMoreMessages] = useState<boolean>(true)

    const loadConversation = useCallback(async (conversationId: string, page: number = 1): Promise<void> => {
        setLoading(page === 1)
        setError(null)

        try {
            if (page === 1) {
                messageIdsRef.current.clear()
            }

            const details: ConversationDetailsDto = await ConversationsService.buscarConversa(
                conversationId,
                page
            ) as ConversationDetailsDto

            setConversationDetails(details)

            setHasMoreMessages(details.hasNextPage)

            const frontendMessages: Message[] = details.mensagens.map(messageMapper.fromDto)

            const uniqueMessages = frontendMessages.filter(msg => !messageIdsRef.current.has(msg.id))

            uniqueMessages.forEach((msg: Message): void => {
                messageIdsRef.current.add(msg.id)
            })

            setMessages(prevMessages =>
                page === 1
                    ? sortMessagesByTimestamp(uniqueMessages)
                    : [...prevMessages, ...sortMessagesByTimestamp(uniqueMessages)]
            )

            if (page === 1 && isConnected) {
                try {
                    await signalRService.joinConversationGroup(conversationId)
                } catch (signalRError: unknown) {
                    console.warn("⚠️ Error joining SignalR group:", signalRError)
                }
            }
        } catch (err: unknown) {
            setError(err instanceof Error ? err.message : "Error loading conversation")
            console.error("❌ Error loading conversation:", err)
        } finally {
            if (page === 1) {
                setLoading(false)
            }
        }
    }, [isConnected])

    const loadConversationByContact = useCallback(async (contactId: string, page: number = 1): Promise<void> => {
        setLoading(page === 1)
        setError(null)

        try {
            if (page === 1) {
                messageIdsRef.current.clear()
            }

            const details: ConversationDetailsDto = await ConversationsService.buscarConversaPorContato(
                contactId,
                page
            ) as unknown as ConversationDetailsDto

            if (selectedConversation && isConnected) {
                try {
                    await signalRService.leaveConversationGroup(selectedConversation)
                } catch (error: unknown) {
                    console.warn("⚠️ Error leaving SignalR group:", error)
                }
            }

            setSelectedConversation(details.id)
            setHasMoreMessages(true)

            setConversationDetails(details)

            setHasMoreMessages(details.hasNextPage)

            const frontendMessages: Message[] = details.mensagens.map(messageMapper.fromDto)

            const uniqueMessages = frontendMessages.filter(msg => !messageIdsRef.current.has(msg.id))

            uniqueMessages.forEach((msg: Message): void => {
                messageIdsRef.current.add(msg.id)
            })

            setMessages(prevMessages =>
                page === 1
                    ? sortMessagesByTimestamp(uniqueMessages)
                    : [...prevMessages, ...sortMessagesByTimestamp(uniqueMessages)]
            )

            if (page === 1 && isConnected) {
                try {
                    await signalRService.joinConversationGroup(details.id)
                } catch (signalRError: unknown) {
                    console.warn("⚠️ Error joining SignalR group:", signalRError)
                }
            }
        } catch (err: unknown) {
            setError(err instanceof Error ? err.message : "Error loading conversation")
            console.error("❌ Error loading conversation:", err)
        } finally {
            if (page === 1) {
                setLoading(false)
            }
        }
    }, [isConnected]);

    const loadMoreMessages = useCallback(async () => {
        if (!selectedConversation || !conversationDetails || hasMoreMessages) return;

        try {
            const nextPage = conversationDetails.currentPage + 1;
            await loadConversation(selectedConversation, nextPage);
        } catch (err) {
            setError(err instanceof Error ? err.message : "Error loading more messages");
            console.error("❌ Error loading more messages:", err);
        }
    }, [selectedConversation, conversationDetails, hasMoreMessages, loadConversation]);

    const sendMessage = useCallback(async (content: string, file?: File): Promise<void> => {
        if (!selectedConversation) return

        try {
            const formData = new FormData()
            formData.append("Texto", content)
            formData.append("RemetenteTipo", "Agente")

            if (file) {
                formData.append("Anexo", file)
            }

            const _ = (await ConversationsService.adicionarMensagem(selectedConversation, formData)) as MessageDto

            loadConversation(selectedConversation, 1)
        } catch (err: unknown) {
            setError(err instanceof Error ? err.message : "Error sending message")
            console.error("❌ Error sending message:", err)
        }
    }, [selectedConversation])

    const startConversation = useCallback(async (contactId: string, templateName: string, bodyParameters: string[]): Promise<void> => {
        try {
            const requestData = {
                contactId,
                templateName,
                bodyParameters: bodyParameters
            };

            await ConversationsService.iniciarConversaPorTemplate(requestData);
        } catch (err: any) {
            console.error("❌ Erro detalhado ao iniciar conversa:", {
                message: err.message,
                stack: err.stack,
                contactId,
                templateName
            });

            const errorMessage = err.message || "Erro desconhecido ao iniciar conversa";
            throw new Error(`Falha ao iniciar conversa: ${errorMessage}`);
        }
    }, [])

    const resolveConversation = (id: string) => {
        return ConversationsService.resolverConversa(id)
    }

    useEffect(() => {
        if (!isConnected || !selectedConversation) return

        const handleNewMessage = (msgDto: MessageWithConversationIdDto): void => {
            if (msgDto.conversationId !== selectedConversation) return

            const frontendMessage: Message = messageMapper.fromSignalR(msgDto)

            if (!messageIdsRef.current.has(frontendMessage.id)) {
                messageIdsRef.current.add(frontendMessage.id)
                setMessages((prev: Message[]): Message[] =>
                    sortMessagesByDate([...prev, frontendMessage])
                )
            }
        }

        const unsubscribe = signalRService.on("ReceiveMessage", handleNewMessage)
        return () => {
            unsubscribe()
        }
    }, [isConnected, selectedConversation])

    const selectConversation = useCallback(async (conversationId: string | null): Promise<void> => {
        if (selectedConversation && isConnected) {
            try {
                await signalRService.leaveConversationGroup(selectedConversation)
            } catch (error: unknown) {
                console.warn("⚠️ Error leaving SignalR group:", error)
            }
        }

        setSelectedConversation(conversationId)
        setHasMoreMessages(true)

        if (conversationId) {
            await loadConversation(conversationId)
        } else {
            setConversationDetails(null)
            setMessages([])
            messageIdsRef.current.clear()
        }
    }, [selectedConversation, loadConversation, isConnected])

    return {
        selectedConversation,
        conversationDetails,
        messages,
        loading,
        error,
        isConnected,
        selectConversation,
        sendMessage,
        loadConversation,
        startConversation,
        resolveConversation,
        loadMoreMessages,
        hasMoreMessages,
        setConversationDetails,
        loadConversationByContact
    }
}