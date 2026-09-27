import { describe, expect, it } from 'vitest';
import { DEFAULT_ORGANIZATION_NAME, findOrganizationByName } from './organization';
import type { Organization } from '../types';

const orgs: Organization[] = [
  { id: '1', name: 'Pulp Digital', logo: 'a.png' },
  { id: '2', name: 'Other Clinic', logo: 'b.png' },
];

describe('organization config', () => {
  it('uses the expected default organization name', () => {
    expect(DEFAULT_ORGANIZATION_NAME).toBe('Pulp Digital');
  });

  it('finds organizations by exact and partial name', () => {
    expect(findOrganizationByName(orgs, 'Pulp Digital')?.id).toBe('1');
    expect(findOrganizationByName(orgs, 'pulp')?.id).toBe('1');
    expect(findOrganizationByName(orgs, 'missing')).toBeUndefined();
  });
});
