import { ConversationSearchParams } from "@/types/crm"
import { API_BASE_URL, ApiService } from "./api"
import { AuthService } from "./auth"


export class ConversationsService {
     static async listarConversas(params?: ConversationSearchParams) {
    const searchParams = new URLSearchParams()
    if (params?.pageNumber) searchParams.set("pageNumber", params.pageNumber.toString())
    if (params?.pageSize) searchParams.set("pageSize", params.pageSize.toString())
    if (params?.status) searchParams.set("status", params.status.toString())
    if (params?.agenteId) searchParams.set("agenteId", params.agenteId.toString())
    if (params?.setorId) searchParams.set("setorId", params.setorId.toString())

    const query = searchParams.toString()
    return ApiService.request(`/api/conversations${query ? `?${query}` : ""}`)
  }

  static async iniciarConversa(dados: { contatoId: string; texto: string; anexoUrl?: string }) {
    return ApiService.request("/api/conversations", {
      method: "POST",
      body: JSON.stringify(dados),
    })
  }

  static async buscarConversa(id: string) {
    return ApiService.request(`/api/conversations/${id}`)
  }

  static async adicionarMensagem(conversaId: string, formData: FormData) {
    const token = AuthService.getToken()
    const headers: Record<string, string> = {}

    if (token) {
      headers.Authorization = `Bearer ${token}`
    }

    const response = await fetch(`${API_BASE_URL}/api/conversations/${conversaId}/messages`, {
      method: "POST",
      headers,
      body: formData,
    })

    if (response.status === 401) {
      AuthService.removeToken()
      window.location.reload()
      throw new Error("Sessão expirada. Faça login novamente.")
    }

    if (!response.ok) {
      throw new Error(`API Error: ${response.status} ${response.statusText}`)
    }

    return response.json()
  }

  static async atribuirAgente(conversaId: string, agenteId: string) {
    return ApiService.request(`/api/conversations/${conversaId}/atribuir-agente`, {
      method: "PATCH",
      body: JSON.stringify({ agenteId }),
    })
  }

  static async resolverConversa(atendimentoID: string) {
    return ApiService.request(`/api/conversations/${atendimentoID}/resolver`, {
      method: "PATCH",
    })
  }

  static async transferirConversa(conversaId: string, dados: { novoAgenteId?: string; novoSetorId?: string }) {
    return ApiService.request(`/api/conversations/${conversaId}/transferir`, {
      method: "PATCH",
      body: JSON.stringify(dados),
    })
  }
}