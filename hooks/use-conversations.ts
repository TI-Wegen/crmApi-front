import { useCallback, useEffect, useRef, useState } from "react"
import { ConversationsService } from "@/services/conversations"
import { signalRService } from "@/services/signalr"
import { messageMapper } from "@/mappers/message-mapper"
import type { ConversationDetailsDto } from "@/types/conversa"
import type { Message, MessageDto, MessageWithConversationIdDto } from "@/types/messagem"
import { sortMessagesByTimestamp } from "@/utils/sort-messages-by-timestamp"
import {useSignalRConnectionStatus} from "@/hooks/use-signalR-connection-status";

export interface UseConversationsReturn {
  selectedConversation: string | null
  conversationDetails: ConversationDetailsDto | null
  messages: Message[]
  loading: boolean
  error: string | null
  isConnected: boolean
  selectConversation: (conversationId: string | null) => Promise<void>
  sendMessage: (content: string, file?: File) => Promise<void>
  loadConversation: (conversationId: string) => Promise<void>
}

export function useConversations(): UseConversationsReturn {
  const { isConnected } = useSignalRConnectionStatus()
  const [selectedConversation, setSelectedConversation] = useState<string | null>(null)
  const [conversationDetails, setConversationDetails] = useState<ConversationDetailsDto | null>(null)
  const [messages, setMessages] = useState<Message[]>([])
  const [loading, setLoading] = useState<boolean>(false)
  const [error, setError] = useState<string | null>(null)
  const messageIdsRef = useRef<Set<string>>(new Set<string>())

  const loadConversation = useCallback(async (conversationId: string): Promise<void> => {
    setLoading(true)
    setError(null)
    messageIdsRef.current.clear()

    try {
      const details: ConversationDetailsDto = await ConversationsService.buscarConversa(conversationId) as ConversationDetailsDto

      setConversationDetails(details)
      const frontendMessages: Message[] = details.mensagens.map(messageMapper.fromDto)
      const sortedMessages: Message[] = sortMessagesByTimestamp(frontendMessages)
      setMessages(sortedMessages)

      sortedMessages.forEach((msg: Message): void => {
        messageIdsRef.current.add(msg.id)
      })

      if (isConnected) {
        try {
          await signalRService.joinConversationGroup(conversationId)
        } catch (signalRError: unknown) {
          console.warn("⚠️ Error joining SignalR group:", signalRError)
        }
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Error loading conversation")
      console.error("❌ Error loading conversation:", err)
    } finally {
      setLoading(false)
    }
  }, [isConnected])

  const sendMessage = useCallback(async (content: string, file?: File): Promise<void> => {
    if (!selectedConversation) return

    try {
      const formData: FormData = new FormData()
      formData.append("Texto", content)
      formData.append("RemetenteTipo", "Agente")
      if (file) formData.append("Anexo", file)

      const newMessage: MessageDto = await ConversationsService.adicionarMensagem(
        selectedConversation,
        formData
      ) as MessageDto

      const frontendMessage: Message = messageMapper.fromDto(newMessage)

      if (!messageIdsRef.current.has(frontendMessage.id)) {
        messageIdsRef.current.add(frontendMessage.id)
        setMessages((prev: Message[]): Message[] =>
          sortMessagesByTimestamp([...prev, frontendMessage])
        )
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Error sending message")
      console.error("❌ Error sending message:", err)
    }
  }, [selectedConversation])

  useEffect(() => {
    if (!isConnected || !selectedConversation) return

    const handleNewMessage = (msgDto: MessageWithConversationIdDto): void => {
      if (msgDto.conversationId !== selectedConversation) return

      const frontendMessage: Message = messageMapper.fromSignalR(msgDto)

      if (!messageIdsRef.current.has(frontendMessage.id)) {
        messageIdsRef.current.add(frontendMessage.id)
        setMessages((prev: Message[]): Message[] =>
          sortMessagesByTimestamp([...prev, frontendMessage])
        )
      }
    }

    const unsubscribe = signalRService.on("ReceiveMessage", handleNewMessage)
    return () => {
      unsubscribe()
    }
  }, [isConnected, selectedConversation])

  const selectConversation = useCallback(async (conversationId: string | null): Promise<void> => {
    if (selectedConversation && isConnected) {
      try {
        await signalRService.leaveConversationGroup(selectedConversation)
      } catch (error: unknown) {
        console.warn("⚠️ Error leaving SignalR group:", error)
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
  }, [selectedConversation, loadConversation, isConnected])

  return {
    selectedConversation,
    conversationDetails,
    messages,
    loading,
    error,
    isConnected,
    selectConversation,
    sendMessage,
    loadConversation,
  }
}
