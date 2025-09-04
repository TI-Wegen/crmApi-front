"use client";

import {useState} from 'react';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow
} from "@/components/ui/table";
import {Button} from "@/components/ui/button";
import {Pencil, Trash2, Eye} from "lucide-react";
import {
    Pagination,
    PaginationContent,
    PaginationEllipsis,
    PaginationItem,
    PaginationLink,
    PaginationNext,
    PaginationPrevious
} from "@/components/ui/pagination";
import {PaginatedResponse} from "@/types/common/pagination";

interface Column<T> {
    key: keyof T | string;
    title: string;
    render?: (value: any, row: T) => React.ReactNode;
}

interface DataTableProps<T extends Record<string, any>> {
    data: T[] | PaginatedResponse<T>;
    columns: Column<T>[];
    onEdit?: (item: T) => void;
    onDelete?: (item: T) => void;
    onView?: (item: T) => void;
    loading?: boolean;
    emptyMessage?: string;
    onPageChange?: (page: number) => void;
}

export function DataTable<T extends Record<string, any>>({
                                                             data,
                                                             columns,
                                                             onEdit,
                                                             onDelete,
                                                             onView,
                                                             loading,
                                                             emptyMessage = "Nenhum registro encontrado",
                                                             onPageChange
                                                         }: DataTableProps<T>) {
    const [deletingId, setDeletingId] = useState<string | null>(null);

    const isPaginated = (data: T[] | PaginatedResponse<T>): data is PaginatedResponse<T> => {
        return !Array.isArray(data) && 'items' in data && 'page' in data && 'totalPages' in data;
    };

    const paginatedData: PaginatedResponse<T> | null = isPaginated(data) ? data : null;
    const items: T[] = isPaginated(data) ? data.items : data;

    const handleDelete = async (item: T) => {
        if ('id' in item && typeof item.id === 'string') {
            setDeletingId(item.id);
        }
        try {
            await onDelete?.(item);
        } finally {
            setDeletingId(null);
        }
    };

    const getValue = (item: T, key: string) => {
        const keys = key.split('.');
        let value: any = item;

        for (const k of keys) {
            if (value && typeof value === 'object' && k in value) {
                value = value[k];
            } else {
                return undefined;
            }
        }

        return value;
    };

    const handlePageChange = (page: number) => {
        if (paginatedData && onPageChange) {
            onPageChange(page);
        }
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center h-32">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
            </div>
        );
    }

    if (items.length === 0) {
        return (
            <div className="text-center py-8">
                <p className="text-gray-500">{emptyMessage}</p>
            </div>
        );
    }

    return (
        <div>
            <div className="rounded-md border">
                <Table>
                    <TableHeader>
                        <TableRow>
                            {columns.map((column, index) => (
                                <TableHead key={index}>{column.title}</TableHead>
                            ))}
                            {(onEdit || onDelete || onView) && (
                                <TableHead className="text-right">Ações</TableHead>
                            )}
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {items.map((item, itemIndex) => (
                            <TableRow key={itemIndex}>
                                {columns.map((column, colIndex) => (
                                    <TableCell key={colIndex}>
                                        {column.render
                                            ? column.render(getValue(item, column.key as string), item)
                                            : getValue(item, column.key as string) ?? '-'
                                        }
                                    </TableCell>
                                ))}
                                {(onEdit || onDelete || onView) && (
                                    <TableCell className="text-right">
                                        <div className="flex justify-end space-x-2">
                                            {onView && (
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={() => onView(item)}
                                                >
                                                    <Eye className="h-4 w-4"/>
                                                </Button>
                                            )}
                                            {onEdit && (
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={() => onEdit(item)}
                                                >
                                                    <Pencil className="h-4 w-4"/>
                                                </Button>
                                            )}
                                            {onDelete && (
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={() => handleDelete(item)}
                                                    disabled={
                                                        deletingId !== null &&
                                                        'id' in item &&
                                                        typeof item.id === 'string' &&
                                                        item.id === deletingId
                                                    }
                                                >
                                                    {deletingId !== null &&
                                                    'id' in item &&
                                                    typeof item.id === 'string' &&
                                                    item.id === deletingId ? (
                                                        <div
                                                            className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-500"></div>
                                                    ) : (
                                                        <Trash2 className="h-4 w-4"/>
                                                    )}
                                                </Button>
                                            )}
                                        </div>
                                    </TableCell>
                                )}
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </div>

            {paginatedData && paginatedData.totalPages > 1 && (
                <div className="mt-4">
                    <Pagination>
                        <PaginationContent>
                            <PaginationItem>
                                <PaginationPrevious
                                    onClick={() => handlePageChange(paginatedData.page - 1)}
                                    className={paginatedData.hasPrevious ? "cursor-pointer" : "opacity-50 cursor-not-allowed pointer-events-none"}
                                />
                            </PaginationItem>

                            {paginatedData.page > 2 && (
                                <>
                                    <PaginationItem>
                                        <PaginationLink
                                            onClick={() => handlePageChange(1)}
                                        >
                                            1
                                        </PaginationLink>
                                    </PaginationItem>
                                    {paginatedData.page > 3 && (
                                        <PaginationItem>
                                            <PaginationEllipsis/>
                                        </PaginationItem>
                                    )}
                                </>
                            )}

                            {paginatedData.hasPrevious && (
                                <PaginationItem>
                                    <PaginationLink
                                        onClick={() => handlePageChange(paginatedData.page - 1)}
                                    >
                                        {paginatedData.page - 1}
                                    </PaginationLink>
                                </PaginationItem>
                            )}

                            <PaginationItem>
                                <PaginationLink isActive>
                                    {paginatedData.page}
                                </PaginationLink>
                            </PaginationItem>

                            {paginatedData.hasNext && (
                                <PaginationItem>
                                    <PaginationLink
                                        onClick={() => handlePageChange(paginatedData.page + 1)}
                                    >
                                        {paginatedData.page + 1}
                                    </PaginationLink>
                                </PaginationItem>
                            )}

                            {paginatedData.page < paginatedData.totalPages - 1 && (
                                <>
                                    {paginatedData.page < paginatedData.totalPages - 2 && (
                                        <PaginationItem>
                                            <PaginationEllipsis/>
                                        </PaginationItem>
                                    )}
                                    <PaginationItem>
                                        <PaginationLink
                                            onClick={() => handlePageChange(paginatedData.totalPages)}
                                        >
                                            {paginatedData.totalPages}
                                        </PaginationLink>
                                    </PaginationItem>
                                </>
                            )}

                            <PaginationItem>
                                <PaginationNext
                                    onClick={() => handlePageChange(paginatedData.page + 1)}
                                    className={paginatedData.hasNext ? "cursor-pointer" : "opacity-50 cursor-not-allowed pointer-events-none"}
                                />
                            </PaginationItem>
                        </PaginationContent>
                    </Pagination>
                </div>
            )}
        </div>
    );
}
