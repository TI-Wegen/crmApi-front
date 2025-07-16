import { ApiService } from "./api"

export class AgentService {
    static async listarAgentes(params?: {
    pageNumber?: number
    pageSize?: number
    incluirInativos?: boolean
  }) {
    const searchParams = new URLSearchParams()
    if (params?.pageNumber) searchParams.set("pageNumber", params.pageNumber.toString())
    if (params?.pageSize) searchParams.set("pageSize", params.pageSize.toString())
    if (params?.incluirInativos) searchParams.set("incluirInativos", params.incluirInativos.toString())

    const query = searchParams.toString()
    return ApiService.request(`/api/agents${query ? `?${query}` : ""}`)
  }

  static async buscarAgente(id: string) {
    return ApiService.request(`/api/agents/${id}`)
  }

    static async listarSetores() {
    return ApiService.request(`/api/Agents/setores`)
  }
}
