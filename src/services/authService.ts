import { fetchAPI, fetchAPIWithFormData, API_ENDPOINTS, API_CONFIG, APIError } from '../config/api';
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

// Social Auth Types
export interface SocialAuthLoginRequest {
  role?: 'patient' | 'cairgiver';
  platform?: string;
  organization_id?: string;
}

export interface SocialAuthLoginResponse {
  authorization_url: string;
  state: string;
}

export interface AppleAuthRequest {
  identity_token: string;
  authorization_code?: string;
  user?: {
    name?: {
      firstName?: string;
      lastName?: string;
    };
    email?: string;
  };
  role?: 'patient' | 'cairgiver';
  organization_id?: string;
}

export interface AppleAuthResponse {
  access_token: string;
  token_type: string;
  expires_in: number;
  user: {
    email: string;
    first_name?: string;
    last_name?: string;
    display_name: string;
    apple_user_id?: string;
    is_active: boolean;
    auth_provider: string;
    picture?: string | null;
    created_at: string;
    updated_at: string;
  };
}

// Social Auth Functions
export async function getGoogleAuthUrl(
  role: 'patient' | 'cairgiver' = 'patient',
  organization_id?: string
): Promise<SocialAuthLoginResponse> {
  const params = new URLSearchParams();
  params.append('role', role);
  params.append('platform', 'web');
  if (organization_id) {
    params.append('organization_id', organization_id);
  }

  const url = `${API_CONFIG.BASE_URL}${API_ENDPOINTS.GOOGLE_LOGIN}?${params.toString()}`;
  const response = await fetch(url);
  
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new APIError(
      errorData.detail || 'Failed to get Google auth URL',
      response.status,
      errorData
    );
  }

  return response.json();
}

export async function getEntraAuthUrl(
  role: 'patient' | 'cairgiver' = 'patient',
  organization_id?: string
): Promise<SocialAuthLoginResponse> {
  const params = new URLSearchParams();
  params.append('role', role);
  params.append('platform', 'web');
  if (organization_id) {
    params.append('organization_id', organization_id);
  }

  const url = `${API_CONFIG.BASE_URL}${API_ENDPOINTS.ENTRA_LOGIN}?${params.toString()}`;
  const response = await fetch(url);
  
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new APIError(
      errorData.detail || 'Failed to get Microsoft auth URL',
      response.status,
      errorData
    );
  }

  return response.json();
}

export async function appleAuthCallback(data: AppleAuthRequest): Promise<AppleAuthResponse> {
  return fetchAPI<AppleAuthResponse>(API_ENDPOINTS.APPLE_CALLBACK, {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export async function updateTimezone(timezone?: string): Promise<{ message: string }> {
  const tz = timezone || Intl.DateTimeFormat().resolvedOptions().timeZone;
  return fetchAPI<{ message: string }>(API_ENDPOINTS.TIMEZONE, {
    method: 'PUT',
    body: JSON.stringify({ timezone: tz }),
  });
}

export async function deleteAccount(wipeOut: boolean): Promise<void> {
  const url = `${API_CONFIG.BASE_URL}${API_ENDPOINTS.DELETE_ACCOUNT}`;
  const token = localStorage.getItem('access_token');
  const response = await fetch(url, {
    method: 'DELETE',
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify({ wipe_out: wipeOut }),
  });
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new APIError(
      (errorData as { detail?: string; message?: string }).detail ||
        (errorData as { message?: string }).message ||
        'Failed to delete account',
      response.status,
      errorData
    );
  }
}
