import { UserSessionData } from '@/services/storageService';
import { LoginRequest, RegisterRequest } from '@/services/types';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import {
  loginUser,
  logoutUser,
  registerUser,
  updateUserProfile,
} from '@/store/redux/slices/authSlice';
import React, { createContext, ReactNode, useContext } from 'react';

/**
 * AuthContext - Wrapper over Redux for easier component usage
 * Maintains backward compatibility with existing code
 */

interface AuthContextType {
  user: UserSessionData | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  error: string | null;
  login: (credentials: LoginRequest) => Promise<void>;
  register: (data: RegisterRequest) => Promise<void>;
  logout: () => Promise<void>;
  updateUserEmail: (email: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const dispatch = useAppDispatch();

  // Get state from Redux store
  const { user, isLoading, isAuthenticated, error } = useAppSelector((state) => state.auth);

  const login = async (credentials: LoginRequest) => {
    try {
      await dispatch(loginUser(credentials)).unwrap();
    } catch (error: any) {
      throw new Error(error || 'Login failed');
    }
  };

  const register = async (data: RegisterRequest) => {
    try {
      await dispatch(registerUser(data)).unwrap();
    } catch (error: any) {
      throw new Error(error || 'Registration failed');
    }
  };

  const logout = async () => {
    try {
      await dispatch(logoutUser()).unwrap();
    } catch (error: any) {
      console.error('Logout error:', error);
    }
  };

  const updateUserEmail = async (email: string) => {
    try {
      await dispatch(updateUserProfile({ email })).unwrap();
    } catch (error: any) {
      console.error('Update email error:', error);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        isAuthenticated,
        error,
        login,
        register,
        logout,
        updateUserEmail,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export default AuthContext;
