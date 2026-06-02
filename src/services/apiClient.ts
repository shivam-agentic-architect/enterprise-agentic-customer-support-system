import axios from 'axios';

const baseURL = typeof window !== 'undefined'
  ? (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api')
  : 'http://localhost:8000/api';

export const apiClient = axios.create({
  baseURL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Helper to get tokens from localStorage safely in Next.js
export const getTokens = () => {
  if (typeof window === 'undefined') return { accessToken: null, refreshToken: null };
  return {
    accessToken: localStorage.getItem('lauki_access_token'),
    refreshToken: localStorage.getItem('lauki_refresh_token'),
  };
};

// Helper to save tokens
export const saveTokens = (access: string, refresh: string) => {
  if (typeof window === 'undefined') return;
  localStorage.setItem('lauki_access_token', access);
  localStorage.setItem('lauki_refresh_token', refresh);
};

// Helper to clear tokens
export const clearTokens = () => {
  if (typeof window === 'undefined') return;
  localStorage.removeItem('lauki_access_token');
  localStorage.removeItem('lauki_refresh_token');
};

// Request Interceptor: Append Bearer Token
apiClient.interceptors.request.use(
  (config) => {
    const { accessToken } = getTokens();
    if (accessToken && config.headers) {
      config.headers.Authorization = `Bearer ${accessToken}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response Interceptor: Auto-Refresh on 401
let isRefreshing = false;
let failedQueue: any[] = [];

const processQueue = (error: any, token: string | null = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Check if error is 401 and request has not been retried yet
    if (error.response?.status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            originalRequest.headers.Authorization = `Bearer ${token}`;
            return apiClient(originalRequest);
          })
          .catch((err) => Promise.reject(err));
      }

      originalRequest._retry = true;
      isRefreshing = true;

      const { refreshToken } = getTokens();

      if (!refreshToken) {
        clearTokens();
        isRefreshing = false;
        // Trigger page refresh or auth redirect if in browser context
        if (typeof window !== 'undefined') {
          window.dispatchEvent(new Event('lauki_auth_expired'));
        }
        return Promise.reject(error);
      }

      try {
        // Bypass interceptors for token refresh to avoid circular 401s
        const refreshResponse = await axios.post(`${baseURL}/auth/refresh`, {
          refresh_token: refreshToken,
        });

        const { access_token, refresh_token } = refreshResponse.data;
        saveTokens(access_token, refresh_token);
        
        isRefreshing = false;
        processQueue(null, access_token);

        // Retry original request
        originalRequest.headers.Authorization = `Bearer ${access_token}`;
        return apiClient(originalRequest);
      } catch (refreshError) {
        isRefreshing = false;
        processQueue(refreshError, null);
        clearTokens();
        
        if (typeof window !== 'undefined') {
          window.dispatchEvent(new Event('lauki_auth_expired'));
        }
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);
