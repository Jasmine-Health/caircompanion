import { NavLink, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Mic, MessageSquare, LayoutDashboard, Activity, Users, Settings } from 'lucide-react';
import { cn } from '../../lib/utils';

const navItems = [
  { path: '/voice', icon: Mic, label: 'Voice' },
  { path: '/chat', icon: MessageSquare, label: 'Chat' },
  { path: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { path: '/trackers', icon: Activity, label: 'Trackers' },
  { path: '/caregivers', icon: Users, label: 'Caregivers' },
  { path: '/settings', icon: Settings, label: 'Settings' },
];

export function BottomNav() {
  const location = useLocation();

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-50 md:hidden safe-area-bottom">
      <div className="grid grid-cols-6 h-16">
        {navItems.map((item) => {
          const isActive = location.pathname === item.path || 
            (item.path === '/trackers' && location.pathname.startsWith('/trackers'));
          const Icon = item.icon;

          return (
            <NavLink
              key={item.path}
              to={item.path}
              className="flex flex-col items-center justify-center"
            >
              <motion.div
                className={cn(
                  'flex flex-col items-center justify-center gap-1 py-2 px-1 rounded-lg transition-colors',
                  isActive ? 'text-[#6F42C1]' : 'text-gray-500'
                )}
                whileTap={{ scale: 0.9 }}
              >
                {isActive && (
                  <motion.div
                    layoutId="activeTab"
                    className="absolute inset-1 bg-[#6F42C1]/10 rounded-lg"
                    initial={false}
                    transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                  />
                )}
                <Icon className="w-5 h-5 relative z-10" strokeWidth={isActive ? 2.5 : 2} />
                <span className="text-[9px] font-medium relative z-10 leading-none">{item.label}</span>
              </motion.div>
            </NavLink>
          );
        })}
      </div>
    </nav>
  );
}
