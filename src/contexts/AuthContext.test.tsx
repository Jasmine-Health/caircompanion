import { act, renderHook, waitFor } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import type { ReactNode } from 'react';
import { AuthProvider, useAuth } from './AuthContext';
import * as authService from '../services/authService';
import * as voiceService from '../services/voiceService';

vi.mock('../services/authService', () => ({
  login: vi.fn(),
  getCurrentUser: vi.fn(),
  updateTimezone: vi.fn(),
}));

vi.mock('../services/voiceService', () => ({
  resolveUserVoiceModel: vi.fn().mockResolvedValue('aura-2-vesta-en'),
  clearCachedVoiceModel: vi.fn(),
}));

const patientUser = {
  email: 'joe@example.com',
  first_name: 'Joe',
  last_name: 'Example',
  is_active: true,
  agreed_to_sms: false,
  role: 'patient' as const,
  timezone: 'UTC',
  createdAt: '',
  updatedAt: '',
};

const wrapper = ({ children }: { children: ReactNode }) => <AuthProvider>{children}</AuthProvider>;

describe('AuthContext', () => {
  it('loads user from token on mount', async () => {
    localStorage.setItem('access_token', 'token');
    vi.mocked(authService.getCurrentUser).mockResolvedValue(patientUser);

    const { result } = renderHook(() => useAuth(), { wrapper });
    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(result.current.isAuthenticated).toBe(true);
    expect(result.current.user?.email).toBe('joe@example.com');
    expect(voiceService.resolveUserVoiceModel).toHaveBeenCalled();
    expect(authService.updateTimezone).toHaveBeenCalled();
  });

  it('login stores token and logout clears session', async () => {
    vi.mocked(authService.login).mockResolvedValue({
      access_token: 'abc',
      token_type: 'bearer',
      expires_in: 3600,
      user: patientUser,
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
    expect(voiceService.clearCachedVoiceModel).toHaveBeenCalled();
  });

  it('setTokenAndUser stores session', async () => {
    const { result } = renderHook(() => useAuth(), { wrapper });
    await waitFor(() => expect(result.current.isLoading).toBe(false));

    act(() => {
      result.current.setTokenAndUser('session-token', patientUser);
    });

    expect(localStorage.getItem('access_token')).toBe('session-token');
    expect(result.current.user?.email).toBe('joe@example.com');
  });

  it('syncs timezone when tab becomes visible', async () => {
    localStorage.setItem('access_token', 'token');
    vi.mocked(authService.getCurrentUser).mockResolvedValue(patientUser);
    vi.mocked(authService.updateTimezone).mockClear();

    renderHook(() => useAuth(), { wrapper });
    await waitFor(() => expect(authService.updateTimezone).toHaveBeenCalledTimes(1));

    Object.defineProperty(document, 'visibilityState', {
      configurable: true,
      value: 'visible',
    });
    document.dispatchEvent(new Event('visibilitychange'));

    await waitFor(() =>
      expect(vi.mocked(authService.updateTimezone).mock.calls.length).toBeGreaterThanOrEqual(2)
    );
  });
});
