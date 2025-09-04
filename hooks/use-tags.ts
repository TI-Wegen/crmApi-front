import {useState, useEffect, useCallback} from 'react';
import {Tag, CreateTagDto, UpdateTagDto} from '@/types/tag';
import {TagsService} from '@/services/tags';

export const useTags = (pageNumber = 1, pageSize = 20) => {
    const [tags, setTags] = useState<Tag[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    const fetchTags = useCallback(async () => {
        try {
            setLoading(true);
            const data = await TagsService.getAll(pageNumber, pageSize);
            setTags(data);
            setError(null);
        } catch (err) {
            setError('Falha ao carregar tags');
            console.error(err);
        } finally {
            setLoading(false);
        }
    }, [pageNumber, pageSize]);

    const createTag = useCallback(async (tagData: CreateTagDto): Promise<Tag> => {
        try {
            const newTag = await TagsService.create(tagData);
            setTags(prev => [...prev, newTag]);
            return newTag;
        } catch (err) {
            setError('Falha ao criar tag');
            throw err;
        }
    }, []);

    const updateTag = useCallback(async (id: string, tagData: UpdateTagDto): Promise<Tag> => {
        try {
            const updatedTag = await TagsService.update(id, tagData);
            setTags(prev => prev.map(tag => tag.id === id ? updatedTag : tag));
            return updatedTag;
        } catch (err) {
            setError('Falha ao atualizar tag');
            throw err;
        }
    }, []);

    const deleteTag = useCallback(async (id: string): Promise<void> => {
        try {
            await TagsService.delete(id);
            setTags(prev => prev.filter(tag => tag.id !== id));
        } catch (err) {
            setError('Falha ao deletar tag');
            throw err;
        }
    }, []);

    const refreshTags = useCallback(() => {
        fetchTags();
    }, [fetchTags]);

    useEffect(() => {
        fetchTags();
    }, [fetchTags]);

    return {
        tags,
        loading,
        error,
        createTag,
        updateTag,
        deleteTag,
        refreshTags
    };
};
