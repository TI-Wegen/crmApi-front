"use client";

import {useState} from 'react';
import {Button} from "@/components/ui/button";
import {Plus} from "lucide-react";
import {useTags} from '@/hooks/use-tags';
import {DataTable} from '@/components/data-table';
import {TagModal} from '@/components/tag-modal';
import {CreateTagDto, Tag, UpdateTagDto} from '@/types/tag';
import {Card, CardContent, CardHeader, CardTitle} from '@/components/ui/card';
import {Badge} from '@/components/ui/badge';
import {format} from 'date-fns';
import {ptBR} from 'date-fns/locale';
import {getContrastColor} from "@/utils/contrast-color";

export default function TagsPage() {
    const {
        tags,
        loading,
        error,
        createTag,
        updateTag,
        deleteTag,
        refreshTags,
        hasValidationError,
        hasAuthError,
        hasServerError
    } = useTags();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingTag, setEditingTag] = useState<Tag | null>(null);

    const columns = [
        {
            key: 'name',
            title: 'Tag',
            render: (value: string, row: Tag) => (
                <Badge style={{backgroundColor: row.cor, color: getContrastColor(row.cor)}}>
                    {row.nome}
                </Badge>
            )
        },
        {
            key: 'description',
            title: 'Descrição',
            render: (value: string, row: Tag) => row.descricao || '-'
        },
        {
            key: 'createdAt',
            title: 'Criada em',
            render: (value: string) => format(new Date(value), "dd/MM/yyyy HH:mm", {locale: ptBR})
        }
    ];

    const handleCreate = async (data: CreateTagDto) => {
        try {
            await createTag(data);
            setIsModalOpen(false);
        } catch (err) {
            console.error('Erro ao criar tag:', err);
            alert('Erro ao criar tag. Tente novamente.');
        }
    };

    const handleUpdate = async (data: UpdateTagDto) => {
        if (!editingTag) return;

        try {
            await updateTag(editingTag.id, data);
            setEditingTag(null);
            setIsModalOpen(false);
        } catch (err) {
            console.error('Erro ao atualizar tag:', err);
            alert('Erro ao atualizar tag. Tente novamente.');
        }
    };

    const handleDelete = async (tag: Tag) => {
        if (!confirm(`Tem certeza que deseja deletar a tag "${tag.nome}"?`)) {
            return;
        }

        try {
            await deleteTag(tag.id);
        } catch (err) {
            console.error('Erro ao deletar tag:', err);
            alert('Erro ao deletar tag. Tente novamente.');
        }
    };

    const openCreateModal = () => {
        setEditingTag(null);
        setIsModalOpen(true);
    };

    const openEditModal = (tag: Tag) => {
        setEditingTag(tag);
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setEditingTag(null);
    };

    return (
        <div className="container mx-auto py-6">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold">Gerenciamento de Tags</h1>
                <Button onClick={openCreateModal}>
                    <Plus className="h-4 w-4 mr-2"/>
                    Nova Tag
                </Button>
            </div>

            {error && (
                <Card className="mb-6">
                    <CardHeader>
                        <CardTitle className="text-red-500">Erro</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-red-500">{hasValidationError ? 'Erro de Validação' :
                            hasAuthError ? 'Erro de Autorização' :
                                hasServerError ? 'Erro do Servidor' :
                                    'Erro'}</p>
                        <Button onClick={refreshTags} className="mt-2">Tentar novamente</Button>
                    </CardContent>
                </Card>
            )}

            <Card>
                <CardHeader>
                    <CardTitle>Lista de Tags</CardTitle>
                </CardHeader>
                <CardContent>
                    <DataTable
                        data={tags}
                        columns={columns}
                        onEdit={openEditModal}
                        onDelete={handleDelete}
                        loading={loading}
                        emptyMessage="Nenhuma tag encontrada"
                    />
                </CardContent>
            </Card>

            <TagModal
                open={isModalOpen}
                onOpenChange={setIsModalOpen}
                editingTag={editingTag}
                onCreate={handleCreate}
                onUpdate={handleUpdate}
                onCancel={handleCloseModal}
            />
        </div>
    );
}
