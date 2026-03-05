import apiClient from './apiClient';

// Types
export interface ChatMessageResponse {
  id: number;
  content: string;
  senderId: number;
  senderName: string;
  senderAvatar: string | null;
  channelId: number;
  createdAt: string;
}

export interface SendMessageRequest {
  content: string;
  userId: number;
}

/**
 * Get message history for a channel
 */
export const getChannelMessages = async (channelId: number): Promise<ChatMessageResponse[]> => {
  const response = await apiClient.get<ChatMessageResponse[]>(`/channels/${channelId}/messages`);
  return response.data;
};

export const messageService = {
  getChannelMessages,
};

export default messageService;
