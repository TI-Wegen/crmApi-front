"use client"

import { useState } from "react"
import { MessageCircle, Search } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useContacts } from "@/hooks/use-contacts"
import type { ContatoDto } from "@/types/crm"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select"
import { useTemplates } from "@/hooks/use-templates"
import { useConversations } from "@/hooks/use-conversations"

interface NewConversationProps {
  onConversationStarted?: (conversationId: string) => void
  onCancel?: () => void
}

export default function NewConversation({ onConversationStarted, onCancel }: NewConversationProps) {
  const { contacts, searchContacts } = useContacts()
  const { startConversation } = useConversations()
  const {templates,error} = useTemplates()
  const [selectedContact, setSelectedContact] = useState<ContatoDto | null>(null)
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [loading, setLoading] = useState(false)

  const handleSearch = (value: string) => {
    setSearchTerm(value)
    searchContacts(value)
  }

  const handleStartConversation = async () => {
    if (!selectedContact) return

    const bodyParameters =  [selectedContact.nome]
    setLoading(true)
    try {
      const conversation = await startConversation(
        selectedContact.id,
        selectedTemplate || "",
        bodyParameters
      )
      if (onConversationStarted) {
        onConversationStarted(conversation.id)
      }
    } catch (err) {
      console.error("Erro ao iniciar conversa:", err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <Card className="w-full max-w-2xl mx-4 max-h-[80vh] overflow-hidden">
        <CardHeader>
          <CardTitle className="flex items-center">
            <MessageCircle className="h-5 w-5 mr-2" />
            Nova Conversa
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {!selectedContact ? (
            <>
              {/* Busca de contatos */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Buscar contato..."
                  value={searchTerm}
                  onChange={(e) => handleSearch(e.target.value)}
                  className="pl-10"
                />
              </div>

              {/* Lista de contatos */}
              <div className="max-h-60 overflow-y-auto space-y-2">
                {contacts.map((contact) => (
                  <div
                    key={contact.id}
                    className="p-3 border rounded-lg hover:bg-gray-50 cursor-pointer transition-colors"
                    onClick={() => setSelectedContact(contact)}
                  >
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                        <span className="text-blue-600 font-medium text-sm">
                          {contact.nome.charAt(0).toUpperCase()}
                        </span>
                      </div>
                      <div>
                        <h4 className="font-medium text-gray-900">{contact.nome}</h4>
                        <p className="text-sm text-gray-600">{contact.telefone}</p>
                      </div>
                    </div>
                  </div>
                ))}

                {contacts.length === 0 && searchTerm && (
                  <div className="text-center py-4 text-gray-500">Nenhum contato encontrado</div>
                )}
              </div>
            </>
          ) : (
            <>
              {/* Contato selecionado */}
              <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                    <span className="text-blue-600 font-medium">{selectedContact.nome.charAt(0).toUpperCase()}</span>
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900">{selectedContact.nome}</h4>
                    <p className="text-sm text-gray-600">{selectedContact.telefone}</p>
                  </div>
                </div>
                <Button variant="ghost" size="sm" onClick={() => setSelectedContact(null)}>
                  Alterar
                </Button>
              </div>

              {/* Mensagem inicial */}
              <div className="space-y-2">
                <Select value={selectedTemplate || undefined} onValueChange={setSelectedTemplate}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Selecione um template (opcional)" />
                  </SelectTrigger>
                  <SelectContent>
                    {templates.map((template) => (
                      <SelectItem key={template.id} value={`${template.name}`}>
                         {template.name} : {template.body}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </>
          )}

          {/* Botões */}
          <div className="flex space-x-2 pt-4">
            <Button type="button" variant="outline" onClick={onCancel} className="flex-1">
              Cancelar
            </Button>
            {selectedContact && (
              <Button onClick={handleStartConversation} disabled={ loading} className="flex-1">
                {loading ? "Iniciando..." : "Iniciar Conversa"}
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
