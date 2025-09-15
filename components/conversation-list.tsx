import { useState, useCallback, useRef, useEffect } from "react";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Conversation } from "@/types/conversa";
import ConversationItem from "@/components/conversation-item";

interface ConversationListProps {
    conversations: Conversation[];
    selectedId: string;
    onSearch: (term: string) => void;
    loading: boolean;
    onSelectConversation: (id: string) => void;
    hasMore?: boolean;
    onLoadMore?: () => void;
}

export default function ConversationList({
    conversations,
    selectedId,
    onSearch,
    loading,
    onSelectConversation,
    hasMore,
    onLoadMore
}: ConversationListProps) {
    const [searchTerm, setSearchTerm] = useState("");
    const observer = useRef<IntersectionObserver | null>(null);
    const lastConversationRef = useRef<HTMLDivElement | null>(null);

    const [totalConversations, setTotalConversations] = useState<number>(() => {
        if (typeof window !== 'undefined') {
            const saved = localStorage.getItem('totalConversations');
            return saved ? parseInt(saved, 10) : 0;
        }
        return 0;
    });

    const handleSearch = useCallback((value: string) => {
        setSearchTerm(value);
        onSearch(value);
    }, [onSearch]);

    const loadMoreIfIntersecting = useCallback((node: HTMLDivElement | null) => {
        if (loading) return;
        if (observer.current) observer.current.disconnect();

        observer.current = new IntersectionObserver(entries => {
            if (entries[0].isIntersecting && hasMore && onLoadMore) {
                onLoadMore();
            }
        });

        if (node) observer.current.observe(node);
        lastConversationRef.current = node;
    }, [loading, hasMore, onLoadMore]);

        useEffect(() => {
        if (conversations.length > 0) {
            setTotalConversations(conversations.length);
            localStorage.setItem('totalConversations', conversations.length.toString());
        }
    }, [conversations.length]);

    useEffect(() => {
        return () => {
            if (observer.current) observer.current.disconnect();
        };
    }, []);

    return (
        <div className="flex flex-col h-full">
            <div className="p-3 border-b border-gray-200">
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                    <Input
                        placeholder="Buscar conversas..."
                        value={searchTerm}
                        onChange={(e) => handleSearch(e.target.value)}
                        className="pl-10 bg-gray-50 border-gray-200 rounded-full text-sm"
                    />
                </div>
            </div>

            <div className="flex-1 overflow-y-auto">
                {loading && conversations.length === 0 ? (
                    <div className="flex justify-center py-8">
                        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500"></div>
                    </div>
                ) : (
                    <>
                        {conversations.map((conversation, index) => (
                            <div
                                key={conversation.id}
                                ref={index === conversations.length - 1 ? loadMoreIfIntersecting : null}
                            >
                                <ConversationItem
                                    conversation={conversation}
                                    isSelected={selectedId === conversation.id}
                                    onClick={() => onSelectConversation(conversation.id)}
                                />
                            </div>
                        ))}

                        {hasMore && conversations.length > 0 && (
                            <div className="flex justify-center py-4">
                                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500"></div>
                            </div>
                        )}

                        {!loading && conversations.length === 0 && (
                            <div className="text-center py-8 text-gray-500">
                                Nenhuma conversa encontrada
                            </div>
                        )}
                    </>
                )}
            </div>

            <div className="p-2 text-center text-xs text-gray-500 border-t border-gray-200">
                Total de conversas: {totalConversations}
            </div>
        </div>
    );
}
