/**
 * API Client - Axios instance dùng chung cho toàn bộ app
 *
 * Token được lấy qua storeRef (không import store trực tiếp)
 * → Tránh circular dependency: authSlice → userService → apiClient → store → authSlice
 */
import { getToken } from '@/services/storeRef';
import axios from 'axios';
import { API_BASE_URL, REQUEST_TIMEOUT } from './config';

export const apiClient = axios.create({
    baseURL: API_BASE_URL,
    timeout: REQUEST_TIMEOUT,
    headers: {
        'Content-Type': 'application/json',
    },
});

// ─── Request Interceptor ───────────────────────────────────────────────────────
apiClient.interceptors.request.use(
    (config) => {
        const token = getToken();
        console.log('apiClient request - url:', config.url, '- hasToken:', !!token);
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

// ─── Response Interceptor ─────────────────────────────────────────────────────
apiClient.interceptors.response.use(
    (response) => response,
    (error) => {
        console.error('API Error:', {
            url: error.config?.url,
            method: error.config?.method?.toUpperCase(),
            status: error.response?.status,
            data: error.response?.data,
        });

        if (error.response) {
            const status = error.response.status;
            const message = error.response.data?.message || error.response.data?.error;

            if (status === 401) {
                return Promise.reject(new Error('Phiên đăng nhập hết hạn. Vui lòng đăng nhập lại.'));
            }
            if (status === 403) {
                return Promise.reject(new Error('Không có quyền truy cập. Vui lòng đăng nhập lại.'));
            }
            if (status === 404) {
                return Promise.reject(new Error('Không tìm thấy dữ liệu.'));
            }
            return Promise.reject(new Error(message || `Lỗi ${status}: Đã xảy ra lỗi`));
        } else if (error.request) {
            return Promise.reject(new Error('Không thể kết nối đến server.'));
        }
        return Promise.reject(new Error('Đã xảy ra lỗi không xác định'));
    }
);

export default apiClient;
