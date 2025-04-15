import axios from 'axios';

const API_URL = import.meta.env?.VITE_API_URL || 'http://localhost:8000/api/v1';

const api = axios.create({
  baseURL: API_URL,
  timeout: 30000,
  withCredentials: true
});

api.interceptors.request.use(
  (config) => {
    if (!config.headers['Content-Type']) {
      config.headers['Content-Type'] = 'application/json';
    }

    // Get token from localStorage if available
    const token = localStorage.getItem('accessToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor to handle common errors
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // If error is 401 (Unauthorized) and we haven't tried refreshing token yet
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        // Try to refresh the token using cookies
        const refreshResponse = await axios.post(
          `${API_URL}/users/refresh-token`,
          {},
          { withCredentials: true }
        );

        // Check if we got a new token
        if (refreshResponse.data.data?.accessToken) {
          const { accessToken } = refreshResponse.data.data;

          // Update localStorage with new token
          localStorage.setItem('accessToken', accessToken);

          // Update Authorization header with new token
          originalRequest.headers['Authorization'] = `Bearer ${accessToken}`;

          // Retry the original request with new token
          return api(originalRequest);
        }
      } catch (refreshError) {
        // If refresh fails, clear tokens
        localStorage.removeItem('accessToken');
        console.error('Token refresh failed:', refreshError);

        // Check if current page is protected
        const currentPath = window.location.pathname;
        if (currentPath !== '/login' && currentPath !== '/register' && currentPath !== '/home') {
          // Save the current location for redirect after login
          localStorage.setItem('redirectAfterLogin', currentPath);
        }
      }
    }

    return Promise.reject(error);
  }
);

export default api;