import apiClient from './apiClient';
import {
    CategorySearchResult,
    ChannelSearchResult,
    MemberSearchParams,
    MemberSearchResult,
    SearchParams,
    SearchResponse,
    ServerSearchResult,
} from './searchTypes';

/**
 * Tìm kiếm tổng hợp
 * GET /search
 */
export const searchAll = async (params: SearchParams): Promise<SearchResponse> => {
  const response = await apiClient.get<SearchResponse>('/search', {
    params: {
      keyword: params.keyword,
      serverId: params.serverId,
    },
  });
  return response.data;
};

/**
 * Tìm kiếm servers theo tên hoặc mô tả
 * GET /search/servers
 */
export const searchServers = async (keyword: string): Promise<ServerSearchResult[]> => {
  const response = await apiClient.get<ServerSearchResult[]>('/search/servers', {
    params: { keyword },
  });
  return response.data;
};

/**
 * Tìm kiếm channels theo tên
 * GET /search/channels
 */
export const searchChannels = async (params: SearchParams): Promise<ChannelSearchResult[]> => {
  const response = await apiClient.get<ChannelSearchResult[]>('/search/channels', {
    params: {
      keyword: params.keyword,
      serverId: params.serverId,
    },
  });
  return response.data;
};

/**
 * Tìm kiếm categories theo tên
 * GET /search/categories
 */
export const searchCategories = async (params: SearchParams): Promise<CategorySearchResult[]> => {
  const response = await apiClient.get<CategorySearchResult[]>('/search/categories', {
    params: {
      keyword: params.keyword,
      serverId: params.serverId,
    },
  });
  return response.data;
};

/**
 * Tìm kiếm members trong server
 * GET /search/members
 */
export const searchMembers = async (params: MemberSearchParams): Promise<MemberSearchResult[]> => {
  const response = await apiClient.get<MemberSearchResult[]>('/search/members', {
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
