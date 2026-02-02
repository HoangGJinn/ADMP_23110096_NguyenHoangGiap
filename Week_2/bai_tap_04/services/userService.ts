import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { UpdateProfileRequest, UserProfileResponse } from './types';

// Base URL
const BASE_URL = 'http://10.0.2.2:8085/api';

// Create axios instance
const userApi = axios.create({
  baseURL: BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add auth token interceptor
userApi.interceptors.request.use(
  async (config) => {
    try {
      const sessionData = await AsyncStorage.getItem('@user_session');
      if (sessionData) {
        const session = JSON.parse(sessionData);
        if (session.token) {
          config.headers.Authorization = `Bearer ${session.token}`;
        }
      }
    } catch (error) {
      console.error('Error getting token:', error);
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor
userApi.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response) {
      const message = error.response.data?.message || 'Đã xảy ra lỗi';
      return Promise.reject(new Error(message));
    } else if (error.request) {
      return Promise.reject(new Error('Không thể kết nối đến server'));
    }
    return Promise.reject(new Error('Đã xảy ra lỗi'));
  }
);

/**
 * Lấy thông tin profile của user hiện tại
 */
export const getProfile = async (): Promise<UserProfileResponse> => {
  const response = await userApi.get<UserProfileResponse>('/users/me');
  return response.data;
};

/**
 * Cập nhật profile của user hiện tại
 */
export const updateProfile = async (data: UpdateProfileRequest): Promise<UserProfileResponse> => {
  const response = await userApi.put<UserProfileResponse>('/users/profile', data);
  return response.data;
};

export const userService = {
  getProfile,
  updateProfile,
};

export default userService;
