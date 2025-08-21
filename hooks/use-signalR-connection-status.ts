"use client"

import {useState, useEffect} from "react"
import {signalRService} from "@/services/signalr"
import {HubConnectionState} from "@microsoft/signalr"

export interface UseSignalRConnectionStatusReturn {
    isConnected: boolean
    connectionState: HubConnectionState | null
    isConnecting: boolean
    debugInfo: any
}

export function useSignalRConnectionStatus(): UseSignalRConnectionStatusReturn {
    const [isConnected, setIsConnected] = useState<boolean>(false)
    const [connectionState, setConnectionState] = useState<HubConnectionState | null>(null)

    useEffect(() => {
        const checkConnectionStatus = () => {
            try {
                const state = signalRService.getConnectionState()
                const connected = signalRService.isConnected()

                setConnectionState(state)
                setIsConnected(connected)
            } catch (error: unknown) {
                console.warn("Erro ao verificar status do SignalR:", error)
                setIsConnected(false)
                setConnectionState(null)
            }
        }

        checkConnectionStatus()

        const interval = setInterval(checkConnectionStatus, 2000)

        return () => {
            clearInterval(interval)
        }
    }, [])

    const isConnectingState = (): boolean => {
        try {
            return connectionState === HubConnectionState.Connecting
        } catch (error: unknown) {
            return false
        }
    }

    const getDebugInfo = (): any => {
        try {
            return typeof signalRService.getDebugInfo === "function"
                ? signalRService.getDebugInfo()
                : {connectionState, isConnected}
        } catch (error: unknown) {
            return {connectionState, isConnected}
        }
    }

    return {
        isConnected,
        connectionState,
        isConnecting: isConnectingState(),
        debugInfo: getDebugInfo(),
    }
}