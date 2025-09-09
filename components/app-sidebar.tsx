"use client"

import {ChevronLeft, ChevronRight, LogOut, MessageCircle, Tag, User, Users} from "lucide-react"
import type React from "react";
import {useState} from "react";
import {useSignalRConnectionStatus} from "@/hooks/use-signalR-connection-status";
import UserHeader from "@/components/user-header";
import {DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger} from "@/components/ui/dropdown-menu";
import {Button} from "@/components/ui/button";
import {useAuth} from "@/hooks/use-auth";
import {usePathname, useRouter} from 'next/navigation';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface MenuItem {
    name: string
    href: string
    icon: React.ReactNode
    badge?: {
        text: string
        type: "default" | "primary"
    }
}

export default function AppSidebar({children}: { children: React.ReactNode }) {
    const isSignalRConnected = useSignalRConnectionStatus();
    const {user, logout} = useAuth()
    const router = useRouter();
    const pathname = usePathname();

    const isLoginPage = pathname === "/login";

    const [isExpanded, setIsExpanded] = useState(false);

    const topMenuItems: MenuItem[] = [
        {
            name: "Conversas",
            href: "/chat/conversations",
            icon: <MessageCircle className="h-4 w-4 mr-2"/>
        },
        {
            name: "Contatos",
            href: "/chat/contacts",
            icon: <Users className="h-4 w-4 mr-2"/>,
        },
        {
            name: "Tags",
            href: "/tags",
            icon: <Tag className="h-4 w-4 mr-2"/>,
        },
    ]

    const isActive = (href: string) => {
        if (href === "/chat/conversations") {
            return pathname === "/chat/conversations" || pathname === "/chat";
        }
        if (href === "/chat/contacts") {
            return pathname === "/chat/contacts";
        }
        return false;
    };

    const handleLogout = (): void => {
        if (confirm("Tem certeza que deseja sair?")) {
            logout()
            router.push("/login")
        }
    }

    if (isLoginPage) {
        return <>{children}</>;
    }

    if (!user) {
        return (
            <>
                <UserHeader signalRConnected={!!isSignalRConnected}/>
                <div className="sm:ml-64 h-[calc(100vh-4rem)] overflow-hidden">
                    {children}
                </div>
            </>
        )
    }

    return (
        <>
            <UserHeader signalRConnected={!!isSignalRConnected}/>
            <aside
                id="separator-sidebar"
                className={`fixed top-16 left-0 z-40 h-[calc(100vh-4rem)] transition-all duration-300 ease-in-out ${
                    isExpanded ? "w-64" : "w-20"
                }`}
                aria-label="Sidebar">
                <div className="h-full px-3 py-4 overflow-y-auto bg-gray-50 flex flex-col">
                    <ul className="space-y-2 font-medium flex-grow">
                        {topMenuItems.map((item, index) => (
                            <li key={index}>
                                <TooltipProvider>
                                    <Tooltip>
                                        <TooltipTrigger asChild>
                                            <a
                                                href={item.href}
                                                className={`flex items-center p-2 rounded-lg group transition-colors ${
                                                    isActive(item.href)
                                                        ? "bg-gray-800 text-white"
                                                        : "text-gray-900 hover:bg-gray-100"
                                                } ${isExpanded ? "" : "justify-center"}`}
                                                onClick={(e) => {
                                                    e.preventDefault()
                                                    router.push(item.href)
                                                }}>
              <span className={isActive(item.href) ? "text-white" : ""}>
                {item.icon}
              </span>
                                                {isExpanded && (
                                                    <>
                                                        <span className="ms-3">{item.name}</span>
                                                        {item.badge && (
                                                            <span
                                                                className={`inline-flex items-center justify-center px-2 ms-3 text-sm font-medium rounded-full ${
                                                                    item.badge.type === "primary"
                                                                        ? isActive(item.href)
                                                                            ? "text-blue-100 bg-blue-800"
                                                                            : "text-blue-800 bg-blue-100"
                                                                        : isActive(item.href)
                                                                            ? "text-gray-100 bg-gray-800"
                                                                            : "text-gray-800 bg-gray-100"
                                                                }`}>
                      {item.badge.text}
                    </span>
                                                        )}
                                                    </>
                                                )}
                                            </a>
                                        </TooltipTrigger>
                                        {!isExpanded && (
                                            <TooltipContent side="right">
                                                <p>{item.name}</p>
                                            </TooltipContent>
                                        )}
                                    </Tooltip>
                                </TooltipProvider>
                            </li>
                        ))}
                    </ul>

                    <ul className="pt-4 space-y-2 font-medium border-t border-gray-200">
                        <li>
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => setIsExpanded(!isExpanded)}
                                className={`w-full flex items-center justify-start p-2 ${
                                    isExpanded ? "" : "justify-center"
                                }`}
                            >
                                {isExpanded ? (
                                    <>
                                        <ChevronLeft className="h-5 w-5"/>
                                        <span className="ms-3">Recolher menu</span>
                                    </>
                                ) : (
                                    <ChevronRight className="h-5 w-5"/>
                                )}
                            </Button>
                        </li>

                        <li>
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button
                                        variant="ghost"
                                        className={`w-full flex items-center space-x-2 ${
                                            isExpanded ? "" : "justify-center"
                                        }`}
                                    >
                                        <div
                                            className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center">
                                            <User className="h-4 w-4 text-gray-600"/>
                                        </div>
                                        {isExpanded && (
                                            <div className="text-left">
                                                <p className="text-sm font-medium text-gray-900">{user.name}</p>
                                                <p className="text-xs text-gray-500">{user.email}</p>
                                            </div>
                                        )}
                                    </Button>
                                </DropdownMenuTrigger>

                                <DropdownMenuContent align="end" className="w-56">
                                    <DropdownMenuItem onClick={handleLogout} className="text-red-600">
                                        <LogOut className="h-4 w-4 mr-2"/>
                                        Sair
                                    </DropdownMenuItem>
                                </DropdownMenuContent>
                            </DropdownMenu>
                        </li>
                    </ul>
                </div>
            </aside>

            <div className={isExpanded ? "sm:ml-64" : "sm:ml-20"}
                 style={{height: "calc(100vh - 4rem)", overflow: "hidden"}}>
                {children}
            </div>
        </>
    )
}
