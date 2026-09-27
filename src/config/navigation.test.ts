import { describe, expect, it } from 'vitest';
import {
  bottomTabItems,
  drawerMenuItems,
  getDestinationFromPath,
  getPageTitle,
  pageTitles,
} from './navigation';

describe('navigation config', () => {
  it('exposes drawer and bottom tab routes', () => {
    expect(drawerMenuItems.length).toBeGreaterThan(10);
    expect(bottomTabItems.some((item) => item.path === '/voice')).toBe(true);
    expect(pageTitles['/dashboard']).toBe('Dashboard');
  });

  it('resolves page titles for known and tracker paths', () => {
    expect(getPageTitle('/alerts')).toBe('Alerts');
    expect(getPageTitle('/trackers/vitals')).toBe('Vitals');
    expect(getPageTitle('/trackers/unknown')).toBe('Trackers');
    expect(getPageTitle('/unknown')).toBe('CairCompanion');
  });

  it('maps paths to destinations', () => {
    expect(getDestinationFromPath('/voice')).toBe('voice-chat');
    expect(getDestinationFromPath('/trackers/vitals')).toBe('trackers');
    expect(getDestinationFromPath('/organization-settings')).toBe('organizations');
    expect(getDestinationFromPath('/missing')).toBe('dashboard');
  });
});
