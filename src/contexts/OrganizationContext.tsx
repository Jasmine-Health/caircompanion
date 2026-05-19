import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import type { Organization, UserOrganization } from '../types';
import { getOrganizations, getMyEnrollments, switchOrganization as switchOrgAPI, enrollInOrganization as enrollOrgAPI, unenrollFromOrganization as unenrollOrgAPI, getCurrentOrganization } from '../services/organizationService';

interface OrganizationContextType {
  selectedOrganization: Organization | null;
  userOrganizations: UserOrganization[];
  availableOrganizations: Organization[];
  isLoading: boolean;
  selectOrganization: (org: Organization) => void;
  switchOrganization: (orgId: string) => void;
  enrollInOrganization: (orgId: string) => Promise<void>;
  unenrollFromOrganization: (orgId: string) => Promise<void>;
  clearSelectedOrganization: () => void;
}

const OrganizationContext = createContext<OrganizationContextType | undefined>(undefined);

export function OrganizationProvider({ children }: { children: ReactNode }) {
  const [selectedOrganization, setSelectedOrganization] = useState<Organization | null>(null);
  const [userOrganizations, setUserOrganizations] = useState<UserOrganization[]>([]);
  const [availableOrganizations, setAvailableOrganizations] = useState<Organization[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        const token = localStorage.getItem('access_token');
        
        // Load available organizations (public endpoint)
        const orgsResponse = await getOrganizations();
        const orgs: Organization[] = orgsResponse.organizations.map(org => ({
          id: org.organization_id,
          name: org.name,
          logo: org.logo_url,
        }));
        setAvailableOrganizations(orgs);

        // Load user enrollments and current organization if authenticated
        if (token) {
          const [enrollmentsResponse, currentOrgResponse] = await Promise.all([
            getMyEnrollments(),
            getCurrentOrganization(),
          ]);

          const userOrgs: UserOrganization[] = enrollmentsResponse.enrollments.map(enrollment => ({
            organization: {
              id: enrollment.organization_id,
              name: enrollment.organization_name,
              logo: enrollment.logo_url || '',
            },
            enrolledAt: enrollment.enrolled_at,
            isActive: false,
          }));
          setUserOrganizations(userOrgs);

          // Set current organization
          if (currentOrgResponse.is_set && currentOrgResponse.organization_id) {
            const currentOrg: Organization = {
              id: currentOrgResponse.organization_id,
              name: currentOrgResponse.name || '',
              logo: currentOrgResponse.logo_url || '',
            };
            setSelectedOrganization(currentOrg);
            localStorage.setItem('selectedOrganization', JSON.stringify(currentOrg));
          }
        }
      } catch (error) {
        console.error('Failed to load organization data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, []);

  const selectOrganization = (org: Organization) => {
    setSelectedOrganization(org);
    localStorage.setItem('selectedOrganization', JSON.stringify(org));
  };

  const switchOrganization = async (orgId: string) => {
    const response = await switchOrgAPI(orgId);
    const org: Organization = {
      id: response.organization_id,
      name: response.name,
      logo: response.logo_url,
    };
    setSelectedOrganization(org);
    localStorage.setItem('selectedOrganization', JSON.stringify(org));
  };

  const enrollInOrganization = async (orgId: string) => {
    await enrollOrgAPI(orgId);
    // Reload enrollments after successful enrollment
    const enrollmentsResponse = await getMyEnrollments();
    const userOrgs: UserOrganization[] = enrollmentsResponse.enrollments.map(enrollment => ({
      organization: {
        id: enrollment.organization_id,
        name: enrollment.organization_name,
        logo: enrollment.logo_url || '',
      },
      enrolledAt: enrollment.enrolled_at,
      isActive: false,
    }));
    setUserOrganizations(userOrgs);
  };

  const unenrollFromOrganization = async (orgId: string) => {
    await unenrollOrgAPI(orgId);
    // Reload enrollments after successful unenrollment
    const enrollmentsResponse = await getMyEnrollments();
    const userOrgs: UserOrganization[] = enrollmentsResponse.enrollments.map(enrollment => ({
      organization: {
        id: enrollment.organization_id,
        name: enrollment.organization_name,
        logo: enrollment.logo_url || '',
      },
      enrolledAt: enrollment.enrolled_at,
      isActive: false,
    }));
    setUserOrganizations(userOrgs);
    
    // Reload current organization
    const currentOrgResponse = await getCurrentOrganization();
    if (currentOrgResponse.is_set && currentOrgResponse.organization_id) {
      const currentOrg: Organization = {
        id: currentOrgResponse.organization_id,
        name: currentOrgResponse.name || '',
        logo: currentOrgResponse.logo_url || '',
      };
      setSelectedOrganization(currentOrg);
      localStorage.setItem('selectedOrganization', JSON.stringify(currentOrg));
    } else {
      setSelectedOrganization(null);
      localStorage.removeItem('selectedOrganization');
    }
  };

  const clearSelectedOrganization = () => {
    setSelectedOrganization(null);
    localStorage.removeItem('selectedOrganization');
  };

  return (
    <OrganizationContext.Provider
      value={{
        selectedOrganization,
        userOrganizations,
        availableOrganizations,
        isLoading,
        selectOrganization,
        switchOrganization,
        enrollInOrganization,
        unenrollFromOrganization,
        clearSelectedOrganization,
      }}
    >
      {children}
    </OrganizationContext.Provider>
  );
}

export function useOrganization() {
  const context = useContext(OrganizationContext);
  if (context === undefined) {
    throw new Error('useOrganization must be used within an OrganizationProvider');
  }
  return context;
}
