import api from './api';
import {
    ForgotPasswordRequest,
    ForgotPasswordResponse,
    LoginRequest,
    LoginResponse,
    RegisterRequest,
    RegisterResponse,
    ResetPasswordRequest,
    ResetPasswordResponse,
} from './types';

export const authService = {
  /**
   * Register a new user
   */
  register: async (data: RegisterRequest): Promise<RegisterResponse> => {
    const response = await api.post<RegisterResponse>('/register', data);
    return response.data;
  },

  /**
   * Login user
   */
  login: async (data: LoginRequest): Promise<LoginResponse> => {
    const response = await api.post<LoginResponse>('/login', data);
    return response.data;
  },

  /**
   * Request password reset OTP
   */
  forgotPassword: async (data: ForgotPasswordRequest): Promise<ForgotPasswordResponse> => {
    const response = await api.post<ForgotPasswordResponse>('/forget-password', data);
    return response.data;
  },

  /**
   * Reset password with OTP
   */
  resetPassword: async (data: ResetPasswordRequest): Promise<ResetPasswordResponse> => {
    const response = await api.post<ResetPasswordResponse>('/reset-password', data);
    return response.data;
  },
};

export default authService;
