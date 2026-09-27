import { act, renderHook, waitFor } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import type { ReactNode } from 'react';
import { AuthProvider, useAuth } from './AuthContext';
import * as authService from '../services/authService';

vi.mock('../services/authService', () => ({
  login: vi.fn(),
  getCurrentUser: vi.fn(),
  updateTimezone: vi.fn(),
}));

const wrapper = ({ children }: { children: ReactNode }) => <AuthProvider>{children}</AuthProvider>;

describe('AuthContext', () => {
  it('loads user from token on mount', async () => {
    localStorage.setItem('access_token', 'token');
    vi.mocked(authService.getCurrentUser).mockResolvedValue({
      email: 'joe@example.com',
      first_name: 'Joe',
      last_name: 'Example',
      is_active: true,
      agreed_to_sms: false,
      role: 'patient',
      timezone: 'UTC',
      createdAt: '',
      updatedAt: '',
    });

    const { result } = renderHook(() => useAuth(), { wrapper });
    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(result.current.isAuthenticated).toBe(true);
    expect(result.current.user?.email).toBe('joe@example.com');
  });

  it('login stores token and logout clears session', async () => {
    vi.mocked(authService.login).mockResolvedValue({
      access_token: 'abc',
      token_type: 'bearer',
      expires_in: 3600,
      user: {
        email: 'joe@example.com',
        first_name: 'Joe',
        last_name: 'Example',
        is_active: true,
        agreed_to_sms: false,
        role: 'patient',
        timezone: 'UTC',
        createdAt: '',
        updatedAt: '',
      },
    });

    const { result } = renderHook(() => useAuth(), { wrapper });
    await waitFor(() => expect(result.current.isLoading).toBe(false));

    await act(async () => {
      await result.current.login('joe@example.com', 'secret', 'org-1');
    });
    expect(localStorage.getItem('access_token')).toBe('abc');

    act(() => result.current.logout());
    expect(result.current.isAuthenticated).toBe(false);
    expect(localStorage.getItem('access_token')).toBeNull();
  });
});
