import type { ConversationSearchParams } from "@/types/crm"
import { AuthService } from "./auth"

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"

export class ApiService {
  private static getAuthHeaders(): Record<string, string> {
    const token = AuthService.getToken()
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
    }

    if (token) {
      headers.Authorization = `Bearer ${token}`
    }

    return headers
  }

  private static async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const url = `${API_BASE_URL}${endpoint}`

    const response = await fetch(url, {
      headers: {
        ...this.getAuthHeaders(),
        ...options.headers,
      },
      ...options,
    })

    // Se receber 401, fazer logout automático
    if (response.status === 401) {
      AuthService.removeToken()
      window.location.reload()
      throw new Error("Sessão expirada. Faça login novamente.")
    }

    if (!response.ok) {
      throw new Error(`API Error: ${response.status} ${response.statusText}`)
    }

    // Para respostas 204 No Content
    if (response.status === 204) {
      return {} as T
    }

    return response.json()
  }

  // Contatos
  static async criarContato(dados: { nome: string; telefone: string }) {
    return this.request("/api/contacts", {
      method: "POST",
      body: JSON.stringify(dados),
    })
  }

  static async listarContatos(params?: {
    pageNumber?: number
    pageSize?: number
    incluirInativos?: boolean
  }) {
    const searchParams = new URLSearchParams()
    if (params?.pageNumber) searchParams.set("pageNumber", params.pageNumber.toString())
    if (params?.pageSize) searchParams.set("pageSize", params.pageSize.toString())
    if (params?.incluirInativos) searchParams.set("incluirInativos", params.incluirInativos.toString())

    const query = searchParams.toString()
    return this.request(`/api/contacts${query ? `?${query}` : ""}`)
  }

  static async buscarContato(id: string) {
    return this.request(`/api/contacts/${id}`)
  }

  static async atualizarContato(id: string, dados: { nome: string; telefone: string; tags?: string[] }) {
    return this.request(`/api/contacts/${id}`, {
      method: "PUT",
      body: JSON.stringify(dados),
    })
  }

  static async inativarContato(id: string) {
    return this.request(`/api/contacts/${id}`, {
      method: "DELETE",
    })
  }

  // Agentes
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
    return this.request(`/api/agents${query ? `?${query}` : ""}`)
  }

  static async buscarAgente(id: string) {
    return this.request(`/api/agents/${id}`)
  }

  // Conversas
  static async listarConversas(params?: ConversationSearchParams) {
    const searchParams = new URLSearchParams()
    if (params?.pageNumber) searchParams.set("pageNumber", params.pageNumber.toString())
    if (params?.pageSize) searchParams.set("pageSize", params.pageSize.toString())
    if (params?.status) searchParams.set("status", params.status.toString())
    if (params?.agenteId) searchParams.set("agenteId", params.agenteId.toString())
    if (params?.setorId) searchParams.set("setorId", params.setorId.toString())

    const query = searchParams.toString()
    return this.request(`/api/conversations${query ? `?${query}` : ""}`)
  }

  static async iniciarConversa(dados: { contatoId: string; texto: string; anexoUrl?: string }) {
    return this.request("/api/conversations", {
      method: "POST",
      body: JSON.stringify(dados),
    })
  }

  static async buscarConversa(id: string) {
    return this.request(`/api/conversations/${id}`)
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
    return this.request(`/api/conversations/${conversaId}/atribuir-agente`, {
      method: "PATCH",
      body: JSON.stringify({ agenteId }),
    })
  }

  static async resolverConversa(conversaId: string) {
    return this.request(`/api/conversations/${conversaId}/resolver`, {
      method: "PATCH",
    })
  }

  static async transferirConversa(conversaId: string, dados: { novoAgenteId?: string; novoSetorId?: string }) {
    return this.request(`/api/conversations/${conversaId}/transferir`, {
      method: "PATCH",
      body: JSON.stringify(dados),
    })
  }

  static async reabrirConversa(conversaId: string) {
    return this.request(`/api/conversations/${conversaId}/reabrir`, {
      method: "PATCH",
    })
  }
}
