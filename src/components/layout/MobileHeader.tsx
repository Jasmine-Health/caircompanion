import { useLocation } from 'react-router-dom';
import { User } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useOrganization } from '../../contexts/OrganizationContext';

const pageTitles: Record<string, string> = {
  '/voice': 'Voice',
  '/chat': 'Chat',
  '/dashboard': 'Dashboard',
  '/trackers': 'Trackers',
  '/caregivers': 'Caregivers',
  '/settings': 'Settings',
  '/organization-settings': 'Settings',
};

export function MobileHeader() {
  const location = useLocation();
  const { user } = useAuth();
  const { selectedOrganization } = useOrganization();
  
  // Get page title, handle tracker sub-pages
  let pageTitle = pageTitles[location.pathname] || '';
  if (location.pathname.startsWith('/trackers/')) {
    const trackerId = location.pathname.split('/')[2];
    const trackerNames: Record<string, string> = {
      vitals: 'Vitals',
      medication: 'Medication',
      exercise: 'Exercise',
      diet: 'Diet',
      sleep: 'Sleep',
      mood: 'Mood',
    };
    pageTitle = trackerNames[trackerId] || 'Trackers';
  }

  return (
    <header className="fixed top-0 left-0 right-0 bg-white border-b border-gray-200 z-40 md:hidden safe-area-top">
      <div className="flex items-center justify-between px-4 h-14 pt-[env(safe-area-inset-top)]">
        <div className="flex items-center gap-3">
          <img src={`${import.meta.env.BASE_URL}logo.png`} alt="CairCompanion" className="w-9 h-9" />
          <div className="flex flex-col">
            <span className="font-semibold text-gray-900 text-sm leading-tight">CairCompanion</span>
            <span className="text-xs text-gray-500 leading-tight">{pageTitle}</span>
          </div>
          {selectedOrganization && (
            <img 
              src={selectedOrganization.logo} 
              alt={selectedOrganization.name} 
              className="w-8 h-8 rounded-lg object-contain"
            />
          )}
        </div>
        <div className="flex items-center gap-2 bg-gray-100 rounded-full pl-3 pr-1 py-1">
          <span className="text-sm font-medium text-gray-700">{user?.first_name || 'User'}</span>
          <div className="w-7 h-7 rounded-full bg-[#6F42C1] flex items-center justify-center">
            <User className="w-4 h-4 text-white" />
          </div>
        </div>
      </div>
    </header>
  );
}
