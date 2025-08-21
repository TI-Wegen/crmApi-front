import {useCallback, useEffect, useState} from "react";
import {AuthService} from "@/services/auth";
import type {AuthState, LoginRequest, User} from "@/types/auth";

export interface UseAuthReturn extends AuthState {
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

    useEffect((): void => {
        const initializeAuth = (): void => {
            const token: string | null = AuthService.getToken();
            const user: User | null = AuthService.getUser();

            if (token && AuthService.isTokenValid(token) && user) {
                setAuthState({
                    user,
                    token,
                    isAuthenticated: true,
                    isLoading: false,
                });
            } else {
                AuthService.removeToken();
                setAuthState({
                    user: null,
                    token: null,
                    isAuthenticated: false,
                    isLoading: false,
                });
            }
        };

        initializeAuth();
    }, []);

    const login = useCallback(async (credentials: LoginRequest): Promise<void> => {
        setAuthState((prev: AuthState): AuthState => ({...prev, isLoading: true}));

        try {
            const {token} = await AuthService.login(credentials);
            const user: User | null = AuthService.decodeToken(token);

            if (!user) {
                throw new Error("Invalid token received from server");
            }

            AuthService.saveToken(token);
            AuthService.saveUser(user);

            setAuthState({
                user,
                token: token,
                isAuthenticated: true,
                isLoading: false,
            });
        } catch (error: unknown) {
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
        AuthService.removeToken();
        setAuthState({
            user: null,
            token: null,
            isAuthenticated: false,
            isLoading: false,
        });
    }, []);

    return {
        ...authState,
        login,
        logout,
    };
}