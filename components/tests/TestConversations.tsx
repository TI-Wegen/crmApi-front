"use client";

import { useConversationList } from "@/hooks/use-conversation-list";
import { useEffect } from "react";

export  function TestConversationHook() {
  const {
    conversations,
    loading,
    error,
    loadConversations,
    signalRConnected,
  } = useConversationList();

  // 🔄 Log inicial
  useEffect(() => {
    console.log("🧪 Teste iniciado - carregando conversas...");
    loadConversations(); // forçar carregamento
  }, [loadConversations]);

  // 📡 Log quando conectar SignalR
  useEffect(() => {
    console.log("📡 SignalR conectado:", signalRConnected);
  }, [signalRConnected]);

  // 🗨️ Log sempre que a lista de conversas mudar
  useEffect(() => {
    console.log("📥 Conversas recebidas/atualizadas:", conversations);
  }, [conversations]);

  // ⚠️ Log se houver erro
  useEffect(() => {
    if (error) console.error("❌ Erro no useConversationList:", error);
  }, [error]);

  // 🔁 Log de loading
  useEffect(() => {
    console.log("⏳ Carregando conversas:", loading);
  }, [loading]);

  return null; // nada de UI, só console
}
