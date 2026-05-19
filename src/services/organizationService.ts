import { fetchAPI, API_ENDPOINTS } from '../config/api';

export interface OrganizationResponse {
  organization_id: string;
  name: string;
  logo_url: string;
}

export interface EnrollmentResponse {
  enrollment_id: string;
  organization_id: string;
  organization_name: string;
  logo_url?: string;
  enrolled_at: string;
}

export interface SwitchOrganizationResponse {
  organization_id: string;
  name: string;
  logo_url: string;
  message: string;
}

export interface CurrentOrganizationResponse {
  organization_id: string | null;
  name: string | null;
  logo_url: string | null;
  is_set: boolean;
}

export async function getOrganizations(): Promise<{ organizations: OrganizationResponse[]; count: number }> {
  return fetchAPI<{ organizations: OrganizationResponse[]; count: number }>(API_ENDPOINTS.ORGANIZATIONS);
}

export async function enrollInOrganization(organizationId: string): Promise<EnrollmentResponse> {
  return fetchAPI<EnrollmentResponse>(API_ENDPOINTS.ENROLL, {
    method: 'POST',
    body: JSON.stringify({ organization_id: organizationId }),
  });
}

export async function getMyEnrollments(): Promise<{ enrollments: EnrollmentResponse[]; count: number }> {
  return fetchAPI<{ enrollments: EnrollmentResponse[]; count: number }>(API_ENDPOINTS.MY_ENROLLMENTS);
}

export async function switchOrganization(organizationId: string): Promise<SwitchOrganizationResponse> {
  return fetchAPI<SwitchOrganizationResponse>(API_ENDPOINTS.SWITCH, {
    method: 'POST',
    body: JSON.stringify({ organization_id: organizationId }),
  });
}

export async function getCurrentOrganization(): Promise<CurrentOrganizationResponse> {
  return fetchAPI<CurrentOrganizationResponse>(API_ENDPOINTS.CURRENT);
}

export async function unenrollFromOrganization(organizationId: string): Promise<{ message: string; success: boolean }> {
  return fetchAPI<{ message: string; success: boolean }>(API_ENDPOINTS.UNENROLL(organizationId), {
    method: 'DELETE',
  });
}
