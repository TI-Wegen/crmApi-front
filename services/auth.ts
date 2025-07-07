import type { LoginRequest, LoginResponse, User } from "@/types/auth"

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"

export class AuthService {
  private static readonly TOKEN_KEY = "crm_token"
  private static readonly USER_KEY = "crm_user"

  static async login(credentials: LoginRequest): Promise<LoginResponse> {
    const response = await fetch(`${API_BASE_URL}/api/auth/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(credentials),
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      throw new Error(errorData.message || "Credenciais inválidas")
    }
    return response.json()
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
