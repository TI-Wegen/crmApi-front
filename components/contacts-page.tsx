"use client";

import {useCallback, useEffect, useMemo, useState} from "react";
import {Toaster} from "sonner";
import ChatArea from "@/components/chat-area";
import ContactsManager from "@/components/contacts-manager";
import {useConversations} from "@/hooks/use-conversations";
import {useAgents} from "@/hooks/use-agents";
import {Conversation} from "@/types/conversa";
import UserProfileMenu from "@/components/user-profile-menu";

const ContactsPage = () => {
    const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);

    const {
        conversationDetails,
        messages,
        loading: chatLoading,
        error: chatError,
        sendMessage,
        startConversation,
        resolveConversation,
        loadMoreMessages,
        hasMoreMessages,
        loadConversationByContact,
        selectConversation,
        setConversationDetails
    } = useConversations();

    const {setores} = useAgents();

    const handleNewConversationFromContacts = useCallback(async (contactId: string): Promise<void> => {
        await loadConversationByContact(contactId, 1);
    }, [loadConversationByContact]);

    const handleStartConversation = useCallback(async (contactId: string): Promise<void> => {
        const name = conversationDetails?.contatoNome || "";
        const id = conversationDetails?.id || "";
        await startConversation(contactId, "template", [name]).then(_ => selectConversation(id));
    }, [conversationDetails, startConversation]);

    const handleEndConversation = async (atendimentoId: string) => {
        if (!atendimentoId) return;
        try {
            await resolveConversation(atendimentoId)
            selectConversation(null)
        } catch (error) {
            console.error("Erro ao encerrar atendimento:", error);
        }
    };

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
            contatoTelefone: conversationDetails.contatoTelefone || "",
            agenteId: conversationDetails.agenteId || "",
        } as Conversation;
    }, [conversationDetails]);

    const handleViewProfile = () => {
        setIsProfileMenuOpen(!isProfileMenuOpen);
    };

    const handleUserUpdate = (updatedUser: { name: string }) => {
        if (conversationDetails) {
            setConversationDetails({
                ...conversationDetails,
                contatoNome: updatedUser.name
            });
        }
    }

    if (chatError) {
        return (
            <div className="flex h-screen items-center justify-center bg-gray-100">
                <div className="text-center">
                    <div className="text-red-500 text-lg font-medium mb-2">
                        Connection Error
                    </div>
                    <p className="text-gray-600">{chatError}</p>
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

    return (
        <div className="flex flex-col h-full bg-gray-100">
            <Toaster richColors position="top-right"/>

            <div className="flex h-full bg-gray-100">
                <div className="flex flex-1 overflow-hidden">
                    <div className="w-1/3 min-w-[320px] bg-white border-r border-gray-200 flex flex-col">
                        <div className="flex-1 overflow-hidden">
                            <ContactsManager
                                onStartConversation={handleNewConversationFromContacts}
                            />
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
                            hasTagsMarks={false}
                            hasMoreMessages={hasMoreMessages}
                            isFirstPage={(conversationDetails?.currentPage ?? 1) === 1}
                            onViewProfile={handleViewProfile}

                        />
                    </div>
                    <UserProfileMenu
                        user={{
                            id: formattedConversation?.contatoId || '',
                            name: formattedConversation?.contatoNome || '',
                            phone: formattedConversation?.contatoTelefone || '',
                            avatar: formattedConversation?.avatar
                        }}
                        isOpen={isProfileMenuOpen}
                        onClose={handleViewProfile}
                        onlyView={false}
                        onUserUpdate={handleUserUpdate}
                    />
                </div>
            </div>
        </div>
    );
}

export default ContactsPage;
