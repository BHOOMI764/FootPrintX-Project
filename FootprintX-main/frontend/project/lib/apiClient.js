import axios from 'axios';

// Use relative URLs since Next.js will proxy /api/* to the backend
const apiBaseUrl = process.env.NEXT_PUBLIC_BACKEND_URL || '';

const apiClient = axios.create({
    baseURL: apiBaseUrl,
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