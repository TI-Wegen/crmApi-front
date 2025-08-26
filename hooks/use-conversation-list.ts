"use client"

import {useState, useCallback, useEffect, useRef} from "react"
import {formatMessageTimestamp} from "@/utils/date-formatter"
import {useConversationSignalREvents} from "./use-conversation-signalR-events"
import {ConversationsService} from "@/services/conversations"
import {
    Conversation,
    ConversationListItemDto,
    ConversationSearchParams,
    ConversationSummaryDto
} from "@/types/conversa";
import {useAuth} from "@/hooks/use-auth";

interface ConversationStatusChange {
    conversationId: string;
    status: Conversation["status"];
}

interface UseConversationListReturn {
    conversations: Conversation[]
    loading: boolean
    error: string | null
    pagination: {
        pageNumber: number
        pageSize: number
        total: number
    }
    loadConversations: (params?: ConversationSearchParams, showLoading?: boolean) => Promise<void>
    markAsRead: (conversationId: string) => void
    filterByStatus: (status: "AguardandoNaFila" | "EmAtendimento" | "Resolvida" | null) => void
    searchConversations: (termoBusca: string) => void
    signalRConnected: boolean
}

function convertDtoToConversation(dto: ConversationListItemDto): Conversation {
    return {
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
        unread: 0,
        contatoId: dto.contatoId,
    }
}

export function useConversationList(activeConversationId: string | null, onConversationUpdate?: () => void): UseConversationListReturn {
    const {isAuthenticated, user} = useAuth()
    const [conversations, setConversations] = useState<Conversation[]>([])
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [pagination, setPagination] = useState({
        pageNumber: 1,
        pageSize: 50,
        total: 0,
    })

    const conversationIdsRef = useRef(new Set<string>())
    const lastUpdateRef = useRef<number>(0)

    const updateConversationInList = useCallback((conversationId: string, getUpdatedConversation: (prev?: Conversation) => Partial<Conversation>) => {
        setConversations((prevList) => {
            const existing = prevList.find((c) => c.id === conversationId)
            const updates = getUpdatedConversation(existing)

            if (!existing && Object.keys(updates).length === 0) return prevList

            const updatedConversation = {
                ...(existing || {id: conversationId}),
                ...updates,
            } as Conversation


            const filtered = prevList.filter((c) => c.id !== conversationId)
            if (updates.lastMessage || updates.status) {
                return [updatedConversation, ...filtered]
            }
            const originalIndex = prevList.findIndex((c) => c.id === conversationId)
            if (originalIndex >= 0) {
                const newList = [...filtered]
                newList.splice(originalIndex, 0, updatedConversation)
                return newList
            }
            return [updatedConversation, ...filtered]
        })
    }, [])

    const markAsRead = useCallback((conversationId: string) => {
        setConversations((prev) => prev.map((conv) => (conv.id === conversationId ? {...conv, unread: 0} : conv)))
    }, [])

    const addOrUpdateConversation = useCallback((newConversation: Conversation) => {
        const now = Date.now()
        if (now - lastUpdateRef.current < 100) return
        lastUpdateRef.current = now

        setConversations((prev) => {
            const filtered = prev.filter((c) => c.id !== newConversation.id)
            conversationIdsRef.current.add(newConversation.id)
            return [newConversation, ...filtered]
        })
    }, [])

    const loadConversations = useCallback(async (params?: ConversationSearchParams, showLoading = true) => {
        if (!isAuthenticated) {
            setConversations([])
            conversationIdsRef.current.clear()
            return
        }

        if (showLoading) setLoading(true)
        setError(null)

        try {
            const dtos = (await ConversationsService.listarConversas({
                pageNumber: 1,
                pageSize: 1000,
                setorId: user?.setorId,
                ...params,
            })) as ConversationListItemDto[]
            dtos.sort(
                (a, b) => new Date(b.ultimaMensagemTimestamp).getTime() - new Date(a.ultimaMensagemTimestamp).getTime()
            )

            const frontendConversations = dtos.map(convertDtoToConversation)
            conversationIdsRef.current.clear()
            frontendConversations.forEach((conv) => conversationIdsRef.current.add(conv.id))

            setConversations(frontendConversations)
        } catch (err) {
            setError(err instanceof Error ? err.message : "Error loading conversations")
            setConversations([])
            conversationIdsRef.current.clear()
        } finally {
            if (showLoading) setLoading(false)
        }
    }, [isAuthenticated, user?.setorId])

    const handleStatusChange = useCallback((data: ConversationStatusChange) => {
        updateConversationInList(data.conversationId, () => ({status: data.status}))
    }, [updateConversationInList])

    const handleNewMessage = useCallback((message: any) => {


        if (!message.conversationId) return

        if(onConversationUpdate) {
            onConversationUpdate()
        }

        // updateConversationInList(message.conversationId, (prevConv) => {
        //     const shouldIncrementUnread =
        //         message.remetenteTipo === "Cliente" &&
        //         message.conversationId !== activeConversationId
        //
        //     return {
        //         lastMessage: message.texto,
        //         timestamp: formatMessageTimestamp(),
        //         unread: shouldIncrementUnread ? (prevConv?.unread || 0) + 1 : prevConv?.unread || 0,
        //     }
        // })
    }, [updateConversationInList, activeConversationId])

    const handleSignalRError = useCallback((error: string) => {
        console.error("SignalR error:", error)
        setError(error)
    }, [setError])

    const isSignalRConnected = useConversationSignalREvents({
        groups: ["UnassignedQueue"],
        onNewConversation: (summaryDto: ConversationSummaryDto) => {
            const newConversation: Conversation = {
                id: summaryDto.id,
                contatoNome: summaryDto.contatoNome,
                lastMessage: summaryDto.ultimaMensagemPreview,
                timestamp: formatMessageTimestamp(summaryDto.ultimaMensagemTimestamp),
                avatar: `/placeholder.svg?height=40&width=40`,
                status: summaryDto.status,
                agentName: summaryDto.agenteNome || undefined,
                atendimentoId: "",
                sessaoWhatsappAtiva: false,
                sessaoWhatsappExpiraEm: null,
                unread: 0,
                contatoId: summaryDto.contatoId,
            };
            addOrUpdateConversation(newConversation);
        },
        onNewMessage: handleNewMessage,
        onStatusChange: handleStatusChange,
        onError: handleSignalRError,
    })

    const filterByStatus = useCallback((status: "AguardandoNaFila" | "EmAtendimento" | "Resolvida" | null) => {
        if (status === null) {
            loadConversations({}, false)
        } else {
            loadConversations({status}, false)
        }
    }, [loadConversations])

    const searchConversations = useCallback((termoBusca: string) => {
        loadConversations({searchTerm: termoBusca} as ConversationSearchParams, false)
    }, [loadConversations])

    useEffect(() => {
        if (isAuthenticated) {
            loadConversations()
        }
    }, [isAuthenticated, loadConversations])

    return {
        conversations,
        loading,
        error,
        pagination,
        loadConversations,
        markAsRead,
        filterByStatus,
        searchConversations,
        signalRConnected: isSignalRConnected,
    }
}