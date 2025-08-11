"use client"

import { useState, useCallback, useEffect, useRef } from "react"
import { useAuth } from "@/contexts/auth-context"
import { formatMessageTimestamp } from "@/utils/date-formatter"
import type {
  Conversation,
  ConversationListItemDto,
  ConversationSearchParams,
  ConversationSummaryDto,
} from "@/types/crm"
import { useConversationSignalREvents } from "./useConversationSignalREvents"
import { ConversationsService } from "@/services/conversations"

function convertDtoToConversation(dto: ConversationListItemDto): Conversation {
  return {
    id: dto.id,
    contatoNome: dto.contatoNome,
    lastMessage: dto.ultimaMensagemPreview,
    timestamp: formatMessageTimestamp(dto.ultimaMensagemTimestamp),
    // unread: dto.mensagensNaoLidas || 0,
    avatar: `/placeholder.svg?height=40&width=40`,
    status: dto.status,
    agentName: dto.agenteNome || undefined,
    atendimentoId: dto.atendimentoId || "",
    sessaoWhatsappAtiva: dto.sessaoWhatsappAtiva,
    sessaoWhatsappExpiraEm: dto.sessaoWhatsappExpiraEm || null,
  }
}
function convertSummaryToConversation(dto: ConversationSummaryDto): Conversation {
  return {
    id: dto.id,
    contatoNome: dto.contatoNome,
    lastMessage: dto.ultimaMensagemPreview,
    timestamp: formatMessageTimestamp(dto.ultimaMensagemTimestamp),
    // unread: dto.mensagensNaoLidas,
    avatar: `/placeholder.svg?height=40&width=40`,
    status: dto.status,
    agentName: dto.agenteNome || undefined,
  }
}

export function useConversationList(activeConversationId: string | null) {
  const { isAuthenticated, user } = useAuth()
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [pagination, setPagination] = useState({
    pageNumber: 1,
    pageSize: 50,
    total: 0,
  })

  // Ref para controlar atualizações
  const conversationIdsRef = useRef(new Set<string>())
  const lastUpdateRef = useRef<number>(0)

  // Função otimizada para atualizar conversa na lista
 const updateConversationInList = useCallback(
    (conversationId: string, getUpdatedConversation: (prev?: Conversation) => Partial<Conversation>) => {
      setConversations((prevList) => {
        const existing = prevList.find((c) => c.id === conversationId)
        const updates = getUpdatedConversation(existing)

        if (!existing && Object.keys(updates).length === 0) return prevList

        const updatedConversation = {
          ...(existing || { id: conversationId }),
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
    },
    [setConversations], 
  )

const markAsRead = useCallback((conversationId: string) => {
    setConversations((prev) => prev.map((conv) => (conv.id === conversationId ? { ...conv, unread: 0 } : conv)))
  }, [setConversations]) 

  const addOrUpdateConversation = useCallback((newConversation: Conversation) => {
    // Throttle para evitar muitas atualizações
    const now = Date.now()
    if (now - lastUpdateRef.current < 100) return // 100ms throttle
    lastUpdateRef.current = now

    setConversations((prev) => {
      const filtered = prev.filter((c) => c.id !== newConversation.id)
      conversationIdsRef.current.add(newConversation.id)
      return [newConversation, ...filtered]
    })
  }, [setConversations])

  const updateConversationStatus = useCallback(
    (conversationId: string, status: Conversation["status"]) => {
      updateConversationInList(conversationId, () => ({ status }))
    },
    [updateConversationInList],
  )

  const loadConversations = useCallback(
    async (params?: ConversationSearchParams, showLoading = true) => {
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

        // Ordenar por timestamp
        dtos.sort(
          (a, b) => new Date(b.ultimaMensagemTimestamp).getTime() - new Date(a.ultimaMensagemTimestamp).getTime(),
        )

        const frontendConversations = dtos.map(convertDtoToConversation)


        // Atualizar ref com IDs das conversas
        conversationIdsRef.current.clear()
        frontendConversations.forEach((conv) => conversationIdsRef.current.add(conv.id))

        setConversations(frontendConversations)
      } catch (err) {
        setError(err instanceof Error ? err.message : "Erro ao carregar conversas")
        setConversations([])
        conversationIdsRef.current.clear()
      } finally {
        if (showLoading) setLoading(false)
      }
    },
    [isAuthenticated, user?.setorId],
  )

    const handleStatusChange = useCallback((data: { conversationId: string; status: Conversation["status"] }) => {
    updateConversationInList(data.conversationId, () => ({ status: data.status }))
  }, [updateConversationInList])

 const handleNewConversation = useCallback(
    (convoDto: ConversationListItemDto) => {
      const newConversation = convertDtoToConversation(convoDto)
      addOrUpdateConversation(newConversation)
    },
    [addOrUpdateConversation],
  )

  const handleNewMessage = useCallback(
    (message: any) => {
      if (!message.conversationId) return
 updateConversationInList(message.conversationId, (prevConv) => {
        // A lógica para incrementar o contador `unread`
        const shouldIncrementUnread =
          message.remetenteTipo === "Cliente" && // A mensagem é do cliente
          message.conversationId !== activeConversationId // E NÃO é para o chat que já está aberto

        return {
          lastMessage: message.texto,
          timestamp: formatMessageTimestamp(message.timestamp),
          // Se a condição for verdadeira, incrementa. Senão, mantém o valor que já existia.
          unread: shouldIncrementUnread ? (prevConv?.unread || 0) + 1 : prevConv?.unread || 0,
        }
      })
    },
    [updateConversationInList, activeConversationId],
  )

  const handleSignalRError = useCallback((error: string) => {
    console.error("❌ Erro no SignalR:", error)
    setError(error)
  }, [setError])

  const isSignalRConnected = useConversationSignalREvents({
    groups: ["UnassignedQueue"],

    onNewConversation: handleNewConversation,
    onNewMessage: handleNewMessage,
    onStatusChange: handleStatusChange,
    onError: handleSignalRError,
  })

  
  // Funções de filtro otimizadas
  const filterByStatus = useCallback(
    (status: Conversation["status"]) => {
      loadConversations({ status }, false)
    },
    [loadConversations],
  )

  const searchConversations = useCallback(
    (termoBusca: string) => {
      loadConversations({ searchTerm: termoBusca }, false)
    },
    [loadConversations],
  )

  // Carregar conversas iniciais
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
