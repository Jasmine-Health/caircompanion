import { fetchAPI, fetchAPIWithFormData, API_ENDPOINTS } from '../config/api';
import type { User } from '../types';

export interface LoginRequest {
  email: string;
  password: string;
  role?: 'patient' | 'cairgiver';
  organization_id?: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  first_name: string;
  last_name: string;
  phone?: string;
  agreed_to_sms?: boolean;
  role?: 'patient' | 'cairgiver';
  timezone?: string;
  organization_id?: string;
}

export interface LoginResponse {
  access_token: string;
  token_type: string;
  expires_in: number;
  user: User;
}

export interface ChangePasswordRequest {
  old_password: string;
  new_password: string;
}

export interface ForgotPasswordRequest {
  email: string;
  role: 'patient' | 'cairgiver';
}

export interface ResetPasswordRequest {
  token: string;
  new_password: string;
}

export interface VerifyResetTokenRequest {
  reset_token: string;
}

export async function login(data: LoginRequest): Promise<LoginResponse> {
  const formData = new FormData();
  formData.append('email', data.email);
  formData.append('password', data.password);
  if (data.role) formData.append('role', data.role);
  if (data.organization_id) formData.append('organization_id', data.organization_id);

  return fetchAPIWithFormData<LoginResponse>(API_ENDPOINTS.LOGIN, formData);
}

export async function register(data: RegisterRequest): Promise<User> {
  return fetchAPI<User>(API_ENDPOINTS.REGISTER, {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export async function getCurrentUser(): Promise<User> {
  return fetchAPI<User>(API_ENDPOINTS.ME);
}

export async function changePassword(data: ChangePasswordRequest): Promise<{ message: string; success: boolean }> {
  return fetchAPI<{ message: string; success: boolean }>(API_ENDPOINTS.CHANGE_PASSWORD, {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export async function forgotPassword(data: ForgotPasswordRequest): Promise<{ message: string; success: boolean }> {
  const formData = new FormData();
  formData.append('email', data.email);
  formData.append('role', data.role);

  return fetchAPIWithFormData<{ message: string; success: boolean }>(API_ENDPOINTS.FORGOT_PASSWORD, formData);
}

export async function resetPassword(data: ResetPasswordRequest): Promise<{ message: string; success: boolean }> {
  const formData = new FormData();
  formData.append('token', data.token);
  formData.append('new_password', data.new_password);

  return fetchAPIWithFormData<{ message: string; success: boolean }>(API_ENDPOINTS.RESET_PASSWORD, formData);
}

export async function verifyResetToken(data: VerifyResetTokenRequest): Promise<{ message: string; success: boolean }> {
  return fetchAPI<{ message: string; success: boolean }>(API_ENDPOINTS.VERIFY_RESET_TOKEN, {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export async function refreshToken(): Promise<LoginResponse> {
  return fetchAPI<LoginResponse>(API_ENDPOINTS.REFRESH, {
    method: 'POST',
  });
}
