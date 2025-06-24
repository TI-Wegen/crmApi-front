import type { ConversationSearchParams } from "@/types/crm"


const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5233"

export class ApiService {
  private static async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const url = `${API_BASE_URL}${endpoint}`

    const response = await fetch(url, {
      headers: {
        "Content-Type": "application/json",
        ...options.headers,
      },
      ...options,
    })

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

  // Conversas
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
    const response = await fetch(`${API_BASE_URL}/api/conversations/${conversaId}/messages`, {
      method: "POST",
      body: formData,
    })

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

  static async listarConversas(params?: {
    pageNumber?: number
    pageSize?: number
    status?: string
    agenteId: string
    setorId: string
  }) {

    const searchParams = new URLSearchParams()
    if (params?.pageNumber) searchParams.set("pageNumber", params.pageNumber.toString())
    if (params?.pageSize) searchParams.set("pageSize", params.pageSize.toString())
    if (params?.status) searchParams.set("status", params.status.toString())
    if (params?.agenteId) searchParams.set("agenteId", params.agenteId.toString())
    if (params?.setorId) searchParams.set("setorId", params.setorId.toString())

    const query = searchParams.toString()
    return this.request(`/api/conversations${query ? `?${query}` : ""}`)
  }
}
