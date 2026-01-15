import React, { createContext, useState, useEffect, useContext } from 'react';
import apiClient, { setAuthToken } from '@/lib/apiClient';
import { useRouter } from 'next/navigation';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const router = useRouter();

    useEffect(() => {
        // Check for token in localStorage on initial load (client-side only)
        const token = localStorage.getItem('authToken');
        if (token) {
            setAuthToken(token); // Set token in apiClient headers
            // Fetch user data based on token
            apiClient.get('/api/auth/me')
                .then(res => {
                    setUser(res.data);
                })
                .catch(err => {
                    console.error('Failed to fetch user data:', err);
                    // Token might be invalid, clear it
                    setAuthToken(null);
                    localStorage.removeItem('authToken');
                    setUser(null);
                })
                .finally(() => {
                    setLoading(false);
                });
        } else {
            setAuthToken(null); // Clear token if not found
            setLoading(false);
        }
    }, []);

    const login = async (email, password) => {
        try {
            const res = await apiClient.post('/api/auth/login', { email, password });
            const { token } = res.data;
            setAuthToken(token);
            setUser({ token }); // Update user state
            router.push('/dashboard'); // Redirect to dashboard after login
            return { success: true };
        } catch (error) {
            console.error('Login failed:', error.response ? error.response.data : error.message);
            setAuthToken(null); // Clear token on failure
            setUser(null);
            return { success: false, message: error.response?.data?.errors?.[0]?.msg || 'Login failed' };
        }
    };

    const register = async (email, password) => {
        try {
            const res = await apiClient.post('/api/auth/register', { email, password });
            const { token } = res.data;
            setAuthToken(token);
            setUser({ token }); // Update user state
            router.push('/dashboard'); // Redirect to dashboard after registration
            return { success: true };
        } catch (error) {
            console.error('Registration failed:', error.response ? error.response.data : error.message);
            setAuthToken(null);
            setUser(null);
            return { success: false, message: error.response?.data?.errors?.[0]?.msg || 'Registration failed' };
        }
    };

    const logout = () => {
        setAuthToken(null);
        setUser(null);
        router.push('/login'); // Redirect to login page
    };

    const demoLogin = async () => {
        try {
            const res = await apiClient.post('/api/auth/demo');
            const { token } = res.data;
            setAuthToken(token);
            setUser({ token, isDemo: true });
            router.push('/dashboard');
            return { success: true };
        } catch (error) {
            console.error('Demo login failed:', error);
            setAuthToken(null);
            setUser(null);
            return { success: false, message: 'Demo login failed' };
        }
    };

    return (
        <AuthContext.Provider value={{ user, loading, login, register, logout, demoLogin }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext); 