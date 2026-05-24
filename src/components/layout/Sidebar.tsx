import { NavLink, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Mic, MessageSquare, LayoutDashboard, Activity, Users, Settings, LogOut } from 'lucide-react';
import { cn } from '../../lib/utils';
import { useAuth } from '../../contexts/AuthContext';
import { useOrganization } from '../../contexts/OrganizationContext';

const navItems = [
  { path: '/voice', icon: Mic, label: 'Voice' },
  { path: '/chat', icon: MessageSquare, label: 'Chat' },
  { path: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { path: '/trackers', icon: Activity, label: 'Trackers' },
  { path: '/caregivers', icon: Users, label: 'Caregivers' },
  { path: '/settings', icon: Settings, label: 'Settings' },
];

export function Sidebar() {
  const location = useLocation();
  const { user, logout } = useAuth();
  const { selectedOrganization } = useOrganization();

  return (
    <aside className="hidden md:flex flex-col w-64 bg-white border-r border-gray-200 h-screen fixed top-0 left-0 z-40">
      <div className="p-6 border-b border-gray-100">
        <div className="flex items-center gap-3">
          <img src={`${import.meta.env.BASE_URL}logo.png`} alt="CairCompanion" className="w-10 h-10" />
          <div>
            <h1 className="font-bold text-gray-900">CairCompanion</h1>
            <p className="text-xs text-gray-500">Health Assistant</p>
          </div>
          {selectedOrganization && (
            <img 
              src={selectedOrganization.logo} 
              alt={selectedOrganization.name} 
              className="w-9 h-9 rounded-lg object-contain"
            />
          )}
        </div>
      </div>

      <nav className="flex-1 p-4 space-y-1">
        {navItems.map((item) => {
          const isActive = location.pathname === item.path || 
            (item.path === '/trackers' && location.pathname.startsWith('/trackers'));
          const Icon = item.icon;

          return (
            <NavLink
              key={item.path}
              to={item.path}
              className="relative block"
            >
              <motion.div
                className={cn(
                  'flex items-center gap-3 px-4 py-3 rounded-xl transition-colors',
                  isActive 
                    ? 'text-[#6F42C1] bg-[#6F42C1]/10' 
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                )}
                whileHover={{ x: 4 }}
                whileTap={{ scale: 0.98 }}
              >
                <Icon className="w-5 h-5" strokeWidth={isActive ? 2.5 : 2} />
                <span className="font-medium">{item.label}</span>
              </motion.div>
            </NavLink>
          );
        })}
      </nav>

      <div className="p-4 border-t border-gray-100">
        <div className="flex items-center gap-3 px-4 py-3 mb-2">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#6F42C1] to-[#8b5cf6] flex items-center justify-center text-white font-semibold">
            {user?.first_name?.[0]}{user?.last_name?.[0]}
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-medium text-gray-900 truncate">
              {user?.first_name} {user?.last_name}
            </p>
            <p className="text-xs text-gray-500 truncate">{user?.email}</p>
          </div>
        </div>
        <button
          onClick={logout}
          className="flex items-center gap-3 w-full px-4 py-3 text-gray-600 hover:bg-gray-50 hover:text-red-600 rounded-xl transition-colors"
        >
          <LogOut className="w-5 h-5" />
          <span className="font-medium">Logout</span>
        </button>
      </div>
    </aside>
  );
}
