import { NavLink, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { LogOut } from 'lucide-react';
import { cn } from '../../lib/utils';
import { useAuth } from '../../contexts/AuthContext';
import { useOrganization } from '../../contexts/OrganizationContext';
import { drawerMenuItems } from '../../config/navigation';

export function Sidebar() {
  const location = useLocation();
  const { user, logout } = useAuth();
  const { selectedOrganization } = useOrganization();

  return (
    <aside className="hidden md:flex flex-col w-72 bg-white border-r border-gray-200 h-screen fixed top-0 left-0 z-40">
      <div className="p-6 border-b border-gray-100">
        <div className="flex items-center gap-3">
          <img src={`${import.meta.env.BASE_URL}logo.png`} alt="CairCompanion" className="w-10 h-10" />
          <div>
            <div className="text-lg font-black tracking-tight">
              <span className="text-gray-900">C</span>
              <span className="text-orange-500">ai</span>
              <span className="text-gray-900">rIQ</span>
            </div>
            <p className="text-[10px] font-semibold text-gray-500 tracking-widest uppercase">CairCompanion</p>
          </div>
          {selectedOrganization && (
            <img
              src={selectedOrganization.logo}
              alt={selectedOrganization.name}
              className="w-9 h-9 rounded-lg object-contain ml-auto"
            />
          )}
        </div>
      </div>

      <nav className="flex-1 p-3 space-y-0.5 overflow-y-auto hide-scrollbar">
        {drawerMenuItems.map((item) => {
          const isActive =
            location.pathname === item.path ||
            (item.path !== '/voice' && location.pathname.startsWith(item.path));
          const Icon = item.icon;

          return (
            <NavLink key={item.path} to={item.path} className="relative block">
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
                <span className="font-medium text-sm">{item.name}</span>
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
