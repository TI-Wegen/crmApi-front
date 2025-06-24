"use client"

import { useState, useCallback, useEffect } from "react"
import { ApiService } from "@/services/api"
import type { ConversationDto, Conversation, ConversationListItemDto, ConversationSearchParams } from "@/types/crm"

export function useConversationList() {
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [pagination, setPagination] = useState({
    pageNumber: 1,
    pageSize: 20,
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
    async (params?: ConversationSearchParams) => {
      setLoading(true)
      setError(null)

      try {
        const response = (await ApiService.listarConversas({
          pageNumber: 1,
          pageSize: 50, // Carregar mais conversas por padrão
          ...params,
        })) as ConversationListItemDto[]

        // Se a resposta for um array direto
        const conversationList = Array.isArray(response) ? response : response.data || []

        const frontendConversations = conversationList.map(convertListItemToFrontend)
        setConversations(frontendConversations)

        // Atualizar paginação se disponível
        if (!Array.isArray(response) && response.total !== undefined) {
          setPagination({
            pageNumber: response.pageNumber || 1,
            pageSize: response.pageSize || 50,
            total: response.total,
          })
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "Erro ao carregar conversas")
        console.error("Erro ao carregar conversas:", err)
      } finally {
        setLoading(false)
      }
    },
    [convertListItemToFrontend],
  )

  // Iniciar nova conversa
  const startConversation = useCallback(
    async (contatoId: string, texto: string) => {
      setLoading(true)
      setError(null)

      try {
        const newConversation = (await ApiService.iniciarConversa({
          contatoId,
          texto,
        })) as ConversationDto

        // Recarregar a lista de conversas para incluir a nova
        await loadConversations()

        return newConversation
      } catch (err) {
        setError(err instanceof Error ? err.message : "Erro ao iniciar conversa")
        console.error("Erro ao iniciar conversa:", err)
        throw err
      } finally {
        setLoading(false)
      }
    },
    [loadConversations],
  )

  // Atualizar conversa na lista
  const updateConversationInList = useCallback((conversationId: string, updates: Partial<Conversation>) => {
    setConversations((prev) => prev.map((conv) => (conv.id === conversationId ? { ...conv, ...updates } : conv)))
  }, [])

  // Buscar conversas por termo (filtro local)
  const searchConversations = useCallback(
    (searchTerm: string) => {
      if (!searchTerm.trim()) {
        loadConversations()
        return
      }

      // Filtro local nas conversas já carregadas
      setConversations((prev) =>
        prev.filter(
          (conv) =>
            conv.clientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
            conv.lastMessage.toLowerCase().includes(searchTerm.toLowerCase()),
        ),
      )
    },
    [loadConversations],
  )

  // Filtrar por status
  const filterByStatus = useCallback(
    (status?: "AguardandoNaFila" | "EmAndamento" | "Resolvida") => {
      loadConversations({ status })
    },
    [loadConversations],
  )

  // Filtrar por agente
  const filterByAgent = useCallback(
    (agenteId?: string) => {
      loadConversations({ agenteId })
    },
    [loadConversations],
  )

  // Carregar conversas na inicialização
  useEffect(() => {
    loadConversations()
  }, [loadConversations])

  return {
    conversations,
    loading,
    error,
    pagination,
    startConversation,
    loadConversations,
    updateConversationInList,
    searchConversations,
    filterByStatus,
    filterByAgent,
  }
}
