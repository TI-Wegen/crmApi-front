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
import {conversationMapper} from "@/mappers/conversation-mapper";

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
    hasMore: boolean
    loadConversations: (params?: ConversationSearchParams, showLoading?: boolean) => Promise<void>
    loadMoreConversations: () => Promise<void>
    markAsRead: (conversationId: string) => void
    filterByStatus: (status: "AguardandoNaFila" | "EmAtendimento" | "Resolvida" | "EmAutoAtendimento" | "AguardandoRespostaCliente" | null) => void
    searchConversations: (termoBusca: string) => void
    signalRConnected: boolean
    refreshConversations: () => Promise<void>
    setConversations: React.Dispatch<React.SetStateAction<Conversation[]>>
}


export function useConversationList(activeConversationId: string | null, onConversationUpdate?: () => void): UseConversationListReturn {
    const {isAuthenticated, user} = useAuth()
    const [conversations, setConversations] = useState<Conversation[]>([])
    const [allConversations, setAllConversations] = useState<Conversation[]>([])
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [pagination, setPagination] = useState({
        pageNumber: 1,
        pageSize: 20,
        total: 0,
    })
    const [hasMore, setHasMore] = useState<boolean>(true)
    const [currentFilter, setCurrentFilter] = useState<ConversationSearchParams>({})

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

        setAllConversations(prev => {
            const existing = prev.find((c) => c.id === conversationId)
            const updates = getUpdatedConversation(existing)

            if (!existing && Object.keys(updates).length === 0) return prev

            const updatedConversation = {
                ...(existing || {id: conversationId}),
                ...updates,
            } as Conversation

            const filtered = prev.filter((c) => c.id !== conversationId)
            if (updates.lastMessage || updates.status) {
                return [updatedConversation, ...filtered]
            }
            const originalIndex = prev.findIndex((c) => c.id === conversationId)
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
        setAllConversations((prev) => prev.map((conv) => (conv.id === conversationId ? {...conv, unread: 0} : conv)))
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
        
        setAllConversations((prev) => {
            const filtered = prev.filter((c) => c.id !== newConversation.id)
            conversationIdsRef.current.add(newConversation.id)
            return [newConversation, ...filtered]
        })
    }, [])

    const loadConversations = useCallback(async (params?: ConversationSearchParams, showLoading = true) => {
        if (!isAuthenticated) {
            setConversations([])
            setAllConversations([])
            conversationIdsRef.current.clear()
            return
        }

        if (showLoading) setLoading(true)
        setError(null)

        try {
            const requestParams = {
                pageNumber: 1,
                pageSize: 20,
                setorId: user?.setorId,
                ...params,
            }

            const response: any = await ConversationsService.listarConversas(requestParams)

            const dtos = Array.isArray(response.data) ? response.data : response
            const total = response.total || dtos.length
            const pageNumber = response.pageNumber || requestParams.pageNumber
            const pageSize = response.pageSize || requestParams.pageSize

            dtos.sort(
                (a: ConversationListItemDto, b: ConversationListItemDto) =>
                    new Date(b.ultimaMensagemTimestamp).getTime() - new Date(a.ultimaMensagemTimestamp).getTime()
            )

            const frontendConversations = dtos.map(conversationMapper.fromListItemDto)
            conversationIdsRef.current.clear()
            frontendConversations.forEach((conv: any) => conversationIdsRef.current.add(conv.id))

            setAllConversations(frontendConversations)
            setConversations(frontendConversations)
            setPagination({
                pageNumber,
                pageSize,
                total
            })
            setHasMore(frontendConversations.length === pageSize)
            setCurrentFilter(params || {})
        } catch (err) {
            setError(err instanceof Error ? err.message : "Error loading conversations")
            setConversations([])
            setAllConversations([])
            conversationIdsRef.current.clear()
            setHasMore(false)
        } finally {
            if (showLoading) setLoading(false)
        }
    }, [isAuthenticated, user?.setorId])

    const loadMoreConversations = useCallback(async (): Promise<void> => {
        if (!isAuthenticated || loading || !hasMore) return

        setLoading(true)
        setError(null)

        try {
            const nextPage = pagination.pageNumber + 1
            const requestParams = {
                pageNumber: nextPage,
                pageSize: pagination.pageSize,
                setorId: user?.setorId,
                ...currentFilter,
            }

            const response: any = await ConversationsService.listarConversas(requestParams)

            const dtos = Array.isArray(response.data) ? response.data : response
            const total = response.total || (pagination.total + dtos.length)
            const pageSize = response.pageSize || requestParams.pageSize

            dtos.sort(
                (a: ConversationListItemDto, b: ConversationListItemDto) =>
                    new Date(b.ultimaMensagemTimestamp).getTime() - new Date(a.ultimaMensagemTimestamp).getTime()
            )

            const frontendConversations = dtos.map(conversationMapper.fromListItemDto)

            setAllConversations(prev => {
                const newConversations = [...prev]
                frontendConversations.forEach((conv: any) => {
                    if (!conversationIdsRef.current.has(conv.id)) {
                        conversationIdsRef.current.add(conv.id)
                        newConversations.push(conv)
                    }
                })
                return newConversations
            })
            
            setConversations(prev => {
                const newConversations = [...prev]
                frontendConversations.forEach((conv: any) => {
                    if (!conversationIdsRef.current.has(conv.id)) {
                        conversationIdsRef.current.add(conv.id)
                        newConversations.push(conv)
                    }
                })
                return newConversations
            })

            setPagination(prev => ({
                ...prev,
                pageNumber: nextPage,
                total
            }))
            setHasMore(frontendConversations.length === pageSize)
        } catch (err) {
            setError(err instanceof Error ? err.message : "Error loading more conversations")
            console.error("Error loading more conversations:", err)
        } finally {
            setLoading(false)
        }
    }, [isAuthenticated, loading, hasMore, pagination, currentFilter, user?.setorId])

    const refreshConversations = useCallback(async (): Promise<void> => {
        await loadConversations(currentFilter, true)
    }, [loadConversations, currentFilter])

    const handleStatusChange = useCallback((data: ConversationStatusChange) => {
        updateConversationInList(data.conversationId, () => ({status: data.status}))
    }, [updateConversationInList])

    const handleNewMessage = useCallback((message: any) => {
        if (!message.conversationId) return

        if (onConversationUpdate) {
            onConversationUpdate()
        }

        updateConversationInList(message.conversationId, (prevConv) => {
            const shouldIncrementUnread =
                message.remetenteTipo === "Cliente" &&
                message.conversationId !== activeConversationId

            return {
                lastMessage: message.texto,
                timestamp: formatMessageTimestamp(message.timestamp),
                unread: shouldIncrementUnread ? (prevConv?.unread || 0) + 1 : prevConv?.unread || 0,
            }
        })
    }, [updateConversationInList, activeConversationId, onConversationUpdate])

    const handleSignalRError = useCallback((error: string) => {
        console.error("SignalR error:", error)
        setError(error)
    }, [setError])

    const isSignalRConnected = useConversationSignalREvents({
        groups: ["UnassignedQueue"],
        onNewConversation: (summaryDto: ConversationSummaryDto) => {
            const newConversation: Conversation = conversationMapper.fromSummaryDto(summaryDto);
            addOrUpdateConversation(newConversation);
        },
        onNewMessage: handleNewMessage,
        onStatusChange: handleStatusChange,
        onError: handleSignalRError,
    })

    const filterByStatus = useCallback((status: "AguardandoNaFila" | "EmAtendimento" | "Resolvida" | "EmAutoAtendimento" | "AguardandoRespostaCliente" | null) => {
        const params: ConversationSearchParams = status === null
            ? {}
            : {status}

        setCurrentFilter(params)
        loadConversations(params, false)
    }, [loadConversations])

    const searchConversations = useCallback((termoBusca: string) => {
        if (!termoBusca) {
            let filtered = [...allConversations]

            if (currentFilter.status) {
                filtered = filtered.filter(conversation => conversation.status === currentFilter.status)
            }
            
            setConversations(filtered)
            return
        }

        let filteredConversations = allConversations.filter(conversation => {
            if (currentFilter.status && conversation.status !== currentFilter.status) {
                return false
            }

            const searchLower = termoBusca.toLowerCase()
            return (
                conversation.contatoNome.toLowerCase().includes(searchLower) ||
                (conversation.lastMessage && conversation.lastMessage.toLowerCase().includes(searchLower))
            )
        })

        setConversations(filteredConversations)
    }, [allConversations, currentFilter])

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
        hasMore,
        loadConversations,
        loadMoreConversations,
        markAsRead,
        filterByStatus,
        searchConversations,
        signalRConnected: isSignalRConnected,
        refreshConversations,
        setConversations
    }
}