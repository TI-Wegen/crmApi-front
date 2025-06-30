"use client"

import type React from "react"

import { createContext, useContext, useEffect, useState } from "react"
import { AuthService } from "@/services/auth"
import type { AuthState, LoginRequest } from "@/types/auth"

interface AuthContextType extends AuthState {
  login: (credentials: LoginRequest) => Promise<void>
  logout: () => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    token: null,
    isAuthenticated: false,
    isLoading: true,
  })

  // Verificar token salvo na inicialização
  useEffect(() => {
    const initializeAuth = () => {
      const token = AuthService.getToken()
      const user = AuthService.getUser()

      if (token && AuthService.isTokenValid(token) && user) {
        setAuthState({
          user,
          token,
          isAuthenticated: true,
          isLoading: false,
        })
      } else {
        // Token inválido ou expirado
        AuthService.removeToken()
        setAuthState({
          user: null,
          token: null,
          isAuthenticated: false,
          isLoading: false,
        })
      }
    }

    initializeAuth()
  }, [])

  const login = async (credentials: LoginRequest) => {
    setAuthState((prev) => ({ ...prev, isLoading: true }))

    try {
      const response = await AuthService.login(credentials)
      const user = AuthService.decodeToken(response.token)

      if (!user) {
        throw new Error("Token inválido recebido do servidor")
      }

      AuthService.saveToken(response.token)
      AuthService.saveUser(user)

      setAuthState({
        user,
        token: response.token,
        isAuthenticated: true,
        isLoading: false,
      })
    } catch (error) {
      setAuthState({
        user: null,
        token: null,
        isAuthenticated: false,
        isLoading: false,
      })
      throw error
    }
  }

  const logout = () => {
    AuthService.removeToken()
    setAuthState({
      user: null,
      token: null,
      isAuthenticated: false,
      isLoading: false,
    })
  }

  return (
    <AuthContext.Provider
      value={{
        ...authState,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth deve ser usado dentro de um AuthProvider")
  }
  return context
}
