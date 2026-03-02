import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [token, setToken] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const storedToken = localStorage.getItem('ig_token');
        if (storedToken) {
            try {
                // Manually decode JWT payload (base64)
                const parts = storedToken.split('.');
                if (parts.length === 3) {
                    const payload = JSON.parse(atob(parts[1]));
                    if (payload.exp * 1000 > Date.now()) {
                        setUser({ email: payload.user, name: payload.name || 'Coach', role: payload.role || 'user' });
                        setToken(storedToken);
                    } else {
                        localStorage.removeItem('ig_token');
                    }
                }
            } catch (e) {
                console.warn('Token parse failed:', e);
                localStorage.removeItem('ig_token');
            }
        }
        setLoading(false);
    }, []);

    const login = (userData, userToken) => {
        setUser(userData);
        setToken(userToken);
        localStorage.setItem('ig_token', userToken);
    };

    const logout = () => {
        setUser(null);
        setToken(null);
        localStorage.removeItem('ig_token');
    };

    return (
        <AuthContext.Provider value={{ user, token, login, logout, isAuthenticated: !!user, loading }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const ctx = useContext(AuthContext);
    if (!ctx) throw new Error('useAuth must be used inside AuthProvider');
    return ctx;
};
