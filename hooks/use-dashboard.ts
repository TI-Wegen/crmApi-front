"use client"

import { useState, useEffect, useCallback } from "react"
import { DashboardService } from "@/services/dashboard"
import { useAuth } from "@/contexts/auth-context"
import type { DashboardStats, MessageHistory, BotMessage, DashboardFilters } from "@/types/dashboard"

export function useDashboard() {
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
    total: 0,
  })

  // Carregar estatísticas do dashboard
  const loadStats = useCallback(
    async (customFilters?: DashboardFilters) => {
      if (!isAuthenticated) return

      setLoading(true)
      setError(null)

      try {
        const data = await DashboardService.getDashboardStats(customFilters || filters)
        setStats(data)
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
        const response = await DashboardService.getMessageHistory({
          ...filters,
          ...customFilters,
          pageNumber: page,
          pageSize: pagination.pageSize,
        })

        setMessageHistory(response.data)
        setPagination({
          pageNumber: response.pageNumber,
          pageSize: response.pageSize,
          total: response.total,
        })
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
        const response = await DashboardService.getBotMessages({
          ...filters,
          ...customFilters,
          pageNumber: page,
          pageSize: pagination.pageSize,
        })

        setBotMessages(response.data)
        setPagination({
          pageNumber: response.pageNumber,
          pageSize: response.pageSize,
          total: response.total,
        })
      } catch (err) {
        setError(err instanceof Error ? err.message : "Erro ao carregar mensagens do bot")
        console.error("Erro ao carregar mensagens do bot:", err)
      } finally {
        setLoading(false)
      }
    },
    [isAuthenticated, filters, pagination.pageSize],
  )

  // Exportar dados
  const exportData = useCallback(
    async (customFilters?: DashboardFilters) => {
      if (!isAuthenticated) return

      try {
        const blob = await DashboardService.exportMessageHistory(customFilters || filters)

        // Criar link para download
        const url = window.URL.createObjectURL(blob)
        const link = document.createElement("a")
        link.href = url
        link.download = `historico-mensagens-${new Date().toISOString().split("T")[0]}.xlsx`
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
        window.URL.revokeObjectURL(url)
      } catch (err) {
        setError(err instanceof Error ? err.message : "Erro ao exportar dados")
        console.error("Erro ao exportar dados:", err)
      }
    },
    [isAuthenticated, filters],
  )

  // Atualizar filtros
  const updateFilters = useCallback((newFilters: Partial<DashboardFilters>) => {
    setFilters((prev) => ({ ...prev, ...newFilters }))
  }, [])

  // Carregar dados iniciais
  useEffect(() => {
    if (isAuthenticated) {
      loadStats()
    }
  }, [isAuthenticated, loadStats])

  // Auto-refresh a cada 5 minutos
  useEffect(() => {
    if (!isAuthenticated) return

    const interval = setInterval(
      () => {
        loadStats()
      },
      5 * 60 * 1000,
    ) // 5 minutos

    return () => clearInterval(interval)
  }, [isAuthenticated, loadStats])

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
    refresh: () => loadStats(),
  }
}
