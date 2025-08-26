"use client"

import {Filter, Users, Clock, CheckCircle} from "lucide-react"
import {Button} from "@/components/ui/button"
import {Badge} from "@/components/ui/badge"

interface ConversationFiltersProps {
    activeFilter: string
    onFilterChange: (filter: string) => void
    conversationCounts?: {
        all: number
        AguardandoNaFila: number
        EmAtendimento: number
        Resolvida: number
    }
}

export default function ConversationFilters({
                                                activeFilter,
                                                onFilterChange,
                                                conversationCounts,
                                            }: ConversationFiltersProps) {
    const filters = [
        {
            key: "" as const,
            label: "Todos",
            icon: CheckCircle,
            count: conversationCounts?.all || 0,
            color: "bg-blue-100 text-green-800",
        },
        {
            key: "AguardandoNaFila" as const,
            label: "Na Fila",
            icon: Clock,
            count: conversationCounts?.AguardandoNaFila || 0,
            color: "bg-yellow-100 text-yellow-800",
        },
        {
            key: "EmAtendimento" as const,
            label: "Em Andamento",
            icon: Users,
            count: conversationCounts?.EmAtendimento || 0,
            color: "bg-blue-100 text-blue-800",
        },
    ]

    return (
        <div className="p-4 border-b border-gray-200 bg-gray-50">
            <div className="flex items-center mb-3">
                <Filter className="h-4 w-4 text-gray-500 mr-2"/>
                <span className="text-sm font-medium text-gray-700">Filtros</span>
            </div>

            <div className="flex flex-wrap gap-2">
                {filters.map((filter) => {
                    const Icon = filter.icon
                    const isActive = activeFilter === filter.key

                    return (
                        <Button
                            key={filter.key}
                            variant={isActive ? "default" : "outline"}
                            size="sm"
                            onClick={() => onFilterChange(filter.key)}
                            className={`flex items-center space-x-2 ${isActive ? "" : "hover:bg-gray-100"}`}
                        >
                            <Icon className="h-3 w-3"/>
                            <span>{filter.label}</span>
                        </Button>
                    )
                })}
            </div>
        </div>
    )
}
