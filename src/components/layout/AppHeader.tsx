import { useState } from 'react';
import { Menu, LogOut } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useOrganization } from '../../contexts/OrganizationContext';
import { getPageTitle } from '../../config/navigation';

interface AppHeaderProps {
  title?: string;
  onMenuTap: () => void;
}

export function AppHeader({ title, onMenuTap }: AppHeaderProps) {
  const { logout } = useAuth();
  const { selectedOrganization } = useOrganization();
  const [showLogoutAlert, setShowLogoutAlert] = useState(false);

  return (
    <>
      <header className="fixed top-0 left-0 right-0 bg-[#6F42C1] z-40 safe-area-top">
        <div className="relative flex items-center justify-between px-4 h-14 pt-[env(safe-area-inset-top)]">
          <div className="flex items-center gap-2 z-10">
            <button
              onClick={onMenuTap}
              className="p-1 text-white hover:bg-white/10 rounded-lg transition-colors"
              aria-label="Open menu"
            >
              <Menu className="w-6 h-6" />
            </button>
            {selectedOrganization && (
              <div className="bg-white rounded-md p-1 ml-1">
                <img
                  src={selectedOrganization.logo}
                  alt={selectedOrganization.name}
                  className="h-6 w-auto max-w-[60px] object-contain"
                />
              </div>
            )}
          </div>

          <div className="absolute inset-x-0 flex justify-center pointer-events-none pt-[env(safe-area-inset-top)]">
            <div className="flex items-center h-14">
              <span className="text-lg font-black tracking-tight">
                <span className="text-white">C</span>
                <span className="text-orange-400">ai</span>
                <span className="text-white">r</span>
                <span className="text-white">IQ</span>
              </span>
            </div>
          </div>

          <button
            onClick={() => setShowLogoutAlert(true)}
            className="p-1 text-white hover:bg-white/10 rounded-lg transition-colors z-10"
            aria-label="Logout"
          >
            <LogOut className="w-5 h-5" />
          </button>
        </div>
        {title && (
          <div className="px-4 pb-2 -mt-1">
            <p className="text-center text-white/80 text-xs font-medium">{title}</p>
          </div>
        )}
      </header>

      {showLogoutAlert && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[60] px-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-sm shadow-xl">
            <h3 className="text-lg font-bold text-gray-900 mb-2">Logout</h3>
            <p className="text-gray-600 mb-6">Are you sure you want to logout?</p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowLogoutAlert(false)}
                className="flex-1 px-4 py-2.5 rounded-xl border border-gray-200 text-gray-700 font-medium hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  setShowLogoutAlert(false);
                  logout();
                }}
                className="flex-1 px-4 py-2.5 rounded-xl bg-red-600 text-white font-medium hover:bg-red-700"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export function useHeaderTitle(pathname: string): string {
  return getPageTitle(pathname);
}
