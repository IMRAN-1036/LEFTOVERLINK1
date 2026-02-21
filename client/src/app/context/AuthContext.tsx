import React, { createContext, useContext, useState, useEffect } from 'react';
import { UserRole } from '../types';

interface AuthUser {
    id: string;
    name: string;
    role: UserRole | string;
    email?: string;
}

interface AuthContextType {
    user: AuthUser | null;
    token: string | null;
    isLoading: boolean;
    login: (user: AuthUser, token: string) => void;
    logout: () => void;
    updateUser: (updates: Partial<AuthUser>) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [user, setUser] = useState<AuthUser | null>(null);
    const [token, setToken] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const initAuth = () => {
            try {
                const savedUser = localStorage.getItem('user');
                const savedToken = localStorage.getItem('token');

                if (savedUser && savedToken) {
                    setUser(JSON.parse(savedUser));
                    setToken(savedToken);
                }
            } catch (e) {
                console.error("Failed to parse user from localStorage", e);
            } finally {
                setIsLoading(false);
            }
        };
        initAuth();
    }, []);

    const login = (userData: AuthUser, authToken: string) => {
        setUser(userData);
        setToken(authToken);
        localStorage.setItem('user', JSON.stringify(userData));
        localStorage.setItem('token', authToken);
    };

    const logout = () => {
        setUser(null);
        setToken(null);
        localStorage.removeItem('user');
        localStorage.removeItem('token');
        // For completely clearing out other app-specific caches if needed
        // localStorage.removeItem('userSettings'); 
        localStorage.removeItem('receiverWallet');
        window.location.href = '/login';
    };

    const updateUser = (updates: Partial<AuthUser>) => {
        setUser(prev => {
            if (!prev) return prev;
            const updated = { ...prev, ...updates };
            localStorage.setItem('user', JSON.stringify(updated));
            return updated;
        });
    };

    return (
        <AuthContext.Provider value={{ user, token, isLoading, login, logout, updateUser }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
}
