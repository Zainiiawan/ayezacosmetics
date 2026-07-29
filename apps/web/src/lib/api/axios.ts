import axios, { AxiosError, AxiosInstance } from 'axios';
import { config } from '@/lib/config';

const AUTH_NO_REFRESH_PATHS = [
  '/auth/login',
  '/auth/register',
  '/auth/forgot-password',
  '/auth/reset-password',
  '/auth/refresh',
  '/auth/verify-otp',
  '/auth/resend-otp',
];

const createAxiosInstance = (): AxiosInstance => {
  const instance = axios.create({
    baseURL: config.apiUrl,
    withCredentials: true,
    headers: {
      'Content-Type': 'application/json',
    },
    timeout: 15000,
  });

  instance.interceptors.request.use(
    (reqConfig) => {
      if (typeof window !== 'undefined') {
        const token = localStorage.getItem('accessToken');
        if (token) {
          reqConfig.headers.Authorization = `Bearer ${token}`;
        }
      }
      return reqConfig;
    },
    (error) => Promise.reject(error)
  );

  instance.interceptors.response.use(
    (response) => response,
    async (error: AxiosError) => {
      const originalRequest = error.config as (typeof error.config & { _retry?: boolean }) | undefined;
      if (!originalRequest) return Promise.reject(error);

      const url = originalRequest.url || '';
      const isAuthRoute = AUTH_NO_REFRESH_PATHS.some((path) => url.includes(path));

      // Never try token refresh on failed login/register — that falsely "succeeds" the flow
      if (error.response?.status === 401 && !originalRequest._retry && !isAuthRoute) {
        originalRequest._retry = true;

        try {
          const refreshToken = localStorage.getItem('refreshToken');
          if (refreshToken) {
            const response = await axios.post(`${config.apiUrl}/auth/refresh`, {
              refreshToken,
            });

            const { accessToken, refreshToken: newRefreshToken } = response.data.data.tokens;
            localStorage.setItem('accessToken', accessToken);
            localStorage.setItem('refreshToken', newRefreshToken);

            originalRequest.headers = originalRequest.headers || {};
            originalRequest.headers.Authorization = `Bearer ${accessToken}`;
            return instance(originalRequest);
          }
        } catch (refreshError) {
          localStorage.removeItem('accessToken');
          localStorage.removeItem('refreshToken');
          if (typeof window !== 'undefined' && !window.location.pathname.startsWith('/login')) {
            window.location.href = '/login';
          }
          return Promise.reject(refreshError);
        }
      }

      return Promise.reject(error);
    }
  );

  return instance;
};

export const api = createAxiosInstance();
