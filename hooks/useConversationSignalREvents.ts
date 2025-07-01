import { useEffect } from "react";
import { signalRService } from "@/services/signalr";
import type { MessageWithConversationIdDto, ConversationSummaryDto, Conversation } from "@/types/crm";
import { HubConnectionState } from "@microsoft/signalr";

type Params = {
  groups?: string[]; // Permite múltiplos grupos
  onNewMessage: (message: MessageWithConversationIdDto) => void;
  onNewConversation: (convo: ConversationSummaryDto) => void;
  onStatusChange: (conversationId: string, status: Conversation["status"]) => void;
  onError?: (msg: string) => void;
};

export function useConversationSignalREvents({
  groups = ["UnassignedQueue"], // default
  onNewMessage,
  onNewConversation,
  onStatusChange,
  onError,
}: Params) {
  useEffect(() => {
    let isMounted = true;

    const setup = async () => {
      try {
        await signalRService.connect();

        // Aguarda até conectar de fato
        let attempts = 0;
        const maxAttempts = 10;
        while (
          signalRService.getConnectionState() !== HubConnectionState.Connected &&
          attempts < maxAttempts
        ) {
          await new Promise((res) => setTimeout(res, 300));
          attempts++;
        }

        if (!signalRService.isConnected()) {
          onError?.("Falha ao conectar com SignalR");
          return;
        }

        // Entra em todos os grupos
        for (const group of groups) {
          await signalRService.joinGroup(group);
          console.log(`✅ Entrou no grupo '${group}'`);
        }

        if (!isMounted) return;

        signalRService.onReceiveNewConversation(onNewConversation);
        signalRService.onReceiveMessage(onNewMessage);
        signalRService.onConversationStatusChanged(onStatusChange);
      } catch (err) {
        console.error("Erro ao conectar ou entrar nos grupos:", err);
        onError?.("Erro ao conectar com SignalR");
      }
    };

    setup();

    return () => {
      isMounted = false;
      signalRService.offReceiveNewConversation();
      signalRService.offReceiveMessage();
      signalRService.offConversationStatusChanged();
    };
  }, [groups, onNewMessage, onNewConversation, onStatusChange, onError]);
}
export function useSignalRConnectionStatus() {
  return signalRService.isConnected();
}