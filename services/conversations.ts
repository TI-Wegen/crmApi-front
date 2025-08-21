import {ApiService} from "./api"
import type {
    AssignAgentData,
    ConversationDetailsDto,
    ConversationListItemDto,
    ConversationSearchParams,
    ConversationSummaryDto,
    StartConversationByTemplateData,
    TransferConversationData
} from "@/types/conversa"

export class ConversationsService {
    static async listarConversas(params?: ConversationSearchParams): Promise<ConversationListItemDto[]> {
        const searchParams = new URLSearchParams()
        if (params?.pageNumber) searchParams.set("pageNumber", params.pageNumber.toString())
        if (params?.pageSize) searchParams.set("pageSize", params.pageSize.toString())
        if (params?.status) searchParams.set("status", params.status.toString())
        if (params?.agenteId) searchParams.set("agenteId", params.agenteId.toString())
        if (params?.setorId) searchParams.set("setorId", params.setorId.toString())

        const query = searchParams.toString()
        return ApiService.get<ConversationListItemDto[]>(`/api/conversations${query ? `?${query}` : ""}`)
    }

    static async buscarConversa(id: string): Promise<ConversationDetailsDto> {
        return ApiService.get<ConversationDetailsDto>(`/api/conversations/${id}`)
    }

    static async adicionarMensagem(conversaId: string, formData: FormData): Promise<any> {
        return ApiService.post<any>(`/api/conversations/${conversaId}/messages`, formData)
    }
}