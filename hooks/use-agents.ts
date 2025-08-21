import {useState, useEffect, useCallback} from "react"
import {AgentService} from "@/services/agent"
import type {AgenteDto} from "@/types/agente"
import type {SetorDto} from "@/types/setor"

interface PaginationDefault {
    pageNumber: number
    pageSize: number
    total: number
}

export interface UseAgentsReturn {
    agents: AgenteDto[]
    setores: SetorDto[]
    loading: boolean
    error: string | null
    pagination: PaginationDefault
    loadAgents: (params?: {
        pageNumber?: number;
        pageSize?: number;
        incluirInativos?: boolean
    }) => Promise<void>
}

export function useAgents(): UseAgentsReturn {
    const [agents, setAgents] = useState<AgenteDto[]>([])
    const [setores, setSetores] = useState<SetorDto[]>([])
    const [loading, setLoading] = useState<boolean>(true)
    const [error, setError] = useState<string | null>(null)
    const [pagination, setPagination] = useState<PaginationDefault>({
        pageNumber: 1,
        pageSize: 500,
        total: 0,
    })

    const loadAgents = useCallback(async (params?: {
            pageNumber?: number;
            pageSize?: number;
            incluirInativos?: boolean
        }): Promise<void> => {
            setLoading(true)
            setError(null)

            try {
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
                    throw new Error("Unexpected API response format for agents.")
                }
            } catch (err: unknown) {
                const message = err instanceof Error ? err.message : "Error loading agents."
                setError(message)
                console.error("Failed to load agents:", err)
            } finally {
                setLoading(false)
            }
        }, [])

    const loadSetores = useCallback(async (): Promise<SetorDto[]> => {
        try {
            const setoresData: SetorDto[] = await AgentService.listarSetores() as SetorDto[]
            setSetores(setoresData)
            return setoresData
        } catch (err: unknown) {
            console.error("Error loading sectors:", err)
            throw new Error("Unable to load sectors.")
        }
    }, [])

    useEffect((): void => {
        loadAgents()
        loadSetores()
    }, [loadAgents, loadSetores])

    return {
        agents,
        setores,
        loading,
        error,
        pagination,
        loadAgents,
    }
}
