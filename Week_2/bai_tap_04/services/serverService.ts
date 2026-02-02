import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';

// Types based on API response
export interface ServerResponse {
  id: number;
  name: string;
  description: string | null;
  iconUrl: string | null;
  inviteCode: string;
  ownerId: number;
  ownerName: string;
  memberCount: number;
  channelCount: number;
  categories: CategoryResponse[];
  channels: ChannelResponse[];
  members: ServerMemberResponse[];
  createdAt: string;
  updatedAt: string;
}

export interface CategoryResponse {
  id: number;
  name: string;
  position: number;
  serverId: number;
  channels: ChannelResponse[];
  createdAt: string;
}

export interface ChannelResponse {
  id: number;
  name: string;
  type: 'TEXT' | 'VOICE';
  topic: string | null;
  position: number;
  serverId: number;
  categoryId: number | null;
  createdAt: string;
}

export interface ServerMemberResponse {
  id: number;
  userId: number;
  userName: string;
  displayName: string;
  nickname: string | null;
  role: 'OWNER' | 'ADMIN' | 'MEMBER';
  joinedAt: string;
}

// Base URL
const BASE_URL = 'http://10.0.2.2:8085/api';

// Create axios instance
const serverApi = axios.create({
  baseURL: BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add auth token interceptor
serverApi.interceptors.request.use(
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

// Response interceptor
serverApi.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('Server API Error:', {
      status: error.response?.status,
      statusText: error.response?.statusText,
      data: error.response?.data,
      url: error.config?.url,
      method: error.config?.method,
    });
    
    if (error.response) {
      const status = error.response.status;
      const message = error.response.data?.message || error.response.data?.error;
      
      if (status === 401) {
        return Promise.reject(new Error('Phiên đăng nhập hết hạn. Vui lòng đăng nhập lại.'));
      }
      if (status === 403) {
        return Promise.reject(new Error('Bạn không có quyền truy cập tài nguyên này.'));
      }
      if (status === 404) {
        return Promise.reject(new Error('Không tìm thấy dữ liệu.'));
      }
      
      return Promise.reject(new Error(message || `Lỗi ${status}: Đã xảy ra lỗi`));
    } else if (error.request) {
      return Promise.reject(new Error('Không thể kết nối đến server. Vui lòng kiểm tra backend đang chạy.'));
    }
    return Promise.reject(new Error('Đã xảy ra lỗi không xác định'));
  }
);

/**
 * Lấy danh sách servers của user đang đăng nhập
 */
export const getMyServers = async (): Promise<ServerResponse[]> => {
  const response = await serverApi.get<ServerResponse[]>('/servers/my-servers');
  return response.data;
};

/**
 * Lấy chi tiết server
 */
export const getServerById = async (serverId: number): Promise<ServerResponse> => {
  const response = await serverApi.get<ServerResponse>(`/servers/${serverId}`);
  return response.data;
};

/**
 * Lấy chi tiết server với đầy đủ thông tin
 */
export const getServerDetails = async (serverId: number): Promise<ServerResponse> => {
  const response = await serverApi.get<ServerResponse>(`/servers/${serverId}/details`);
  return response.data;
};

/**
 * Lấy danh sách channels của server
 */
export const getChannelsByServer = async (serverId: number): Promise<ChannelResponse[]> => {
  const response = await serverApi.get<ChannelResponse[]>(`/servers/${serverId}/channels`);
  return response.data;
};

/**
 * Lấy danh sách categories của server
 */
export const getCategoriesByServer = async (serverId: number): Promise<CategoryResponse[]> => {
  const response = await serverApi.get<CategoryResponse[]>(`/servers/${serverId}/categories`);
  return response.data;
};

/**
 * Lấy danh sách members của server
 */
export const getServerMembers = async (serverId: number): Promise<ServerMemberResponse[]> => {
  const response = await serverApi.get<ServerMemberResponse[]>(`/servers/${serverId}/members`);
  return response.data;
};

/**
 * Lấy channels theo category
 */
export const getChannelsByCategory = async (categoryId: number): Promise<ChannelResponse[]> => {
  const response = await serverApi.get<ChannelResponse[]>(`/categories/${categoryId}/channels`);
  return response.data;
};

// ==================== SERVER CRUD ====================

export interface CreateServerRequest {
  name: string;
  description?: string;
  iconUrl?: string;
}

export interface JoinServerRequest {
  inviteCode: string;
}

/**
 * Tạo server mới
 */
export const createServer = async (data: CreateServerRequest): Promise<ServerResponse> => {
  const response = await serverApi.post<ServerResponse>('/servers', data);
  return response.data;
};

/**
 * Xóa server (chỉ owner)
 */
export const deleteServer = async (serverId: number): Promise<void> => {
  await serverApi.delete(`/servers/${serverId}`);
};

/**
 * Tham gia server bằng invite code
 */
export const joinServer = async (data: JoinServerRequest): Promise<ServerResponse> => {
  const response = await serverApi.post<ServerResponse>('/servers/join', data);
  return response.data;
};

/**
 * Rời khỏi server
 */
export const leaveServer = async (serverId: number): Promise<void> => {
  await serverApi.post(`/servers/${serverId}/leave`);
};

/**
 * Tạo lại invite code cho server
 */
export const regenerateInviteCode = async (serverId: number): Promise<string> => {
  const response = await serverApi.post<{ inviteCode: string }>(`/servers/${serverId}/invite-code`);
  return response.data.inviteCode;
};

export default {
  getMyServers,
  getServerById,
  getServerDetails,
  getChannelsByServer,
  getCategoriesByServer,
  getServerMembers,
  getChannelsByCategory,
  createServer,
  deleteServer,
  joinServer,
  leaveServer,
  regenerateInviteCode,
};
