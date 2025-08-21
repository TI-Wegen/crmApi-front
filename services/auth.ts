import { ApiService } from "./api"
import type { LoginRequest, LoginResponse, User } from "@/types/auth"

export class AuthService {
  private static readonly TOKEN_KEY = "crm_token"
  private static readonly USER_KEY = "crm_user"

  static async login(credentials: LoginRequest): Promise<LoginResponse> {
    try {
      const response: LoginResponse = await ApiService.post<LoginResponse>(
        "/api/auth/login",
        credentials
      )
      return response
    } catch (error: unknown) {
      if (error instanceof Error) {
        throw new Error(error.message || "Credenciais inválidas")
      }
      throw new Error("Credenciais inválidas")
    }
  }

  static saveToken(token: string): void {
    if (typeof window !== "undefined") {
      localStorage.setItem(this.TOKEN_KEY, token)
    }
  }

  static getToken(): string | null {
    if (typeof window !== "undefined") {
      return localStorage.getItem(this.TOKEN_KEY)
    }
    return null
  }

  static removeToken(): void {
    if (typeof window !== "undefined") {
      localStorage.removeItem(this.TOKEN_KEY)
      localStorage.removeItem(this.USER_KEY)
    }
  }

  static decodeToken(token: string): User | null {
    try {
      const payload = token.split(".")[1]
      const decoded = JSON.parse(atob(payload))
      return {
        id: decoded.sub,
        email: decoded.email,
        name: decoded.name,
        setorId: decoded.setorId,
        setorNome: decoded.setorNome,
      }
    } catch (error) {
      console.error("Erro ao decodificar token:", error)
      return null
    }
  }

  static isTokenValid(token: string): boolean {
    try {
      const payload = token.split(".")[1]
      const decoded = JSON.parse(atob(payload))
      const currentTime = Date.now() / 1000

      return decoded.exp > currentTime
    } catch (error) {
      return false
    }
  }

  static saveUser(user: User): void {
    if (typeof window !== "undefined") {
      localStorage.setItem(this.USER_KEY, JSON.stringify(user))
    }
  }

  static getUser(): User | null {
    if (typeof window !== "undefined") {
      const userData = localStorage.getItem(this.USER_KEY)
      return userData ? JSON.parse(userData) : null
    }
    return null
  }
}
