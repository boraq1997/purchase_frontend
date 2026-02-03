import axios, { AxiosError } from 'axios';
import router from '../../router';

// Create an Axios instance with default configuration
const http = axios.create({
  // Base URL for all API requests
  baseURL: 'http://10.55.3.22:8000/api',
  // Default headers for requests
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
  // Disable sending credentials (e.g., cookies) with requests
  withCredentials: false,
});

// Request Interceptor: Add Authorization token to requests
http.interceptors.request.use(
  (config) => {
    // Retrieve the token from localStorage
    const token = localStorage.getItem('auth_token');
    // If a token exists, add it to the Authorization header
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    // Handle request errors (e.g., network issues)
    return Promise.reject(error);
  }
);

// Response Interceptor: Handle API response errors
http.interceptors.response.use(
  (response) => response, // Pass through successful responses
  (error: unknown) => {
    // Cast error to AxiosError for type safety
    const err = error as AxiosError;
    // Handle 401 Unauthorized errors (e.g., invalid or expired token)
    if (err.response?.status === 401) {
      // Remove token from localStorage
      localStorage.removeItem('auth_token');
      // Redirect to the home page
      router.push('/');
    }
    // Reject the promise with the error for further handling
    return Promise.reject(err);
  }
);

// Export the configured Axios instance for use in the application
export default http;