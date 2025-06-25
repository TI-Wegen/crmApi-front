"use client"

import type { Conversation } from "@/types/crm"
import { Clock, User, CheckCircle } from "lucide-react"
import { Badge } from "@/components/ui/badge"

// Atualizar a interface para incluir agentName
interface ConversationItemProps {
  conversation: Conversation & { agentName?: string }
  isSelected: boolean
  onClick: () => void
}

// Atualizar o componente para mostrar status e agente
export default function ConversationItem({ conversation, isSelected, onClick }: ConversationItemProps) {
  const getStatusIcon = (status: string) => {
    switch (status) {
      case "AguardandoNaFila":
        return <Clock className="h-3 w-3 text-yellow-600" />
      case "EmAtendimento":
        return <User className="h-3 w-3 text-blue-600" />
      case "Resolvida":
        return <CheckCircle className="h-3 w-3 text-green-600" />
      default:
        return null
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "AguardandoNaFila":
        return "bg-yellow-100 text-yellow-800"
      case "EmAtendimento":
        return "bg-blue-100 text-blue-800"
      case "Resolvida":
        return "bg-green-100 text-green-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "AguardandoNaFila":
        return "Na Fila"
      case "EmAtendimento":
        return "Em Andamento"
      case "Resolvida":
        return "Resolvida"
      default:
        return status
    }
  }

  return (
    <div
      className={`p-4 border-b border-gray-100 cursor-pointer hover:bg-gray-50 transition-colors ${
        isSelected ? "bg-blue-50 border-r-2 border-r-blue-500" : ""
      }`}
      onClick={onClick}
    >
      <div className="flex items-center space-x-3">
        <img
          src={conversation.avatar || "/placeholder.svg"}
          alt={conversation.clientName}
          className="w-12 h-12 rounded-full object-cover"
        />
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-medium text-gray-900 truncate">{conversation.clientName}</h3>
            <span className="text-xs text-gray-500">{conversation.timestamp}</span>
          </div>

          <div className="flex items-center justify-between mt-1">
            <p className="text-sm text-gray-600 truncate">{conversation.lastMessage}</p>
            {conversation.unread > 0 && (
              <span className="bg-blue-500 text-white text-xs rounded-full px-2 py-1 min-w-[20px] text-center">
                {conversation.unread}
              </span>
            )}
          </div>

          {/* Status e Agente */}
          <div className="flex items-center justify-between mt-2">
            <div className="flex items-center space-x-2">
              <Badge variant="secondary" className={`text-xs ${getStatusColor(conversation.status)}`}>
                <span className="flex items-center space-x-1">
                  {getStatusIcon(conversation.status)}
                  <span>{getStatusLabel(conversation.status)}</span>
                </span>
              </Badge>
            </div>

            {conversation.agentName && (
              <span className="text-xs text-gray-500 flex items-center">
                <User className="h-3 w-3 mr-1" />
                {conversation.agentName}
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
