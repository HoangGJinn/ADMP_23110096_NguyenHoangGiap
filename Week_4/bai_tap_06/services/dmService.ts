// Services cho Direct Message (tin nhắn 1-1)
import apiClient from './apiClient';

export interface DMConversation {
    conversationId: string;
    partnerId: number;
    partnerUsername: string;
    partnerDisplayName: string;
    partnerAvatarUrl?: string;
    lastMessage?: string;
    lastMessageAt?: string;
    unreadCount?: number;
}

export interface DMReaction {
    emoji: string;
    count: number;
    userIds: number[];
}

export interface DMMessage {
    id: string;
    senderId: number;
    senderUsername: string;
    senderDisplayName: string;
    senderAvatarUrl?: string;
    receiverId: number;
    content: string;
    createdAt: string;
    updatedAt?: string;
    edited?: boolean;
    deleted?: boolean;
    reactions?: DMReaction[];
}

export interface ConversationResponse {
    id: string;
    user1Id: number;
    user2Id: number;
    createdAt: string;
}

export const dmService = {
    /** Lấy danh sách conversations của user hiện tại */
    getConversations: async (): Promise<DMConversation[]> => {
        const res = await apiClient.get('/direct-messages/conversations');
        return res.data;
    },

    /** Lấy hoặc tạo conversation với user khác */
    initConversation: async (receiverId: number): Promise<ConversationResponse> => {
        const res = await apiClient.post('/direct-messages/conversation/init', null, {
            params: { receiverId },
        });
        return res.data;
    },

    /** Lấy conversation theo userId của đối phương */
    getConversationByUser: async (friendId: number): Promise<ConversationResponse> => {
        const res = await apiClient.get(`/direct-messages/conversation/by-user/${friendId}`);
        return res.data;
    },

    /** Lấy messages trong conversation (có phân trang) */
    getMessages: async (conversationId: string, page = 0, size = 50): Promise<{
        content: DMMessage[];
        totalPages: number;
        totalElements: number;
    }> => {
        const res = await apiClient.get(`/direct-messages/conversation/${conversationId}`, {
            params: { page, size },
        });
        return res.data;
    },

    /** Gửi tin nhắn */
    sendMessage: async (receiverId: number, content: string): Promise<DMMessage> => {
        const res = await apiClient.post('/direct-messages', { receiverId, content });
        return res.data;
    },

    /** Sửa tin nhắn */
    editMessage: async (messageId: string, content: string): Promise<DMMessage> => {
        const res = await apiClient.put(`/direct-messages/${messageId}`, { content });
        return res.data;
    },

    /** Xóa tin nhắn */
    deleteMessage: async (messageId: string): Promise<void> => {
        await apiClient.delete(`/direct-messages/${messageId}`);
    },

    /** Thêm reaction — backend nhận emoji qua @RequestParam (query string) */
    addReaction: async (messageId: string, emoji: string): Promise<void> => {
        await apiClient.post(`/direct-messages/${messageId}/reactions`, null, {
            params: { emoji },
        });
    },

    /** Xóa reaction — backend xóa user khỏi tất cả emoji, không nhận body */
    removeReaction: async (messageId: string): Promise<void> => {
        await apiClient.delete(`/direct-messages/${messageId}/reactions`);
    },

    /** Chuyển đổi reactions trả về từ backend (Map<emoji, Set<userId>>) sang mảng DMReaction */
    parseReactions: (raw: Record<string, number[]> | null | undefined): DMReaction[] => {
        if (!raw) return [];
        return Object.entries(raw).map(([emoji, userIds]) => ({
            emoji,
            count: userIds.length,
            userIds,
        }));
    },
};

