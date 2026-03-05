import { TypedUseSelectorHook, useDispatch, useSelector } from 'react-redux';
import type { AppDispatch, RootState } from './redux/store';

/**
 * Custom hooks với TypeScript typing
 * Sử dụng hooks này thay vì useDispatch và useSelector thông thường
 */

// Typed useDispatch hook
export const useAppDispatch = () => useDispatch<AppDispatch>();

// Typed useSelector hook
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;

// Export để dễ sử dụng trong components:
// import { useAppDispatch, useAppSelector } from '@/store/hooks';
