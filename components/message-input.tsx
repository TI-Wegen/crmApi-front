"use client"

import type React from "react"
import { useState } from "react"
import { Send, Paperclip, Smile, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useTemplates } from "@/hooks/use-templates"
import { useConversations } from "@/hooks/use-conversations"

interface MessageInputProps {
  onSendMessage: (content: string, file?: File) => void
  sessaoAtiva: boolean
  onConversationStarted?: (conversationId: string) => void
  conversationId: string
  contactName: string
}

export default function MessageInput({
  onSendMessage,
  sessaoAtiva,
  conversationId,
  onConversationStarted,
  contactName
}: MessageInputProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [message, setMessage] = useState("")
  const [selectedTemplateId, setSelectedTemplateId] = useState("")
  const [loading, setLoading] = useState(false)

  const { templates, loading: loadingTemplates } = useTemplates()
  const { startConversation } = useConversations()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (sessaoAtiva) {
      if (message.trim() || selectedFile) {
        onSendMessage(message.trim(), selectedFile || undefined)
        setMessage("")
        setSelectedFile(null)
      }
    } else {
      if (!conversationId || !selectedTemplateId) return

      const bodyParameters = [contactName]
        console.log("Conversa body:", bodyParameters)

      setLoading(true)
      try {
        const conversation = await startConversation(
          conversationId,
          selectedTemplateId,
          bodyParameters
        )


        if (onConversationStarted) {
          onConversationStarted(conversationId)
        }
      } catch (err) {
        console.error("Erro ao iniciar conversa:", err)
      } finally {
        setLoading(false)
      }
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSubmit(e)
    }
  }

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) setSelectedFile(file)
  }

  return (
    <div className="p-4 border-t border-gray-200 bg-white">
      <form onSubmit={handleSubmit} className="flex flex-col gap-2">
        {selectedFile && (
          <div className="flex items-center space-x-2 text-sm text-gray-600">
            <Paperclip className="h-4 w-4" />
            <span>{selectedFile.name}</span>
            <button type="button" onClick={() => setSelectedFile(null)} className="text-red-500 hover:text-red-700">
              ×
            </button>
          </div>
        )}

        <div className="flex items-center space-x-2">
          {sessaoAtiva ? (
            <>
              <input
                type="file"
                id="file-input"
                className="hidden"
                onChange={handleFileSelect}
                accept="image/*,application/pdf,.doc,.docx"
              />
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="text-gray-500 hover:text-gray-700"
                onClick={() => document.getElementById("file-input")?.click()}
              >
                <Paperclip className="h-5 w-5" />
              </Button>

              <div className="flex-1 relative">
                <Input
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Digite sua mensagem..."
                  className="pr-10 rounded-full border-gray-300 focus:border-blue-500"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                >
                  <Smile className="h-4 w-4" />
                </Button>
              </div>
            </>
          ) : (
            <select
              value={selectedTemplateId}
              onChange={(e) => setSelectedTemplateId(e.target.value)}
              className="flex-1 border rounded px-3 py-2 text-sm text-gray-700"
              disabled={loading || loadingTemplates}
            >
              <option value="">Selecione um modelo de mensagem...</option>
              {templates.map((template) => (
                <option key={template.id} value={template.name}>
                  {template.body}
                </option>
              ))}
            </select>
          )}

          <Button
            type="submit"
            size="sm"
            className="rounded-full bg-blue-500 hover:bg-blue-600"
            disabled={
              loading ||
              (sessaoAtiva
                ? !message.trim() 
                : !selectedTemplateId)
            }
          >
            {loading ? (
              <Loader2 className="animate-spin h-4 w-4" />
            ) : (
              <Send className="h-4 w-4" />
            )}
          </Button>
        </div>
      </form>
    </div>
  )
}
