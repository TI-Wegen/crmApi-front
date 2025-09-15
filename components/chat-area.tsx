import { useCallback, useEffect, useRef, useState } from "react";
import MessageBubble from "./message-bubble";
import MessageInput from "./message-input";
import { Conversation } from "@/types/conversa";
import { Message } from "@/types/messagem";
import { SetorDto } from "@/types/setor";
import { ArrowDown, LogOut, MoreVertical, Tag, User } from "lucide-react";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuSub,
    DropdownMenuSubContent,
    DropdownMenuSubTrigger,
    DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { useTags } from "@/hooks/use-tags";
import { useContacts } from "@/hooks/use-contacts";

interface ChatAreaProps {
    conversation?: Conversation;
    messages: Message[];
    onSendMessage: (content: string, file?: File) => void;
    loading?: boolean;
    onEndConversation: (atendimentoId: string) => Promise<void>;
    onConversationStarted?: (conversationId: string) => void;
    setores: SetorDto[];
    onLoadMoreMessages?: () => void;
    hasMoreMessages?: boolean;
    hasTagsMarks?: boolean;
    isFirstPage?: boolean;
    onTagChange?: (tagId: string) => void;
    onViewProfile: () => void;
}

export default function ChatArea({
                                     conversation,
                                     messages,
                                     onSendMessage,
                                     loading,
                                     onEndConversation,
                                     onConversationStarted,
                                     setores,
                                     onLoadMoreMessages,
                                     hasMoreMessages = true,
                                     hasTagsMarks = true,
                                     isFirstPage = true,
                                     onTagChange,
                                     onViewProfile
                                 }: ChatAreaProps) {
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const messagesContainerRef = useRef<HTMLDivElement>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isFetching, setIsFetching] = useState(false);
    const [showScrollButton, setShowScrollButton] = useState(false);
    const previousHeightRef = useRef(0);

    const { tags, loading: tagsLoading } = useTags();
    const { addTagInContact } = useContacts();

    useEffect(() => {
        if (!messagesContainerRef.current) return;

        const container = messagesContainerRef.current;

        if (isFetching) {
            previousHeightRef.current = container.scrollHeight;
        } else if (!isFetching && previousHeightRef.current > 0) {
            container.scrollTop = container.scrollHeight - previousHeightRef.current;
            previousHeightRef.current = 0;
        }
    }, [messages, isFetching]);

    useEffect(() => {
        if (isFirstPage || messages[messages.length - 1]) {
            messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
        }
    }, [messages, isFirstPage]);

    const handleScroll = useCallback(() => {
        if (!messagesContainerRef.current || !onLoadMoreMessages || !hasMoreMessages || isFetching) return;

        const container = messagesContainerRef.current;

        if (container.scrollTop <= 50) {
            setIsFetching(true);
            onLoadMoreMessages();
        }

        const atBottom = container.scrollHeight - container.scrollTop <= container.clientHeight + 100;
        setShowScrollButton(!atBottom);
    }, [onLoadMoreMessages, hasMoreMessages, isFetching]);

    useEffect(() => {
        const container = messagesContainerRef.current;
        if (!container) return;

        container.addEventListener("scroll", handleScroll);
        return () => container.removeEventListener("scroll", handleScroll);
    }, [handleScroll]);

    const handleEnd = async () => {
        if (!conversation) return;
        setIsSubmitting(true);
        await onEndConversation(conversation.atendimentoId);
        setIsSubmitting(false);
    };

    const handleTagContact = async (tagId: string) => {
        if (!conversation?.contatoId) return;
        addTagInContact(conversation.contatoId, tagId);
        onTagChange?.(tagId);
    };

    const handleSendMessage = (content: string, file?: File) => {
        onSendMessage(content, file);
    };

    const groupedMessages: Record<string, Message[]> = [...messages]
        .filter((message, index, self) => index === self.findIndex(m => m.id === message.id))
        .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
        .reduce((groups: Record<string, Message[]>, message: Message) => {
            const dateKey = new Date(message.date).toLocaleDateString();
            if (!groups[dateKey]) groups[dateKey] = [];
            groups[dateKey].push(message);
            return groups;
        }, {} as Record<string, Message[]>);

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
        );
    }

    return (
        <div className="flex flex-col h-full bg-white">

            <div className="p-4 border-b border-gray-200 bg-white">
                <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                        {conversation.avatar && !["", "null", "undefined"].includes(conversation.avatar) ? (
                            <img
                                src={conversation.avatar}
                                alt={conversation.contatoNome}
                                className="w-12 h-12 rounded-full object-cover ring-2 ring-white shadow-sm"
                            />
                        ) : (
                            <div className="w-12 h-12 rounded-full bg-gray-200 flex items-center justify-center"    >
                                <User className="text-gray-500" />
                            </div>
                        )}
                        <div>
                            <h2 className="font-medium text-gray-900">{conversation.contatoNome}</h2>
                            <small className="font-medium text-gray-600">{conversation.contatoTelefone}</small>
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
                                <DropdownMenuItem onSelect={onViewProfile} className="focus:bg-red-50">
                                    <User className="mr-2 h-4 w-4" />
                                    <span>Ver perfil</span>
                                </DropdownMenuItem>

                                {hasTagsMarks && (
                                    <>
                                        <DropdownMenuSub>
                                            <DropdownMenuSubTrigger>
                                                <Tag className="mr-2 h-4 w-4" />
                                                <span>Marcar essa conversa como</span>
                                            </DropdownMenuSubTrigger>
                                            <DropdownMenuSubContent>
                                                {tagsLoading ? (
                                                    <DropdownMenuItem disabled>Carregando tags...</DropdownMenuItem>
                                                ) : tags.length === 0 ? (
                                                    <DropdownMenuItem disabled>Nenhuma tag disponível</DropdownMenuItem>
                                                ) : (
                                                    tags.map(tag => (
                                                        <DropdownMenuItem
                                                            key={tag.id}
                                                            onClick={() => handleTagContact(tag.id)}
                                                            disabled={conversation.tagId === tag.id}
                                                        >
                                                            {conversation.tagId === tag.id && <span className="mr-2">✓</span>}
                                                            {tag.nome}
                                                        </DropdownMenuItem>
                                                    ))
                                                )}
                                            </DropdownMenuSubContent>
                                        </DropdownMenuSub>
                                        <DropdownMenuSeparator />
                                    </>
                                )}

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


            {showScrollButton && (
                <div className="absolute bottom-24 right-6 z-10">
                    <Button
                        size="sm"
                        className="rounded-full p-2 shadow-lg bg-blue-500 hover:bg-blue-600"
                        onClick={() => {
                            messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
                            setShowScrollButton(false);
                        }}
                    >
                        <ArrowDown className="h-5 w-5 text-white" />
                    </Button>
                </div>
            )}


            <div
                ref={messagesContainerRef}
                className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50 relative"
            >
                {isFetching && hasMoreMessages && (
                    <div className="flex justify-center py-2">
                        <div className="flex items-center space-x-2 text-gray-500">
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-500"></div>
                            <span className="text-sm">Carregando mensagens anteriores...</span>
                        </div>
                    </div>
                )}

                {Object.entries(groupedMessages).map(([date, dayMessages]) => (
                    <div key={date}>
                        <div className="space-y-2">
                            {dayMessages.map(message => (
                                <MessageBubble key={message.id} message={message} />
                            ))}
                        </div>
                    </div>
                ))}
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
                onSendMessage={handleSendMessage}
                sessaoAtiva={conversation.sessaoWhatsappAtiva}
                onConversationStarted={onConversationStarted}
                conversationId={conversation.contatoId}
                contactName={conversation.contatoNome}
            />
        </div>
    );
}