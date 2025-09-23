import {useCallback, useEffect, useState} from "react"
import {AgentService} from "@/services/agent"
import type {AgenteDto} from "@/types/agente"
import type {SetorDto} from "@/types/setor"
import {createErrorFromApiError, UseTagsError} from "@/utils/erro-from-api-handler"

interface PaginationDefault {
    pageNumber: number
    pageSize: number
    total: number
}

interface LoadAgentsParams {
    pageNumber?: number;
    pageSize?: number;
    incluirInativos?: boolean;
}

export interface UseAgentsReturn {
    agents: AgenteDto[]
    setores: SetorDto[]
    loading: boolean
    pagination: PaginationDefault

    error: UseTagsError | null
    hasValidationError: boolean
    hasAuthError: boolean
    hasServerError: boolean

    loadAgents: (params?: LoadAgentsParams) => Promise<boolean>
    loadSetores: () => Promise<SetorDto[] | null>
    refreshData: () => Promise<void>
    clearError: () => void

    getFieldError: (fieldName: string) => string | null
    getAllValidationMessages: () => string[]
}

export function useAgents(): UseAgentsReturn {
    const [agents, setAgents] = useState<AgenteDto[]>([])
    const [setores, setSetores] = useState<SetorDto[]>([])
    const [loading, setLoading] = useState<boolean>(true)
    const [error, setError] = useState<UseTagsError | null>(null)
    const [pagination, setPagination] = useState<PaginationDefault>({
        pageNumber: 1,
        pageSize: 500,
        total: 0,
    })

    const loadAgents = useCallback(async (params?: LoadAgentsParams): Promise<boolean> => {
        try {
            setLoading(true)
            setError(null)

            const response: any = await AgentService.listarAgentes(params)

            if (response.data && typeof response.total !== "undefined") {
                setAgents(response.data)
                setPagination({
                    pageNumber: response.pageNumber || 1,
                    pageSize: response.pageSize || 500,
                    total: response.total,
                })
            } else if (Array.isArray(response)) {
                setAgents(response)
                setPagination({
                    pageNumber: 1,
                    pageSize: response.length,
                    total: response.length
                })
            } else {
                throw new Error("Formato de resposta da API inesperado para agentes.")
            }

            return true

        } catch (err: unknown) {
            const errorInfo = createErrorFromApiError(err, 'Falha ao carregar agentes')
            setError(errorInfo)
            console.error("Erro ao carregar agentes:", err)
            return false
        } finally {
            setLoading(false)
        }
    }, [])

    const loadSetores = useCallback(async (): Promise<SetorDto[] | null> => {
        try {
            setError(null)

            const setoresData: SetorDto[] = await AgentService.listarSetores() as SetorDto[]
            setSetores(setoresData)
            return setoresData

        } catch (err: unknown) {
            const errorInfo = createErrorFromApiError(err, 'Falha ao carregar setores')
            setError(errorInfo)
            console.error("Erro ao carregar setores:", err)
            return null
        }
    }, [])

    const refreshData = useCallback(async (): Promise<void> => {
        await loadAgents({
            pageNumber: pagination.pageNumber,
            pageSize: pagination.pageSize
        })

        await loadSetores()
    }, [loadAgents, loadSetores, pagination.pageNumber, pagination.pageSize])

    const clearError = useCallback(() => {
        setError(null)
    }, [])

    const getFieldError = useCallback((fieldName: string): string | null => {
        if (!error || !error.validationErrors) return null

        const fieldErrors = error.validationErrors[fieldName]
        return fieldErrors && fieldErrors.length > 0 ? fieldErrors[0] : null
    }, [error])

    const getAllValidationMessages = useCallback((): string[] => {
        if (!error || !error.validationErrors) return []

        const messages: string[] = []
        Object.values(error.validationErrors).forEach(fieldErrors => {
            if (Array.isArray(fieldErrors)) {
                messages.push(...fieldErrors)
            }
        })

        return messages
    }, [error])

    useEffect((): void => {
        const initializeData = async () => {
            const [agentsSuccess, setoresResult] = await Promise.allSettled([
                loadAgents(),
                loadSetores()
            ])

            if (agentsSuccess.status === 'rejected' && setoresResult.status === 'rejected') {
                console.error('Falha ao carregar dados iniciais')
            }
        }

        initializeData()
    }, [])

    return {
        agents,
        setores,
        loading,
        pagination,
        error,
        hasValidationError: error?.type === 'validation',
        hasAuthError: error?.type === 'auth',
        hasServerError: error?.type === 'server',
        loadAgents,
        loadSetores,
        refreshData,
        clearError,
        getFieldError,
        getAllValidationMessages
    }
}