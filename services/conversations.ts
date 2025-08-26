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

    static async getConversation(id: string): Promise<ConversationDetailsDto> {
        return ApiService.get<ConversationDetailsDto>(`/api/conversations/${id}`)
    }

    static async createConversation(data: StartConversationByTemplateData): Promise<ConversationDetailsDto> {
        return ApiService.post<ConversationDetailsDto>("/api/conversations", data)
    }

    static async updateConversation(id: string, data: Partial<ConversationDetailsDto>): Promise<ConversationDetailsDto> {
        return ApiService.put<ConversationDetailsDto>(`/api/conversations/${id}`, data)
    }

    static async deleteConversation(id: string): Promise<void> {
        return ApiService.delete<void>(`/api/conversations/${id}`)
    }

    static async sendMessage(conversaId: string, formData: FormData): Promise<any> {
        return ApiService.post<any>(`/api/conversations/${conversaId}/messages`, formData)
    }

    static async assignAgent(conversaId: string, data: AssignAgentData): Promise<any> {
        return ApiService.put<any>(`/api/conversations/${conversaId}/assign`, data)
    }

    static async transferConversation(conversaId: string, data: TransferConversationData): Promise<any> {
        return ApiService.put<any>(`/api/conversations/${conversaId}/transfer`, data)
    }

    static async closeConversation(conversaId: string): Promise<any> {
        return ApiService.put<any>(`/api/conversations/${conversaId}/close`, null)
    }

    static async getConversationSummary(): Promise<ConversationSummaryDto> {
        return ApiService.get<ConversationSummaryDto>("/api/conversations/summary")
    }

    static async iniciarConversaPorTemplate(dados: { contactId: string; templateName: string; bodyParameters:string[] }) {
        return ApiService.post(`/api/Conversations/${dados.contactId}/senTemplate`, dados)
    }

}
