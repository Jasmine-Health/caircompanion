import { act, renderHook, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
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

describe('OrganizationContext actions', () => {
  beforeEach(() => {
    vi.mocked(organizationService.getOrganizations).mockResolvedValue({ count: 0, organizations: [] });
    vi.mocked(organizationService.getMyEnrollments).mockResolvedValue({ count: 0, enrollments: [] });
    vi.mocked(organizationService.getCurrentOrganization).mockResolvedValue({
      organization_id: null,
      name: null,
      logo_url: null,
      is_set: false,
    });
  });

  it('switchOrganization updates selected organization', async () => {
    vi.mocked(organizationService.switchOrganization).mockResolvedValue({
      organization_id: 'org-2',
      name: 'New Org',
      logo_url: 'logo.png',
      message: 'ok',
    });

    const { result } = renderHook(() => useOrganization(), { wrapper });
    await waitFor(() => expect(result.current.isLoading).toBe(false));

    await act(async () => {
      await result.current.switchOrganization('org-2');
    });

    expect(result.current.selectedOrganization?.name).toBe('New Org');
  });

  it('enroll and unenroll refresh user organizations', async () => {
    vi.mocked(organizationService.enrollInOrganization).mockResolvedValue({
      enrollment_id: 'e1',
      organization_id: 'org-1',
      organization_name: 'Org',
      enrolled_at: '2026-01-01',
    });
    vi.mocked(organizationService.getMyEnrollments)
      .mockResolvedValueOnce({
        count: 1,
        enrollments: [
          {
            enrollment_id: 'e1',
            organization_id: 'org-1',
            organization_name: 'Org',
            enrolled_at: '2026-01-01',
          },
        ],
      })
      .mockResolvedValueOnce({ count: 0, enrollments: [] });
    vi.mocked(organizationService.unenrollFromOrganization).mockResolvedValue({
      message: 'removed',
      success: true,
    });

    const { result } = renderHook(() => useOrganization(), { wrapper });
    await waitFor(() => expect(result.current.isLoading).toBe(false));

    await act(async () => {
      await result.current.enrollInOrganization('org-1');
    });
    expect(result.current.userOrganizations).toHaveLength(1);

    await act(async () => {
      await result.current.unenrollFromOrganization('org-1');
    });
    expect(result.current.userOrganizations).toHaveLength(0);
  });
});
