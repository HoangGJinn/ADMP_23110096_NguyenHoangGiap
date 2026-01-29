import { authService } from '@/services/authService';
import { storageService, UserSessionData } from '@/services/storageService';
import { LoginRequest, RegisterRequest } from '@/services/types';
import { createAsyncThunk, createSlice, PayloadAction } from '@reduxjs/toolkit';

/**
 * Redux Slice cho Authentication
 * Quản lý user state và integrate với Realm database
 */

// Types
export interface AuthState {
    user: UserSessionData | null;
    isAuthenticated: boolean;
    isLoading: boolean;
    error: string | null;
}

// Initial state
const initialState: AuthState = {
    user: null,
    isAuthenticated: false,
    isLoading: true, // true ban đầu để check storage
    error: null,
};

// ========== ASYNC THUNKS ==========

/**
 * Load user từ Realm storage khi app start
 * Đây là hàm quan trọng nhất cho Auto Login
 */
export const loadUserFromStorage = createAsyncThunk(
    'auth/loadUserFromStorage',
    async (_, { rejectWithValue }) => {
        try {
            const userSession = await storageService.getUserSession();

            if (userSession) {
                console.log('✅ Loaded user from storage:', userSession.userId);
                return userSession;
            }

            return null;
        } catch (error: any) {
            console.error('❌ Error loading user from storage:', error);
            return rejectWithValue(error.message || 'Failed to load user');
        }
    }
);

/**
 * Login user - Call API và save vào Realm
 */
export const loginUser = createAsyncThunk(
    'auth/login',
    async (credentials: LoginRequest, { rejectWithValue }) => {
        try {
            // 1. Call API login
            const response = await authService.login(credentials);

            // 2. Tạo user session data
            const userSession: UserSessionData = {
                userId: response.userId,
                userName: response.userName,
                token: response.token,
                // Nếu backend trả về refreshToken, thêm vào đây
                // refreshToken: response.refreshToken,
                lastLoginAt: new Date(),
            };

            // 3. Lưu vào Realm
            await storageService.saveUserSession(userSession);

            console.log('✅ Login successful, saved to Realm');
            return userSession;
        } catch (error: any) {
            console.error('❌ Login failed:', error);
            return rejectWithValue(error.message || 'Login failed');
        }
    }
);

/**
 * Logout user - Clear Realm và Redux state
 */
export const logoutUser = createAsyncThunk(
    'auth/logout',
    async (_, { rejectWithValue }) => {
        try {
            // Clear Realm storage
            await storageService.clearUserSession();

            console.log('✅ Logout successful');
            return null;
        } catch (error: any) {
            console.error('❌ Logout failed:', error);
            return rejectWithValue(error.message || 'Logout failed');
        }
    }
);

/**
 * Register user (không auto-login sau khi register)
 */
export const registerUser = createAsyncThunk(
    'auth/register',
    async (data: RegisterRequest, { rejectWithValue }) => {
        try {
            await authService.register(data);
            return null;
        } catch (error: any) {
            console.error('❌ Registration failed:', error);
            return rejectWithValue(error.message || 'Registration failed');
        }
    }
);

/**
 * Update user profile (từ API response)
 */
export const updateUserProfile = createAsyncThunk(
    'auth/updateProfile',
    async (updates: Partial<UserSessionData>, { getState, rejectWithValue }) => {
        try {
            const state = getState() as { auth: AuthState };
            const currentUser = state.auth.user;

            if (!currentUser) {
                return rejectWithValue('No user logged in');
            }

            const updatedUser = { ...currentUser, ...updates };

            // Update Realm
            await storageService.saveUserSession(updatedUser);

            return updatedUser;
        } catch (error: any) {
            return rejectWithValue(error.message || 'Update failed');
        }
    }
);

// ========== SLICE ==========

const authSlice = createSlice({
    name: 'auth',
    initialState,
    reducers: {
        // Sync actions
        setUser: (state, action: PayloadAction<UserSessionData | null>) => {
            state.user = action.payload;
            state.isAuthenticated = !!action.payload;
        },
        setLoading: (state, action: PayloadAction<boolean>) => {
            state.isLoading = action.payload;
        },
        setError: (state, action: PayloadAction<string | null>) => {
            state.error = action.payload;
        },
        clearError: (state) => {
            state.error = null;
        },
    },
    extraReducers: (builder) => {
        // Load user from storage
        builder
            .addCase(loadUserFromStorage.pending, (state) => {
                state.isLoading = true;
            })
            .addCase(loadUserFromStorage.fulfilled, (state, action) => {
                state.user = action.payload;
                state.isAuthenticated = !!action.payload;
                state.isLoading = false;
                state.error = null;
            })
            .addCase(loadUserFromStorage.rejected, (state, action) => {
                state.user = null;
                state.isAuthenticated = false;
                state.isLoading = false;
                state.error = action.payload as string;
            });

        // Login
        builder
            .addCase(loginUser.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(loginUser.fulfilled, (state, action) => {
                state.user = action.payload;
                state.isAuthenticated = true;
                state.isLoading = false;
                state.error = null;
            })
            .addCase(loginUser.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload as string;
            });

        // Logout
        builder
            .addCase(logoutUser.pending, (state) => {
                state.isLoading = true;
            })
            .addCase(logoutUser.fulfilled, (state) => {
                state.user = null;
                state.isAuthenticated = false;
                state.isLoading = false;
                state.error = null;
            })
            .addCase(logoutUser.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload as string;
            });

        // Register
        builder
            .addCase(registerUser.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(registerUser.fulfilled, (state) => {
                state.isLoading = false;
                state.error = null;
            })
            .addCase(registerUser.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload as string;
            });

        // Update profile
        builder
            .addCase(updateUserProfile.fulfilled, (state, action) => {
                state.user = action.payload;
            })
            .addCase(updateUserProfile.rejected, (state, action) => {
                state.error = action.payload as string;
            });
    },
});

// Export actions
export const { setUser, setLoading, setError, clearError } = authSlice.actions;

// Export reducer
export default authSlice.reducer;
