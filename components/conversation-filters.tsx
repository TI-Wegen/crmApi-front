"use client"

import { Filter, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
  DropdownMenuCheckboxItem,
} from "@/components/ui/dropdown-menu"
import { Tag } from "@/types/tag"
import { Conversation } from "@/types/conversa"

interface ConversationFiltersProps {
    activeFilter: string
    onFilterChange: (filter: string) => void
    tags?: Tag[]
    conversations: Conversation[]
}

export default function ConversationFilters({
    activeFilter,
    onFilterChange,
    tags = [],
    conversations,
}: ConversationFiltersProps) {
    // Calcular contagem de conversas por tag
    const getTagCount = (tagId: string) => {
        if (!tagId) return conversations.length;
        return conversations.filter(conv =>
            conv.tagId === tagId
        ).length
    }

    // Contagem para "Todos"
    const totalCount = conversations.length

    const tagFilters = [
        { key: "", label: "Todos", count: totalCount },
        ...tags.map(tag => ({
            key: tag.id,
            label: tag.nome,
            count: getTagCount(tag.id)
        }))
    ]

    const activeFilterItem = tagFilters.find(f => f.key === activeFilter) || tagFilters[0]

    return (
        <div className="p-4 border-b border-gray-200 bg-gray-50">
            <div className="flex items-center mb-3">
                <Filter className="h-4 w-4 text-gray-500 mr-2"/>
                <span className="text-sm font-medium text-gray-700">Filtros</span>
            </div>

            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button variant="outline" className="w-full justify-between">
                        <span>{activeFilterItem.label} ({activeFilterItem.count})</span>
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
                                {activeFilter === filter.key && (
                                    <span className="bg-gray-200 rounded-full px-2 py-0.5 text-xs">
                                        {filter.count}
                                    </span>
                                )}
                            </div>
                        </DropdownMenuCheckboxItem>
                    ))}
                </DropdownMenuContent>
            </DropdownMenu>
        </div>
    )
}
