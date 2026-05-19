import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import type { Organization, UserOrganization } from '../types';
import { mockOrganizations, mockUserOrganizations } from '../data/mockData';

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
  const [availableOrganizations] = useState<Organization[]>(mockOrganizations);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const storedOrg = localStorage.getItem('selectedOrganization');
    const storedUserOrgs = localStorage.getItem('userOrganizations');
    
    if (storedOrg) {
      setSelectedOrganization(JSON.parse(storedOrg));
    }
    
    if (storedUserOrgs) {
      setUserOrganizations(JSON.parse(storedUserOrgs));
    } else {
      setUserOrganizations(mockUserOrganizations);
      localStorage.setItem('userOrganizations', JSON.stringify(mockUserOrganizations));
    }
    
    setIsLoading(false);
  }, []);

  const selectOrganization = (org: Organization) => {
    setSelectedOrganization(org);
    localStorage.setItem('selectedOrganization', JSON.stringify(org));
  };

  const switchOrganization = (orgId: string) => {
    const userOrg = userOrganizations.find(uo => uo.organization.id === orgId);
    if (userOrg) {
      const updatedUserOrgs = userOrganizations.map(uo => ({
        ...uo,
        isActive: uo.organization.id === orgId,
      }));
      setUserOrganizations(updatedUserOrgs);
      setSelectedOrganization(userOrg.organization);
      localStorage.setItem('selectedOrganization', JSON.stringify(userOrg.organization));
      localStorage.setItem('userOrganizations', JSON.stringify(updatedUserOrgs));
    }
  };

  const enrollInOrganization = async (orgId: string) => {
    await new Promise(resolve => setTimeout(resolve, 500));
    
    const org = availableOrganizations.find(o => o.id === orgId);
    if (org && !userOrganizations.find(uo => uo.organization.id === orgId)) {
      const newUserOrg: UserOrganization = {
        organization: org,
        enrolledAt: new Date().toISOString(),
        isActive: false,
      };
      const updatedUserOrgs = [...userOrganizations, newUserOrg];
      setUserOrganizations(updatedUserOrgs);
      localStorage.setItem('userOrganizations', JSON.stringify(updatedUserOrgs));
    }
  };

  const unenrollFromOrganization = async (orgId: string) => {
    await new Promise(resolve => setTimeout(resolve, 500));
    
    const updatedUserOrgs = userOrganizations.filter(uo => uo.organization.id !== orgId);
    setUserOrganizations(updatedUserOrgs);
    localStorage.setItem('userOrganizations', JSON.stringify(updatedUserOrgs));
    
    if (selectedOrganization?.id === orgId) {
      const activeOrg = updatedUserOrgs.find(uo => uo.isActive);
      if (activeOrg) {
        setSelectedOrganization(activeOrg.organization);
        localStorage.setItem('selectedOrganization', JSON.stringify(activeOrg.organization));
      } else if (updatedUserOrgs.length > 0) {
        setSelectedOrganization(updatedUserOrgs[0].organization);
        localStorage.setItem('selectedOrganization', JSON.stringify(updatedUserOrgs[0].organization));
      } else {
        setSelectedOrganization(null);
        localStorage.removeItem('selectedOrganization');
      }
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
