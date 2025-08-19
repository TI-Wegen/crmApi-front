"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  ReactNode,
  useRef,
} from "react";
import type {
  ConversationDetailsDto,
  MessageDto,
  Conversation,
  Message,
  ConversationListItemDto,
  MessageWithConversationIdDto,
} from "@/types/crm";
import { formatMessageTimestamp } from "@/utils/date-formatter";
import { ConversationsService } from "@/services/conversations";
import { signalRService } from "@/services/signalr";
import { useAuth } from "@/contexts/auth-context";

interface ConversationsContextType {
  selectedConversation: string | null;
  conversationDetails: ConversationDetailsDto | null;
  messages: Message[];
  loading: boolean;
  error: string | null;
  signalRConnected: boolean;

  selectConversation: (conversationId: string) => Promise<void>;
  sendMessage: (content: string, file?: File) => Promise<void>;
  startConversation: (
    contactId: string,
    templateName: string,
    bodyParameters: string[]
  ) => Promise<any>;

  resolveConversation: (id: string) => Promise<void>;
  assignAgent: (conversationId: string, agentId: string) => Promise<void>;
  transferConversation: (
    conversationId: string,
    data: { novoAgenteId?: string; novoSetorId?: string }
  ) => Promise<void>;

  convertToFrontendFormat: (dto: ConversationListItemDto) => Conversation;
  convertMessagesToFrontend: (dtoMessages: MessageDto[]) => Message[];
}

const ConversationsContext = createContext<ConversationsContextType | undefined>(
  undefined
);

export const ConversationsProvider = ({ children }: { children: ReactNode }) => {
  const { isAuthenticated, token } = useAuth();

  const [selectedConversation, setSelectedConversation] = useState<string | null>(
    null
  );
  const [conversationDetails, setConversationDetails] =
    useState<ConversationDetailsDto | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [signalRConnected, setSignalRConnected] = useState(false);
const selectedConversationRef = useRef(selectedConversation);

  // Converter DTO para frontend
  const convertToFrontendFormat = useCallback(
    (dto: ConversationListItemDto): Conversation => {
      return {
        id: dto.id,
        contatoNome: dto.contatoNome,
        lastMessage: dto.ultimaMensagemPreview,
        timestamp: formatMessageTimestamp(dto.ultimaMensagemTimestamp),
        unread: dto.mensagensNaoLidas || 0,
        avatar: `/placeholder.svg?height=40&width=40`,
        status: dto.status,
        agentName: dto.agenteNome || undefined,
        atendimentoId: dto.atendimentoId || "",
        sessaoWhatsappAtiva: dto.sessaoWhatsappAtiva,
        sessaoWhatsappExpiraEm: dto.sessaoWhatsappExpiraEm || null,
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

  // Gerenciar conexão SignalR
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
        }
      };
      connectSignalR();
    } else {
      signalRService.disconnect();
      setSignalRConnected(false);
    }

    return () => {
      if (!isAuthenticated) {
        signalRService.disconnect();
      }
    };
  }, [isAuthenticated, token]);

  // Load conversa
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

        if (signalRConnected) {
          try {
            await signalRService.joinConversationGroup(conversationId);
          } catch (signalRError) {
            console.warn("Erro ao entrar no grupo SignalR:", signalRError);
          }
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "Erro ao carregar conversa");
        console.error("Erro ao carregar conversa:", err);
      } finally {
        setLoading(false);
      }
    },
    [convertMessagesToFrontend, signalRConnected]
  );

  // Enviar mensagem
  const sendMessage = useCallback(
    async (content: string, file?: File) => {
      if (!selectedConversation) return;

      try {
        const formData = new FormData();
        formData.append("Texto", content);
        formData.append("RemetenteTipo", "Agente");

        if (file) formData.append("Anexo", file);

        const newMessage = (await ConversationsService.adicionarMensagem(
          selectedConversation,
          formData
        )) as MessageDto;

        const frontendMessage: Message = {
          id: newMessage.id,
          content: newMessage.texto,
          timestamp: new Date(newMessage.timestamp).toLocaleTimeString("pt-BR", {
            hour: "2-digit",
            minute: "2-digit",
          }),
          isFromClient: false,
          date: new Date(newMessage.timestamp).toISOString().split("T")[0],
          anexoUrl: newMessage.anexoUrl,
        };


        setMessages((prev) => {
          if (prev.some((msg) => msg.id === frontendMessage.id)) return prev;
          return [...prev, frontendMessage];
        });
      } catch (err) {
        setError(err instanceof Error ? err.message : "Erro ao enviar mensagem");
        console.error("Erro ao enviar mensagem:", err);
      }
    },
    [selectedConversation]
  );

  // Iniciar conversa com template
  const startConversation = useCallback(
    async (
      contactId: string,
      templateName: string,
      bodyParameters: string[]
    ) => {
      try {
        const response = await ConversationsService.iniciarConversaPorTemplate({
          contactId,
          templateName,
          bodyParameters,
        });

        if (!response) throw new Error("Erro ao iniciar conversa com template");
        return response;
      } catch (err) {
        console.error("Erro ao iniciar conversa com template:", err);
        throw err;
      }
    },
    []
  );
useEffect(() => {
  selectedConversationRef.current = selectedConversation;
}, [selectedConversation]);
  // Listener SignalR para mensagens novas
useEffect(() => {
  if (!signalRConnected) return;

  const handleNewMessage = (messageWithConvId: MessageWithConversationIdDto) => {
    console.log("Nova mensagem recebida no SignalR:", messageWithConvId);

    const isCurrent =
      messageWithConvId.conversationId === selectedConversationRef.current;

    const frontendMessage: Message = {
      id: messageWithConvId.id,
      content: messageWithConvId.texto,
      timestamp: new Date().toLocaleTimeString("pt-BR", {
        hour: "2-digit",
        minute: "2-digit",
      }),
      isFromClient: messageWithConvId.remetenteTipo === "Cliente",
      date: new Date().toISOString().split("T")[0],
      anexoUrl: messageWithConvId.anexoUrl,
    };

    if (isCurrent) {
      // ✅ Atualiza a lista de mensagens
      setMessages((prev) => {
        const exists = prev.some((msg) => msg.id === frontendMessage.id);
        return exists ? prev : [...prev, frontendMessage];
      });

      // ✅ Atualiza o preview da conversa atual
      setConversationDetails((prev) =>
        prev
          ? {
              ...prev,
              ultimaMensagemPreview: frontendMessage.content,
              ultimaMensagemTimestamp: new Date().toISOString(),
            }
          : prev
      );
    }

    // ❗️Você pode futuramente emitir um evento global para atualizar outras conversas também
  };

  signalRService.onReceiveMessage(handleNewMessage);
  return () => signalRService.offReceiveMessage();
}, [signalRConnected]);


  // Selecionar conversa
const selectConversation = useCallback(
  async (conversationId: string) => {
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


  // Cleanup ao desmontar/conversa mudar
  useEffect(() => {
    return () => {
      if (selectedConversation && signalRConnected) {
        signalRService.leaveConversationGroup(selectedConversation);
      }
    };
  }, [selectedConversation, signalRConnected]);

  // Ações adicionais da API
  const resolveConversation = useCallback((id: string) => {
    return ConversationsService.resolverConversa(id);
  }, []);

  const assignAgent = useCallback((conversationId: string, agentId: string) => {
    return ConversationsService.atribuirAgente(conversationId, agentId);
  }, []);

  const transferConversation = useCallback(
    (conversationId: string, data: { novoAgenteId?: string; novoSetorId?: string }) => {
      return ConversationsService.transferirConversa(conversationId, data);
    },
    []
  );

  return (
    <ConversationsContext.Provider
      value={{
        selectedConversation,
        conversationDetails,
        messages,
        loading,
        error,
        signalRConnected,
        selectConversation,
        sendMessage,
        startConversation,
        resolveConversation,
        assignAgent,
        transferConversation,
        convertToFrontendFormat,
        convertMessagesToFrontend,
      }}
    >
      {children}
    </ConversationsContext.Provider>
  );
};

export const useConversations = () => {
  const context = useContext(ConversationsContext);
  if (!context) {
    throw new Error(
      "useConversations deve ser usado dentro de um ConversationsProvider"
    );
  }
  return context;
};
