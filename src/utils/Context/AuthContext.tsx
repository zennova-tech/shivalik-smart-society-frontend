import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

// Define the shape of the context
interface AuthContextType {
    authToken: string | null;
    login: (token: string) => void;
    logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Auth Provider component
export const AuthProvider = ({ children }: { children: ReactNode }) => {
    const [authToken, setAuthToken] = useState<string | null>(null);

    // On mount, check if auth_token exists in localStorage
    useEffect(() => {
        const token = localStorage.getItem('auth_token');
        if (token) {
            setAuthToken(token);
        }
        const storedUser = localStorage.getItem("userInfo");
        login(token);
    }, []);

    // Function to handle login
    const login = (token: string) => {
        localStorage.setItem('auth_token', token);
        setAuthToken(token);
    };

    // Function to handle logout
    const logout = () => {
        localStorage.removeItem('auth_token');
        setAuthToken(null);
    };

    return (
        <AuthContext.Provider value={{ authToken, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
};

// Custom hook to use the AuthContext
export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};