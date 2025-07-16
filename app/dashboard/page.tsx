"use client"

import { useState } from "react"
import { BarChart3, MessageCircle, Bot, History, RefreshCw } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import ProtectedRoute from "@/components/protected-route"
import UserHeader from "@/components/user-header"
import StatsOverview from "@/components/dashboard/stats-overview"
import SectorStats from "@/components/dashboard/sector-stats"
import MessageHistory from "@/components/dashboard/message-history"
import BotMessages from "@/components/dashboard/bot-messages"
import { useDashboardMock } from "@/hooks/use-dashboard-mock"
import { useConversations } from "@/hooks/use-conversations"

function DashboardContent() {
  const [activeTab, setActiveTab] = useState("overview")
  const { signalRConnected } = useConversations()

  const {
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
    refresh,
  } = useDashboardMock()

  const handleTabChange = (tab: string) => {
    setActiveTab(tab)

    // Carregar dados específicos da aba
    switch (tab) {
      case "messages":
        if (messageHistory.length === 0) {
          loadMessageHistory()
        }
        break
      case "bot":
        if (botMessages.length === 0) {
          loadBotMessages()
        }
        break
    }
  }

  if (error) {
    return (
      <div className="flex h-screen items-center justify-center bg-gray-100">
        <div className="text-center">
          <div className="text-red-500 text-lg font-medium mb-2">Erro ao carregar dashboard</div>
          <p className="text-gray-600 mb-4">{error}</p>
          <Button onClick={refresh}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Tentar Novamente
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col h-screen bg-gray-100">
      <UserHeader signalRConnected={signalRConnected} />

      <div className="flex-1 overflow-hidden">
        <div className="h-full p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
              <p className="text-gray-600">Visão geral do sistema de atendimento</p>
              <p className="text-xs text-blue-600 mt-1">🧪 Modo demonstração com dados simulados</p>
            </div>
            <Button onClick={refresh} variant="outline" disabled={loading}>
              <RefreshCw className={`h-4 w-4 mr-2 ${loading ? "animate-spin" : ""}`} />
              Atualizar
            </Button>
          </div>

          <Tabs value={activeTab} onValueChange={handleTabChange} className="h-full flex flex-col">
            <TabsList className="grid w-full grid-cols-4 mb-6">
              <TabsTrigger value="overview" className="flex items-center">
                <BarChart3 className="h-4 w-4 mr-2" />
                Visão Geral
              </TabsTrigger>
              <TabsTrigger value="sectors" className="flex items-center">
                <MessageCircle className="h-4 w-4 mr-2" />
                Por Setor
              </TabsTrigger>
              <TabsTrigger value="messages" className="flex items-center">
                <History className="h-4 w-4 mr-2" />
                Histórico
              </TabsTrigger>
              <TabsTrigger value="bot" className="flex items-center">
                <Bot className="h-4 w-4 mr-2" />
                Chatbot
              </TabsTrigger>
            </TabsList>

            <div className="flex-1 overflow-hidden">
              <TabsContent value="overview" className="h-full overflow-y-auto">
                <StatsOverview stats={stats} loading={loading} />
              </TabsContent>

              <TabsContent value="sectors" className="h-full overflow-y-auto">
                <SectorStats sectors={stats?.conversas?.porSetor || null} loading={loading} />
              </TabsContent>

              <TabsContent value="messages" className="h-full overflow-y-auto">
                <MessageHistory
                  messages={messageHistory}
                  loading={loading}
                  filters={filters}
                  onFiltersChange={updateFilters}
                  onExport={exportData}
                  onLoadMore={() => loadMessageHistory(undefined, pagination.pageNumber + 1)}
                  hasMore={pagination.pageNumber * pagination.pageSize < pagination.total}
                />
              </TabsContent>

              <TabsContent value="bot" className="h-full overflow-y-auto">
                <BotMessages
                  messages={botMessages}
                  loading={loading}
                  filters={filters}
                  onFiltersChange={updateFilters}
                  onLoadMore={() => loadBotMessages(undefined, pagination.pageNumber + 1)}
                  hasMore={pagination.pageNumber * pagination.pageSize < pagination.total}
                />
              </TabsContent>
            </div>
          </Tabs>
        </div>
      </div>
    </div>
  )
}

export default function DashboardPage() {
  return (
    <ProtectedRoute>
      <DashboardContent />
    </ProtectedRoute>
  )
}
