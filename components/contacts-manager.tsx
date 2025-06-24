"use client"

import { useState } from "react"
import { Plus, Search, Edit, Trash2, MessageCircle, Phone } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { useContacts } from "@/hooks/use-contacts"
import { useConversationList } from "@/hooks/use-conversation-list"
import type { ContatoDto } from "@/types/crm"
import ContactForm from "./contact-form"

interface ContactsManagerProps {
  onStartConversation?: (conversationId: string) => void
}

export default function ContactsManager({ onStartConversation }: ContactsManagerProps) {
  const { contacts, loading, error, createContact, updateContact, deactivateContact, searchContacts } = useContacts()
  const { startConversation } = useConversationList()

  const [showForm, setShowForm] = useState(false)
  const [editingContact, setEditingContact] = useState<ContatoDto | null>(null)
  const [searchTerm, setSearchTerm] = useState("")

  const handleCreateContact = async (dados: { nome: string; telefone: string }) => {
    try {
      await createContact(dados)
      setShowForm(false)
    } catch (err) {
      console.error("Erro ao criar contato:", err)
    }
  }

  const handleUpdateContact = async (dados: { nome: string; telefone: string; tags?: string[] }) => {
    if (!editingContact) return

    try {
      await updateContact(editingContact.id, dados)
      setEditingContact(null)
    } catch (err) {
      console.error("Erro ao atualizar contato:", err)
    }
  }

  const handleStartConversation = async (contact: ContatoDto) => {
    try {
      const conversation = await startConversation(contact.id, `Olá ${contact.nome}! Como posso ajudá-lo?`)
      if (onStartConversation) {
        onStartConversation(conversation.id)
      }
    } catch (err) {
      console.error("Erro ao iniciar conversa:", err)
    }
  }

  const handleSearch = (value: string) => {
    setSearchTerm(value)
    searchContacts(value)
  }

  if (error) {
    return (
      <div className="p-4 text-center">
        <div className="text-red-500 mb-2">Erro ao carregar contatos</div>
        <p className="text-gray-600 text-sm">{error}</p>
      </div>
    )
  }

  return (
    <div className="h-full flex flex-col bg-white">
      {/* Header */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-gray-800">Contatos</h2>
          <Button onClick={() => setShowForm(true)} size="sm">
            <Plus className="h-4 w-4 mr-2" />
            Novo Contato
          </Button>
        </div>

        {/* Busca */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            placeholder="Buscar contatos..."
            value={searchTerm}
            onChange={(e) => handleSearch(e.target.value)}
            className="pl-10 bg-gray-50 border-gray-200 rounded-full"
          />
        </div>
      </div>

      {/* Lista de Contatos */}
      <div className="flex-1 overflow-y-auto p-4">
        {loading ? (
          <div className="flex justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
          </div>
        ) : (
          <div className="space-y-3">
            {contacts.map((contact) => (
              <Card key={contact.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                        <span className="text-blue-600 font-medium">{contact.nome.charAt(0).toUpperCase()}</span>
                      </div>
                      <div>
                        <h3 className="font-medium text-gray-900">{contact.nome}</h3>
                        <div className="flex items-center space-x-2 text-sm text-gray-600">
                          <Phone className="h-3 w-3" />
                          <span>{contact.telefone}</span>
                        </div>
                        {contact.tags && contact.tags.length > 0 && (
                          <div className="flex flex-wrap gap-1 mt-1">
                            {contact.tags.map((tag, index) => (
                              <Badge key={index} variant="secondary" className="text-xs">
                                {tag}
                              </Badge>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center space-x-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleStartConversation(contact)}
                        title="Iniciar conversa"
                      >
                        <MessageCircle className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setEditingContact(contact)}
                        title="Editar contato"
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => deactivateContact(contact.id)}
                        title="Excluir contato"
                        className="text-red-500 hover:text-red-700"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}

            {contacts.length === 0 && !loading && (
              <div className="text-center py-8">
                <div className="w-16 h-16 bg-gray-100 rounded-full mx-auto mb-4 flex items-center justify-center">
                  <Phone className="h-8 w-8 text-gray-400" />
                </div>
                <h3 className="text-lg font-medium text-gray-600 mb-2">Nenhum contato encontrado</h3>
                <p className="text-gray-500 mb-4">
                  {searchTerm ? "Tente buscar com outros termos" : "Comece adicionando um novo contato"}
                </p>
                {!searchTerm && (
                  <Button onClick={() => setShowForm(true)}>
                    <Plus className="h-4 w-4 mr-2" />
                    Adicionar Contato
                  </Button>
                )}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Formulários */}
      {showForm && (
        <ContactForm onSubmit={handleCreateContact} onCancel={() => setShowForm(false)} title="Novo Contato" />
      )}

      {editingContact && (
        <ContactForm
          contact={editingContact}
          onSubmit={handleUpdateContact}
          onCancel={() => setEditingContact(null)}
          title="Editar Contato"
        />
      )}
    </div>
  )
}
