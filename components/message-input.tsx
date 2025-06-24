"use client"

import type React from "react"

import { useState } from "react"
import { Send, Paperclip, Smile } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

// Atualizar a interface para suportar arquivos
interface MessageInputProps {
  onSendMessage: (content: string, file?: File) => void
}

export default function MessageInput({ onSendMessage }: MessageInputProps) {
  // Adicionar estado para arquivo
  // Adicionar suporte a anexos de arquivo
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [message, setMessage] = useState("")

  // Atualizar a função handleSubmit
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (message.trim() || selectedFile) {
      onSendMessage(message.trim(), selectedFile || undefined)
      setMessage("")
      setSelectedFile(null)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSubmit(e)
    }
  }

  // Adicionar função para lidar com seleção de arquivo
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setSelectedFile(file)
    }
  }

  return (
    <div className="p-4 border-t border-gray-200 bg-white">
      <form onSubmit={handleSubmit} className="flex items-center space-x-2">
        {selectedFile && (
          <div className="flex items-center space-x-2 text-sm text-gray-600 mb-2">
            <Paperclip className="h-4 w-4" />
            <span>{selectedFile.name}</span>
            <button type="button" onClick={() => setSelectedFile(null)} className="text-red-500 hover:text-red-700">
              ×
            </button>
          </div>
        )}
        {/* Atualizar o botão de anexo para ser funcional */}
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

        <Button
          type="submit"
          size="sm"
          className="rounded-full bg-blue-500 hover:bg-blue-600"
          disabled={!message.trim() && !selectedFile}
        >
          <Send className="h-4 w-4" />
        </Button>
      </form>
    </div>
  )
}
