// API Types for Authentication

export interface RegisterRequest {
  username: string;
  email: string;
  password: string;
  displayName: string;
}

export interface RegisterResponse {
  message: string;
  username: string;
  email: string;
}

export interface LoginRequest {
  userName: string;
  password: string;
}

export interface LoginResponse {
  message: string;
  token: string;
  userId: number;
  userName: string;
}

export interface ForgotPasswordRequest {
  email: string;
}

export interface ForgotPasswordResponse {
  message: string;
}

export interface ResetPasswordRequest {
  email: string;
  otp: string;
  newPassword: string;
}

export interface ResetPasswordResponse {
  message: string;
}

export interface User {
  userId: number;
  userName: string;
  email?: string;
  displayName?: string;
  token: string;
}

export interface AuthState {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
}
