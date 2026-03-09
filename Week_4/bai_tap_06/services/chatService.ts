/**
 * Chat Service - REST API cho tin nhắn trong channel
 *
 * createdAt từ backend có thể là:
 *   - ISO string: "2024-03-01T10:30:00"
 *   - Array số:   [2024, 3, 1, 10, 30, 0, 0]  ← LocalDateTime của Java/Spring
 */
import apiClient from './apiClient';

// ─── Types ────────────────────────────────────────────────────────────────────

export interface ChatMessage {
    id: string;
    content: string;
    senderId: number;
    senderName: string;
    senderAvatar?: string | null;
    createdAt: string | number[];
    isEdited?: boolean;
    reactions?: ChatReaction[];
}

export interface ChatReaction {
    emoji: string;
    count: number;
    userIds: number[];
}

/** Chuyển List<{userId, emoji}> từ backend sang ChatReaction[] nhóm theo emoji */
export const parseReactions = (
    raw: Array<{ userId: number; emoji: string }> | null | undefined
): ChatReaction[] => {
    if (!raw || raw.length === 0) return [];
    const map: Record<string, number[]> = {};
    for (const r of raw) {
        if (!map[r.emoji]) map[r.emoji] = [];
        if (!map[r.emoji].includes(r.userId)) map[r.emoji].push(r.userId);
    }
    return Object.entries(map).map(([emoji, userIds]) => ({ emoji, count: userIds.length, userIds }));
};

export interface SendMessageRequest {
    senderId: number;
    content: string;
}

// ─── Socket Response Types ────────────────────────────────────────────────────

export interface SocketResponse {
    type: 'CREATE' | 'EDIT' | 'DELETE';
    data: any;
}

// ─── Helper: Parse createdAt ──────────────────────────────────────────────────

/**
 * Parse createdAt về Date object
 * Hỗ trợ cả ISO string lẫn array số từ Java LocalDateTime
 */
export const parseCreatedAt = (dateInput: string | number[] | null | undefined): Date => {
    if (!dateInput) return new Date();

    if (Array.isArray(dateInput)) {
        // [year, month(1-based), day, hour, minute, second, nano?]
        const [year, month, day, hour = 0, minute = 0, second = 0] = dateInput;
        return new Date(year, month - 1, day, hour, minute, second);
    }

    return new Date(dateInput);
};

/**
 * Format thời gian hiển thị trong chat
 */
export const formatMessageTime = (dateInput: string | number[] | null | undefined): string => {
    const date = parseCreatedAt(dateInput);
    const today = new Date();

    const timeString = date.toLocaleTimeString('vi-VN', {
        hour: '2-digit',
        minute: '2-digit',
    });

    if (date.toDateString() === today.toDateString()) {
        return timeString; // Hôm nay: chỉ hiện giờ
    }

    const dateString = date.toLocaleDateString('vi-VN', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
    });
    return `${dateString} ${timeString}`;
};

/**
 * Format ngày để hiển thị date separator
 */
export const formatMessageDate = (dateInput: string | number[] | null | undefined): string => {
    const date = parseCreatedAt(dateInput);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(today.getDate() - 1);

    if (date.toDateString() === today.toDateString()) return 'Hôm nay';
    if (date.toDateString() === yesterday.toDateString()) return 'Hôm qua';

    return date.toLocaleDateString('vi-VN', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
    });
};

// ─── API Calls ────────────────────────────────────────────────────────────────

export const chatService = {
    /**
     * Lấy lịch sử tin nhắn của channel
     * GET /channels/{channelId}/messages
     */
    getMessages: async (channelId: number | string): Promise<ChatMessage[]> => {
        const response = await apiClient.get<ChatMessage[]>(`/channels/${channelId}/messages`);
        return response.data;
    },

    /**
     * Chỉnh sửa nội dung tin nhắn
     * PUT /messages/{messageId}
     */
    editMessage: async (messageId: string, content: string): Promise<ChatMessage> => {
        const response = await apiClient.put<ChatMessage>(`/messages/${messageId}`, { content });
        return response.data;
    },

    /**
     * Xóa tin nhắn
     * DELETE /messages/{messageId}
     */
    deleteMessage: async (messageId: string): Promise<void> => {
        await apiClient.delete(`/messages/${messageId}`);
    },

    /** Thêm reaction — emoji qua query string */
    addReaction: async (messageId: string, emoji: string): Promise<void> => {
        await apiClient.post(`/messages/${messageId}/reactions`, null, { params: { emoji } });
    },

    /** Xóa reaction — emoji qua query string */
    removeReaction: async (messageId: string, emoji: string): Promise<void> => {
        await apiClient.delete(`/messages/${messageId}/reactions`, { params: { emoji } });
    },
};

export default chatService;
