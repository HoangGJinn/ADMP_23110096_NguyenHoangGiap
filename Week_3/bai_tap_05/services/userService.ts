import apiClient from './apiClient';
import { UpdateProfileRequest, UserProfileResponse } from './types';

/**
 * Lấy thông tin profile của user hiện tại
 * GET /users/me
 */
export const getProfile = async (): Promise<UserProfileResponse> => {
  const response = await apiClient.get<UserProfileResponse>('/users/me');
  return response.data;
};

/**
 * Cập nhật profile của user hiện tại
 * PUT /users/profile
 */
export const updateProfile = async (data: UpdateProfileRequest): Promise<UserProfileResponse> => {
  const response = await apiClient.put<UserProfileResponse>('/users/profile', data);
  return response.data;
};

export const userService = {
  getProfile,
  updateProfile,
};

export default userService;
