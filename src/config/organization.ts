import type { Organization } from '../types';

export const DEFAULT_ORGANIZATION_NAME = 'Pulp Digital';

export function findOrganizationByName(
  organizations: Organization[],
  name: string
): Organization | undefined {
  const normalized = name.trim().toLowerCase();

  return (
    organizations.find((org) => org.name.trim().toLowerCase() === normalized) ??
    organizations.find((org) => org.name.trim().toLowerCase().includes(normalized))
  );
}
