"use client"

import { Button } from "@/components/ui/button"
import SignalRStatus from "./signalR-status"
import Link from "next/link"
import { useAuth } from "@/hooks/use-auth"

interface NavigationItem {
    name: string
    href: string
    icon?: React.ReactNode
}

const navigationItems: NavigationItem[] = [
    {
        name: "Home",
        href: "/",
    },
]

interface UserHeaderProps {
    signalRConnected?: boolean
}

export default function UserHeader({ signalRConnected = false }: UserHeaderProps) {
    const { user } = useAuth()

    if (!user) return null

    return (
        <div className="bg-white border-b border-gray-200 px-4 py-3 sticky top-0 w-full z-50">
            <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                        <span className="text-white text-sm font-bold">CRM</span>
                    </div>
                    <h1 className="text-xl font-semibold text-gray-800">Sistema CRM</h1>
                    <h3>{user.setorNome}</h3>
                    <SignalRStatus isConnected={signalRConnected} />
                </div>

                <nav>
                    <ul className="flex items-center space-x-4">
                        {navigationItems.map((item: NavigationItem) => (
                            <li key={item.href}>
                                <Link href={item.href}>
                                    <Button variant="ghost" size="sm">
                                        {item.icon}
                                        {item.name}
                                    </Button>
                                </Link>
                            </li>
                        ))}
                    </ul>
                </nav>
            </div>
        </div>
    )
}
