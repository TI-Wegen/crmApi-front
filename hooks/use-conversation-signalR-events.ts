"use client";

import {useEffect} from "react";
import {signalRService} from "@/services/signalr";
import {Conversation, ConversationSummaryDto} from "@/types/conversa";
import {MessageWithConversationIdDto} from "@/types/messagem";
import {useSignalRConnectionStatus} from "@/hooks/use-signalR-connection-status";

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
                                                 onError,
                                             }: UseConversationSignalREventsProps) => {
    const {isConnected} = useSignalRConnectionStatus();

    useEffect(() => {
        const connect = async () => {
            try {
                await signalRService.connect();
            } catch (err) {
                console.error("Falha ao conectar ao SignalR", err);
                onError?.(err instanceof Error ? err.message : "Falha ao conectar ao SignalR");
            }
        };

        connect();
    }, []);

    useEffect(() => {
        if (!isConnected) {
            return;
        }

        const joinGroups = async () => {
            for (const groupName of groups) {
                try {
                    await signalRService.joinConversationGroup(groupName);
                } catch (err) {
                    console.error(`Falha ao entrar no grupo ${groupName}`, err);
                    onError?.(`Falha ao entrar no grupo ${groupName}: ${err instanceof Error ? err.message : String(err)}`);
                }
            }
        };

        joinGroups();

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
    }, [isConnected, ...groups, onNewConversation, onNewMessage, onStatusChange]);

    return isConnected;
};
