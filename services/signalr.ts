"use client";

import * as signalR from "@microsoft/signalr";
import { AuthService } from "./auth";
import {Conversation, ConversationSummaryDto} from "@/types/conversa";
import {MessageWithConversationIdDto} from "@/types/messagem";

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
    private currentConversationId: string | null = null;

    /**
     * Subscribe to a SignalR event
     * @param eventName - The event name to subscribe to
     * @param callback - The function to call when the event is received
     * @returns A function to unsubscribe from the event
     */
    public on<T>(eventName: HubEvent, callback: (data: T) => void): () => void {
        if (!this.subscribers.has(eventName)) {
            this.subscribers.set(eventName, new Set());
        }
        this.subscribers.get(eventName)!.add(callback);

        return () => {
            this.off(eventName, callback);
        };
    }

    /**
     * Unsubscribe from a SignalR event
     * @param eventName - The event name to unsubscribe from
     * @param callback - The callback function to remove
     */
    public off<T>(eventName: HubEvent, callback: (data: T) => void): void {
        const eventSubscribers = this.subscribers.get(eventName);
        if (eventSubscribers) {
            eventSubscribers.delete(callback);
        }
    }

    /**
     * Publish an event to all subscribers
     * @param eventName - The event name to publish
     * @param data - The data to send to subscribers
     */
    private publish<T>(eventName: HubEvent, data: T) {
        console.log(`[STEP 4] SERVICE RECEIVED SERVER EVENT: ${eventName}`, data);

        const eventSubscribers = this.subscribers.get(eventName);
        console.log(
            `[SignalR Service] FOUND ${
                eventSubscribers ? eventSubscribers.size : 0
            } subscribers for event "${eventName}".`
        );

        if (eventSubscribers) {
            eventSubscribers.forEach((callback) => {
                try {
                    callback(data);
                } catch (e) {
                    console.error(
                        `Error executing subscriber for event ${eventName}:`,
                        e
                    );
                }
            });
        }
    }

    /**
     * Connect to the SignalR hub
     */
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

    /**
     * Perform the actual connection to the SignalR hub
     */
    private async performConnection(): Promise<void> {
        const token = AuthService.getToken();
        if (!token) throw new Error("Authentication token not found");

        const hubUrl = process.env.NEXT_PUBLIC_API_URL
            ? `${process.env.NEXT_PUBLIC_API_URL}/conversationHub`
            : "http://localhost:5233/conversationHub";

        this.connection = new signalR.HubConnectionBuilder()
            .withUrl(hubUrl, { accessTokenFactory: () => token })
            .withAutomaticReconnect()
            .configureLogging(signalR.LogLevel.Information)
            .build();

        // Register event handlers
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

        // Connection lifecycle events
        this.connection.onreconnected((connectionId) =>
            console.log("SignalR reconnected:", connectionId)
        );

        this.connection.onclose((error) =>
            console.log("SignalR connection closed:", error)
        );

        await this.connection.start();
        console.log("SignalR connected successfully");
    }

    /**
     * Disconnect from the SignalR hub
     */
    async disconnect(): Promise<void> {
        if (this.connection) {
            try {
                await this.connection.stop();
                console.log("SignalR disconnected");
            } catch (error) {
                console.error("Error disconnecting SignalR:", error);
            } finally {
                this.connection = null;
                this.subscribers.clear();
                this.joinedGroups.clear();
                this.isConnecting = false;
                this.connectionPromise = null;
                this.currentConversationId = null;
            }
        }
    }

    /**
     * Join a conversation group
     * @param groupName - The name of the group to join
     */
    async joinConversationGroup(groupName: string): Promise<void> {
        await this.ensureConnected();
        if (this.joinedGroups.has(groupName)) return;

        console.log(`[STEP 3] Service attempting to invoke "JoinConversationGroup" for group: ${groupName}`);

        try {
            await this.connection!.invoke("JoinConversationGroup", groupName);
            this.joinedGroups.add(groupName);
            console.log(`✅ Joined group: ${groupName}`);
        } catch (error) {
            console.error(`❌ Error joining group ${groupName}:`, error);
            throw error;
        }
    }

    /**
     * Leave a conversation group
     * @param groupName - The name of the group to leave
     */
    async leaveConversationGroup(groupName?: string): Promise<void> {
        if (!this.isConnected() || !groupName || !this.joinedGroups.has(groupName)) {
            return;
        }

        try {
            await this.connection!.invoke("LeaveConversationGroup", groupName);
            this.joinedGroups.delete(groupName);
            console.log(`✅ Left group: ${groupName}`);
        } catch (error) {
            console.error(`❌ Error leaving group ${groupName}:`, error);
        }
    }

    /**
     * Ensure SignalR is connected
     */
    private async ensureConnected(): Promise<void> {
        if (!this.isConnected()) {
            console.log("SignalR is not connected, attempting to connect...");
            await this.connect();
        }

        if (!this.isConnected()) {
            throw new Error("Unable to establish SignalR connection");
        }
    }

    /**
     * Rejoin all previously joined groups
     */
    private async rejoinAllGroups(): Promise<void> {
        const groupsToRejoin = Array.from(this.joinedGroups);
        console.log("🔄 Rejoining groups:", groupsToRejoin);
        for (const groupName of groupsToRejoin) {
            try {
                await this.connection!.invoke("JoinConversationGroup", groupName);
            } catch (error) {
                console.warn(`⚠️ Error rejoining group ${groupName}:`, error);
            }
        }
    }

    /**
     * Get the current connection state
     */
    getConnectionState(): signalR.HubConnectionState | null {
        return this.connection?.state || null;
    }

    /**
     * Check if SignalR is connected
     */
    isConnected(): boolean {
        return this.connection?.state === signalR.HubConnectionState.Connected;
    }

    /**
     * Check if SignalR is in connecting state
     */
    isConnectingState(): boolean {
        return (
            this.isConnecting ||
            this.connection?.state === signalR.HubConnectionState.Connecting
        );
    }

    /**
     * Get debug information about the SignalR service
     */
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

export const signalRService = new SignalRService();