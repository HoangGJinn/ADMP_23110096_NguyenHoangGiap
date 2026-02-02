import { configureStore } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice';
import navigationReducer from './slices/navigationSlice';

/**
 * Redux Store Configuration
 * Sử dụng Redux Toolkit để setup store đơn giản hơn
 */

export const store = configureStore({
    reducer: {
        auth: authReducer,
        navigation: navigationReducer,
    },
    middleware: (getDefaultMiddleware) =>
        getDefaultMiddleware({
            serializableCheck: {
                // Bỏ qua check serializable cho Date objects trong Realm
                ignoredActions: ['auth/loadUserFromStorage/fulfilled', 'auth/login/fulfilled'],
                ignoredPaths: ['auth.user.lastLoginAt'],
            },
        }),
    devTools: process.env.NODE_ENV !== 'production', // Enable Redux DevTools trong dev
});

// Export types để sử dụng trong components
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

export default store;
