import apiClient from './apiClient';

// ─── Types ────────────────────────────────────────────────────────────────────

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

export interface CreateServerRequest {
  name: string;
  description?: string;
  iconUrl?: string;
}

export interface UpdateServerRequest {
  name?: string;
  description?: string;
  iconUrl?: string;
}

export interface JoinServerRequest {
  inviteCode: string;
}

export interface CreateCategoryRequest {
  name: string;
  position?: number;
}

export interface UpdateCategoryRequest {
  name?: string;
  position?: number;
}

export interface CreateChannelRequest {
  name: string;
  type: 'TEXT' | 'VOICE';
  topic?: string;
  categoryId?: number | null;
  position?: number;
}

export interface UpdateChannelRequest {
  name?: string;
  topic?: string;
  position?: number;
  categoryId?: number | null;
}

// ─── API Calls ────────────────────────────────────────────────────────────────

export const getMyServers = async (): Promise<ServerResponse[]> => {
  const response = await apiClient.get<ServerResponse[]>('/servers/my-servers');
  return response.data;
};

export const getServerById = async (serverId: number): Promise<ServerResponse> => {
  const response = await apiClient.get<ServerResponse>(`/servers/${serverId}`);
  return response.data;
};

export const getServerDetails = async (serverId: number): Promise<ServerResponse> => {
  const response = await apiClient.get<ServerResponse>(`/servers/${serverId}/details`);
  return response.data;
};

export const getChannelsByServer = async (serverId: number): Promise<ChannelResponse[]> => {
  const response = await apiClient.get<ChannelResponse[]>(`/servers/${serverId}/channels`);
  return response.data;
};

export const getCategoriesByServer = async (serverId: number): Promise<CategoryResponse[]> => {
  const response = await apiClient.get<CategoryResponse[]>(`/servers/${serverId}/categories`);
  return response.data;
};

export const getServerMembers = async (serverId: number): Promise<ServerMemberResponse[]> => {
  const response = await apiClient.get<ServerMemberResponse[]>(`/servers/${serverId}/members`);
  return response.data;
};

export const getChannelsByCategory = async (categoryId: number): Promise<ChannelResponse[]> => {
  const response = await apiClient.get<ChannelResponse[]>(`/categories/${categoryId}/channels`);
  return response.data;
};

export const createServer = async (data: CreateServerRequest): Promise<ServerResponse> => {
  const response = await apiClient.post<ServerResponse>('/servers', data);
  return response.data;
};

export const updateServer = async (serverId: number, data: UpdateServerRequest): Promise<ServerResponse> => {
  const response = await apiClient.put<ServerResponse>(`/servers/${serverId}`, data);
  return response.data;
};

export const deleteServer = async (serverId: number): Promise<void> => {
  await apiClient.delete(`/servers/${serverId}`);
};

export const joinServer = async (data: JoinServerRequest): Promise<ServerResponse> => {
  const response = await apiClient.post<ServerResponse>('/servers/join', data);
  return response.data;
};

export const leaveServer = async (serverId: number): Promise<void> => {
  await apiClient.post(`/servers/${serverId}/leave`);
};

export const regenerateInviteCode = async (serverId: number): Promise<string> => {
  const response = await apiClient.post<{ inviteCode: string }>(`/servers/${serverId}/invite-code`);
  return response.data.inviteCode;
};

// ─── Category API ─────────────────────────────────────────────────────────────

export const createCategory = async (serverId: number, data: CreateCategoryRequest): Promise<CategoryResponse> => {
  const response = await apiClient.post<CategoryResponse>(`/servers/${serverId}/categories`, data);
  return response.data;
};

export const updateCategory = async (categoryId: number, data: UpdateCategoryRequest): Promise<CategoryResponse> => {
  const response = await apiClient.put<CategoryResponse>(`/categories/${categoryId}`, data);
  return response.data;
};

export const deleteCategory = async (categoryId: number): Promise<void> => {
  await apiClient.delete(`/categories/${categoryId}`);
};

// ─── Channel API ──────────────────────────────────────────────────────────────

export const createChannel = async (serverId: number, data: CreateChannelRequest): Promise<ChannelResponse> => {
  const response = await apiClient.post<ChannelResponse>(`/servers/${serverId}/channels`, data);
  return response.data;
};

export const getChannelById = async (channelId: number): Promise<ChannelResponse> => {
  const response = await apiClient.get<ChannelResponse>(`/channels/${channelId}`);
  return response.data;
};

export const updateChannel = async (channelId: number, data: UpdateChannelRequest): Promise<ChannelResponse> => {
  const response = await apiClient.put<ChannelResponse>(`/channels/${channelId}`, data);
  return response.data;
};

export const deleteChannel = async (channelId: number): Promise<void> => {
  await apiClient.delete(`/channels/${channelId}`);
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
  updateServer,
  deleteServer,
  joinServer,
  leaveServer,
  regenerateInviteCode,
  createCategory,
  updateCategory,
  deleteCategory,
  createChannel,
  getChannelById,
  updateChannel,
  deleteChannel,
};
