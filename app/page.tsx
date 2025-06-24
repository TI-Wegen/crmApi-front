"use client"

import { useState } from "react"
import { MessageCircle, Users, Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import ConversationList from "@/components/conversation-list"
import ChatArea from "@/components/chat-area"
import ContactsManager from "@/components/contacts-manager"
import NewConversation from "@/components/new-conversation"
import { useConversations } from "@/hooks/use-conversations"
import { useConversationList } from "@/hooks/use-conversation-list"
// Adicionar import do filtro
import ConversationFilters from "@/components/conversation-filters"

type ActiveTab = "conversations" | "contacts"

// Atualizar o componente para usar conversas reais
export default function CRMPage() {
  const [activeTab, setActiveTab] = useState<ActiveTab>("conversations")
  const [showNewConversation, setShowNewConversation] = useState(false)
  const [conversationFilter, setConversationFilter] = useState<
    "all" | "AguardandoNaFila" | "EmAndamento" | "Resolvida"
  >("all")

  const {
    selectedConversation,
    conversationDetails,
    messages,
    loading: chatLoading,
    error: chatError,
    selectConversation,
    sendMessage,
  } = useConversations()


  const {
    conversations,
    loading: conversationsLoading,
    error: conversationsError,
    searchConversations,
    filterByStatus,
  } = useConversationList()

  const handleStartConversation = (conversationId: string) => {
    setShowNewConversation(false)
    setActiveTab("conversations")
    selectConversation(conversationId)
  }

  const handleNewConversationFromContacts = (conversationId: string) => {
    setActiveTab("conversations")
    selectConversation(conversationId)
  }

  const handleFilterChange = (filter: "all" | "AguardandoNaFila" | "EmAndamento" | "Resolvida") => {
    setConversationFilter(filter)
    if (filter === "all") {
      filterByStatus()
    } else {
      filterByStatus(filter)
    }
  }

  // Calcular contadores para os filtros
  const conversationCounts = {
    all: conversations.length,
    AguardandoNaFila: conversations.filter((c) => c.status === "AguardandoNaFila").length,
    EmAndamento: conversations.filter((c) => c.status === "EmAndamento").length,
    Resolvida: conversations.filter((c) => c.status === "Resolvida").length,
  }

  const error = chatError || conversationsError



  if (error) {
    return (
      <div className="flex h-screen items-center justify-center bg-gray-100">
        <div className="text-center">
          <div className="text-red-500 text-lg font-medium mb-2">Erro de Conexão</div>
          <p className="text-gray-600">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Tentar Novamente
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Coluna Esquerda - Navegação e Listas */}
      <div className="w-1/3 min-w-[320px] bg-white border-r border-gray-200 flex flex-col">
        {/* Navegação por abas */}
        <div className="flex border-b border-gray-200">
          <button
            onClick={() => setActiveTab("conversations")}
            className={`flex-1 flex items-center justify-center py-3 px-4 text-sm font-medium transition-colors ${
              activeTab === "conversations"
                ? "text-blue-600 border-b-2 border-blue-600 bg-blue-50"
                : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
            }`}
          >
            <MessageCircle className="h-4 w-4 mr-2" />
            Conversas
          </button>
          <button
            onClick={() => setActiveTab("contacts")}
            className={`flex-1 flex items-center justify-center py-3 px-4 text-sm font-medium transition-colors ${
              activeTab === "contacts"
                ? "text-blue-600 border-b-2 border-blue-600 bg-blue-50"
                : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
            }`}
          >
            <Users className="h-4 w-4 mr-2" />
            Contatos
          </button>
        </div>

        {/* Botão Nova Conversa */}
        {activeTab === "conversations" && (
          <div className="p-4 border-b border-gray-200">
            <Button onClick={() => setShowNewConversation(true)} className="w-full" size="sm">
              <Plus className="h-4 w-4 mr-2" />
              Nova Conversa
            </Button>
          </div>
        )}

        {/* Conteúdo da aba ativa */}
        <div className="flex-1 overflow-hidden">
          {activeTab === "conversations" ? (
            <div className="flex-1 flex flex-col overflow-hidden">
              <ConversationFilters
                activeFilter={conversationFilter}
                onFilterChange={handleFilterChange}
                conversationCounts={conversationCounts}
              />
              <ConversationList
                conversations={conversations}
                selectedId={selectedConversation || ""}
                onSelectConversation={selectConversation}
                onSearch={searchConversations}
                loading={conversationsLoading}
              />
            </div>
          ) : (
            <ContactsManager onStartConversation={handleNewConversationFromContacts} />
          )}
        </div>
      </div>

      {/* Coluna Direita - Chat Ativo */}
      <div className="flex-1 flex flex-col">
        <ChatArea
          conversation={
            conversationDetails
              ? {
                  id: conversationDetails.id,
                  clientName: conversationDetails.contato?.nome || "",
                  lastMessage: conversationDetails.ultimaMensagem || "",
                  timestamp: conversationDetails.ultimaMensagemEm
                    ? new Date(conversationDetails.ultimaMensagemEm).toLocaleTimeString("pt-BR", {
                        hour: "2-digit",
                        minute: "2-digit",
                      })
                    : "",
                  unread: 0,
                  avatar: "/placeholder.svg?height=40&width=40",
                  status: conversationDetails.status,
                }
              : undefined
          }
          messages={messages}
          onSendMessage={sendMessage}
          loading={chatLoading}
        />
      </div>

      {/* Modal Nova Conversa */}
      {showNewConversation && (
        <NewConversation
          onConversationStarted={handleStartConversation}
          onCancel={() => setShowNewConversation(false)}
        />
      )}
    </div>
  )
}
