import { Outlet, useLocation } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { BottomNav } from './BottomNav';
import { MobileHeader } from './MobileHeader';

export function AppLayout() {
  const location = useLocation();
  const isChatPage = location.pathname === '/chat';

  return (
    <div className="flex h-screen h-dvh overflow-hidden bg-gray-50">
      <Sidebar />
      <MobileHeader />
      {/* Add left margin on desktop to account for fixed sidebar */}
      {/* Add top padding on mobile for fixed header, bottom padding for bottom nav */}
      {/* Remove bottom padding on chat page since it has its own sticky input */}
      <main className={`flex-1 md:ml-64 overflow-y-auto pt-[calc(3.5rem+env(safe-area-inset-top,0px))] md:pt-0 ${isChatPage ? '' : 'pb-bottom-nav'} md:pb-0`}>
        <Outlet />
      </main>
      <BottomNav />
    </div>
  );
}
