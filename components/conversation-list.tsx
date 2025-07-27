"use client"

import { useState, useEffect, useMemo } from "react"
import { Search, X } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import type { Conversation } from "@/types/crm"
import ConversationItem from "./conversation-item"

interface ConversationListProps {
  conversations: Conversation[]
  selectedId: string
  onSelectConversation: (id: string) => void
  onSearch: (searchTerm: string) => void
  loading?: boolean
}

export default function ConversationList({
  conversations,
  selectedId,
  onSelectConversation,
  onSearch,
  loading,
}: ConversationListProps) {
  const [searchTerm, setSearchTerm] = useState("")
  const [isSearching, setIsSearching] = useState(false)

  // Debounce da busca para evitar muitas chamadas
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      onSearch(searchTerm)
      setIsSearching(false)
    }, 300) // 300ms de delay

    if (searchTerm) {
      setIsSearching(true)
    }

    return () => clearTimeout(timeoutId)
  }, [searchTerm, onSearch])

  // Filtrar conversas localmente para feedback imediato
  const filteredConversations = useMemo(() => {
    if (!searchTerm.trim()) {
      return conversations
    }

    const term = searchTerm.toLowerCase()
    return conversations.filter(
      (conversation) =>
        conversation.contatoNome.toLowerCase().includes(term) ||
        conversation.lastMessage.toLowerCase().includes(term) ||
        (conversation.agentName && conversation.agentName.toLowerCase().includes(term)),
    )
  }, [conversations, searchTerm])

  const handleClearSearch = () => {
    setSearchTerm("")
    onSearch("")
  }

  return (
    <div className="flex flex-col h-full">
      {/* Busca */}
      <div className="p-4 border-b border-gray-200 bg-white sticky top-0 z-10">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            placeholder="Buscar conversas..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 pr-10 bg-gray-50 border-gray-200 rounded-full"
          />
          {searchTerm && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleClearSearch}
              className="absolute right-1 top-1/2 transform -translate-y-1/2 h-8 w-8 p-0 hover:bg-gray-200"
            >
              <X className="h-4 w-4" />
            </Button>
          )}
          {isSearching && (
            <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-500"></div>
            </div>
          )}
        </div>

        {/* Indicador de busca ativa */}
        {searchTerm && (
          <div className="mt-2 text-xs text-gray-500">
            {filteredConversations.length} conversa{filteredConversations.length !== 1 ? "s" : ""} encontrada
            {filteredConversations.length !== 1 ? "s" : ""}
            {searchTerm && ` para "${searchTerm}"`}
          </div>
        )}
      </div>

      {/* Lista de conversas com scroll */}
      <div className="flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
        {loading ? (
          <div className="flex justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
          </div>
        ) : filteredConversations.length > 0 ? (
          <div className="divide-y divide-gray-100">
            {filteredConversations.map((conversation) => (
              <ConversationItem
                key={conversation.id}
                conversation={conversation}
                isSelected={conversation.id === selectedId}
                onClick={() => onSelectConversation(conversation.id)}
              />
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center h-full text-center p-8">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
              <Search className="h-8 w-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-600 mb-2">
              {searchTerm ? "Nenhuma conversa encontrada" : "Nenhuma conversa disponível"}
            </h3>
            <p className="text-gray-500 max-w-sm">
              {searchTerm
                ? `Não encontramos conversas que correspondam a "${searchTerm}". Tente outros termos de busca.`
                : "Inicie uma nova conversa ou aguarde novas mensagens chegarem."}
            </p>
            {searchTerm && (
              <Button variant="outline" onClick={handleClearSearch} className="mt-4 bg-transparent">
                Limpar busca
              </Button>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
