"use client"

import { Search } from "lucide-react"
import { Input } from "@/components/ui/input"
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
  return (
    <>
      {/* Busca */}
      <div className="p-4 border-b border-gray-200">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            placeholder="Buscar conversas..."
            className="pl-10 bg-gray-50 border-gray-200 rounded-full"
            onChange={(e) => onSearch(e.target.value)}
          />
        </div>
      </div>

      {/* Lista de conversas */}
      <div className="flex-1 overflow-y-auto">
        {loading ? (
          <div className="flex justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
          </div>
        ) : conversations.length > 0 ? (
          conversations.map((conversation) => (
            <ConversationItem
              key={conversation.id}
              conversation={conversation}
              isSelected={conversation.id === selectedId}
              onClick={() => onSelectConversation(conversation.id)}
            />
          ))
        ) : (
          <div className="flex flex-col items-center justify-center h-full text-center p-4">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
              <Search className="h-8 w-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-600 mb-2">Nenhuma conversa encontrada</h3>
            <p className="text-gray-500">Inicie uma nova conversa ou ajuste sua busca</p>
          </div>
        )}
      </div>
    </>
  )
}
