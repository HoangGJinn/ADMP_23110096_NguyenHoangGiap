import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import {
    CategorySearchResult,
    ChannelSearchResult,
    MemberSearchParams,
    MemberSearchResult,
    SearchParams,
    SearchResponse,
    ServerSearchResult,
} from './searchTypes';

// Base URL for Search API
const BASE_URL = 'http://10.0.2.2:8085/api';

// Create axios instance for search
const searchApi = axios.create({
  baseURL: BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add auth token interceptor
searchApi.interceptors.request.use(
  async (config) => {
    try {
      // Token is stored in @user_session object, not a separate key
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

// Response interceptor for error handling
searchApi.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response) {
      const message = error.response.data?.message || 'Đã xảy ra lỗi khi tìm kiếm';
      return Promise.reject(new Error(message));
    } else if (error.request) {
      return Promise.reject(new Error('Không thể kết nối đến server'));
    }
    return Promise.reject(new Error('Đã xảy ra lỗi'));
  }
);

/**
 * Tìm kiếm tổng hợp - gọi tất cả APIs cùng lúc
 */
export const searchAll = async (params: SearchParams): Promise<SearchResponse> => {
  const response = await searchApi.get<SearchResponse>('/search', {
    params: {
      keyword: params.keyword,
      serverId: params.serverId,
    },
  });
  return response.data;
};

/**
 * Tìm kiếm servers theo tên hoặc mô tả
 */
export const searchServers = async (keyword: string): Promise<ServerSearchResult[]> => {
  const response = await searchApi.get<ServerSearchResult[]>('/search/servers', {
    params: { keyword },
  });
  return response.data;
};

/**
 * Tìm kiếm channels theo tên
 */
export const searchChannels = async (params: SearchParams): Promise<ChannelSearchResult[]> => {
  const response = await searchApi.get<ChannelSearchResult[]>('/search/channels', {
    params: {
      keyword: params.keyword,
      serverId: params.serverId,
    },
  });
  return response.data;
};

/**
 * Tìm kiếm categories theo tên
 */
export const searchCategories = async (params: SearchParams): Promise<CategorySearchResult[]> => {
  const response = await searchApi.get<CategorySearchResult[]>('/search/categories', {
    params: {
      keyword: params.keyword,
      serverId: params.serverId,
    },
  });
  return response.data;
};

/**
 * Tìm kiếm members trong server theo displayName, userName hoặc nickname
 */
export const searchMembers = async (params: MemberSearchParams): Promise<MemberSearchResult[]> => {
  const response = await searchApi.get<MemberSearchResult[]>('/search/members', {
    params: {
      keyword: params.keyword,
      serverId: params.serverId,
    },
  });
  return response.data;
};

export default {
  searchAll,
  searchServers,
  searchChannels,
  searchCategories,
  searchMembers,
};
