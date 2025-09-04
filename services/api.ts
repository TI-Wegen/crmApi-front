import {AuthService} from "./auth"

export const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"

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
        if (response.status === 401) {
            AuthService.removeToken()
            window.location.reload()
            throw new Error("Sessão expirada. Faça login novamente.")
        }

        if (response.status === 204 || response.status === 202) {
            const text = await response.text();
            if (!text) {
                return undefined as unknown as T;
            }
            try {
                return JSON.parse(text);
            } catch {
                return undefined as unknown as T;
            }
        }

        if (!response.ok) {
            let errorMessage = `API Error: ${response.status} ${response.statusText}`;
            try {
                const errorText = await response.text();
                if (errorText) {
                    try {
                        const errorData = JSON.parse(errorText);
                        errorMessage = errorData.message || errorData.error || errorMessage;
                    } catch {
                        errorMessage = errorText || errorMessage;
                    }
                }
            } catch (e) {
            }
            throw new Error(errorMessage);
        }

        const text = await response.text();
        if (!text) {
            throw new Error("Resposta vazia do servidor");
        }

        try {
            return JSON.parse(text);
        } catch (e) {
            throw new Error("Resposta inválida do servidor: " + text.substring(0, 100));
        }
    }


    public static async get<T>(endpoint: string): Promise<T> {
        const url = `${API_BASE_URL}${endpoint}`

        const response = await fetch(url, {
            headers: this.getAuthHeaders(),
            method: "GET",
        })

        return this.handleResponse<T>(response)
    }

    public static async post<T>(endpoint: string, data?: any): Promise<T> {
        const url = `${API_BASE_URL}${endpoint}`

        const isFormData = data instanceof FormData

        const response = await fetch(url, {
            method: "POST",
            headers: {
                ...this.getAuthHeaders(),
                ...(isFormData ? {} : {"Content-Type": "application/json"})
            },
            body: isFormData ? data : JSON.stringify(data),
        })


        return this.handleResponse<T>(response)
    }

    public static async put<T>(endpoint: string, data: any): Promise<T> {
        const url = `${API_BASE_URL}${endpoint}`

        const response = await fetch(url, {
            method: "PUT",
            headers: {
                ...this.getAuthHeaders(),
                "Content-Type": "application/json",
            },
            body: JSON.stringify(data),
        })

        return this.handleResponse<T>(response)
    }

    public static async patch<T>(endpoint: string, data: any): Promise<T> {
        const url = `${API_BASE_URL}${endpoint}`

        const response = await fetch(url, {
            method: "PATCH",
            headers: {
                ...this.getAuthHeaders(),
                "Content-Type": "application/json",
            },
            body: JSON.stringify(data),
        })

        return this.handleResponse<T>(response)
    }

    public static async delete<T>(endpoint: string): Promise<T> {
        const url = `${API_BASE_URL}${endpoint}`

        const response = await fetch(url, {
            method: "DELETE",
            headers: this.getAuthHeaders(),
        })

        return this.handleResponse<T>(response)
    }
}