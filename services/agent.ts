import {ApiService} from "./api"

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
        return ApiService.get(`/api/agents${query ? `?${query}` : ""}`)
    }

    static async listarSetores() {
        return ApiService.get(`/api/Agents/setores`)
    }
}
