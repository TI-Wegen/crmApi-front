"use client"

import { Wifi, WifiOff } from "lucide-react"
import { Badge } from "@/components/ui/badge"

interface SignalRStatusProps {
  isConnected: boolean
  className?: string
}

export default function SignalRStatus({ isConnected, className }: SignalRStatusProps) {
  if (isConnected) {
    return (
      <Badge variant="secondary" className={`bg-green-100 text-green-800 ${className}`}>
        <Wifi className="h-3 w-3 mr-1" />
        Online
      </Badge>
    )
  }

  return (
    <Badge variant="secondary" className={`bg-yellow-100 text-yellow-800 ${className}`}>
      <WifiOff className="h-3 w-3 mr-1" />
      Offline
    </Badge>
  )
}
