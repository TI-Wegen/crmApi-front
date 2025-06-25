"use client";

import { useState, useEffect, useCallback } from "react";
import { ApiService } from "@/services/api";
import { signalRService } from "@/services/signalr";
import type {
  ConversationDetailsDto,
  MessageDto,
  Conversation,
  Message,
} from "@/types/crm";

export function useConversations() {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedConversation, setSelectedConversation] = useState<
    string | null
  >(null);
  const [conversationDetails, setConversationDetails] =
    useState<ConversationDetailsDto | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Converter DTO para formato do frontend
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

  // Carregar conversa específica
  const loadConversation = useCallback(
    async (conversationId: string) => {
      setLoading(true);
      setError(null);

      try {
        const details = (await ApiService.buscarConversa(
          conversationId
        )) as ConversationDetailsDto;
        setConversationDetails(details);
        setMessages(convertMessagesToFrontend(details.mensagens));

        // Conectar ao SignalR e entrar no grupo da conversa
        await signalRService.connect();
        await signalRService.joinConversationGroup(conversationId);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Erro ao carregar conversa"
        );
        console.error("Erro ao carregar conversa:", err);
      } finally {
        setLoading(false);
      }
    },
    [convertMessagesToFrontend]
  );

  // Enviar mensagem
  const sendMessage = useCallback(
    async (content: string, file?: File) => {

      if (!selectedConversation) return;

      try {
        const formData = new FormData();
        formData.append("texto", content);
        formData.append("remetenteTipo", "Agente");
        const currentAgentId = "23902ec5-a4f5-4a0d-9f02-60d266142124";
        // TODO: Adicionar ID do agente logado
        formData.append('agenteId', currentAgentId)

        if (file) {
          formData.append("anexo", file);
        }

      

        const newMessage = (await ApiService.adicionarMensagem(
          selectedConversation,
          formData
        )) as MessageDto;

        // A mensagem será adicionada via SignalR, mas podemos adicionar localmente para feedback imediato
        const frontendMessage: Message = {
          id: newMessage.id,
          content: newMessage.texto,
          timestamp: new Date(newMessage.timestamp).toLocaleTimeString(
            "pt-BR",
            { hour: "2-digit", minute: "2-digit" }
          ),
          isFromClient: false,
          date: new Date(newMessage.timestamp).toISOString().split("T")[0],
          anexo: newMessage.anexoUrl,
        };

        setMessages((prev) => [...prev, frontendMessage]);
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
    const handleNewMessage = (messageDto: MessageDto) => {
      console.log("Nova mensagem recebida:", messageDto);

      const frontendMessage: Message = {
        id: messageDto.id,
        content: messageDto.texto,
        timestamp: new Date(messageDto.timestamp).toLocaleTimeString("pt-BR", {
          hour: "2-digit",
          minute: "2-digit",
        }),
        isFromClient: messageDto.remetenteTipo === "Cliente",
        date: new Date(messageDto.timestamp).toISOString().split("T")[0],
        anexo: messageDto.anexoUrl,
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
  }, []);

  // Selecionar conversa
  const selectConversation = useCallback(
    async (conversationId: string) => {
      if (selectedConversation === conversationId) return;

      // Sair do grupo anterior
      if (selectedConversation) {
        await signalRService.leaveConversationGroup(selectedConversation);
      }

      setSelectedConversation(conversationId);
      await loadConversation(conversationId);
    },
    [selectedConversation, loadConversation]
  );

  // Buscar conversas (mock - implementar quando tiver endpoint)
  const searchConversations = useCallback((searchTerm: string) => {
    // TODO: Implementar busca real quando tiver endpoint de listagem de conversas
    console.log("Buscar conversas:", searchTerm);
  }, []);

  // Cleanup ao desmontar
  useEffect(() => {
    return () => {
      signalRService.disconnect();
    };
  }, []);

  return {
    conversations,
    selectedConversation,
    conversationDetails,
    messages,
    loading,
    error,
    selectConversation,
    sendMessage,
    searchConversations,
    // Ações adicionais da API
    resolveConversation: (id: string) => ApiService.resolverConversa(id),
    assignAgent: (conversationId: string, agentId: string) =>
      ApiService.atribuirAgente(conversationId, agentId),
    transferConversation: (
      conversationId: string,
      data: { novoAgenteId?: string; novoSetorId?: string }
    ) => ApiService.transferirConversa(conversationId, data),
    reopenConversation: (id: string) => ApiService.reabrirConversa(id),
  };
}
