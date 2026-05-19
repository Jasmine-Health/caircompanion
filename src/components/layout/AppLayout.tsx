import { Outlet, useLocation } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { BottomNav } from './BottomNav';
import { MobileHeader } from './MobileHeader';

export function AppLayout() {
  const location = useLocation();
  const isChatPage = location.pathname === '/chat';

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar />
      <MobileHeader />
      {/* Add left margin on desktop to account for fixed sidebar */}
      {/* Add top padding on mobile for fixed header, bottom padding for bottom nav */}
      {/* Remove bottom padding on chat page since it has its own sticky input */}
      <main className={`flex-1 md:ml-64 overflow-y-auto pt-14 md:pt-0 ${isChatPage ? '' : 'pb-24'} md:pb-0`}>
        <Outlet />
      </main>
      <BottomNav />
    </div>
  );
}
