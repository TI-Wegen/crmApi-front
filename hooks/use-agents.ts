"use client"

import { useState, useEffect, useCallback } from "react"
import { ApiService } from "@/services/api"
import type { AgenteDto, SetorDto } from "@/types/crm"

/**
 * Hook para gerenciar a lógica de negócios relacionada a agentes.
 * Centraliza o carregamento, paginação e estados de erro/loading.
 */
export function useAgents() {
  const [agents, setAgents] = useState<AgenteDto[]>([])
  const [setores, setSetores] = useState<SetorDto[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [pagination, setPagination] = useState({
    pageNumber: 1,
    pageSize: 20,
    total: 0,
  })

  /**
   * Carrega a lista de agentes da API.
   * Suporta paginação e filtros.
   * @param params Parâmetros para a busca, como paginação.
   */
  const loadAgents = useCallback(
    async (params?: { pageNumber?: number; pageSize?: number; incluirInativos?: boolean }) => {
      setLoading(true)
      setError(null)

      try {
        // Assume uma resposta paginada, similar ao 'useContacts'.
        const response = (await ApiService.listarAgentes(params)) as any

        // Adaptação para o formato de resposta da API (paginado ou array simples)
        if (response.data && typeof response.total !== "undefined") {
          setAgents(response.data)
          setPagination({
            pageNumber: response.pageNumber || 1,
            pageSize: response.pageSize || 20,
            total: response.total,
          })
        } else if (Array.isArray(response)) {
          setAgents(response)
          setPagination({ pageNumber: 1, pageSize: response.length, total: response.length })
        } else {
          throw new Error("Formato de resposta da API de agentes é inesperado.")
        }
      } catch (err) {
        const message = err instanceof Error ? err.message : "Erro ao carregar agentes."
        setError(message)
        console.error("Falha ao carregar agentes:", err)
      } finally {
        setLoading(false)
      }
    },
    [],
  )

  const loadSetores = useCallback(async () => {
    try {
      const setores = await ApiService.listarSetores()
        setSetores(setores as SetorDto[])
        return setores as SetorDto[]
    } catch (err) {
      console.error("Erro ao carregar setores:", err)
      throw new Error("Não foi possível carregar os setores.")
    }
  }
    , [])

  useEffect(() => {
    loadAgents(),
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