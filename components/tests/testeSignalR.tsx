"use client";

import { useConversationSignalREvents } from "@/hooks/useConversationSignalREvents";
import { useEffect, useState } from "react";
import { signalRService } from "@/services/signalr";
import * as signalR from "@microsoft/signalr";

export  function TesteSignalR() {
  const [connected, setConnected] = useState(false);

  useEffect(() => {
    const setup = async () => {
      try {
        await signalRService.connect();

        // Aguarda até a conexão realmente estar em estado "Connected"
        const waitForConnected = async () => {
          const maxAttempts = 10;
          let attempts = 0;

          while (
            signalRService.getConnectionState() !== signalR.HubConnectionState.Connected &&
            attempts < maxAttempts
          ) {
            await new Promise((res) => setTimeout(res, 300));
            attempts++;
          }

          if (signalRService.isConnected()) {
            await signalRService.joinGroup("UnassignedQueue");
            console.log("✅ Entrou no grupo 'UnassignedQueue'");
            setConnected(true);
          } else {
            console.warn("❌ Não foi possível conectar ao SignalR.");
          }
        };

        waitForConnected();
      } catch (err) {
        console.error("Erro ao conectar ou entrar no grupo:", err);
      }
    };

    setup();
  }, []);

  useConversationSignalREvents({
    onNewConversation: (convo) => {
      console.log("📥 [Hook] Nova conversa recebida:", convo);
    },
    onNewMessage: (msg) => {
      console.log("💬 [Hook] Nova mensagem recebida:", msg);
    },
    onStatusChange: (id, status) => {
      console.log(`🔄 [Hook] Status alterado: ${id} -> ${status}`);
    },
    onError: (msg) => {
      console.error("❌ [Hook] Erro SignalR:", msg);
    },
  });

  return (
    <div className="p-4">
      <h1 className="font-bold text-xl">Teste SignalR Hook</h1>
      <p>Conexão: {connected ? "🟢 Conectado" : "🔴 Desconectado"}</p>
      <p>Abra o console para ver os eventos.</p>
    </div>
  );
}
