"use client";

import * as signalR from "@microsoft/signalr";
import type { Conversation, ConversationSummaryDto, MessageDto, MessageWithConversationIdDto } from "@/types/crm";
import { AuthService } from "./auth";

export class SignalRService {
  private connection: signalR.HubConnection | null = null;
  private currentConversationId: string | null = null;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;

  public onReceiveNewConversation(callback: (conversationDto: ConversationSummaryDto) => void): void {
    this.connection?.on("ReceiveNewConversation", callback);
  }

  public offReceiveNewConversation(): void {
    this.connection?.off("ReceiveNewConversation");
  }


    public onReceiveMessage(callback: (message: MessageWithConversationIdDto) => void): void {
    this.connection?.on("ReceiveMessage", callback);
  }

  public offReceiveMessage(): void {
    this.connection?.off("ReceiveMessage");
  }

  public onConversationStatusChanged(callback: (conversationId: string, status: Conversation["status"]) => void): void {
    this.connection?.on("ConversationStatusChanged", (data: { conversationId: string; status: string }) => {
      callback(data.conversationId, data.status as Conversation["status"]);
    });
  }

 public offConversationStatusChanged(): void {
    this.connection?.off("ConversationStatusChanged");
  }

  
  async connect(): Promise<void> {
    if (this.connection?.state === signalR.HubConnectionState.Connected) {
      return;
    }

    const token = AuthService.getToken();
    if (!token) {
      console.warn("Token não encontrado, não é possível conectar ao SignalR");
      return;
    }

    const hubUrl = process.env.NEXT_PUBLIC_API_URL
      ? `${process.env.NEXT_PUBLIC_API_URL}/conversationHub`
      : "http://localhost:5233/conversationHub";

    this.connection = new signalR.HubConnectionBuilder()
      .withUrl(hubUrl, {
        accessTokenFactory: () => token,
        transport: signalR.HttpTransportType.WebSockets,
        skipNegotiation: true,
      })
      .withAutomaticReconnect({
        nextRetryDelayInMilliseconds: (retryContext) => {
          if (retryContext.previousRetryCount < 3) {
            return 1000 * Math.pow(2, retryContext.previousRetryCount); // 1s, 2s, 4s
          }
          return 10000; // 10s para tentativas subsequentes
        },
      })
      .configureLogging(signalR.LogLevel.Information)
      .build();

    // Configurar eventos de conexão
    this.connection.onreconnecting(() => {
      console.log("SignalR reconectando...");
    });

    this.connection.onreconnected(() => {
      console.log("SignalR reconectado com sucesso");
      this.reconnectAttempts = 0;
      // Reentrar no grupo da conversa atual se existir
      if (this.currentConversationId) {
        this.joinConversationGroup(this.currentConversationId);
      }
    });

    this.connection.onclose((error) => {
      console.log("Conexão SignalR fechada:", error);
      this.reconnectAttempts++;

      if (this.reconnectAttempts < this.maxReconnectAttempts) {
        setTimeout(() => {
          console.log(
            `Tentativa de reconexão ${this.reconnectAttempts}/${this.maxReconnectAttempts}`
          );
          this.connect();
        }, 5000);
      } else {
        console.error("Máximo de tentativas de reconexão atingido");
      }
    });

    try {
      await this.connection.start();
      console.log("SignalR conectado com sucesso");
      this.reconnectAttempts = 0;
    } catch (error) {
      console.error("Erro ao conectar SignalR:", error);

      // Se o erro for de autenticação, não tentar reconectar
      if (error instanceof Error && error.message.includes("401")) {
        console.error("Erro de autenticação no SignalR - token inválido");
        AuthService.removeToken();
        window.location.reload();
        return;
      }

      throw error;
    }
  }

  async disconnect(): Promise<void> {
    if (this.connection) {
      try {
        await this.connection.stop();
        console.log("SignalR desconectado");
      } catch (error) {
        console.error("Erro ao desconectar SignalR:", error);
      } finally {
        this.connection = null;
        this.currentConversationId = null;
        this.reconnectAttempts = 0;
      }
    }
  }

  async joinConversationGroup(conversationId: string): Promise<void> {
    if (
      !this.connection ||
      this.connection.state !== signalR.HubConnectionState.Connected
    ) {
      console.warn("SignalR não está conectado, tentando conectar...");
      await this.connect();
    }

    if (
      !this.connection ||
      this.connection.state !== signalR.HubConnectionState.Connected
    ) {
      throw new Error("Não foi possível estabelecer conexão SignalR");
    }

    // Sair do grupo anterior se existir
    if (
      this.currentConversationId &&
      this.currentConversationId !== conversationId
    ) {
      await this.leaveConversationGroup(this.currentConversationId);
    }

    try {
      await this.connection.invoke("JoinConversationGroup", conversationId);
      this.currentConversationId = conversationId;
      console.log(`Entrou no grupo da conversa: ${conversationId}`);
    } catch (error) {
      console.error("Erro ao entrar no grupo da conversa:", error);
      throw error;
    }
  }

  async leaveConversationGroup(conversationId?: string): Promise<void> {
    if (
      !this.connection ||
      this.connection.state !== signalR.HubConnectionState.Connected
    ) {
      return;
    }

    const groupId = conversationId || this.currentConversationId;
    if (!groupId) return;

    try {
      await this.connection.invoke("LeaveConversationGroup", groupId);
      if (groupId === this.currentConversationId) {
        this.currentConversationId = null;
      }
      console.log(`Saiu do grupo da conversa: ${groupId}`);
    } catch (error) {
      console.error("Erro ao sair do grupo da conversa:", error);
    }
  }

   async joinGroup(group: string) {
    await this.connection?.invoke("JoinConversationGroup", group);
    console.log(`📡 Entrou no grupo: ${group}`);
  }
leaveGroup(group: string) {
  return this.connection?.invoke("LeaveGroup", group);
}
  getConnectionState(): signalR.HubConnectionState | null {
    return this.connection?.state || null;
  }

  isConnected(): boolean {
    return this.connection?.state === signalR.HubConnectionState.Connected;
  }
}

// Singleton instance
export const signalRService = new SignalRService();
