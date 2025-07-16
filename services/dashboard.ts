import { ApiService } from "./api"
import type { DashboardStats, MessageHistory, BotMessage, DashboardFilters } from "@/types/dashboard"

export class DashboardService {
  static async getDashboardStats(filters?: DashboardFilters): Promise<DashboardStats> {
    const params = new URLSearchParams()

    if (filters?.dataInicio) params.set("dataInicio", filters.dataInicio)
    if (filters?.dataFim) params.set("dataFim", filters.dataFim)
    if (filters?.setorId) params.set("setorId", filters.setorId)

    const query = params.toString()
    return ApiService.request(`/api/dashboard/stats${query ? `?${query}` : ""}`)
  }

  static async getMessageHistory(
    filters?: DashboardFilters & {
      pageNumber?: number
      pageSize?: number
    },
  ): Promise<{
    data: MessageHistory[]
    total: number
    pageNumber: number
    pageSize: number
  }> {
    const params = new URLSearchParams()

    if (filters?.dataInicio) params.set("dataInicio", filters.dataInicio)
    if (filters?.dataFim) params.set("dataFim", filters.dataFim)
    if (filters?.setorId) params.set("setorId", filters.setorId)
    if (filters?.agenteId) params.set("agenteId", filters.agenteId)
    if (filters?.tipoMensagem && filters.tipoMensagem !== "Todas") {
      params.set("tipoMensagem", filters.tipoMensagem)
    }
    if (filters?.pageNumber) params.set("pageNumber", filters.pageNumber.toString())
    if (filters?.pageSize) params.set("pageSize", filters.pageSize.toString())

    const query = params.toString()
    return ApiService.request(`/api/dashboard/messages${query ? `?${query}` : ""}`)
  }

  static async getBotMessages(
    filters?: DashboardFilters & {
      pageNumber?: number
      pageSize?: number
    },
  ): Promise<{
    data: BotMessage[]
    total: number
    pageNumber: number
    pageSize: number
  }> {
    const params = new URLSearchParams()

    if (filters?.dataInicio) params.set("dataInicio", filters.dataInicio)
    if (filters?.dataFim) params.set("dataFim", filters.dataFim)
    if (filters?.pageNumber) params.set("pageNumber", filters.pageNumber.toString())
    if (filters?.pageSize) params.set("pageSize", filters.pageSize.toString())

    const query = params.toString()
    return ApiService.request(`/api/dashboard/bot-messages${query ? `?${query}` : ""}`)
  }

  static async exportMessageHistory(filters?: DashboardFilters): Promise<Blob> {
    const params = new URLSearchParams()

    if (filters?.dataInicio) params.set("dataInicio", filters.dataInicio)
    if (filters?.dataFim) params.set("dataFim", filters.dataFim)
    if (filters?.setorId) params.set("setorId", filters.setorId)
    if (filters?.agenteId) params.set("agenteId", filters.agenteId)
    if (filters?.tipoMensagem && filters.tipoMensagem !== "Todas") {
      params.set("tipoMensagem", filters.tipoMensagem)
    }

    const query = params.toString()
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/dashboard/export${query ? `?${query}` : ""}`, {
      headers: ApiService.getAuthHeaders(),
    })

    if (!response.ok) {
      throw new Error("Erro ao exportar dados")
    }

    return response.blob()
  }
}
