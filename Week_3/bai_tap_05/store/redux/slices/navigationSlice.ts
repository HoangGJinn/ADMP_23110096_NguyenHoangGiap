import { createSlice, PayloadAction } from '@reduxjs/toolkit';

/**
 * Navigation Slice - Quản lý navigation state cho cross-screen communication
 */

interface NavigationState {
    // Server được chọn từ search để navigate tới
    pendingServerId: number | null;
    // Channel được chọn từ search
    pendingChannelId: number | null;
}

const initialState: NavigationState = {
    pendingServerId: null,
    pendingChannelId: null,
};

const navigationSlice = createSlice({
    name: 'navigation',
    initialState,
    reducers: {
        setPendingServer: (state, action: PayloadAction<number | null>) => {
            state.pendingServerId = action.payload;
        },
        setPendingChannel: (state, action: PayloadAction<number | null>) => {
            state.pendingChannelId = action.payload;
        },
        clearPendingNavigation: (state) => {
            state.pendingServerId = null;
            state.pendingChannelId = null;
        },
    },
});

export const { setPendingServer, setPendingChannel, clearPendingNavigation } = navigationSlice.actions;
export default navigationSlice.reducer;
