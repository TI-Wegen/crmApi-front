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
            console.log("🔐 Login API response received")
            return response
        } catch (error: unknown) {
            console.error("❌ Login API error:", error)
            if (error instanceof Error) {
                throw new Error(error.message || "Credenciais inválidas")
            }
            throw new Error("Credenciais inválidas")
        }
    }

    static saveToken(token: string): void {
        if (typeof window !== "undefined") {
            localStorage.setItem(this.TOKEN_KEY, token)

            const expires = new Date()
            expires.setDate(expires.getDate() + 7)
            document.cookie = `${this.TOKEN_KEY}=${token}; path=/; expires=${expires.toUTCString()}; SameSite=Lax`

            console.log("💾 Token salvo no localStorage e cookie")
        }
    }

    static getToken(): string | null {
        if (typeof window !== "undefined") {
            const token = localStorage.getItem(this.TOKEN_KEY)
            console.log("🔍 Token obtido:", token ? "presente" : "ausente")
            return token
        }
        return null
    }

    static removeToken(): void {
        if (typeof window !== "undefined") {
            localStorage.removeItem(this.TOKEN_KEY)
            localStorage.removeItem(this.USER_KEY)

            document.cookie = `${this.TOKEN_KEY}=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT`

            console.log("🗑️ Token e usuário removidos")
        }
    }

    static decodeToken(token: string): User | null {
        try {
            const parts = token.split(".");
            if (parts.length !== 3) {
                console.error("❌ Token format is invalid");
                return null;
            }

            const payload = parts[1];
            if (!payload) {
                console.error("❌ Token payload is empty");
                return null;
            }

            const decoded = JSON.parse(atob(payload))

            const user: User = {
                id: decoded.sub || decoded.id,
                email: decoded.email,
                name: decoded.name || decoded.nome,
                setorId: decoded.setorId,
                setorNome: decoded.setorNome,
            }

            console.log("👤 Token decodificado:", user)
            return user
        } catch (error) {
            console.error("❌ Erro ao decodificar token:", error)
            return null
        }
    }

    static isTokenValid(token: string): boolean {
        if (!token) return false

        try {
            const parts = token.split(".");
            if (parts.length !== 3) {
                console.error("❌ Token format is invalid");
                return false;
            }

            const payload = parts[1];
            if (!payload) {
                console.error("❌ Token payload is empty");
                return false;
            }

            const decoded = JSON.parse(atob(payload))
            const currentTime = Date.now() / 1000
            const isValid = decoded.exp > currentTime

            console.log("✅ Token válido:", isValid, "Expira em:", new Date(decoded.exp * 1000))
            return isValid
        } catch (error) {
            console.error("❌ Erro ao validar token:", error)
            return false
        }
    }

    static saveUser(user: User): void {
        if (typeof window !== "undefined") {
            localStorage.setItem(this.USER_KEY, JSON.stringify(user))
            console.log("👤 Usuário salvo no localStorage")
        }
    }

    static getUser(): User | null {
        if (typeof window !== "undefined") {
            const userData = localStorage.getItem(this.USER_KEY)
            if (userData) {
                try {
                    const user = JSON.parse(userData)
                    console.log("👤 Usuário obtido do localStorage:", user.email)
                    return user
                } catch (error) {
                    console.error("❌ Erro ao parsear usuário:", error)
                    this.removeToken()
                    return null
                }
            }
        }
        return null
    }

    static isAuthenticated(): boolean {
        const token = this.getToken()
        const user = this.getUser()

        if (!token || !user) {
            console.log("🔍 Não autenticado: token ou usuário ausente")
            return false
        }

        if (!this.isTokenValid(token)) {
            console.log("🔍 Não autenticado: token inválido")
            this.removeToken()
            return false
        }

        console.log("🔍 Autenticado com sucesso")
        return true
    }
}
