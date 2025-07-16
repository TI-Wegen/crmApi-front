"use client"

import { useState } from "react"
import { Search, Download, MessageCircle, User, Bot, Calendar } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import type { MessageHistory as MessageHistoryType, DashboardFilters } from "@/types/dashboard"

interface MessageHistoryProps {
  messages: MessageHistoryType[]
  loading?: boolean
  filters: DashboardFilters
  onFiltersChange: (filters: Partial<DashboardFilters>) => void
  onExport: () => void
  onLoadMore?: () => void
  hasMore?: boolean
}

export default function MessageHistoryComponent({
  messages,
  loading,
  filters,
  onFiltersChange,
  onExport,
  onLoadMore,
  hasMore,
}: MessageHistoryProps) {
  const [searchTerm, setSearchTerm] = useState("")

  const filteredMessages = messages.filter(
    (message) =>
      message.texto.toLowerCase().includes(searchTerm.toLowerCase()) ||
      message.contatoNome.toLowerCase().includes(searchTerm.toLowerCase()) ||
      message.contatoTelefone.includes(searchTerm),
  )

  const getRemetenteBadge = (tipo: string, agenteNome?: string) => {
    switch (tipo) {
      case "Cliente":
        return (
          <Badge variant="outline" className="bg-blue-50 text-blue-700">
            <User className="h-3 w-3 mr-1" />
            Cliente
          </Badge>
        )
      case "Agente":
        return (
          <Badge variant="outline" className="bg-green-50 text-green-700">
            <User className="h-3 w-3 mr-1" />
            {agenteNome || "Agente"}
          </Badge>
        )
      case "Bot":
        return (
          <Badge variant="outline" className="bg-purple-50 text-purple-700">
            <Bot className="h-3 w-3 mr-1" />
            Bot
          </Badge>
        )
      default:
        return null
    }
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

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center">
            <MessageCircle className="h-5 w-5 mr-2" />
            Histórico de Mensagens
          </CardTitle>
          <Button onClick={onExport} variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Exportar
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Filtros */}
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Buscar mensagens, contatos ou telefones..."
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
            <Select
              value={filters.tipoMensagem || "Todas"}
              onValueChange={(value) =>
                onFiltersChange({
                  tipoMensagem: value as DashboardFilters["tipoMensagem"],
                })
              }
            >
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Todas">Todas</SelectItem>
                <SelectItem value="Cliente">Cliente</SelectItem>
                <SelectItem value="Agente">Agente</SelectItem>
                <SelectItem value="Bot">Bot</SelectItem>
              </SelectContent>
            </Select>
          </div>
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
                      {getRemetenteBadge(message.remetenteTipo, message.agenteNome)}
                    </div>
                    <div className="flex items-center text-xs text-gray-500">
                      <Calendar className="h-3 w-3 mr-1" />
                      {formatDate(message.criadoEm)}
                    </div>
                  </div>

                  <div className="text-gray-700 mb-2">{message.texto}</div>

                  {message.anexoUrl && (
                    <div className="flex items-center text-sm text-blue-600">
                      <span>📎 Anexo disponível</span>
                    </div>
                  )}

                  <div className="flex justify-between items-center mt-2 pt-2 border-t border-gray-100">
                    <span className="text-xs text-gray-500">Conversa: {message.conversaId.substring(0, 8)}...</span>
                    {!message.lida && (
                      <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                        Não lida
                      </Badge>
                    )}
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
              <MessageCircle className="h-12 w-12 mx-auto mb-4 text-gray-300" />
              <p>Nenhuma mensagem encontrada</p>
              <p className="text-sm">Tente ajustar os filtros de busca</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
