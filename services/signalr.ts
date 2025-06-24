"use client"

import * as signalR from "@microsoft/signalr"
import type { ConversationDetailsDto, MessageDto } from "@/types/crm"

export class SignalRService {
  private connection: signalR.HubConnection | null = null
  private currentConversationId: string | null = null

  async connect(): Promise<void> {
    if (this.connection?.state === signalR.HubConnectionState.Connected) {
      return
    }

    const hubUrl = process.env.NEXT_PUBLIC_API_URL
      ? `${process.env.NEXT_PUBLIC_API_URL}/conversationHub`
      : "http://localhost:5000/conversationHub"

    this.connection = new signalR.HubConnectionBuilder().withUrl(hubUrl).withAutomaticReconnect().build()

    try {
      await this.connection.start()
      console.log("SignalR conectado com sucesso")
    } catch (error) {
      console.error("Erro ao conectar SignalR:", error)
      throw error
    }
  }

  async disconnect(): Promise<void> {
    if (this.connection) {
      await this.connection.stop()
      this.connection = null
      this.currentConversationId = null
    }
  }

  async joinConversationGroup(conversationId: string): Promise<void> {
    if (!this.connection || this.connection.state !== signalR.HubConnectionState.Connected) {
      throw new Error("SignalR não está conectado")
    }

    // Sair do grupo anterior se existir
    if (this.currentConversationId && this.currentConversationId !== conversationId) {
      await this.leaveConversationGroup(this.currentConversationId)
    }

    try {
      await this.connection.invoke("JoinConversationGroup", conversationId)
      this.currentConversationId = conversationId
      console.log(`Entrou no grupo da conversa: ${conversationId}`)
    } catch (error) {
      console.error("Erro ao entrar no grupo da conversa:", error)
      throw error
    }
  }

  async leaveConversationGroup(conversationId?: string): Promise<void> {
    if (!this.connection || this.connection.state !== signalR.HubConnectionState.Connected) {
      return
    }

    const groupId = conversationId || this.currentConversationId
    if (!groupId) return

    try {
      await this.connection.invoke("LeaveConversationGroup", groupId)
      if (groupId === this.currentConversationId) {
        this.currentConversationId = null
      }
      console.log(`Saiu do grupo da conversa: ${groupId}`)
    } catch (error) {
      console.error("Erro ao sair do grupo da conversa:", error)
    }
  }
  async joinUnassignedQueue(): Promise<void> {
    if (!this.connection || this.connection.state !== signalR.HubConnectionState.Connected) {
      // É melhor conectar primeiro antes de chamar este método
      throw new Error("SignalR não está conectado");
    }
    try {
      await this.connection.invoke("JoinUnassignedQueue");
      console.log("Inscrito com sucesso na fila de conversas não atribuídas.");
    } catch (error) {
      console.error("Erro ao entrar na fila geral:", error);
      throw error; // Propaga o erro para ser tratado no hook
    }
  }

  async leaveUnassignedQueue(): Promise<void> {
    if (!this.connection || this.connection.state !== signalR.HubConnectionState.Connected) {
      // Se já estiver desconectado, não há o que fazer.
      console.warn("Tentou sair da fila, mas o SignalR não está conectado.");
      return;
    }
    try {
      await this.connection.invoke("LeaveUnassignedQueue");
      console.log("Inscrição na fila de não atribuídos removida.");
    } catch (error) {
      console.error("Erro ao sair da fila geral:", error);
    }
  }

  onReceiveMessage(callback: (message: MessageDto) => void): void {
    if (!this.connection || this.connection.state !== signalR.HubConnectionState.Connected) {
      console.warn("SignalR não está conectado. Listener não registrado.");
      return;
    }

    this.connection.on("ReceiveMessage", callback);
  }

  offReceiveMessage(): void {
    if (this.connection) {
      this.connection.off("ReceiveMessage")
    }
  }
  onReceiveNewConversation(callback: (conversation: ConversationDetailsDto) => void): void {
    if (!this.connection) return
    // "ReceiveNewConversation" é o nome do evento que definimos no backend
    this.connection.on("ReceiveNewConversation", callback)
  }

  // NOVO: Método para parar de ouvir o evento de nova conversa
  offReceiveNewConversation(): void {
    if (this.connection) {
      this.connection.off("ReceiveNewConversation")
    }
  }
  getConnectionState(): signalR.HubConnectionState | null {
    return this.connection?.state || null
  }
}

// Singleton instance
export const signalRService = new SignalRService()
