"use client";

import * as signalR from "@microsoft/signalr";
import type {
  Conversation,
  ConversationSummaryDto,
  MessageWithConversationIdDto,
} from "@/types/crm";
import { AuthService } from "./auth";
type HubEvent =
  | "ReceiveNewConversation"
  | "ReceiveMessage"
  | "ConversationStatusChanged";

export class SignalRService {
  private connection: signalR.HubConnection | null = null;
  private isConnecting = false;
  private connectionPromise: Promise<void> | null = null;
  private subscribers = new Map<HubEvent, Set<Function>>();

    private joinedGroups = new Set<string>();


  public on<T>(eventName: HubEvent, callback: (data: T) => void): () => void {
    if (!this.subscribers.has(eventName)) {
      this.subscribers.set(eventName, new Set());
    }
    this.subscribers.get(eventName)!.add(callback);

    // Retorna a função de "off" diretamente.
    return () => {
      this.off(eventName, callback);
    };
  }
  public off<T>(eventName: HubEvent, callback: (data: T) => void): void {
    const eventSubscribers = this.subscribers.get(eventName);
    if (eventSubscribers) {
      eventSubscribers.delete(callback);
    }
  }
  private publish<T>(eventName: HubEvent, data: T) {
    console.log(`[PASSO 4] SERVIÇO RECEBEU EVENTO DO SERVIDOR: ${eventName}`, data);

    const eventSubscribers = this.subscribers.get(eventName);
    console.log(
      `[SignalR Service] ENCONTRADOS ${
        eventSubscribers ? eventSubscribers.size : 0
      } subscribers para o evento "${eventName}".`
    );

    if (eventSubscribers) {
      eventSubscribers.forEach((callback) => {
        try {
          callback(data);
        } catch (e) {
          console.error(
            `Erro ao executar subscriber para o evento ${eventName}:`,
            e
          );
        }
      });
    }
  }

  async connect(): Promise<void> {
    if (this.connection?.state === signalR.HubConnectionState.Connected) {
      return;
    }
    if (this.isConnecting && this.connectionPromise) {
      return this.connectionPromise;
    }
    this.isConnecting = true;
    this.connectionPromise = this.performConnection();
    try {
      await this.connectionPromise;
    } finally {
      this.isConnecting = false;
      this.connectionPromise = null;
    }
  }

  private async performConnection(): Promise<void> {
    const token = AuthService.getToken();
    if (!token) throw new Error("Token não encontrado");

    const hubUrl = process.env.NEXT_PUBLIC_API_URL
      ? `${process.env.NEXT_PUBLIC_API_URL}/conversationHub`
      : "http://localhost:5233/conversationHub";

    this.connection = new signalR.HubConnectionBuilder()
      .withUrl(hubUrl, { accessTokenFactory: () => token })
      .withAutomaticReconnect()
      .configureLogging(signalR.LogLevel.Information)
      .build();

    // Registro centralizado dos dispatchers (está perfeito)
    this.connection.on(
      "ReceiveNewConversation",
      (data: ConversationSummaryDto) =>
        this.publish("ReceiveNewConversation", data)
    );
    this.connection.on("ReceiveMessage", (data: MessageWithConversationIdDto) =>
      this.publish("ReceiveMessage", data)
    );
    this.connection.on(
      "ConversationStatusChanged",
      (data: { conversationId: string; status: string }) => {
        const payload = {
          conversationId: data.conversationId,
          status: data.status as Conversation["status"],
        };
        this.publish("ConversationStatusChanged", payload);
      }
    );

    this.connection.onreconnected((connectionId) =>
      console.log("SignalR reconectado:", connectionId)
    );
    this.connection.onclose((error) =>
      console.log("Conexão SignalR fechada:", error)
    );

    await this.connection.start();
    console.log("SignalR conectado com sucesso");
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
        this.subscribers.clear(); // Limpa todos os subscribers
        this.isConnecting = false;
        this.connectionPromise = null;
      }
    }
  }

async joinConversationGroup(groupName: string): Promise<void> {
    await this.ensureConnected();
    if (this.joinedGroups.has(groupName)) return; // Já está no grupo, não faz nada.
    console.log(`[PASSO 3] Serviço tentando invocar "JoinConversationGroup" para o grupo: ${groupName}`);

    try {
      await this.connection!.invoke("JoinConversationGroup", groupName);
      this.joinedGroups.add(groupName);
      console.log(`✅ Entrou no grupo: ${groupName}`);
    } catch (error) {
      console.error(`❌ Erro ao entrar no grupo ${groupName}:`, error);
      throw error;
    }
  }
 async leaveConversationGroup(groupName?: string): Promise<void> {
    if (!this.isConnected() || !groupName || !this.joinedGroups.has(groupName)) {
      return;
    }

    try {
      await this.connection!.invoke("LeaveConversationGroup", groupName);
      this.joinedGroups.delete(groupName);
      console.log(`✅ Saiu do grupo: ${groupName}`);
    } catch (error) {
      console.error(`❌ Erro ao sair do grupo ${groupName}:`, error);
    }
  }
  private async ensureConnected(): Promise<void> {
    if (!this.isConnected()) {
      console.log("SignalR não está conectado, tentando conectar...");
      await this.connect();
    }

    if (!this.isConnected()) {
      throw new Error("Não foi possível estabelecer conexão SignalR");
    }
  }
  private async rejoinAllGroups(): Promise<void> {
    const groupsToRejoin = Array.from(this.joinedGroups);
    console.log("🔄 Reentrando nos grupos:", groupsToRejoin);
    for (const groupName of groupsToRejoin) {
      try {
        await this.connection!.invoke("JoinConversationGroup", groupName);
      } catch (error) {
        console.warn(`⚠️ Erro ao reentrar no grupo ${groupName}:`, error);
      }
    }
  }
  getConnectionState(): signalR.HubConnectionState | null {
    return this.connection?.state || null;
  }

  isConnected(): boolean {
    return this.connection?.state === signalR.HubConnectionState.Connected;
  }

  // Método para verificar se está conectando (corrigido)
  isConnectingState(): boolean {
    return (
      this.isConnecting ||
      this.connection?.state === signalR.HubConnectionState.Connecting
    );
  }

  // Método para obter informações de debug
  public getDebugInfo(): object {
    const subscribersInfo: { [key: string]: number } = {};
    for (const [eventName, subs] of this.subscribers.entries()) {
      subscribersInfo[eventName] = subs.size;
    }

    return {
      connectionState: this.getConnectionState(),
      isConnecting: this.isConnecting,
      currentConversationId: this.currentConversationId,
      joinedGroups: Array.from(this.joinedGroups),
      subscribers: subscribersInfo,
    };
  }
}

// Singleton instance
export const signalRService = new SignalRService();
