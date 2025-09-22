import { AuthService } from "./auth"

export const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"

interface ApiResponse<T = any> {
    success: boolean
    message: string
    data?: T
    errors?: Record<string, string[]> | { detail: string }
    statusCode: number
    timestamp: string
}

export class ApiError extends Error {
    public readonly statusCode: number
    public readonly errors?: Record<string, string[]> | { detail: string }
    public readonly timestamp?: string

    constructor(
        message: string,
        statusCode: number,
        errors?: Record<string, string[]> | { detail: string },
        timestamp?: string
    ) {
        super(message)
        this.name = "ApiError"
        this.statusCode = statusCode
        this.errors = errors
        this.timestamp = timestamp
    }

    public getFirstValidationError(): (string | string[]) | null {
        if (!this.errors) return null

        if ('detail' in this.errors) {
            return this.errors.detail
        }

        const firstField = Object.keys(this.errors)[0]
        if (firstField) {
            const fieldErrors = this.errors[firstField]
            if (Array.isArray(fieldErrors) && fieldErrors.length > 0) {
                return fieldErrors[0]
            }
        }

        return null
    }

    public getAllValidationErrors(): string | string[] {
        if (!this.errors) return []

        if ('detail' in this.errors) {
            return this.errors.detail
        }

        const allErrors: string[] = []
        Object.values(this.errors).forEach(fieldErrors => {
            if (Array.isArray(fieldErrors)) {
                allErrors.push(...fieldErrors)
            }
        })

        return allErrors
    }

    public getFieldErrors(): Record<string, string[]> {
        if (!this.errors) {
            return {}
        }

        if ('detail' in this.errors) {
            return {}
        }

        const fieldErrors: Record<string, string[]> = {}
        for (const [field, errors] of Object.entries(this.errors)) {
            if (Array.isArray(errors)) {
                fieldErrors[field] = errors
            }
        }

        return fieldErrors
    }
}

export class ApiService {
    private static getAuthHeaders(): Record<string, string> {
        const token = AuthService.getToken()
        const headers: Record<string, string> = {}

        if (token) {
            headers.Authorization = `Bearer ${token}`
        }

        return headers
    }

    private static async handleResponse<T>(response: Response): Promise<T> {
        if (response.status === 204 || response.status === 304) {
            return undefined as unknown as T
        }

        const text = await response.text()

        let parsedResponse: ApiResponse<T>
        try {
            parsedResponse = JSON.parse(text)
        } catch (e) {
            throw new ApiError(
                "Resposta inválida do servidor",
                response.status,
                { detail: text.substring(0, 100) }
            )
        }

        if (response.status === 401) {
            AuthService.removeToken()
            window.location.reload()
            throw new ApiError(
                parsedResponse.message || "Sessão expirada. Faça login novamente.",
                401,
                parsedResponse.errors,
                parsedResponse.timestamp
            )
        }

        if (!response.ok || !parsedResponse.success) {
            throw new ApiError(
                parsedResponse.message || `Erro ${response.status}`,
                parsedResponse.statusCode || response.status,
                parsedResponse.errors,
                parsedResponse.timestamp
            )
        }

        return parsedResponse.data !== undefined ? parsedResponse.data : (parsedResponse as unknown as T)
    }

    public static async get<T>(endpoint: string): Promise<T> {
        const url = `${API_BASE_URL}${endpoint}`

        try {
            const response = await fetch(url, {
                headers: this.getAuthHeaders(),
                method: "GET",
            })

            return this.handleResponse<T>(response)
        } catch (error) {
            if (error instanceof ApiError) {
                throw error
            }

            throw new ApiError(
                error instanceof Error ? error.message : "Erro de conexão",
                0,
                { detail: "Verifique sua conexão com a internet" }
            )
        }
    }

    public static async post<T>(endpoint: string, data?: any): Promise<T> {
        const url = `${API_BASE_URL}${endpoint}`
        const isFormData = data instanceof FormData

        try {
            const response = await fetch(url, {
                method: "POST",
                headers: {
                    ...this.getAuthHeaders(),
                    ...(isFormData ? {} : { "Content-Type": "application/json" })
                },
                body: isFormData ? data : JSON.stringify(data),
            })

            return this.handleResponse<T>(response)
        } catch (error) {
            if (error instanceof ApiError) {
                throw error
            }

            throw new ApiError(
                error instanceof Error ? error.message : "Erro de conexão",
                0,
                { detail: "Verifique sua conexão com a internet" }
            )
        }
    }

    public static async put<T>(endpoint: string, data: any): Promise<T> {
        const url = `${API_BASE_URL}${endpoint}`

        try {
            const response = await fetch(url, {
                method: "PUT",
                headers: {
                    ...this.getAuthHeaders(),
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(data),
            })

            return this.handleResponse<T>(response)
        } catch (error) {
            if (error instanceof ApiError) {
                throw error
            }

            throw new ApiError(
                error instanceof Error ? error.message : "Erro de conexão",
                0,
                { detail: "Verifique sua conexão com a internet" }
            )
        }
    }

    public static async patch<T>(endpoint: string, data: any): Promise<T> {
        const url = `${API_BASE_URL}${endpoint}`

        try {
            const response = await fetch(url, {
                method: "PATCH",
                headers: {
                    ...this.getAuthHeaders(),
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(data),
            })

            return this.handleResponse<T>(response)
        } catch (error) {
            if (error instanceof ApiError) {
                throw error
            }

            throw new ApiError(
                error instanceof Error ? error.message : "Erro de conexão",
                0,
                { detail: "Verifique sua conexão com a internet" }
            )
        }
    }

    public static async delete<T>(endpoint: string): Promise<T> {
        const url = `${API_BASE_URL}${endpoint}`

        try {
            const response = await fetch(url, {
                method: "DELETE",
                headers: this.getAuthHeaders(),
            })

            return this.handleResponse<T>(response)
        } catch (error) {
            if (error instanceof ApiError) {
                throw error
            }

            throw new ApiError(
                error instanceof Error ? error.message : "Erro de conexão",
                0,
                { detail: "Verifique sua conexão com a internet" }
            )
        }
    }

    public static isValidationError(error: unknown): error is ApiError {
        return error instanceof ApiError && (error.statusCode === 400 || error.statusCode === 422)
    }

    public static isAuthError(error: unknown): error is ApiError {
        return error instanceof ApiError && (error.statusCode === 401 || error.statusCode === 403)
    }

    public static isServerError(error: unknown): error is ApiError {
        return error instanceof ApiError && error.statusCode >= 500
    }
}