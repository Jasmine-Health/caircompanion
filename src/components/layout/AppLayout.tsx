import { useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { BottomNav } from './BottomNav';
import { AppHeader, useHeaderTitle } from './AppHeader';
import { DrawerMenu } from './DrawerMenu';
import { getDestinationFromPath } from '../../config/navigation';

export function AppLayout() {
  const location = useLocation();
  const isChatPage = location.pathname === '/chat';
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const headerTitle = useHeaderTitle(location.pathname);
  const selectedDestination = getDestinationFromPath(location.pathname);

  return (
    <div className="flex h-screen h-dvh overflow-hidden bg-gray-50">
      <Sidebar />

      <div className="flex-1 flex flex-col md:ml-72 min-w-0">
        <div className="md:hidden">
          <AppHeader
            title={headerTitle}
            onMenuTap={() => setIsDrawerOpen(true)}
          />
        </div>

        <DrawerMenu
          isOpen={isDrawerOpen}
          onClose={() => setIsDrawerOpen(false)}
          selectedDestination={selectedDestination}
        />

        <main
          className={`flex-1 overflow-y-auto pt-[calc(3.5rem+env(safe-area-inset-top,0px))] ${
            isChatPage ? '' : 'pb-bottom-nav'
          } md:pb-0 md:pt-0`}
        >
          <Outlet />
        </main>

        <BottomNav />
      </div>
    </div>
  );
}
