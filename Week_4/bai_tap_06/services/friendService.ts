// Services cho tính năng bạn bè
// Sử dụng apiClient đã có Bearer token tự động

import apiClient from './apiClient';

export interface UserSearchResult {
    id: number;
    username: string;
    displayName: string;
    avatarUrl?: string;
    bio?: string;
    friendshipStatus?: string;  // null | 'PENDING' | 'ACCEPTED' | 'REJECTED' | 'BLOCKED'
    friendshipId?: number;
    isSender?: boolean;
}

export interface FriendshipInfo {
    id: number;
    status: 'PENDING' | 'ACCEPTED' | 'REJECTED' | 'BLOCKED';
    senderId: number;
    senderUsername: string;
    senderDisplayName: string;
    senderAvatarUrl?: string;
    receiverId: number;
    receiverUsername: string;
    receiverDisplayName: string;
    receiverAvatarUrl?: string;
    createdAt: string;
}

export const friendService = {
    /** Tìm kiếm user theo keyword */
    searchUsers: async (keyword: string): Promise<UserSearchResult[]> => {
        const res = await apiClient.get('/users/search', { params: { keyword } });
        return res.data;
    },

    /** Danh sách bạn bè đã chấp nhận */
    getFriends: async (): Promise<FriendshipInfo[]> => {
        const res = await apiClient.get('/friends');
        return res.data;
    },

    /** Lời mời kết bạn nhận được (đang chờ) */
    getPendingRequests: async (): Promise<FriendshipInfo[]> => {
        const res = await apiClient.get('/friends/requests/received');
        return res.data;
    },

    /** Lời mời kết bạn đã gửi */
    getSentRequests: async (): Promise<FriendshipInfo[]> => {
        const res = await apiClient.get('/friends/requests/sent');
        return res.data;
    },

    /** Gửi lời mời kết bạn */
    sendRequest: async (receiverId: number): Promise<FriendshipInfo> => {
        const res = await apiClient.post(`/friends/request/${receiverId}`);
        return res.data;
    },

    /** Chấp nhận lời mời */
    acceptRequest: async (friendshipId: number): Promise<FriendshipInfo> => {
        const res = await apiClient.put(`/friends/${friendshipId}/accept`);
        return res.data;
    },

    /** Từ chối lời mời */
    rejectRequest: async (friendshipId: number): Promise<FriendshipInfo> => {
        const res = await apiClient.put(`/friends/${friendshipId}/reject`);
        return res.data;
    },

    /** Hủy lời mời đã gửi */
    cancelRequest: async (friendshipId: number): Promise<void> => {
        await apiClient.delete(`/friends/request/${friendshipId}`);
    },

    /** Xóa bạn bè */
    unfriend: async (friendshipId: number): Promise<void> => {
        await apiClient.delete(`/friends/${friendshipId}`);
    },
};
