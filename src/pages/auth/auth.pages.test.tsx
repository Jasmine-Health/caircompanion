import { describe, expect, it, vi, beforeEach } from 'vitest';
import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { AuthProvider } from '../../contexts/AuthContext';
import { OrganizationProvider } from '../../contexts/OrganizationContext';
import { LoginPage } from './LoginPage';
import { RegisterPage } from './RegisterPage';
import { ForgotPasswordPage } from './ForgotPasswordPage';
import { ResetPasswordPage } from './ResetPasswordPage';
import { OAuthCallbackPage } from './OAuthCallbackPage';
import * as authService from '../../services/authService';

vi.mock('../../hooks/usePWAInstall', () => ({
  usePWAInstall: () => ({
    isInstallable: false,
    isInstalled: false,
    install: vi.fn(),
    showInstructions: false,
    setShowInstructions: vi.fn(),
    platform: 'desktop' as const,
  }),
}));

vi.mock('../../services/voiceService', () => ({
  resolveUserVoiceModel: vi.fn().mockResolvedValue('aura-2-vesta-en'),
  clearCachedVoiceModel: vi.fn(),
}));

vi.mock('../../services/authService', () => ({
  login: vi.fn(),
  register: vi.fn(),
  forgotPassword: vi.fn(),
  resetPassword: vi.fn(),
  getCurrentUser: vi.fn(),
  getGoogleAuthUrl: vi.fn(),
  getEntraAuthUrl: vi.fn(),
  updateTimezone: vi.fn(),
}));

vi.mock('../../services/organizationService', () => ({
  getOrganizations: vi.fn().mockResolvedValue({ count: 0, organizations: [] }),
  getMyEnrollments: vi.fn().mockResolvedValue({ enrollments: [] }),
  getCurrentOrganization: vi.fn().mockResolvedValue({ is_set: false }),
  switchOrganization: vi.fn(),
  enrollInOrganization: vi.fn(),
  unenrollFromOrganization: vi.fn(),
}));

function renderAuthPage(element: React.ReactElement, path = '/') {
  return render(
    <MemoryRouter initialEntries={[path]}>
      <OrganizationProvider>
        <AuthProvider>{element}</AuthProvider>
      </OrganizationProvider>
    </MemoryRouter>
  );
}

describe('auth pages', () => {
  beforeEach(() => {
    localStorage.clear();
    localStorage.setItem(
      'selectedOrganization',
      JSON.stringify({ id: 'org-1', name: 'Pulp Digital', logo: '/logo.png' })
    );
    vi.mocked(authService.getCurrentUser).mockRejectedValue(new Error('no session'));
    vi.mocked(authService.login).mockResolvedValue({
      access_token: 'token',
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
    vi.mocked(authService.register).mockResolvedValue({
      access_token: 'token',
      token_type: 'bearer',
      expires_in: 3600,
      user: {
        email: 'jane@example.com',
        first_name: 'Jane',
        last_name: 'Doe',
        is_active: true,
        agreed_to_sms: false,
        role: 'patient',
        timezone: 'UTC',
        createdAt: '',
        updatedAt: '',
      },
    });
    vi.mocked(authService.forgotPassword).mockResolvedValue(undefined);
    vi.mocked(authService.resetPassword).mockResolvedValue(undefined);
    vi.mocked(authService.getGoogleAuthUrl).mockRejectedValue(new Error('fail'));
  });

  it('login submits credentials', async () => {
    const user = userEvent.setup();
    renderAuthPage(<LoginPage />);
    await user.type(screen.getByPlaceholderText(/password/i), 'secret123');
    await user.click(screen.getByRole('button', { name: /^Sign In$/i }));
    await waitFor(() => expect(authService.login).toHaveBeenCalled());
  });

  it('register requires terms acceptance then submits', async () => {
    const user = userEvent.setup();
    const view = renderAuthPage(<RegisterPage />);
    const page = within(view.container);
    await user.type(page.getByPlaceholderText('First name'), 'Jane');
    await user.type(page.getByPlaceholderText('Last name'), 'Doe');
    await user.type(page.getByPlaceholderText('Enter your email'), 'jane@example.com');
    await user.type(page.getByPlaceholderText('Enter your password'), 'password1');
    await user.type(page.getByPlaceholderText('Confirm your password'), 'password1');
    await user.click(page.getAllByRole('button', { pressed: false })[1]);
    await user.click(page.getByRole('button', { name: /^Create Account$/i }));
    await waitFor(() => expect(authService.register).toHaveBeenCalled());
  });

  it('forgot password sends reset email', async () => {
    const user = userEvent.setup();
    const view = renderAuthPage(<ForgotPasswordPage />);
    const page = within(view.container);
    await user.type(page.getByPlaceholderText('Enter your email'), 'jane@example.com');
    await user.click(page.getByRole('button', { name: /Send Reset Link/i }));
    await waitFor(() => expect(authService.forgotPassword).toHaveBeenCalled());
  });

  it('reset password validates matching passwords', async () => {
    const user = userEvent.setup();
    render(
      <MemoryRouter initialEntries={['/reset-password?token=tok']}>
        <ResetPasswordPage />
      </MemoryRouter>
    );
    await user.type(screen.getByPlaceholderText('Enter new password'), 'abcdef');
    await user.type(screen.getByPlaceholderText('Confirm new password'), 'abcdef');
    await user.click(screen.getByRole('button', { name: /^Reset Password$/i }));
    await waitFor(() => expect(authService.resetPassword).toHaveBeenCalled());
  });

  it('oauth callback surfaces missing token error', async () => {
    render(
      <MemoryRouter initialEntries={['/oauth-callback']}>
        <OrganizationProvider>
          <AuthProvider>
            <Routes>
              <Route path="/oauth-callback" element={<OAuthCallbackPage />} />
              <Route path="/voice" element={<div data-testid="voice-redirect" />} />
            </Routes>
          </AuthProvider>
        </OrganizationProvider>
      </MemoryRouter>
    );
    expect(await screen.findByText(/No access token received/i)).toBeInTheDocument();
  });

  it('oauth callback stores token when query params are present', async () => {
    render(
      <MemoryRouter
        initialEntries={[
          {
            pathname: '/oauth-callback',
            search: '?access_token=oauth-token&user_email=joe@example.com&user_name=Joe%20Example',
          },
        ]}
      >
        <OrganizationProvider>
          <AuthProvider>
            <Routes>
              <Route path="/oauth-callback" element={<OAuthCallbackPage />} />
              <Route path="/voice" element={<div data-testid="voice-redirect" />} />
            </Routes>
          </AuthProvider>
        </OrganizationProvider>
      </MemoryRouter>
    );
    await waitFor(() => expect(localStorage.getItem('access_token')).toBe('oauth-token'));
  });
});
