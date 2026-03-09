import AsyncStorage from '@react-native-async-storage/async-storage';

/**
 * Storage Service - Quản lý persistent storage với AsyncStorage
 * Thay thế Realm để tương thích với Expo Go
 */

export interface UserSessionData {
    userId: string;
    userName: string;
    displayName?: string;
    avatar?: string;
    email?: string;
    bio?: string;
    birthDate?: string;
    country?: string;
    pronouns?: string;
    avatarUrl?: string;
    token: string;
    refreshToken?: string;
    lastLoginAt: string; // ISO date string for Redux serialization
}

const USER_SESSION_KEY = '@user_session';

class StorageService {
    /**
     * Lưu user session vào AsyncStorage
     */
    async saveUserSession(userData: UserSessionData): Promise<void> {
        try {
            const jsonData = JSON.stringify(userData);
            await AsyncStorage.setItem(USER_SESSION_KEY, jsonData);
            console.log('✅ User session saved to AsyncStorage:', userData.userId);
        } catch (error) {
            console.error('❌ Error saving user session:', error);
            throw error;
        }
    }

    /**
     * Lấy user session từ AsyncStorage
     * Returns null nếu không có user nào đã login
     */
    async getUserSession(): Promise<UserSessionData | null> {
        try {
            const jsonData = await AsyncStorage.getItem(USER_SESSION_KEY);

            if (!jsonData) {
                return null;
            }

            const userData = JSON.parse(jsonData);

            // Convert lastLoginAt string back to Date object
            if (userData.lastLoginAt) {
                userData.lastLoginAt = new Date(userData.lastLoginAt);
            }

            return userData;
        } catch (error) {
            console.error('❌ Error getting user session:', error);
            return null;
        }
    }

    /**
     * Xóa user session (Logout)
     */
    async clearUserSession(): Promise<void> {
        try {
            await AsyncStorage.removeItem(USER_SESSION_KEY);
            console.log('✅ User session cleared from AsyncStorage');
        } catch (error) {
            console.error('❌ Error clearing user session:', error);
            throw error;
        }
    }

    /**
     * Update một field cụ thể của user
     */
    async updateUserField(
        userId: string,
        field: keyof UserSessionData,
        value: any
    ): Promise<void> {
        try {
            const currentSession = await this.getUserSession();

            if (!currentSession || currentSession.userId !== userId) {
                throw new Error('User session not found');
            }

            const updatedSession = {
                ...currentSession,
                [field]: value,
            };

            await this.saveUserSession(updatedSession);
            console.log(`✅ Updated user field ${field} for user ${userId}`);
        } catch (error) {
            console.error('❌ Error updating user field:', error);
            throw error;
        }
    }

    /**
     * Update token (dùng cho refresh token flow)
     */
    async updateToken(userId: string, newToken: string): Promise<void> {
        await this.updateUserField(userId, 'token', newToken);
    }

    /**
     * Update cả user profile (từ API response)
     */
    async updateUserProfile(updates: Partial<UserSessionData>): Promise<void> {
        try {
            const currentSession = await this.getUserSession();

            if (!currentSession) {
                throw new Error('User session not found');
            }

            const updatedSession = {
                ...currentSession,
                ...updates,
            };

            await this.saveUserSession(updatedSession);
            console.log('✅ User profile updated');
        } catch (error) {
            console.error('❌ Error updating user profile:', error);
            throw error;
        }
    }
}

// Export singleton instance
export const storageService = new StorageService();
export default storageService;
