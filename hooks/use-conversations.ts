"use client"

import { useState, useEffect, useCallback, useRef } from "react"
import { useAuth } from "@/contexts/auth-context"
import type {
  ConversationDetailsDto,
  MessageDto,
  Conversation,
  Message,
  ConversationListItemDto,
  MessageWithConversationIdDto,
} from "@/types/crm"
import { formatMessageTimestamp } from "@/utils/date-formatter"
import { ConversationsService } from "@/services/conversations"
import { signalRService } from "@/services/signalr"
import { useSignalR } from "@/contexts/signalr-context"

export function useConversations() {
   const { isAuthenticated } = useAuth()
  const { isConnected: signalRConnected } = useSignalR()
  const [selectedConversation, setSelectedConversation] = useState<string | null>(null)
  const [conversationDetails, setConversationDetails] = useState<ConversationDetailsDto | null>(null)
  const [messages, setMessages] = useState<Message[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const messageIdsRef = useRef(new Set<string>())

  // Converter DTO para formato do frontend
  const convertToFrontendFormat = useCallback((dto: ConversationListItemDto): Conversation => {
    return {
      id: dto.id,
      contatoNome: dto.contatoNome,
      lastMessage: dto.ultimaMensagemPreview,
      timestamp: dto.ultimaMensagemTimestamp,
      avatar: `/placeholder.svg?height=40&width=40`,
      status: dto.status,
      agentName: dto.agenteNome || undefined,
      atendimentoId: dto.atendimentoId || "",
      sessaoWhatsappAtiva: dto.sessaoWhatsappAtiva,
      sessaoWhatsappExpiraEm: dto.sessaoWhatsappExpiraEm || null,
    }
  }, [])

  const convertMessagesToFrontend = useCallback((dtoMessages: MessageDto[]): Message[] => {
    return dtoMessages.map((msg) => ({
      id: msg.id,
      content: msg.texto,
      timestamp: formatMessageTimestamp(msg.timestamp),
      isFromClient: msg.remetenteTipo === "Cliente",
      date: new Date(msg.timestamp).toISOString().split("T")[0],
      anexoUrl: msg.anexoUrl,
    }))
  }, [])


  const loadConversation = useCallback(
    async (conversationId: string) => {
      setLoading(true)
      setError(null)
      messageIdsRef.current.clear()

      try {
        const details = (await ConversationsService.buscarConversa(conversationId)) as ConversationDetailsDto

        setConversationDetails(details)
        const frontendMessages = convertMessagesToFrontend(details.mensagens)
        setMessages(frontendMessages)

        frontendMessages.forEach((msg) => messageIdsRef.current.add(msg.id))

        if (signalRConnected) {
          try {
            await signalRService.joinConversationGroup(conversationId)
          } catch (signalRError) {
            console.warn("⚠️ Erro ao entrar no grupo SignalR:", signalRError)
          }
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "Erro ao carregar conversa")
        console.error("❌ Erro ao carregar conversa:", err)
      } finally {
        setLoading(false)
      }
    },
    [convertMessagesToFrontend, signalRConnected],
  )

  const sendMessage = useCallback(
    async (content: string, file?: File) => {
      if (!selectedConversation) return

      try {
        const formData = new FormData()
        formData.append("Texto", content)
        formData.append("RemetenteTipo", "Agente")

        if (file) {
          formData.append("Anexo", file)
        }

        const newMessage = (await ConversationsService.adicionarMensagem(selectedConversation, formData)) as MessageDto

        const frontendMessage: Message = {
          id: newMessage.id,
          content: newMessage.texto,
          timestamp: new Date(newMessage.timestamp).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" }),
          isFromClient: false,
          date: new Date(newMessage.timestamp).toISOString().split("T")[0],
          anexoUrl: newMessage.anexoUrl,
        }

        // Adicionar mensagem apenas se não existir
        if (!messageIdsRef.current.has(frontendMessage.id)) {
          messageIdsRef.current.add(frontendMessage.id)
          setMessages((prev) => [...prev, frontendMessage])
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "Erro ao enviar mensagem")
        console.error("❌ Erro ao enviar mensagem:", err)
      }
    },
    [selectedConversation],
  )

  const startConversation = useCallback(async (contactId: string, templateName: string, bodyParameters: string[]) => {
    try {
      const response = await ConversationsService.iniciarConversaPorTemplate({
        contactId,
        templateName,
        bodyParameters,
      })

      if (response) {
        return response
      } else {
        throw new Error("Erro ao iniciar conversa com template")
      }
    } catch (err) {
      console.error("❌ Erro ao iniciar conversa com template:", err)
      throw err
    }
  }, [])

  // Configurar listener do SignalR para novas mensagens APENAS para a conversa ativa
  useEffect(() => {
    if (!signalRConnected  || !selectedConversation) {
      return
    }

    const handleNewMessage = (messageWithConvId: MessageWithConversationIdDto) => {
      console.log("📨 Nova mensagem recebida via SignalR no chat:", messageWithConvId)

      // Verificar se a mensagem é para a conversa atual
      if (messageWithConvId.conversationId !== selectedConversation) {
        console.log("📨 Mensagem não é para a conversa atual, ignorando no chat")
        return
      }

      // Verificar se a mensagem já existe para evitar duplicatas
      if (messageIdsRef.current.has(messageWithConvId.id)) {
        console.log("📨 Mensagem já existe no chat, ignorando duplicata")
        return
      }

      const frontendMessage: Message = {
        id: messageWithConvId.id,
        content: messageWithConvId.texto,
        timestamp: formatMessageTimestamp(messageWithConvId.timestamp),
        isFromClient: messageWithConvId.remetenteTipo === "Cliente",
        date: new Date(messageWithConvId.timestamp).toISOString().split("T")[0],
        anexoUrl: messageWithConvId.anexoUrl,
      }

      messageIdsRef.current.add(frontendMessage.id)

      setMessages((prev) => {
        console.log(`📨 Adicionando mensagem ao chat. Total: ${prev.length + 1}`)
        return [...prev, frontendMessage]
      })
    }

    const unsubscribe = signalRService.on("ReceiveMessage", handleNewMessage)

    return () => {
     unsubscribe()
      console.log("📨 Cleanup: Removendo listener de novas mensagens do SignalR")
    }
  }, [signalRConnected, selectedConversation])

  const selectConversation = useCallback(
    async (conversationId: string | null) => {
      if (selectedConversation && signalRConnected) {
        try {
          await signalRService.leaveConversationGroup(selectedConversation)
        } catch (error) {
          console.warn("⚠️ Erro ao sair do grupo SignalR:", error)
        }
      }

      setSelectedConversation(conversationId)

      if (conversationId) {
        await loadConversation(conversationId)
      } else {
        setConversationDetails(null)
        setMessages([])
        messageIdsRef.current.clear()
      }
    },
    [selectedConversation, loadConversation, signalRConnected],
  )

useEffect(() => {
    return () => {
      if (selectedConversation && signalRConnected) {
        signalRService.leaveConversationGroup(selectedConversation)
      }
    }
  }, [selectedConversation, signalRConnected])

 return {
    selectedConversation,
    conversationDetails,
    messages,
    loading,
    error,
    signalRConnected,
    selectConversation,
    sendMessage,
    startConversation,
    resolveConversation: (id: string) => ConversationsService.resolverConversa(id),
    assignAgent: (conversationId: string, agentId: string) =>
      ConversationsService.atribuirAgente(conversationId, agentId),
    transferConversation: (conversationId: string, data: { novoAgenteId?: string; novoSetorId?: string }) =>
      ConversationsService.transferirConversa(conversationId, data),
    convertToFrontendFormat,
    convertMessagesToFrontend,
  }
}
