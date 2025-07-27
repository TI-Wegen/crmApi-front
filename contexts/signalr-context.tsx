"use client"

import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  useRef,
  type ReactNode,
} from "react"
import { signalRService } from "@/services/signalr"
import { useAuth } from "./auth-context"

interface SignalRContextType {
  isConnected: boolean
}

const SignalRContext = createContext<SignalRContextType>({
  isConnected: false,
})

export function useSignalR() {
  return useContext(SignalRContext)
}

export function SignalRProvider({ children }: { children: ReactNode }) {
  const { isAuthenticated, token } = useAuth()
  const [isConnected, setIsConnected] = useState(false)
  const retryRef = useRef<NodeJS.Timeout | null>(null)

  const connectWithRetry = useCallback(async () => {
    // 1. Apenas verificamos a autenticação para iniciar o processo.
    if (!isAuthenticated || !token) {
      return
    }

    // 2. A própria service.connect() já é idempotente e previne múltiplas conexões.
    //    Não precisamos de uma verificação extra aqui.
    try {
      console.log("🔄 Tentando conectar ao SignalR (central)...")
      await signalRService.connect()

      // 3. Esta é a etapa crucial: SEMPRE atualizamos o estado do contexto após o sucesso.
      setIsConnected(true)
      console.log("✅ Conexão SignalR estabelecida centralmente.")

      if (retryRef.current) {
        clearTimeout(retryRef.current)
      }
    } catch (error) {
      console.error("❌ Falha na conexão central do SignalR, tentando novamente em 5s.", error)
      setIsConnected(false)

      if (retryRef.current) {
        clearTimeout(retryRef.current)
      }
      retryRef.current = setTimeout(connectWithRetry, 5000)
    }
  }, [isAuthenticated, token])

  useEffect(() => {
    if (isAuthenticated && token) {
      connectWithRetry()
    } else {
      if (signalRService.isConnected()) {
        signalRService.disconnect()
      }
      setIsConnected(false)
    }

    return () => {
      if (retryRef.current) {
        clearTimeout(retryRef.current)
      }
    }
  }, [isAuthenticated, token, connectWithRetry])

  return <SignalRContext.Provider value={{ isConnected }}>{children}</SignalRContext.Provider>
}