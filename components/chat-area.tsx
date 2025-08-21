"use client"

import {useEffect, useRef, useState} from "react"
import {ArrowRightLeft, LogOut, MoreVertical} from "lucide-react"
import {Button} from "@/components/ui/button"
import MessageBubble from "./message-bubble"
import MessageInput from "./message-input"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
    Dialog,
    DialogClose,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import {Label} from "@/components/ui/label"
import {Select, SelectContent, SelectItem, SelectTrigger, SelectValue} from "@/components/ui/select"
import {formatDate} from "@/utils/date-formatter"
import {Conversation} from "@/types/conversa";
import {Message} from "@/types/messagem";
import {SetorDto} from "@/types/setor";

interface ChatAreaProps {
  conversation?: Conversation
  messages: Message[]
  onSendMessage: (content: string, file?: File) => void
  loading?: boolean
  onEndConversation: (atendimentoId: string) => Promise<void>
  onTransferConversation: (conversationId: string, setorId: string) => Promise<void>
  onConversationStarted?: (conversationId: string) => void
  setores: SetorDto[]
}

export default function ChatArea({
  conversation,
  messages,
  onSendMessage,
  loading,
  onEndConversation,
  onTransferConversation,
  onConversationStarted,
  setores,
}: ChatAreaProps) {
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const [isTransferModalOpen, setIsTransferModalOpen] = useState<boolean>(false)
  const [selectedSetor, setSelectedSetor] = useState<string>("")
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false)

  const scrollToBottom = (): void => {
    messagesEndRef.current?.scrollIntoView({ behavior: "auto" })
  }

  useEffect((): void => {
    scrollToBottom()
  }, [messages, conversation])

  if (!conversation) {
    return (
      <div className="flex-1 flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="w-24 h-24 bg-gray-200 rounded-full mx-auto mb-4 flex items-center justify-center">
            <span className="text-gray-400 text-2xl">💬</span>
          </div>
          <h3 className="text-lg font-medium text-gray-600 mb-2">Selecione uma conversa</h3>
          <p className="text-gray-500">Escolha uma conversa da lista para começar a atender</p>
        </div>
      </div>
    )
  }

  const groupedMessages: Record<string, Message[]> = messages.reduce(
    (groups: Record<string, Message[]>, message: Message): Record<string, Message[]> => {
      const date: string = message.date
      if (!groups[date]) {
        groups[date] = []
      }
      groups[date] = [message, ...groups[date]]
      return groups
    },
    {} as Record<string, Message[]>,
  )

  const handleEnd = async (): Promise<void> => {
    if (!conversation) return
    setIsSubmitting(true)
    await onEndConversation(conversation.atendimentoId)
    setIsSubmitting(false)
  }

  const handleTransfer = async (): Promise<void> => {
    if (!conversation || !selectedSetor) return
    setIsSubmitting(true)
    await onTransferConversation(conversation.id, selectedSetor)
    setIsSubmitting(false)
    setIsTransferModalOpen(false)
    setSelectedSetor("")
  }

  return (
    <div className="flex flex-col h-full bg-white">
      <div className="p-4 border-b border-gray-200 bg-white">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <img
              src={conversation.avatar || "/placeholder.svg"}
              alt={conversation.contatoNome}
              className="w-10 h-10 rounded-full object-cover"
            />
            <div>
              <h2 className="font-medium text-gray-900">{conversation.contatoNome}</h2>
              <p className="text-sm text-green-500">Online</p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" disabled={isSubmitting}>
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onSelect={(): void => setIsTransferModalOpen(true)}>
                  <ArrowRightLeft className="mr-2 h-4 w-4" />
                  <span>Transferir Atendimento</span>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onSelect={handleEnd}
                  className="text-red-500 focus:text-red-500 focus:bg-red-50"
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Encerrar Atendimento</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
        {Object.entries(groupedMessages)
          .sort(([dateA], [dateB]): number =>
            new Date(dateA).getTime() - new Date(dateB).getTime()
          )
          .map(([date, dayMessages]) => (
            <div key={date}>
              <div className="flex justify-center mb-4">
                <span className="bg-white px-3 py-1 rounded-full text-xs text-gray-500 shadow-sm">
                  {formatDate(date)}
                </span>
              </div>

              <div className="space-y-2">
                {dayMessages.map((message: Message) => (
                  <MessageBubble key={message.id} message={message} />
                ))}
              </div>
            </div>
          ))
        }
        <div ref={messagesEndRef} />
      </div>

      {loading && (
        <div className="flex justify-center py-2">
          <div className="flex items-center space-x-2 text-gray-500">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-500"></div>
            <span className="text-sm">Carregando...</span>
          </div>
        </div>
      )}

      <MessageInput
        onSendMessage={onSendMessage}
        sessaoAtiva={conversation.sessaoWhatsappAtiva}
        onConversationStarted={onConversationStarted}
        conversationId={conversation.contatoId}
        contactName={conversation.contatoNome}
      />

      <Dialog open={isTransferModalOpen} onOpenChange={setIsTransferModalOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Transferir Atendimento</DialogTitle>
            <DialogDescription>
              Selecione o setor para o qual deseja transferir esta conversa.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <div className="grid gap-4">
              <Label htmlFor="setor">Setor de Destino</Label>
              <Select value={selectedSetor} onValueChange={setSelectedSetor}>
                <SelectTrigger id="setor">
                  <SelectValue placeholder="Selecione um setor" />
                </SelectTrigger>
                <SelectContent>
                  {setores.map((setor: SetorDto) => (
                    <SelectItem key={setor.id} value={setor.id}>
                      {setor.nome}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline">Cancelar</Button>
            </DialogClose>
            <Button
              onClick={handleTransfer}
              disabled={!selectedSetor || isSubmitting}
            >
              {isSubmitting ? "Transferindo..." : "Transferir"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
