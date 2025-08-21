"use client"

import { LogOut, User, Settings } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
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
  const { user, logout } = useAuth()

  if (!user) return null

  const handleLogout = (): void => {
    if (confirm("Tem certeza que deseja sair?")) {
      logout()
    }
  }

  return (
    <div className="bg-white border-b border-gray-200 px-4 py-3">
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

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center">
                <User className="h-4 w-4 text-gray-600" />
              </div>
              <div className="text-left">
                <p className="text-sm font-medium text-gray-900">{user.name}</p>
                <p className="text-xs text-gray-500">{user.email}</p>
              </div>
            </Button>
          </DropdownMenuTrigger>

          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuItem>
              <User className="h-4 w-4 mr-2" />
              Meu Perfil
            </DropdownMenuItem>
            <DropdownMenuItem>
              <Settings className="h-4 w-4 mr-2" />
              Configurações
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleLogout} className="text-red-600">
              <LogOut className="h-4 w-4 mr-2" />
              Sair
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  )
}
