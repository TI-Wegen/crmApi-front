"use client"

import {useEffect, useRef, useState} from "react"
import MessageBubble from "./message-bubble"
import MessageInput from "./message-input"
import {formatDate} from "@/utils/date-formatter"
import {Conversation} from "@/types/conversa";
import {Message} from "@/types/messagem";
import {SetorDto} from "@/types/setor";
import {User} from "lucide-react";

interface ChatAreaProps {
    conversation?: Conversation
    messages: Message[]
    onSendMessage: (content: string, file?: File) => void
    loading?: boolean
    onConversationStarted?: (conversationId: string) => void
    setores: SetorDto[]
}

export default function ChatArea({
                                     conversation,
                                     messages,
                                     onSendMessage,
                                     loading,
                                     onConversationStarted,
                                     setores,
                                 }: ChatAreaProps) {
    const messagesEndRef = useRef<HTMLDivElement>(null)

    const scrollToBottom = (): void => {
        messagesEndRef.current?.scrollIntoView({behavior: "auto"})
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

    return (
        <div className="flex flex-col h-full bg-white">
            <div className="p-4 border-b border-gray-200 bg-white">
                <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                        {[null, "", undefined].includes(conversation?.avatar) ? (
                            <img
                                src={conversation.avatar}
                                className="w-12 h-12 rounded-full object-cover ring-2 ring-white shadow-sm"
                            />) : (<User/>)
                        }
                        <div>
                            <h2 className="font-medium text-gray-900">{conversation.contatoNome}</h2>
                            <p className="text-sm text-green-500">Online</p>
                        </div>
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
                                    <MessageBubble key={message.id} message={message}/>
                                ))}
                            </div>
                        </div>
                    ))
                }
                <div ref={messagesEndRef}/>
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
        </div>
    )
}
