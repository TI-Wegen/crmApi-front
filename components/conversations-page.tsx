"use client";

import {useCallback, useMemo, useState} from "react";
import {Toaster} from "sonner";
import ConversationList from "@/components/conversation-list";
import ChatArea from "@/components/chat-area";
import NewConversation from "@/components/new-conversation";
import ConversationFilters from "@/components/conversation-filters";
import {useAgents} from "@/hooks/use-agents";
import {useConversations} from "@/hooks/use-conversations";
import {useConversationList} from "@/hooks/use-conversation-list";
import {useTags} from "@/hooks/use-tags";

interface ConversationCounts {
    all: number;
    [key: string]: number;
}

type ConversationFilter = "all" | string;
const ConversationsPage = () => {
    const [showNewConversation, setShowNewConversation] = useState<boolean>(false);
    const [conversationFilter, setConversationFilter] = useState<ConversationFilter>("all");

    const {
        selectedConversation,
        conversationDetails,
        messages,
        loading: chatLoading,
        error: chatError,
        selectConversation,
        sendMessage,
        startConversation,
        loadConversation,
        resolveConversation,
        loadMoreMessages,
        hasMoreMessages
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
        loadConversations
    } = useConversationList(selectedConversation, () => {
        if (selectedConversation) {
            loadConversation(selectedConversation);
        }
    });

    const {setores} = useAgents();
    const {tags} = useTags();

    const handleEndConversation = async (atendimentoId: string) => {
        if (!atendimentoId) return;
        try {
            await resolveConversation(atendimentoId)
            selectConversation(null)
        } catch (error) {
            console.error("Erro ao encerrar atendimento:", error);
        }
    };

    const handleSelectAndMarkAsRead = useCallback((conversationId: string): void => {
        markAsRead(conversationId);
        selectConversation(conversationId);
    }, [markAsRead, selectConversation]);

    const handleStartConversation = useCallback(async (conversationId: string): Promise<void> => {
        setShowNewConversation(false);
        const name = conversationDetails?.contatoNome || "";
        const id = conversationDetails?.id || "";
        await startConversation(conversationId, "template", [name]).then(_ => selectConversation(id));
    }, [conversationDetails, startConversation]);

    const handleStartConversationWithModal = useCallback(async (conversationId: string, template: string, params: string[]): Promise<void> => {
        await startConversation(conversationId, template, params);
    }, []);

    const handleFilterChange = useCallback((filter: string): void => {
        setConversationFilter(filter as ConversationFilter);
        loadConversations({tagId: filter})
    }, [filterByStatus]);

    const conversationCounts = useMemo((): ConversationCounts => {
        const counts: ConversationCounts = {
            all: conversations.length,
            AguardandoNaFila: conversations.filter(c => c.status === "AguardandoNaFila").length,
            EmAtendimento: conversations.filter(c => c.status === "EmAtendimento").length,
            Resolvida: conversations.filter(c => c.status === "Resolvida").length,
        };

        return counts;
    }, [conversations, tags]);

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
            tagId: conversationDetails.contato?.tags || "",
            tagName: conversationDetails.tagName || "",
            tagColor: conversationDetails.tagColor || "",
            contatoTelefone: conversationDetails.contatoTelefone || "",
        };

    }, [conversationDetails]);

    return (
        <div className="flex flex-col h-full bg-gray-100">
            <Toaster richColors position="top-right"/>

            <div className="flex h-full bg-gray-100">
                <div className="flex flex-1 overflow-hidden">
                    <div className="w-1/3 min-w-[320px] bg-white border-r border-gray-200 flex flex-col">
                        <NewConversation
                            onConversationStarted={handleStartConversationWithModal}
                            onCancel={(): void => setShowNewConversation(false)}
                            show={showNewConversation}
                            setShow={setShowNewConversation}
                        />

                        <div className="flex-1 overflow-hidden">
                            <div className="flex-1 flex flex-col h-full">
                                <ConversationFilters
                                    activeFilter={conversationFilter}
                                    onFilterChange={handleFilterChange}
                                    conversationCounts={conversationCounts}
                                    tags={tags}
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
                            onEndConversation={handleEndConversation}
                            onLoadMoreMessages={loadMoreMessages}
                            hasMoreMessages={hasMoreMessages}
                            isFirstPage={(conversationDetails?.currentPage ?? false) === 1}
                        />
                    </div>
                </div>
            </div>
        </div>
    );
}

export default ConversationsPage;
