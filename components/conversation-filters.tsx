"use client"

import { Filter } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
  DropdownMenuCheckboxItem,
} from "@/components/ui/dropdown-menu"
import {Tag} from "@/types/tag";

interface ConversationFiltersProps {
    activeFilter: string
    onFilterChange: (filter: string) => void
    conversationCounts?: {
        all: number
        [key: string]: number
    }
    tags?: Tag[]
}

export default function ConversationFilters({
    activeFilter,
    onFilterChange,
    conversationCounts,
    tags = [],
}: ConversationFiltersProps) {
    const tagFilters = [
        { key: "", label: "Todos", count: conversationCounts?.all},
        ...tags.map(tag => ({
            key: tag.id,
            label: tag.nome,
            count: conversationCounts?.[tag.id] || 0,
        }))
    ]

    const activeFilterLabel = tagFilters.find(f => f.key === activeFilter)?.label || "Todos"

    return (
        <div className="p-4 border-b border-gray-200 bg-gray-50">
            <div className="flex items-center mb-3">
                <Filter className="h-4 w-4 text-gray-500 mr-2"/>
                <span className="text-sm font-medium text-gray-700">Filtros</span>
            </div>

            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button variant="outline" className="w-full justify-between">
                        <span>{activeFilterLabel}</span>
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-[200px]" align="start">
                    {tagFilters.map((filter) => (
                        <DropdownMenuCheckboxItem
                            key={filter.key}
                            checked={activeFilter === filter.key}
                            onCheckedChange={(checked) => {
                                if (checked) {
                                    onFilterChange(filter.key)
                                }
                            }}
                        >
                            <div className="flex justify-between w-full">
                                <span>{filter.label}</span>
                                <span className="ml-2 bg-gray-200 text-gray-700 rounded-full px-2 py-1 text-xs">
                                    {filter.count}
                                </span>
                            </div>
                        </DropdownMenuCheckboxItem>
                    ))}
                </DropdownMenuContent>
            </DropdownMenu>
        </div>
    )
}
