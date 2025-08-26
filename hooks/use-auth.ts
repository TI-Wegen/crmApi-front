import {useCallback, useEffect, useState} from "react";
import {AuthService} from "@/services/auth";
import type {AuthState, LoginRequest, User} from "@/types/auth";

export interface UseAuthReturn {
    user: User | null;
    token: string | null;
    isAuthenticated: boolean;
    isLoading: boolean;

    login: (credentials: LoginRequest) => Promise<void>;
    logout: () => void;
}

export function useAuth(): UseAuthReturn {
    const [authState, setAuthState] = useState<AuthState>({
        user: null,
        token: null,
        isAuthenticated: false,
        isLoading: true,
    });

    const initializeAuth = useCallback((): void => {
        console.log("🔄 Inicializando autenticação...")

        try {
            const token = AuthService.getToken();
            const user = AuthService.getUser();

            console.log("🔍 Estado inicial:", {
                hasToken: !!token,
                hasUser: !!user,
                userEmail: user?.email
            });

            if (token && user && AuthService.isTokenValid(token)) {
                console.log("✅ Usuário autenticado encontrado");
                setAuthState({
                    user,
                    token,
                    isAuthenticated: true,
                    isLoading: false,
                });
            } else {
                console.log("❌ Usuário não autenticado ou token inválido");
                if (token || user) {
                    AuthService.removeToken();
                }
                setAuthState({
                    user: null,
                    token: null,
                    isAuthenticated: false,
                    isLoading: false,
                });
            }
        } catch (error) {
            console.error("❌ Erro na inicialização:", error);
            AuthService.removeToken();
            setAuthState({
                user: null,
                token: null,
                isAuthenticated: false,
                isLoading: false,
            });
        }
    }, []);

    useEffect(() => {
        const timer = setTimeout(() => {
            initializeAuth();
        }, 100);

        return () => clearTimeout(timer);
    }, [initializeAuth]);

    const login = useCallback(async (credentials: LoginRequest): Promise<void> => {
        console.log("🚀 Iniciando processo de login...");

        setAuthState(prev => ({
            ...prev,
            isLoading: true,
            isAuthenticated: false
        }));

        try {
            const response = await AuthService.login(credentials);
            console.log("✅ Login API bem-sucedido");

            const user = AuthService.decodeToken(response.token);
            if (!user) {
                throw new Error("Token inválido recebido do servidor");
            }

            AuthService.saveToken(response.token);
            AuthService.saveUser(user);

            const newState = {
                user,
                token: response.token,
                isAuthenticated: true,
                isLoading: false,
            };

            console.log("✅ Estado de autenticação atualizado:", {
                userEmail: user.email,
                isAuthenticated: true
            });

            setAuthState(newState);

        } catch (error: unknown) {
            console.error("❌ Erro no login:", error);

            AuthService.removeToken();

            setAuthState({
                user: null,
                token: null,
                isAuthenticated: false,
                isLoading: false,
            });

            throw error;
        }
    }, []);

    const logout = useCallback((): void => {
        console.log("🚪 Fazendo logout...");

        AuthService.removeToken();
        setAuthState({
            user: null,
            token: null,
            isAuthenticated: false,
            isLoading: false,
        });

        if (typeof window !== "undefined") {
            window.location.href = '/login';
        }
    }, []);

    useEffect(() => {
        console.log("🔍 Estado auth atual:", {
            isAuthenticated: authState.isAuthenticated,
            isLoading: authState.isLoading,
            hasUser: !!authState.user,
            hasToken: !!authState.token,
            userEmail: authState.user?.email
        });
    }, [authState]);

    return {
        user: authState.user,
        token: authState.token,
        isAuthenticated: authState.isAuthenticated,
        isLoading: authState.isLoading,

        login,
        logout,
    };
}