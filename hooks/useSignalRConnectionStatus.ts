"use client"

import { useState, useEffect } from "react"
import { signalRService } from "@/services/signalr"
import { HubConnectionState } from "@microsoft/signalr"

export function useSignalRConnectionStatus() {
  const [isConnected, setIsConnected] = useState(false)
  const [connectionState, setConnectionState] = useState<HubConnectionState | null>(null)

  useEffect(() => {
    // Função para verificar o status da conexão
    const checkConnectionStatus = () => {
      try {
        const state = signalRService.getConnectionState()
        const connected = signalRService.isConnected()

        setConnectionState(state)
        setIsConnected(connected)
      } catch (error) {
        console.warn("Erro ao verificar status do SignalR:", error)
        setIsConnected(false)
        setConnectionState(null)
      }
    }

    // Verificar status inicial
    checkConnectionStatus()

    // Verificar status periodicamente
    const interval = setInterval(checkConnectionStatus, 2000) // Aumentado para 2s

    return () => {
      clearInterval(interval)
    }
  }, [])

  // Função segura para verificar se está conectando
  const isConnectingState = () => {
    try {
      return connectionState === HubConnectionState.Connecting
    } catch {
      return false
    }
  }

  // Função segura para obter debug info
  const getDebugInfo = () => {
    try {
      return typeof signalRService.getDebugInfo === "function"
        ? signalRService.getDebugInfo()
        : { connectionState, isConnected }
    } catch {
      return { connectionState, isConnected }
    }
  }

  return {
    isConnected,
    connectionState,
    isConnecting: isConnectingState(),
    debugInfo: getDebugInfo(),
  }
}
