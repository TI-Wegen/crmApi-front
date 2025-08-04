"use client";

import { useEffect } from "react";
import { signalRService } from "@/services/signalr";
import { useSignalR } from "@/contexts/signalr-context";
import type {
  ConversationSummaryDto,
  MessageWithConversationIdDto,
  Conversation,
} from "@/types/crm";

interface UseConversationSignalREventsProps {
  groups?: string[];
  onNewConversation: (conversationDto: ConversationSummaryDto) => void;
  onNewMessage: (message: MessageWithConversationIdDto) => void;
  onStatusChange: (data: {
    conversationId: string;
    status: Conversation["status"];
  }) => void;
  onError?: (error: string) => void;
}

export const useConversationSignalREvents = ({
  groups = [],
  onNewConversation,
  onNewMessage,
  onStatusChange,
}: UseConversationSignalREventsProps) => {
  const { isConnected } = useSignalR();

  useEffect(() => {

    if (!isConnected) {
      return;
    }

    groups.forEach((groupName) => {
      signalRService.joinConversationGroup(groupName).catch((err) => {
        console.error(`Falha ao entrar no grupo ${groupName}`, err);
      });
    });
    const unsubscribeNewConv = signalRService.on(
      "ReceiveNewConversation",
      onNewConversation
    );
    const unsubscribeStatusChange = signalRService.on(
      "ConversationStatusChanged",
      onStatusChange
    );
    const unsubscribeMessage = signalRService.on(
      "ReceiveMessage",
      onNewMessage
    );

    // A função de cleanup agora chama as funções de "unsubscribe" retornadas.
    return () => {
      unsubscribeNewConv();
      unsubscribeStatusChange();
      unsubscribeMessage();
      groups.forEach((groupName) => {
        signalRService.leaveConversationGroup(groupName).catch((err) => {
          console.error(`Falha ao sair do grupo ${groupName}`, err);
        });
      });
    };
  }, [isConnected, onNewConversation, onNewMessage, onStatusChange]);

  return isConnected;
};
