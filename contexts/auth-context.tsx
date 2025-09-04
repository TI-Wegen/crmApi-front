"use client"

import type React from "react"
import {createContext} from "react"
import {useAuth, type UseAuthReturn} from "@/hooks/use-auth"
import AppSidebar from "@/components/app-sidebar";
import {useSignalRConnectionStatus} from "@/hooks/use-signalR-connection-status";
import {usePathname} from "next/navigation";
import UserHeader from "@/components/user-header";

interface AuthContextType extends UseAuthReturn {
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({children}: { children: React.ReactNode }) {
    const isSignalRConnected = useSignalRConnectionStatus();
    const auth = useAuth()
    const pathname = usePathname();

    const publicPaths = ['/login', '/register', '/'];
    if (publicPaths.includes(pathname)) {
        return <>{children}</>;
    }

    return (
        <AuthContext.Provider value={auth}>
            {auth ? (
                <AppSidebar>
                    {children}
                </AppSidebar>
            ) : (
                <>{children}</>
            )}
        </AuthContext.Provider>
    )
}
