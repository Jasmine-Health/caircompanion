import {
  Bell,
  LayoutDashboard,
  Pill,
  Heart,
  Brain,
  MessageSquare,
  HeartPulse,
  CalendarClock,
  Dumbbell,
  Smile,
  Apple,
  Link2,
  Users,
  Building2,
  Settings,
  Mic,
  type LucideIcon,
} from 'lucide-react';

export type AppDestination =
  | 'voice-chat'
  | 'chat'
  | 'dashboard'
  | 'health-data'
  | 'alerts'
  | 'appointments'
  | 'medications'
  | 'exercise'
  | 'mood'
  | 'diet'
  | 'care-plan'
  | 'connectors'
  | 'connect-to-cairgiver'
  | 'organizations'
  | 'settings'
  | 'trackers';

export interface MenuItem {
  name: string;
  icon: LucideIcon;
  destination: AppDestination;
  path: string;
}

export const drawerMenuItems: MenuItem[] = [
  { name: 'Talk to CairCompanion', icon: Mic, destination: 'voice-chat', path: '/voice' },
  { name: 'Chat', icon: MessageSquare, destination: 'chat', path: '/chat' },
  { name: 'Dashboard', icon: LayoutDashboard, destination: 'dashboard', path: '/dashboard' },
  { name: 'Health Data', icon: HeartPulse, destination: 'health-data', path: '/health-data' },
  { name: 'Alerts', icon: Bell, destination: 'alerts', path: '/alerts' },
  { name: 'Appointments', icon: CalendarClock, destination: 'appointments', path: '/appointments' },
  { name: 'Medications', icon: Pill, destination: 'medications', path: '/medications' },
  { name: 'Exercise', icon: Dumbbell, destination: 'exercise', path: '/exercise' },
  { name: 'Mood', icon: Smile, destination: 'mood', path: '/mood' },
  { name: 'Diet', icon: Apple, destination: 'diet', path: '/diet' },
  { name: 'Care Plan', icon: Heart, destination: 'care-plan', path: '/care-plan' },
  { name: 'Connectors', icon: Link2, destination: 'connectors', path: '/connectors' },
  { name: 'Connect To Cairgiver', icon: Users, destination: 'connect-to-cairgiver', path: '/caregivers' },
  { name: 'Organizations', icon: Building2, destination: 'organizations', path: '/organizations' },
  { name: 'Settings', icon: Settings, destination: 'settings', path: '/settings' },
];

export const bottomTabItems = [
  { path: '/alerts', icon: Bell, label: 'Alerts', destination: 'alerts' as AppDestination },
  { path: '/dashboard', icon: LayoutDashboard, label: 'Dashboard', destination: 'dashboard' as AppDestination },
  { path: '/medications', icon: Pill, label: 'Medication', destination: 'medications' as AppDestination },
  { path: '/care-plan', icon: Heart, label: 'Care Plan', destination: 'care-plan' as AppDestination },
  { path: '/voice', icon: Brain, label: 'AI', destination: 'voice-chat' as AppDestination },
];

export const pageTitles: Record<string, string> = {
  '/voice': 'Talk to CairCompanion',
  '/chat': 'Chat',
  '/dashboard': 'Dashboard',
  '/health-data': 'Health Data',
  '/alerts': 'Alerts',
  '/appointments': 'Appointments',
  '/medications': 'Medications',
  '/exercise': 'Exercise',
  '/mood': 'Mood',
  '/diet': 'Diet',
  '/care-plan': 'Care Plans',
  '/connectors': 'Connectors',
  '/caregivers': 'Connect To Cairgiver',
  '/organizations': 'Organizations',
  '/settings': 'Settings',
  '/trackers': 'Health Trackers',
  '/organization-settings': 'Organizations',
};

export function getPageTitle(pathname: string): string {
  if (pageTitles[pathname]) return pageTitles[pathname];
  if (pathname.startsWith('/trackers/')) {
    const trackerId = pathname.split('/')[2];
    const names: Record<string, string> = {
      vitals: 'Vitals',
      medication: 'Medication',
      exercise: 'Exercise',
      diet: 'Diet',
      sleep: 'Sleep',
      mood: 'Mood',
    };
    return names[trackerId] || 'Trackers';
  }
  return 'CairCompanion';
}

export function getDestinationFromPath(pathname: string): AppDestination {
  const item = drawerMenuItems.find((m) => m.path === pathname || pathname.startsWith(m.path + '/'));
  if (item) return item.destination;
  if (pathname.startsWith('/trackers')) return 'health-data';
  if (pathname === '/organization-settings') return 'organizations';
  return 'dashboard';
}
