import axios from 'axios';

// Create an Axios instance with a base URL and common settings
const apiClient = axios.create({
    baseURL: import.meta.env.VITE_API_URL, // Set base URL from environment variables
    timeout: 120000, // Set timeout for API requests
});

// Add request interceptor to dynamically set headers
apiClient.interceptors.request.use((config: any) => {
    try {
        const authToken = localStorage.getItem('auth_token');
        
        if (authToken && authToken.trim() !== '') {
            // Parse token if it's stored as JSON string (with quotes)
            let token = authToken.trim();
            
            // Try to parse as JSON first (in case it was stored with JSON.stringify)
            try {
                const parsed = JSON.parse(token);
                token = typeof parsed === 'string' ? parsed.trim() : token;
            } catch {
                // If parsing fails, it's already a plain string, use as-is
                token = token.trim();
            }
            
            // Remove any surrounding quotes and trim whitespace
            token = token.replace(/^["']|["']$/g, '').trim();
            
            // Only set header if token is not empty after processing
            if (token && token.length > 0) {
                // Ensure headers object exists
                if (!config.headers) {
                    config.headers = {};
                }
                
                // Set Authorization header
                config.headers.Authorization = `Bearer ${token}`;
                
                // Debug logging (only in development)
                if (import.meta.env.DEV) {
                    console.log('API Request - Authorization header set:', {
                        url: config.url,
                        method: config.method,
                        hasToken: !!token,
                        tokenLength: token.length,
                    });
                }
            } else {
                if (import.meta.env.DEV) {
                    console.warn('API Request - Empty token after processing, skipping Authorization header');
                }
            }
        } else {
            if (import.meta.env.DEV) {
                console.warn('API Request - No auth_token found in localStorage', {
                    url: config.url,
                    method: config.method,
                });
            }
        }
    } catch (error) {
        console.error('Error setting Authorization header:', error);
    }
    
    return config;
}, (error) => {
    return Promise.reject(error);
});

// Handle responses and errors globally
apiClient.interceptors.response.use(
    (response) => {
        return response; // Pass through the response
    },
    (error) => {
        const status = error.response?.status;
        const errorMessage = error.response?.data?.message || error.message || 'An unexpected error occurred';
        const errorData = error.response?.data;
        
        // Error logging (always log errors, but more detailed in development)
        if (import.meta.env.DEV) {
            console.error('API Error:', {
                status,
                message: errorMessage,
                url: error.config?.url,
                method: error.config?.method,
                data: errorData,
            });
        } else {
            console.error('API Error:', errorMessage, status);
        }
        
        // Check for 401 (Unauthorized) or 403 (Forbidden) status codes
        if (status === 401 || status === 403) {
            if (import.meta.env.DEV) {
                console.warn('Authentication error - Clearing tokens and redirecting to login');
            }
            // Remove auth token from localStorage
            localStorage.removeItem('auth_token');
            localStorage.removeItem('user_data');
            localStorage.removeItem('userInfo');
            // Don't clear all localStorage as it might have other important data
            // Navigate to the login page
            if (window.location.pathname !== '/login') {
                window.location.href = '/login';
            }
        }
        
        // Return the error with full details for better debugging
        return Promise.reject(error);
    }
);

export default apiClient;