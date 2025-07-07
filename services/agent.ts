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
}
