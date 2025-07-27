"use client" 
import type React from "react"
import { AuthProvider } from "@/contexts/auth-context"
import { SignalRProvider } from "@/contexts/signalr-context"
// No futuro, você pode adicionar outros providers aqui:
// import { ThemeProvider } from 'next-themes'
// import { QueryClient, QueryClientProvider } from '@tanstack/react-query'

export function Providers({ children }: { children: React.ReactNode }) {
  // const [queryClient] = useState(() => new QueryClient())

  return (
    <AuthProvider>

      {/* <QueryClientProvider client={queryClient}>
          <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
            {children}
          </ThemeProvider>
        </QueryClientProvider>
      */}
      <SignalRProvider>
        {children}
      </SignalRProvider>
    </AuthProvider>
  )
}