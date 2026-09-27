import { act, renderHook, waitFor } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import type { ReactNode } from 'react';
import { OrganizationProvider, useOrganization } from './OrganizationContext';
import * as organizationService from '../services/organizationService';

vi.mock('../services/organizationService', () => ({
  getOrganizations: vi.fn(),
  getMyEnrollments: vi.fn(),
  getCurrentOrganization: vi.fn(),
  switchOrganization: vi.fn(),
  enrollInOrganization: vi.fn(),
  unenrollFromOrganization: vi.fn(),
}));

const wrapper = ({ children }: { children: ReactNode }) => (
  <OrganizationProvider>{children}</OrganizationProvider>
);

describe('OrganizationContext', () => {
  it('loads organizations and selects default pulp digital when none stored', async () => {
    vi.mocked(organizationService.getOrganizations).mockResolvedValue({
      count: 1,
      organizations: [{ organization_id: 'org-1', name: 'Pulp Digital', logo_url: 'logo.png' }],
    });

    const { result } = renderHook(() => useOrganization(), { wrapper });
    await waitFor(() => expect(result.current.isLoading).toBe(false));

    expect(result.current.availableOrganizations[0]?.name).toBe('Pulp Digital');
    expect(result.current.selectedOrganization?.id).toBe('org-1');
  });

  it('loads authenticated organization state from API', async () => {
    localStorage.setItem('access_token', 'token');
    vi.mocked(organizationService.getOrganizations).mockResolvedValue({ count: 0, organizations: [] });
    vi.mocked(organizationService.getMyEnrollments).mockResolvedValue({
      count: 1,
      enrollments: [
        {
          enrollment_id: 'e1',
          organization_id: 'org-9',
          organization_name: 'Clinic',
          logo_url: 'logo.png',
          enrolled_at: '2026-01-01',
        },
      ],
    });
    vi.mocked(organizationService.getCurrentOrganization).mockResolvedValue({
      organization_id: 'org-9',
      name: 'Clinic',
      logo_url: 'logo.png',
      is_set: true,
    });

    const { result } = renderHook(() => useOrganization(), { wrapper });
    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(result.current.selectedOrganization?.id).toBe('org-9');
    expect(result.current.userOrganizations).toHaveLength(1);
  });

  it('selectOrganization persists to localStorage', async () => {
    vi.mocked(organizationService.getOrganizations).mockResolvedValue({ count: 0, organizations: [] });

    const { result } = renderHook(() => useOrganization(), { wrapper });
    await waitFor(() => expect(result.current.isLoading).toBe(false));

    act(() => {
      result.current.selectOrganization({ id: 'org-2', name: 'Clinic', logo: 'x.png' });
    });

    expect(JSON.parse(localStorage.getItem('selectedOrganization') || '{}').id).toBe('org-2');
  });
});
