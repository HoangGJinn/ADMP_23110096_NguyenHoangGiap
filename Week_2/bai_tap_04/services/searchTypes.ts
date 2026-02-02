// Search API Types based on api-docs.json

// ============ Request Types ============

export interface SearchParams {
  keyword: string;
  serverId?: number;
}

export interface MemberSearchParams {
  keyword: string;
  serverId: number; // Required for member search
}

// ============ Response Types ============

export interface ServerSearchResult {
  id: number;
  name: string;
  description: string;
  iconUrl: string | null;
  memberCount: number;
}

export interface ChannelSearchResult {
  id: number;
  name: string;
  type: 'TEXT' | 'VOICE';
  serverId: number;
  serverName: string;
  categoryId: number | null;
  categoryName: string | null;
}

export interface CategorySearchResult {
  id: number;
  name: string;
  serverId: number;
  serverName: string;
  channelCount: number;
}

export interface MemberSearchResult {
  id: number;
  userId: number;
  userName: string;
  displayName: string;
  nickname: string | null;
  role: 'OWNER' | 'ADMIN' | 'MEMBER';
  serverId: number;
  serverName: string;
}

export interface SearchResponse {
  keyword: string;
  servers: ServerSearchResult[];
  channels: ChannelSearchResult[];
  categories: CategorySearchResult[];
  members: MemberSearchResult[];
}

// ============ UI State Types ============

export type SearchFilterType = 'all' | 'servers' | 'channels' | 'categories' | 'members';

export interface SearchState {
  keyword: string;
  filter: SearchFilterType;
  results: SearchResponse | null;
  isLoading: boolean;
  error: string | null;
}
