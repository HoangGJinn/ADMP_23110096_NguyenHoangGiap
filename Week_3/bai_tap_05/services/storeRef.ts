/**
 * Store Injector — phá vòng circular dependency
 *
 * Thay vì apiClient import store trực tiếp (gây cycle),
 * ta dùng một module trung gian chỉ giữ reference đến store.
 *
 * Cycle cũ: authSlice → userService → apiClient → store → authSlice ❌
 * Cycle mới: apiClient → storeRef (không import gì từ store/slices) ✅
 *
 * _layout.tsx sẽ gọi setStoreRef(store) sau khi store được khởi tạo.
 */

import type { RootState } from '@/store/redux/store';

type StoreShape = {
    getState: () => RootState;
};

let storeInstance: StoreShape | null = null;

export const setStoreRef = (store: StoreShape) => {
    storeInstance = store;
};

export const getToken = (): string | undefined => {
    return storeInstance?.getState().auth?.user?.token;
};
