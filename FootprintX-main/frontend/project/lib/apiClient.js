import axios from 'axios';

// Determine the backend URL - always use localhost:5000 in development
const getApiBaseUrl = () => {
    // Environment variable takes priority
    if (process.env.NEXT_PUBLIC_BACKEND_URL) {
        return process.env.NEXT_PUBLIC_BACKEND_URL;
    }
    
    // Check if running on localhost
    if (typeof window !== 'undefined') {
        const hostname = window.location.hostname;
        if (hostname === 'localhost' || hostname === '127.0.0.1') {
            return 'http://localhost:5000';
        }
    }
    
    // Production fallback
    return 'https://footprintx-projectxx.onrender.com';
};

const apiBaseUrl = getApiBaseUrl();
console.log('API Base URL:', apiBaseUrl);

const apiClient = axios.create({
    baseURL: apiBaseUrl,
    withCredentials: true,
});

// Interceptor to add the token to requests
apiClient.interceptors.request.use(
    (config) => {
        // Check if running on client side before accessing localStorage
        if (typeof window !== 'undefined') {
            const token = localStorage.getItem('authToken');
            if (token) {
                config.headers['x-auth-token'] = token;
            }
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Function to set the token in localStorage
export const setAuthToken = (token) => {
    if (token) {
        localStorage.setItem('authToken', token);
    } else {
        localStorage.removeItem('authToken');
    }
};

export default apiClient; 