"use client"

import { useState, useEffect, useCallback } from "react"
import { useAuth } from "@/contexts/auth-context"
import type { DashboardStats, MessageHistory, BotMessage, DashboardFilters } from "@/types/dashboard"
import {
  mockMessageHistory,
  mockBotMessages,
  generateMoreMessageHistory,
  generateMoreBotMessages,
  filterMessageHistory,
  filterBotMessages,
  generateFilteredStats,
} from "@/mocks/dashboard-mock"

export function useDashboardMock() {
  const { isAuthenticated } = useAuth()
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [messageHistory, setMessageHistory] = useState<MessageHistory[]>([])
  const [botMessages, setBotMessages] = useState<BotMessage[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [filters, setFilters] = useState<DashboardFilters>({
    dataInicio: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split("T")[0], // 7 dias atrás
    dataFim: new Date().toISOString().split("T")[0], // hoje
  })
  const [pagination, setPagination] = useState({
    pageNumber: 1,
    pageSize: 50,
    total: 1000, // Total simulado
  })

  // Simular delay de rede
  const simulateNetworkDelay = (ms = 800) => {
    return new Promise((resolve) => setTimeout(resolve, ms))
  }

  // Carregar estatísticas do dashboard
  const loadStats = useCallback(
    async (customFilters?: DashboardFilters) => {
      if (!isAuthenticated) return

      setLoading(true)
      setError(null)

      try {
        await simulateNetworkDelay()

        const currentFilters = customFilters || filters
        const data = generateFilteredStats(currentFilters)
        setStats(data)

        console.log("📊 Estatísticas carregadas (mock):", data)
      } catch (err) {
        setError(err instanceof Error ? err.message : "Erro ao carregar estatísticas")
        console.error("Erro ao carregar estatísticas:", err)
      } finally {
        setLoading(false)
      }
    },
    [isAuthenticated, filters],
  )

  // Carregar histórico de mensagens
  const loadMessageHistory = useCallback(
    async (customFilters?: DashboardFilters, page = 1) => {
      if (!isAuthenticated) return

      setLoading(true)
      setError(null)

      try {
        await simulateNetworkDelay(600)

        let messages: MessageHistory[]

        if (page === 1) {
          // Primeira página - usar dados base
          messages = [...mockMessageHistory]
        } else {
          // Páginas seguintes - gerar dados adicionais
          messages = generateMoreMessageHistory(page, pagination.pageSize)
        }

        // Aplicar filtros
        const currentFilters = { ...filters, ...customFilters }
        const filteredMessages = filterMessageHistory(messages, currentFilters)

        if (page === 1) {
          setMessageHistory(filteredMessages)
        } else {
          setMessageHistory((prev) => [...prev, ...filteredMessages])
        }

        setPagination((prev) => ({
          ...prev,
          pageNumber: page,
        }))

        console.log(
          `📨 Histórico de mensagens carregado (mock) - Página ${page}:`,
          filteredMessages.length,
          "mensagens",
        )
      } catch (err) {
        setError(err instanceof Error ? err.message : "Erro ao carregar histórico")
        console.error("Erro ao carregar histórico:", err)
      } finally {
        setLoading(false)
      }
    },
    [isAuthenticated, filters, pagination.pageSize],
  )

  // Carregar mensagens do bot
  const loadBotMessages = useCallback(
    async (customFilters?: DashboardFilters, page = 1) => {
      if (!isAuthenticated) return

      setLoading(true)
      setError(null)

      try {
        await simulateNetworkDelay(500)

        let messages: BotMessage[]

        if (page === 1) {
          // Primeira página - usar dados base
          messages = [...mockBotMessages]
        } else {
          // Páginas seguintes - gerar dados adicionais
          messages = generateMoreBotMessages(page, pagination.pageSize)
        }

        // Aplicar filtros
        const currentFilters = { ...filters, ...customFilters }
        const filteredMessages = filterBotMessages(messages, currentFilters)

        if (page === 1) {
          setBotMessages(filteredMessages)
        } else {
          setBotMessages((prev) => [...prev, ...filteredMessages])
        }

        setPagination((prev) => ({
          ...prev,
          pageNumber: page,
        }))

        console.log(`🤖 Mensagens do bot carregadas (mock) - Página ${page}:`, filteredMessages.length, "mensagens")
      } catch (err) {
        setError(err instanceof Error ? err.message : "Erro ao carregar mensagens do bot")
        console.error("Erro ao carregar mensagens do bot:", err)
      } finally {
        setLoading(false)
      }
    },
    [isAuthenticated, filters, pagination.pageSize],
  )

  // Exportar dados (simulado)
  const exportData = useCallback(
    async (customFilters?: DashboardFilters) => {
      if (!isAuthenticated) return

      try {
        setLoading(true)
        await simulateNetworkDelay(1500)

        // Simular criação de arquivo
        const currentFilters = { ...filters, ...customFilters }
        const filteredMessages = filterMessageHistory(mockMessageHistory, currentFilters)

        // Criar conteúdo CSV simulado
        const csvContent = [
          "Data,Contato,Telefone,Mensagem,Remetente,Agente,Lida",
          ...filteredMessages.map(
            (msg) =>
              `"${new Date(msg.criadoEm).toLocaleString()}","${msg.contatoNome}","${msg.contatoTelefone}","${msg.texto.replace(/"/g, '""')}","${msg.remetenteTipo}","${msg.agenteNome || ""}","${msg.lida ? "Sim" : "Não"}"`,
          ),
        ].join("\n")

        // Criar e baixar arquivo
        const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" })
        const url = window.URL.createObjectURL(blob)
        const link = document.createElement("a")
        link.href = url
        link.download = `historico-mensagens-${new Date().toISOString().split("T")[0]}.csv`
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
        window.URL.revokeObjectURL(url)

        console.log("📥 Dados exportados (mock):", filteredMessages.length, "mensagens")
      } catch (err) {
        setError(err instanceof Error ? err.message : "Erro ao exportar dados")
        console.error("Erro ao exportar dados:", err)
      } finally {
        setLoading(false)
      }
    },
    [isAuthenticated, filters],
  )

  // Atualizar filtros
  const updateFilters = useCallback((newFilters: Partial<DashboardFilters>) => {
    setFilters((prev) => {
      const updated = { ...prev, ...newFilters }
      console.log("🔍 Filtros atualizados (mock):", updated)
      return updated
    })

    // Reset pagination quando filtros mudam
    setPagination((prev) => ({ ...prev, pageNumber: 1 }))
  }, [])

  // Carregar dados iniciais
  useEffect(() => {
    if (isAuthenticated) {
      console.log("🚀 Inicializando dashboard (mock)")
      loadStats()
    }
  }, [isAuthenticated, loadStats])

  // Auto-refresh a cada 5 minutos (simulado)
  useEffect(() => {
    if (!isAuthenticated) return

    const interval = setInterval(
      () => {
        console.log("🔄 Auto-refresh do dashboard (mock)")
        loadStats()
      },
      5 * 60 * 1000,
    ) // 5 minutos

    return () => clearInterval(interval)
  }, [isAuthenticated, loadStats])

  // Simular atualizações em tempo real
  useEffect(() => {
    if (!isAuthenticated) return

    const interval = setInterval(() => {
      // Simular nova mensagem ocasionalmente
      if (Math.random() < 0.1) {
        // 10% de chance a cada intervalo
        const newMessage: MessageHistory = {
          id: `msg-realtime-${Date.now()}`,
          conversaId: `conv-${Math.floor(Math.random() * 100)}`,
          contatoNome: ["João Silva", "Ana Costa", "Pedro Santos", "Maria Oliveira"][Math.floor(Math.random() * 4)],
          contatoTelefone: `+55 31 9${Math.floor(Math.random() * 9000) + 1000}-${Math.floor(Math.random() * 9000) + 1000}`,
          texto: [
            "Preciso de ajuda",
            "Obrigado pelo atendimento",
            "Quando será resolvido?",
            "Perfeito, muito obrigado!",
          ][Math.floor(Math.random() * 4)],
          remetenteTipo: Math.random() > 0.5 ? "Cliente" : "Agente",
          agenteNome: Math.random() > 0.5 ? "Agente Sistema" : undefined,
          criadoEm: new Date().toISOString(),
          lida: false,
        }

        setMessageHistory((prev) => [newMessage, ...prev.slice(0, 49)]) // Manter apenas 50 mensagens
        console.log("📨 Nova mensagem em tempo real (mock):", newMessage.contatoNome)
      }
    }, 30000) // A cada 30 segundos

    return () => clearInterval(interval)
  }, [isAuthenticated])

  return {
    stats,
    messageHistory,
    botMessages,
    loading,
    error,
    filters,
    pagination,
    loadStats,
    loadMessageHistory,
    loadBotMessages,
    updateFilters,
    exportData,
    refresh: () => {
      console.log("🔄 Refresh manual do dashboard (mock)")
      loadStats()
    },
  }
}
