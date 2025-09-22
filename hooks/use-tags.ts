import { useState, useEffect, useCallback } from 'react';
import { Tag, CreateTagDto, UpdateTagDto } from '@/types/tag';
import { TagsService } from '@/services/tags';
import { ApiError, ApiService } from '@/services/api';
import {createErrorFromApiError, UseTagsError} from "@/utils/erro-from-api-handler";

interface UseTagsReturn {
    tags: Tag[];
    loading: boolean;
    error: UseTagsError | null;
    hasValidationError: boolean;
    hasAuthError: boolean;
    hasServerError: boolean;
    createTag: (tagData: CreateTagDto) => Promise<Tag | null>;
    updateTag: (id: string, tagData: UpdateTagDto) => Promise<Tag | null>;
    deleteTag: (id: string) => Promise<boolean>;
    refreshTags: () => Promise<void>;
    clearError: () => void;
    getFieldError: (fieldName: string) => string | null;
    getAllValidationMessages: () => string[];
}

export const useTags = (pageNumber = 1, pageSize = 20): UseTagsReturn => {
    const [tags, setTags] = useState<Tag[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<UseTagsError | null>(null);

    const fetchTags = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);

            const data = await TagsService.getAll(pageNumber, pageSize);
            setTags(data);

        } catch (err) {
            const errorInfo = createErrorFromApiError(err, 'Falha ao carregar tags');
            setError(errorInfo);
            console.error('Erro ao carregar tags:', err);
        } finally {
            setLoading(false);
        }
    }, [pageNumber, pageSize]);

    const createTag = useCallback(async (tagData: CreateTagDto): Promise<Tag | null> => {
        try {
            setError(null);

            const newTag = await TagsService.create(tagData);
            setTags(prev => [...prev, newTag]);

            return newTag;
        } catch (err) {
            const errorInfo = createErrorFromApiError(err, 'Falha ao criar tag');
            setError(errorInfo);

            if (err instanceof ApiError) {
                throw err;
            }
            throw new Error(errorInfo.message);
        }
    }, []);

    const updateTag = useCallback(async (id: string, tagData: UpdateTagDto): Promise<Tag | null> => {
        try {
            setError(null);

            const updatedTag = await TagsService.update(id, tagData);
            setTags(prev => prev.map(tag => tag.id === id ? updatedTag : tag));

            return updatedTag;
        } catch (err) {
            const errorInfo = createErrorFromApiError(err, 'Falha ao atualizar tag');
            setError(errorInfo);

            if (err instanceof ApiError) {
                throw err;
            }
            throw new Error(errorInfo.message);
        }
    }, []);

    const deleteTag = useCallback(async (id: string): Promise<boolean> => {
        try {
            setError(null);

            await TagsService.delete(id);
            setTags(prev => prev.filter(tag => tag.id !== id));

            return true;
        } catch (err) {
            const errorInfo = createErrorFromApiError(err, 'Falha ao deletar tag');
            setError(errorInfo);

            console.error('Erro ao deletar tag:', err);
            return false;
        }
    }, []);

    const refreshTags = useCallback(async (): Promise<void> => {
        await fetchTags();
    }, [fetchTags]);

    const clearError = useCallback(() => {
        setError(null);
    }, []);

    const getFieldError = useCallback((fieldName: string): string | null => {
        if (!error || !error.validationErrors) return null;

        const fieldErrors = error.validationErrors[fieldName];
        return fieldErrors && fieldErrors.length > 0 ? fieldErrors[0] : null;
    }, [error]);

    const getAllValidationMessages = useCallback((): string[] => {
        if (!error || !error.validationErrors) return [];

        const messages: string[] = [];
        Object.values(error.validationErrors).forEach(fieldErrors => {
            if (Array.isArray(fieldErrors)) {
                messages.push(...fieldErrors);
            }
        });

        return messages;
    }, [error]);

    useEffect(() => {
        fetchTags();
    }, [fetchTags]);

    return {
        tags,
        loading,
        error,
        hasValidationError: error?.type === 'validation',
        hasAuthError: error?.type === 'auth',
        hasServerError: error?.type === 'server',
        createTag,
        updateTag,
        deleteTag,
        refreshTags,
        clearError,
        getFieldError,
        getAllValidationMessages
    };
};