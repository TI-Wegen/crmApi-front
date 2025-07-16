"use client";

import { useState, useEffect, useCallback } from "react";
import { signalRService } from "@/services/signalr";
import { useAuth } from "@/contexts/auth-context";
import type {
  ConversationDetailsDto,
  MessageDto,
  Conversation,
  Message,
  ConversationListItemDto,
} from "@/types/crm";
import { formatMessageTimestamp } from "@/utils/date-formatter";
import { ConversationsService } from "@/services/conversations";

export function useConversations() {
  const { isAuthenticated, token } = useAuth();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedConversation, setSelectedConversation] = useState<
    string | null
  >(null);
  const [conversationDetails, setConversationDetails] =
    useState<ConversationDetailsDto | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [signalRConnected, setSignalRConnected] = useState(false);

  // Converter DTO para formato do frontend
  const convertToFrontendFormat = useCallback(
    (dto: ConversationListItemDto): Conversation => {
      return {
        id: dto.id,
        clientName: dto.contatoNome,
        lastMessage: dto.ultimaMensagemPreview,
        timestamp: formatMessageTimestamp(dto.ultimaMensagemTimestamp),
        unread: dto.mensagensNaoLidas || 0,
        avatar: `/placeholder.svg?height=40&width=40`,
        status: dto.status,
        agentName: dto.agenteNome || undefined,
        atendimentoId: dto.atendimentoId || "", 
      };
    },
    []
  );

  const convertMessagesToFrontend = useCallback(
    (dtoMessages: MessageDto[]): Message[] => {
      return dtoMessages.map((msg) => ({
        id: msg.id,
        content: msg.texto,
        timestamp: new Date(msg.timestamp).toLocaleTimeString("pt-BR", {
          hour: "2-digit",
          minute: "2-digit",
        }),
        isFromClient: msg.remetenteTipo === "Cliente",
        date: new Date(msg.timestamp).toISOString().split("T")[0],
        anexoUrl: msg.anexoUrl,
      }));
    },
    []
  );

  // Conectar ao SignalR quando autenticado
  useEffect(() => {
    if (isAuthenticated && token) {
      const connectSignalR = async () => {
        try {
          await signalRService.connect();
          setSignalRConnected(true);
          console.log("SignalR conectado com sucesso");
        } catch (error) {
          console.error("Erro ao conectar SignalR:", error);
          setSignalRConnected(false);
          // Não mostrar erro para o usuário, SignalR é opcional
        }
      };

      connectSignalR();
    } else {
      // Desconectar SignalR quando não autenticado
      signalRService.disconnect();
      setSignalRConnected(false);
    }

    return () => {
      if (!isAuthenticated) {
        signalRService.disconnect();
      }
    };
  }, [isAuthenticated, token]);

  // Carregar conversa específica
  const loadConversation = useCallback(
    async (conversationId: string) => {
      setLoading(true);
      setError(null);

      try {
        const details = (await ConversationsService.buscarConversa(
          conversationId
        )) as ConversationDetailsDto;
        setConversationDetails(details);
        setMessages(convertMessagesToFrontend(details.mensagens));

        // Tentar entrar no grupo da conversa no SignalR (se conectado)
        if (signalRConnected) {
          try {
            await signalRService.joinConversationGroup(conversationId);
          } catch (signalRError) {
            console.warn("Erro ao entrar no grupo SignalR:", signalRError);
            // Não bloquear o carregamento da conversa por erro do SignalR
          }
        }
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Erro ao carregar conversa"
        );
        console.error("Erro ao carregar conversa:", err);
      } finally {
        setLoading(false);
      }
    },
    [convertMessagesToFrontend, signalRConnected]
  );

  // Carregar todas as conversas
  const loadConversations = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const conversas =
        (await ConversationsService.listarConversas()) as ConversationDetailsDto[];

      setConversations(conversas.map(convertToFrontendFormat));

      // Tentar entrar no grupo da conversa no SignalR (se conectado)
      if (signalRConnected) {
        try {
          await signalRService.joinConversationGroup(conversas[0]?.id || "");
        } catch (signalRError) {
          console.warn("Erro ao entrar no grupo SignalR:", signalRError);
          // Não bloquear o carregamento da conversa por erro do SignalR
        }
      }
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Erro ao carregar conversa"
      );
      console.error("Erro ao carregar conversa:", err);
    } finally {
      setLoading(false);
    }
  }, [convertMessagesToFrontend, signalRConnected]);
  
  // Enviar mensagem
  const sendMessage = useCallback(
    async (content: string, file?: File) => {
      if (!selectedConversation) return;

      try {
        const formData = new FormData();
        formData.append("Texto", content);
        formData.append("RemetenteTipo", "Agente");

        // TODO: Adicionar ID do agente logado quando disponível
        // formData.append('AgenteId', currentAgentId)

        if (file) {
          formData.append("Anexo", file);
        }

        const newMessage = (await ConversationsService.adicionarMensagem(
          selectedConversation,
          formData
        )) as MessageDto;

        // Adicionar mensagem localmente para feedback imediato
        const frontendMessage: Message = {
          id: newMessage.id,
          content: newMessage.texto,
          timestamp: new Date(newMessage.timestamp).toLocaleTimeString(
            "pt-BR",
            { hour: "2-digit", minute: "2-digit" }
          ),
          isFromClient: false,
          date: new Date(newMessage.timestamp).toISOString().split("T")[0],
          anexoUrl: newMessage.anexoUrl,
        };

        setMessages((prev) => {
          // Evitar duplicatas
          if (prev.some((msg) => msg.id === frontendMessage.id)) {
            return prev;
          }
          return [...prev, frontendMessage];
        });
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Erro ao enviar mensagem"
        );
        console.error("Erro ao enviar mensagem:", err);
      }
    },
    [selectedConversation]
  );

  // Configurar listener do SignalR para novas mensagens
  useEffect(() => {
    if (!signalRConnected) return;

    const handleNewMessage = (messageDto: MessageDto) => {
      console.log("Nova mensagem recebida via SignalR:", messageDto);

      const frontendMessage: Message = {
        id: messageDto.id,
        content: messageDto.texto,
        timestamp: new Date(messageDto.timestamp).toLocaleTimeString("pt-BR", {
          hour: "2-digit",
          minute: "2-digit",
        }),
        isFromClient: messageDto.remetenteTipo === "Cliente",
        date: new Date(messageDto.timestamp).toISOString().split("T")[0],
        anexoUrl: messageDto.anexoUrl,
      };

      setMessages((prev) => {
        // Evitar duplicatas
        if (prev.some((msg) => msg.id === frontendMessage.id)) {
          return prev;
        }
        return [...prev, frontendMessage];
      });
    };

    signalRService.onReceiveMessage(handleNewMessage);

    return () => {
      signalRService.offReceiveMessage();
    };
  }, [signalRConnected]);

  // Selecionar conversa
  const selectConversation = useCallback(
    async (conversationId: string) => {
      if (selectedConversation === conversationId) return;

      // Sair do grupo anterior no SignalR
      if (selectedConversation && signalRConnected) {
        try {
          await signalRService.leaveConversationGroup(selectedConversation);
        } catch (error) {
          console.warn("Erro ao sair do grupo SignalR:", error);
        }
      }

      setSelectedConversation(conversationId);
      await loadConversation(conversationId);
      if (signalRConnected) {
        try {
          await signalRService.joinConversationGroup(conversationId);
        } catch (error) {
          console.warn("Erro ao entrar no grupo SignalR:", error);
        }
      }
    },
    [selectedConversation, loadConversation, signalRConnected]
  );

  // Buscar todas as conversas ao montar
  useEffect(() => {
    if (isAuthenticated) {
      loadConversations();
    } else {
      setConversations([]);
      setSelectedConversation(null);
      setConversationDetails(null);
      setMessages([]);
    }
  }, [isAuthenticated, loadConversations]);

  // Buscar conversas (mock - implementar quando tiver endpoint)
  const searchConversations = useCallback((searchTerm: string) => {
    console.log("Buscar conversas:", searchTerm);
  }, []);

  // Cleanup ao desmontar
  useEffect(() => {
    return () => {
      if (selectedConversation && signalRConnected) {
        signalRService.leaveConversationGroup(selectedConversation);
      }
    };
  }, [selectedConversation, signalRConnected]);

  return {
    conversations,
    selectedConversation,
    conversationDetails,
    messages,
    loading,
    error,
    signalRConnected,
    selectConversation,
    sendMessage,
    searchConversations,
    // Ações adicionais da API
    resolveConversation: (id: string) => ConversationsService.resolverConversa(id),
    assignAgent: (conversationId: string, agentId: string) =>
      ConversationsService.atribuirAgente(conversationId, agentId),
    transferConversation: (
      conversationId: string,
      data: { novoAgenteId?: string; novoSetorId?: string }
    ) => ConversationsService.transferirConversa(conversationId, data),
    convertToFrontendFormat,
    convertMessagesToFrontend,
  };
}
