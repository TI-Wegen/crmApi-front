import { useEffect } from "react";
import { signalRService } from "@/services/signalr";
import type { MessageWithConversationIdDto, ConversationSummaryDto, Conversation } from "@/types/crm";
import signalR, { HubConnectionState } from "@microsoft/signalr";



type Params = {
  groups?: string[]; // permite múltiplos grupos
  onNewMessage: (message: MessageWithConversationIdDto) => void;
  onNewConversation: (convo: ConversationSummaryDto) => void;
  onStatusChange: (conversationId: string, status: Conversation["status"]) => void;
  onError?: (msg: string) => void;
};

export function useConversationSignalREvents({
  groups = ["UnassignedQueue"],
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

        // Entrar nos grupos
        for (const group of groups) {
          await signalRService.joinGroup(group);
          console.log(`✅ Entrou no grupo '${group}'`);
        }

        if (!isMounted) return;

        signalRService.onReceiveNewConversation(onNewConversation);
        signalRService.onReceiveMessage(onNewMessage);
        signalRService.onConversationStatusChanged(onStatusChange);
      } catch (err) {
        console.error("❌ Erro no SignalR:", err);
        onError?.("Erro ao conectar com SignalR");
      }
    };

    setup();

    return () => {
      isMounted = false;

      // Limpar os handlers
      signalRService.offReceiveNewConversation();
      signalRService.offReceiveMessage();
      signalRService.offConversationStatusChanged();

      // Sair dos grupos conectados
      groups.forEach(async (group) => {
        try {
          await signalRService.leaveGroup(group);
          console.log(`👋 Saiu do grupo '${group}'`);
        } catch (err) {
          console.warn(`⚠️ Falha ao sair do grupo '${group}':`, err);
        }
      });
    };
  }, [groups, onNewMessage, onNewConversation, onStatusChange, onError]);
}

export function useSignalRConnectionStatus() {
  return signalRService.isConnected();
}