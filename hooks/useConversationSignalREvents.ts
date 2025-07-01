import { useEffect } from "react";
import { signalRService } from "@/services/signalr";
import type { MessageWithConversationIdDto, ConversationSummaryDto, Conversation } from "@/types/crm";

type Params = {
  onNewMessage: (message: MessageWithConversationIdDto) => void;
  onNewConversation: (convo: ConversationSummaryDto) => void;
  onStatusChange: (conversationId: string, status: Conversation["status"]) => void;
  onError?: (msg: string) => void;
};

export function useConversationSignalREvents({ onNewMessage, onNewConversation, onStatusChange, onError }: Params) {
  useEffect(() => {
    const setup = async () => {
      try {
        await signalRService.connect();
        signalRService.onReceiveNewConversation(onNewConversation);
        signalRService.onReceiveMessage(onNewMessage);
        signalRService.onConversationStatusChanged(onStatusChange);
      } catch (error) {
        console.error("Erro ao conectar com SignalR:", error);
        onError?.("Erro ao conectar com SignalR");
      }
    };

    setup();

    return () => {
      signalRService.offReceiveNewConversation();
      signalRService.offReceiveMessage();
      signalRService.offConversationStatusChanged();
    };
  }, [onNewConversation, onNewMessage, onStatusChange, onError]);
}
export function useSignalRConnectionStatus() {
  return signalRService.isConnected();
}