"use client"

import { useState, useCallback, useEffect } from "react"
import { ApiService } from "@/services/api"
import { signalRService } from "@/services/signalr"
import { useAuth } from "@/contexts/auth-context"
import type {
  ConversationDto,
  Conversation,
  ConversationListItemDto,
  ConversationSearchParams,
  MessageDto,
} from "@/types/crm"

export function useConversationList() {
  const { isAuthenticated, token } = useAuth()
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date())
  const [pagination, setPagination] = useState({
    pageNumber: 1,
    pageSize: 50,
    total: 0,
  })

  // Converter DTO da listagem para formato do frontend
  const convertListItemToFrontend = useCallback((dto: ConversationListItemDto): Conversation => {
    const timestamp = new Date(dto.ultimaMensagemTimestamp)
    const now = new Date()
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
    const messageDate = new Date(timestamp.getFullYear(), timestamp.getMonth(), timestamp.getDate())

    let timeDisplay: string
    if (messageDate.getTime() === today.getTime()) {
      // Hoje - mostrar apenas hora
      timeDisplay = timestamp.toLocaleTimeString("pt-BR", {
        hour: "2-digit",
        minute: "2-digit",
      })
    } else if (messageDate.getTime() === today.getTime() - 24 * 60 * 60 * 1000) {
      // Ontem
      timeDisplay = "Ontem"
    } else {
      // Outros dias - mostrar data
      timeDisplay = timestamp.toLocaleDateString("pt-BR", {
        day: "2-digit",
        month: "2-digit",
      })
    }

    return {
      id: dto.id,
      clientName: dto.contatoNome,
      lastMessage: dto.ultimaMensagemPreview,
      timestamp: timeDisplay,
      unread: 0, // TODO: Implementar contagem de não lidas se disponível na API
      avatar: `/placeholder.svg?height=40&width=40`,
      status: dto.status,
      agentName: dto.agenteNome || undefined,
    }
  }, [])

  // Carregar conversas da API
  const loadConversations = useCallback(
    async (params?: ConversationSearchParams, showLoading = true) => {
      if (!isAuthenticated) {
        setConversations([])
        return
      }

      if (showLoading) setLoading(true)
      setError(null)

      try {
        const response = (await ApiService.listarConversas({
          pageNumber: 1,
          pageSize: 50,
          ...params,
        })) as ConversationListItemDto[]

        // Se a resposta for um array direto
        const conversationList = Array.isArray(response) ? response : response.data || []

        const frontendConversations = conversationList.map(convertListItemToFrontend)

        // Ordenar por timestamp (mais recente primeiro)
        frontendConversations.sort((a, b) => {
          const timeA = new Date(
            a.timestamp === "Ontem"
              ? Date.now() - 24 * 60 * 60 * 1000
              : a.timestamp === "Hoje"
                ? Date.now()
                : new Date(a.timestamp).getTime(),
          )
          const timeB = new Date(
            b.timestamp === "Ontem"
              ? Date.now() - 24 * 60 * 60 * 1000
              : b.timestamp === "Hoje"
                ? Date.now()
                : new Date(b.timestamp).getTime(),
          )
          return timeB.getTime() - timeA.getTime()
        })

        setConversations(frontendConversations)
        setLastUpdate(new Date())

        // Atualizar paginação se disponível
        if (!Array.isArray(response) && response.total !== undefined) {
          setPagination({
            pageNumber: response.pageNumber || 1,
            pageSize: response.pageSize || 50,
            total: response.total,
          })
        } else {
          setPagination((prev) => ({
            ...prev,
            total: frontendConversations.length,
          }))
        }

        console.log(`Carregadas ${frontendConversations.length} conversas`)
      } catch (err) {
        setError(err instanceof Error ? err.message : "Erro ao carregar conversas")
        console.error("Erro ao carregar conversas:", err)
        setConversations([])
      } finally {
        if (showLoading) setLoading(false)
      }
    },
    [convertListItemToFrontend, isAuthenticated],
  )

  // Iniciar nova conversa
  const startConversation = useCallback(
    async (contatoId: string, texto: string) => {
      if (!isAuthenticated) {
        throw new Error("Usuário não autenticado")
      }

      setLoading(true)
      setError(null)

      try {
        const newConversation = (await ApiService.iniciarConversa({
          contatoId,
          texto,
        })) as ConversationDto

        // Recarregar a lista de conversas para incluir a nova (sem loading visual)
        await loadConversations(undefined, false)

        return newConversation
      } catch (err) {
        setError(err instanceof Error ? err.message : "Erro ao iniciar conversa")
        console.error("Erro ao iniciar conversa:", err)
        throw err
      } finally {
        setLoading(false)
      }
    },
    [loadConversations, isAuthenticated],
  )

  // Atualizar conversa na lista (para mensagens em tempo real)
  const updateConversationInList = useCallback((conversationId: string, updates: Partial<Conversation>) => {
    setConversations((prev) => {
      const updated = prev.map((conv) => (conv.id === conversationId ? { ...conv, ...updates } : conv))

      // Reordenar se a última mensagem foi atualizada
      if (updates.lastMessage || updates.timestamp) {
        return updated.sort((a, b) => {
          // Conversas com atualizações recentes vão para o topo
          if (a.id === conversationId) return -1
          if (b.id === conversationId) return 1
          return 0
        })
      }

      return updated
    })
  }, [])

  // Atualizar conversa com nova mensagem (chamado pelo SignalR)
  const updateConversationWithMessage = useCallback(
    (message: MessageDto, conversationId: string) => {
      const timestamp = new Date(message.criadoEm)
      const now = new Date()
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
      const messageDate = new Date(timestamp.getFullYear(), timestamp.getMonth(), timestamp.getDate())

      let timeDisplay: string
      if (messageDate.getTime() === today.getTime()) {
        timeDisplay = timestamp.toLocaleTimeString("pt-BR", {
          hour: "2-digit",
          minute: "2-digit",
        })
      } else if (messageDate.getTime() === today.getTime() - 24 * 60 * 60 * 1000) {
        timeDisplay = "Ontem"
      } else {
        timeDisplay = timestamp.toLocaleDateString("pt-BR", {
          day: "2-digit",
          month: "2-digit",
        })
      }

      updateConversationInList(conversationId, {
        lastMessage: message.texto,
        timestamp: timeDisplay,
        unread: message.remetenteTipo === "Cliente" ? 1 : 0, // Incrementar não lidas se for do cliente
      })
    },
    [updateConversationInList],
  )

  // Buscar conversas por termo (filtro local + recarregar se necessário)
  const searchConversations = useCallback(
    async (searchTerm: string) => {
      if (!searchTerm.trim()) {
        // Se não há termo de busca, recarregar todas as conversas
        await loadConversations()
        return
      }

      // Primeiro, filtrar localmente
      const filtered = conversations.filter(
        (conv) =>
          conv.clientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
          conv.lastMessage.toLowerCase().includes(searchTerm.toLowerCase()),
      )

      if (filtered.length > 0) {
        // Se encontrou resultados localmente, mostrar eles
        setConversations(filtered)
      } else {
        // Se não encontrou localmente, fazer busca no servidor
        // TODO: Implementar busca no servidor quando disponível
        console.log("Busca no servidor:", searchTerm)
        setConversations([])
      }
    },
    [conversations, loadConversations],
  )

  // Filtrar por status
  const filterByStatus = useCallback(
    async (status?: "AguardandoNaFila" | "EmAndamento" | "Resolvida") => {
      await loadConversations({ status })
    },
    [loadConversations],
  )

  // Filtrar por agente
  const filterByAgent = useCallback(
    async (agenteId?: string) => {
      await loadConversations({ agenteId })
    },
    [loadConversations],
  )

  // Marcar conversa como lida
  const markAsRead = useCallback(
    (conversationId: string) => {
      updateConversationInList(conversationId, { unread: 0 })
    },
    [updateConversationInList],
  )

  // Atualizar status da conversa
  const updateConversationStatus = useCallback(
    (conversationId: string, status: Conversation["status"]) => {
      updateConversationInList(conversationId, { status })
    },
    [updateConversationInList],
  )

  // Configurar listeners do SignalR para atualizações da lista
  useEffect(() => {
    if (!isAuthenticated) return

    const handleConversationUpdate = (data: { conversationId: string; message: MessageDto }) => {
      console.log("Atualização de conversa recebida:", data)
      updateConversationWithMessage(data.message, data.conversationId)
    }

    const handleConversationStatusChange = (data: { conversationId: string; status: string }) => {
      console.log("Mudança de status da conversa:", data)
      updateConversationStatus(data.conversationId, data.status as Conversation["status"])
    }

    // Configurar listeners do SignalR (se conectado)
    if (signalRService.isConnected()) {
      signalRService.connection?.on("ConversationUpdated", handleConversationUpdate)
      signalRService.connection?.on("ConversationStatusChanged", handleConversationStatusChange)
    }

    return () => {
      // Limpar listeners
      if (signalRService.connection) {
        signalRService.connection.off("ConversationUpdated", handleConversationUpdate)
        signalRService.connection.off("ConversationStatusChanged", handleConversationStatusChange)
      }
    }
  }, [isAuthenticated, updateConversationWithMessage, updateConversationStatus])

  // Carregar conversas na inicialização e quando autenticar
  useEffect(() => {
    if (isAuthenticated && token) {
      loadConversations()
    } else {
      // Limpar conversas quando não autenticado
      setConversations([])
      setError(null)
    }
  }, [isAuthenticated, token, loadConversations])

  // Recarregar conversas periodicamente (polling de backup)
  useEffect(() => {
    if (!isAuthenticated) return

    const interval = setInterval(() => {
      // Recarregar silenciosamente a cada 30 segundos
      loadConversations(undefined, false)
    }, 30000)

    return () => clearInterval(interval)
  }, [isAuthenticated, loadConversations])

  return {
    conversations,
    loading,
    error,
    pagination,
    lastUpdate,
    // Ações principais
    startConversation,
    loadConversations,
    searchConversations,
    // Filtros
    filterByStatus,
    filterByAgent,
    // Atualizações em tempo real
    updateConversationInList,
    updateConversationWithMessage,
    markAsRead,
    updateConversationStatus,
    // Utilitários
    refresh: () => loadConversations(),
  }
}
