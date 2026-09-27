import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { BottomNav } from './BottomNav';
import { MobileHeader } from './MobileHeader';
import { AuthProvider } from '../../contexts/AuthContext';
import { OrganizationProvider } from '../../contexts/OrganizationContext';
vi.mock('../../services/authService', () => ({
  getCurrentUser: vi.fn().mockRejectedValue(new Error('no session')),
  updateTimezone: vi.fn(),
  login: vi.fn(),
}));

vi.mock('../../services/organizationService', () => ({
  getOrganizations: vi.fn().mockResolvedValue({ count: 0, organizations: [] }),
  getMyEnrollments: vi.fn(),
  getCurrentOrganization: vi.fn(),
  switchOrganization: vi.fn(),
  enrollInOrganization: vi.fn(),
  unenrollFromOrganization: vi.fn(),
}));

vi.mock('framer-motion', () => {
  const Motion = ({ children, ...props }: { children?: React.ReactNode }) => (
    <div {...props}>{children}</div>
  );
  return {
    motion: new Proxy({}, { get: () => Motion }),
    AnimatePresence: ({ children }: { children: React.ReactNode }) => <>{children}</>,
  };
});

describe('layout components', () => {
  it('renders bottom navigation tabs', () => {
    render(
      <MemoryRouter initialEntries={['/dashboard']}>
        <BottomNav />
      </MemoryRouter>
    );
    expect(screen.getByText('Dashboard')).toBeInTheDocument();
    expect(screen.getByText('AI')).toBeInTheDocument();
  });

  it('renders mobile header title for dashboard route', async () => {
    render(
      <MemoryRouter initialEntries={['/dashboard']}>
        <OrganizationProvider>
          <AuthProvider>
            <MobileHeader />
          </AuthProvider>
        </OrganizationProvider>
      </MemoryRouter>
    );
    expect(await screen.findByText('CairCompanion')).toBeInTheDocument();
    expect(screen.getByText('User')).toBeInTheDocument();
  });
});
