"use client";

import { useState, useCallback, useEffect } from "react";
import { ApiService } from "@/services/api";
import { useAuth } from "@/contexts/auth-context";
import { formatMessageTimestamp } from "@/utils/date-formatter";
import type {
  Conversation,
  ConversationListItemDto,
  ConversationSearchParams,
  ConversationSummaryDto,
  MessageDto,
} from "@/types/crm";
import { useConversationSignalREvents } from "./useConversationSignalREvents";

// ============================================================================
// ✨ ARQUITETURA LIMPA: Funções Puras Extraídas
// Estas funções não dependem do estado do hook e podem viver fora dele.
// Isso as torna reutilizáveis, testáveis e impede que sejam recriadas a cada render.
// ============================================================================

/**
 * Converte um DTO de item de lista de conversa para o formato do frontend.
 */
function convertDtoToConversation(dto: ConversationListItemDto): Conversation {
  return {
    id: dto.id,
    clientName: dto.contatoNome,
    lastMessage: dto.ultimaMensagemPreview,
    // Usamos a função de formatação de data que já criamos.
    timestamp: formatMessageTimestamp(dto.ultimaMensagemTimestamp),
    // Guardamos o timestamp original para uma ordenação precisa.
    unread: dto.mensagensNaoLidas || 0,
    avatar: `/placeholder.svg?height=40&width=40`,
    status: dto.status,
    agentName: dto.agenteNome || undefined,
  };
}

function convertSummaryToConversation(dto: ConversationSummaryDto): Conversation {
  return {
    id: dto.id,
    clientName: dto.contatoNome,
    lastMessage: dto.ultimaMensagemPreview,
    timestamp: formatMessageTimestamp(dto.ultimaMensagemTimestamp),
    unread: 1, // sempre começa com 1 mensagem não lida
    avatar: `/placeholder.svg?height=40&width=40`,
    status: dto.status,
    agentName: dto.agenteNome || undefined,
  };
}

// ============================================================================
// 🚀 O HOOK OTIMIZADO
// ============================================================================

export function useConversationList() {
  const { isAuthenticated } = useAuth();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState({
    pageNumber: 1,
    pageSize: 50,
    total: 0,
  });

  // --------------------------------------------------------------------------
  // Funções de Atualização de Estado (Memoizadas com useCallback)
  // --------------------------------------------------------------------------

 const updateConversationInList = useCallback(
    (
      conversationId: string,
      getUpdatedConversation: (prev?: Conversation) => Partial<Conversation>
    ) => {
      setConversations((prevList) => {
        const existing = prevList.find((c) => c.id === conversationId);
        const updates = getUpdatedConversation(existing);

        if (!existing && Object.keys(updates).length === 0) return prevList;

        const updatedConversation = {
          ...(existing || { id: conversationId }),
          ...updates,
        } as Conversation;

        // Remove antiga e adiciona no topo
        const filtered = prevList.filter((c) => c.id !== conversationId);
        return [updatedConversation, ...filtered];
      });
    },
    []
  );

  const markAsRead = useCallback((conversationId: string) => {
    // Para marcar como lida, zeramos o contador e não alteramos a ordem.
    setConversations((prev) =>
      prev.map((conv) =>
        conv.id === conversationId ? { ...conv, unread: 0 } : conv
      )
    );
  }, []);

  const updateConversationWithMessage = useCallback(
    (message: MessageDto & { conversaId: string }) => {
      updateConversationInList(message.conversaId, (prevConv) => ({
        lastMessage: message.texto,
        timestamp: formatMessageTimestamp(message.timestamp),
        unread:
          message.remetenteTipo === "Cliente"
            ? (prevConv?.unread || 0) + 1
            : prevConv?.unread || 0,
      }));
    },
    [updateConversationInList]
  );

 const addOrUpdateConversation = useCallback((newConversation: Conversation) => {
    setConversations((prev) => {
      const filtered = prev.filter((c) => c.id !== newConversation.id);
      return [newConversation, ...filtered];
    });
  }, []);


  const updateConversationStatus = useCallback(
    (conversationId: string, status: Conversation["status"]) => {
      updateConversationInList(conversationId, () => ({ status }));
    },
    [updateConversationInList]
  );

  // --------------------------------------------------------------------------
  // Funções de Carregamento de Dados
  // --------------------------------------------------------------------------

  const loadConversations = useCallback(
    async (params?: ConversationSearchParams, showLoading = true) => {
      if (!isAuthenticated) {
        setConversations([]);
        return;
      }
      if (showLoading) setLoading(true);
      setError(null);

      try {
        const dtos = (await ApiService.listarConversas({
          pageNumber: 1,
          pageSize: 50,
          ...params,
        })) as ConversationListItemDto[];

        // ✅ PERFORMANCE: Ordena os dados brutos ANTES de converter.
        // É mais confiável e performático ordenar por data do que por strings como "Hoje" ou "Ontem".
        dtos.sort(
          (a, b) =>
            new Date(b.ultimaMensagemTimestamp).getTime() -
            new Date(a.ultimaMensagemTimestamp).getTime()
        );

        const frontendConversations = dtos.map(convertDtoToConversation);

        setConversations(frontendConversations);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Erro ao carregar conversas"
        );
        setConversations([]);
      } finally {
        if (showLoading) setLoading(false);
      }
    },
    [isAuthenticated]
  );
const signalRConnected = useConversationSignalREvents({
  onNewConversation: (convoDto) => {
    const newConversation = convertSummaryToConversation(convoDto);
    addOrUpdateConversation(newConversation);
  },

  onNewMessage: (message) => {
    if (!message.conversationId) return;

    updateConversationInList(message.conversationId, (prevConv) => ({
      lastMessage: message.texto,
      timestamp: formatMessageTimestamp(message.timestamp),
      unread:
        message.remetenteTipo === "Cliente"
          ? (prevConv?.unread || 0) + 1
          : prevConv?.unread || 0,
    }));
  },

  onStatusChange: updateConversationStatus,

  onError: (msg) => {
    setError(msg);
  },
});


useEffect(() => {
  if (isAuthenticated) {
    loadConversations();
  }
}, [isAuthenticated, loadConversations]);
  return {
    conversations,
    loading,
    error,
    pagination,
    loadConversations,
    markAsRead,
    signalRConnected
  };
}
