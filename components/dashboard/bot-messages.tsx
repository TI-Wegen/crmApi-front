"use client"

import { Button } from "@/components/ui/button"

import { useState } from "react"
import { Bot, Search, Calendar, CheckCircle, XCircle } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import type { BotMessage, DashboardFilters } from "@/types/dashboard"

interface BotMessagesProps {
  messages: BotMessage[]
  loading?: boolean
  filters: DashboardFilters
  onFiltersChange: (filters: Partial<DashboardFilters>) => void
  onLoadMore?: () => void
  hasMore?: boolean
}

export default function BotMessages({
  messages,
  loading,
  filters,
  onFiltersChange,
  onLoadMore,
  hasMore,
}: BotMessagesProps) {
  const [searchTerm, setSearchTerm] = useState("")
  const [tipoFilter, setTipoFilter] = useState<string>("Todos")

  const filteredMessages = messages.filter((message) => {
    const matchesSearch =
      message.texto.toLowerCase().includes(searchTerm.toLowerCase()) ||
      message.contatoNome.toLowerCase().includes(searchTerm.toLowerCase()) ||
      message.contatoTelefone.includes(searchTerm)

    const matchesTipo = tipoFilter === "Todos" || message.tipoBot === tipoFilter

    return matchesSearch && matchesTipo
  })

  const getTipoBadge = (tipo: string) => {
    const configs = {
      "Boas-vindas": { color: "bg-blue-100 text-blue-800", icon: "👋" },
      Menu: { color: "bg-green-100 text-green-800", icon: "📋" },
      FAQ: { color: "bg-purple-100 text-purple-800", icon: "❓" },
      Transferencia: { color: "bg-orange-100 text-orange-800", icon: "↗️" },
      Encerramento: { color: "bg-gray-100 text-gray-800", icon: "👋" },
    }

    const config = configs[tipo as keyof typeof configs] || configs["Menu"]

    return (
      <Badge variant="secondary" className={config.color}>
        <span className="mr-1">{config.icon}</span>
        {tipo}
      </Badge>
    )
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleString("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  const successRate = messages.length > 0 ? (messages.filter((m) => m.sucesso).length / messages.length) * 100 : 0

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center">
            <Bot className="h-5 w-5 mr-2" />
            Mensagens do Chatbot
          </CardTitle>
          <div className="flex items-center space-x-4">
            <div className="text-sm text-gray-600">
              Taxa de sucesso: <span className="font-semibold text-green-600">{successRate.toFixed(1)}%</span>
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Filtros */}
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Buscar mensagens do bot..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          <div className="flex gap-2">
            <Input
              type="date"
              value={filters.dataInicio || ""}
              onChange={(e) => onFiltersChange({ dataInicio: e.target.value })}
              className="w-auto"
            />
            <Input
              type="date"
              value={filters.dataFim || ""}
              onChange={(e) => onFiltersChange({ dataFim: e.target.value })}
              className="w-auto"
            />
            <Select value={tipoFilter} onValueChange={setTipoFilter}>
              <SelectTrigger className="w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Todos">Todos os tipos</SelectItem>
                <SelectItem value="Boas-vindas">Boas-vindas</SelectItem>
                <SelectItem value="Menu">Menu</SelectItem>
                <SelectItem value="FAQ">FAQ</SelectItem>
                <SelectItem value="Transferencia">Transferência</SelectItem>
                <SelectItem value="Encerramento">Encerramento</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Estatísticas rápidas */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 p-4 bg-gray-50 rounded-lg">
          {["Boas-vindas", "Menu", "FAQ", "Transferencia", "Encerramento"].map((tipo) => {
            const count = messages.filter((m) => m.tipoBot === tipo).length
            const successCount = messages.filter((m) => m.tipoBot === tipo && m.sucesso).length
            const rate = count > 0 ? (successCount / count) * 100 : 0

            return (
              <div key={tipo} className="text-center">
                <div className="text-lg font-semibold">{count}</div>
                <div className="text-xs text-gray-600">{tipo}</div>
                <div className="text-xs text-green-600">{rate.toFixed(0)}% sucesso</div>
              </div>
            )
          })}
        </div>

        {/* Lista de mensagens */}
        <div className="space-y-3 max-h-96 overflow-y-auto">
          {loading ? (
            <div className="space-y-3">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="animate-pulse border rounded-lg p-4">
                  <div className="flex justify-between items-start mb-2">
                    <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                    <div className="h-4 bg-gray-200 rounded w-20"></div>
                  </div>
                  <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                  <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                </div>
              ))}
            </div>
          ) : filteredMessages.length > 0 ? (
            <>
              {filteredMessages.map((message) => (
                <div key={message.id} className="border rounded-lg p-4 hover:bg-gray-50 transition-colors">
                  <div className="flex justify-between items-start mb-2">
                    <div className="flex items-center space-x-2">
                      <span className="font-medium text-gray-900">{message.contatoNome}</span>
                      <span className="text-sm text-gray-500">({message.contatoTelefone})</span>
                      {getTipoBadge(message.tipoBot)}
                    </div>
                    <div className="flex items-center space-x-2">
                      {message.sucesso ? (
                        <CheckCircle className="h-4 w-4 text-green-600" />
                      ) : (
                        <XCircle className="h-4 w-4 text-red-600" />
                      )}
                      <div className="flex items-center text-xs text-gray-500">
                        <Calendar className="h-3 w-3 mr-1" />
                        {formatDate(message.criadoEm)}
                      </div>
                    </div>
                  </div>

                  <div className="text-gray-700 mb-2 bg-purple-50 p-3 rounded border-l-4 border-purple-400">
                    <div className="flex items-start">
                      <Bot className="h-4 w-4 text-purple-600 mr-2 mt-0.5 flex-shrink-0" />
                      <span>{message.texto}</span>
                    </div>
                  </div>

                  <div className="flex justify-between items-center mt-2 pt-2 border-t border-gray-100">
                    <span className="text-xs text-gray-500">Conversa: {message.conversaId.substring(0, 8)}...</span>
                    <Badge
                      variant={message.sucesso ? "default" : "destructive"}
                      className={message.sucesso ? "bg-green-100 text-green-800" : ""}
                    >
                      {message.sucesso ? "Sucesso" : "Falhou"}
                    </Badge>
                  </div>
                </div>
              ))}

              {hasMore && (
                <div className="text-center pt-4">
                  <Button onClick={onLoadMore} variant="outline">
                    Carregar mais mensagens
                  </Button>
                </div>
              )}
            </>
          ) : (
            <div className="text-center py-8 text-gray-500">
              <Bot className="h-12 w-12 mx-auto mb-4 text-gray-300" />
              <p>Nenhuma mensagem do bot encontrada</p>
              <p className="text-sm">Tente ajustar os filtros de busca</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
