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
            console.log('Attempting login with email:', email);
            const res = await apiClient.post('/api/auth/login', { email, password });
            const { token } = res.data;
            console.log('Login response received:', token ? 'Token received' : 'No token');
            setAuthToken(token);
            setUser({ token });
            router.push('/dashboard');
            return { success: true };
        } catch (error) {
            const errorMsg = error.response?.data?.errors?.[0]?.msg || 
                           error.response?.data?.msg || 
                           error.message || 
                           'Login failed';
            console.error('Login failed:', errorMsg, error);
            setAuthToken(null);
            setUser(null);
            return { success: false, message: errorMsg };
        }
    };

    const register = async (email, password) => {
        try {
            console.log('Attempting register with email:', email);
            const res = await apiClient.post('/api/auth/register', { email, password });
            const { token } = res.data;
            console.log('Register response received:', token ? 'Token received' : 'No token');
            setAuthToken(token);
            setUser({ token });
            router.push('/dashboard');
            return { success: true };
        } catch (error) {
            const errorMsg = error.response?.data?.errors?.[0]?.msg || 
                           error.response?.data?.msg || 
                           error.message || 
                           'Registration failed';
            console.error('Registration failed:', errorMsg, error);
            setAuthToken(null);
            setUser(null);
            return { success: false, message: errorMsg };
        }
    };

    const logout = () => {
        setAuthToken(null);
        setUser(null);
        router.push('/login'); // Redirect to login page
    };

    const demoLogin = async () => {
        try {
            console.log('Attempting demo login');
            const res = await apiClient.post('/api/auth/demo');
            const { token } = res.data;
            console.log('Demo login response received:', token ? 'Token received' : 'No token');
            setAuthToken(token);
            setUser({ token, isDemo: true });
            router.push('/dashboard');
            return { success: true };
        } catch (error) {
            const errorMsg = error.response?.data?.errors?.[0]?.msg || 
                           error.response?.data?.msg || 
                           error.message || 
                           'Demo login failed';
            console.error('Demo login failed:', errorMsg, error);
            setAuthToken(null);
            setUser(null);
            return { success: false, message: errorMsg };
        }
    };

    return (
        <AuthContext.Provider value={{ user, loading, login, register, logout, demoLogin }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext); 