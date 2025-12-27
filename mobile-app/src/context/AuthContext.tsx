import React, { createContext, useState, useEffect, useContext } from 'react';
import * as SecureStore from 'expo-secure-store';
import client from '../api/client';

interface AuthContextType {
    user: any;
    isLoading: boolean;
    login: (token: string, user: any) => Promise<void>;
    logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
    user: null,
    isLoading: true,
    login: async () => { },
    logout: async () => { },
});

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
    const [user, setUser] = useState<any>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        checkUser();
    }, []);

    const checkUser = async () => {
        try {
            const token = await SecureStore.getItemAsync('authToken');
            if (token) {
                // Verify token with backend if needed, or just assume valid for now and fetch user
                const response = await client.get('/user');
                setUser(response.data);
            }
        } catch (e) {
            console.error('Failed to restore token', e);
            await SecureStore.deleteItemAsync('authToken');
        } finally {
            setIsLoading(false);
        }
    };

    const login = async (token: string, userData: any) => {
        if (typeof token !== 'string') {
            console.error('Login failed: Token is not a string:', token);
            return;
        }
        await SecureStore.setItemAsync('authToken', token);
        setUser(userData);
    };

    const logout = async () => {
        try {
            await client.post('/logout'); // Optional: notify backend
        } catch (e) {
            // ignore
        }
        await SecureStore.deleteItemAsync('authToken');
        setUser(null);
    };

    return (
        <AuthContext.Provider value={{ user, isLoading, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
