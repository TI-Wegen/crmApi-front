"use client";

import {useCallback, useEffect, useMemo, useState} from "react";
import {MessageCircle, Plus, Users} from "lucide-react";
import {Button} from "@/components/ui/button";
import {Toaster} from "sonner";
import ConversationList from "@/components/conversation-list";
import ChatArea from "@/components/chat-area";
import ContactsManager from "@/components/contacts-manager";
import NewConversation from "@/components/new-conversation";
import ConversationFilters from "@/components/conversation-filters";
import UserHeader from "@/components/user-header";
import {useAgents} from "@/hooks/use-agents";
import {useConversations} from "@/hooks/use-conversations";
import {useConversationList} from "@/hooks/use-conversation-list";
import {useSignalRConnectionStatus} from "@/hooks/use-signalR-connection-status";
import {throws} from "node:assert";
import {log} from "node:util";

interface ConversationCounts {
    all: number;
    AguardandoNaFila: number;
    EmAtendimento: number;
    Resolvida: number;
}

type ActiveTab = "conversations" | "contacts";
type ConversationFilter = "all" | "AguardandoNaFila" | "EmAtendimento" | "Resolvida";

const ChatPage = () => {
    const [activeTab, setActiveTab] = useState<ActiveTab>("conversations");
    const [showNewConversation, setShowNewConversation] = useState<boolean>(false);
    const [conversationFilter, setConversationFilter] = useState<ConversationFilter>("all");
    const isSignalRConnected = useSignalRConnectionStatus();

    const {
        selectedConversation,
        conversationDetails,
        messages,
        loading: chatLoading,
        error: chatError,
        selectConversation,
        sendMessage,
        startConversation,
        loadConversation
    } = useConversations();

    const {
        conversations,
        loading: conversationsLoading,
        error: conversationsError,
        searchConversations,
        markAsRead,
        filterByStatus,
        loadMoreConversations,
        hasMore,
        refreshConversations
    } = useConversationList(selectedConversation, () => {
        if (selectedConversation) {
            loadConversation(selectedConversation);
        }
    });


    const {setores} = useAgents();

    const handleSelectAndMarkAsRead = useCallback((conversationId: string): void => {
        markAsRead(conversationId);
        selectConversation(conversationId);
    }, [markAsRead, selectConversation]);

    const handleStartConversation = useCallback(async (conversationId: string): Promise<void> => {
        setShowNewConversation(false);
        setActiveTab("conversations");
        const name = conversationDetails?.contatoNome || "";
        const id = conversationDetails?.id || "";
        await startConversation(conversationId, "template", [name]).then(_ => selectConversation(id));
    }, [conversationDetails, startConversation]);


    const handleNewConversationFromContacts = useCallback((conversationId: string): void => {
        setActiveTab("conversations");
        selectConversation(conversationId);
    }, [selectConversation]);

    const handleFilterChange = useCallback((filter: ConversationFilter): void => {
        setConversationFilter(filter);
        filterByStatus(filter === "all" ? null : (filter as "AguardandoNaFila" | "EmAtendimento" | "Resolvida" | null));
    }, [filterByStatus]);


    const conversationCounts = useMemo((): ConversationCounts => ({
        all: conversations.length,
        AguardandoNaFila: conversations.filter(c => c.status === "AguardandoNaFila").length,
        EmAtendimento: conversations.filter(c => c.status === "EmAtendimento").length,
        Resolvida: conversations.filter(c => c.status === "Resolvida").length,
    }), [conversations]);

    const error = chatError || conversationsError;

    if (error) {
        return (
            <div className="flex h-screen items-center justify-center bg-gray-100">
                <div className="text-center">
                    <div className="text-red-500 text-lg font-medium mb-2">
                        Connection Error
                    </div>
                    <p className="text-gray-600">{error}</p>
                    <button
                        onClick={(): void => window.location.reload()}
                        className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                    >
                        Try Again
                    </button>
                </div>
            </div>
        );
    }

    const formattedConversation = useMemo(() => {
        if (!conversationDetails) return undefined;

        return {
            id: conversationDetails.id,
            contatoNome: conversationDetails.contatoNome || "",
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
            atendimentoId: conversationDetails.atendimentoId || "",
            sessaoWhatsappAtiva: conversationDetails.sessaoWhatsappAtiva,
            sessaoWhatsappExpiraEm: conversationDetails.sessaoWhatsappExpiraEm,
            contatoId: conversationDetails.contatoId || "",
            agenteId: conversationDetails.agenteId || "",
        };

    }, [conversationDetails]);


    return (
        <div className="flex flex-col h-screen bg-gray-100">
            <Toaster richColors position="top-right"/>
            <UserHeader signalRConnected={!!isSignalRConnected}/>

            <div className="flex h-full bg-gray-100">
                <div className="flex flex-1 overflow-hidden">
                    <div className="w-1/3 min-w-[320px] bg-white border-r border-gray-200 flex flex-col">
                        <div className="flex border-b border-gray-200">
                            <button
                                onClick={(): void => setActiveTab("conversations")}
                                className={`flex-1 flex items-center justify-center py-3 px-4 text-sm font-medium transition-colors ${
                                    activeTab === "conversations"
                                        ? "text-blue-600 border-b-2 border-blue-600 bg-blue-50"
                                        : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
                                }`}
                                aria-label="Conversations"
                            >
                                <MessageCircle className="h-4 w-4 mr-2"/>
                                Conversations
                            </button>
                            <button
                                onClick={(): void => setActiveTab("contacts")}
                                className={`flex-1 flex items-center justify-center py-3 px-4 text-sm font-medium transition-colors ${
                                    activeTab === "contacts"
                                        ? "text-blue-600 border-b-2 border-blue-600 bg-blue-50"
                                        : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
                                }`}
                                aria-label="Contacts"
                            >
                                <Users className="h-4 w-4 mr-2"/>
                                Contacts
                            </button>
                        </div>

                        {activeTab === "conversations" && (
                            <div className="p-4 border-b border-gray-200 flex-shrink-0">
                                <Button
                                    onClick={(): void => setShowNewConversation(true)}
                                    className="w-full"
                                    size="sm"
                                >
                                    <Plus className="h-4 w-4 mr-2"/>
                                    New Conversation
                                </Button>
                            </div>
                        )}

                        <div className="flex-1 overflow-hidden conversation-scroll">
                            {activeTab === "conversations" ? (
                                <div className="flex-1 flex flex-col h-full">
                                    <ConversationFilters
                                        activeFilter={conversationFilter}
                                        onFilterChange={handleFilterChange}
                                        conversationCounts={conversationCounts}
                                    />
                                    <div className="flex-1 overflow-hidden">
                                        <ConversationList
                                            conversations={conversations}
                                            selectedId={selectedConversation || ""}
                                            onSearch={searchConversations}
                                            loading={conversationsLoading}
                                            onSelectConversation={handleSelectAndMarkAsRead}
                                            hasMore={hasMore}
                                            onLoadMore={loadMoreConversations}
                                        />
                                    </div>
                                </div>
                            ) : (
                                <ContactsManager
                                    onStartConversation={handleNewConversationFromContacts}
                                />
                            )}
                        </div>
                    </div>

                    <div className="flex-1 flex flex-col">
                        <ChatArea
                            conversation={formattedConversation}
                            messages={messages}
                            onSendMessage={sendMessage}
                            loading={chatLoading}
                            onConversationStarted={handleStartConversation}
                            setores={setores}
                        />
                    </div>
                </div>
            </div>

            {showNewConversation && (
                <NewConversation
                    onConversationStarted={handleStartConversation}
                    onCancel={(): void => setShowNewConversation(false)}
                />
            )}
        </div>
    );
}

export default ChatPage;