import { motion } from 'framer-motion';
import { NavLink, useLocation } from 'react-router-dom';
import { cn } from '../../lib/utils';
import { useAuth } from '../../contexts/AuthContext';
import { drawerMenuItems, type AppDestination } from '../../config/navigation';

interface DrawerMenuProps {
  isOpen: boolean;
  onClose: () => void;
  selectedDestination: AppDestination;
}

function getUserDisplayName(user: { first_name?: string; last_name?: string; email: string }): string {
  const firstName = user.first_name || '';
  const lastName = user.last_name || '';
  if (firstName && lastName) return `${firstName} ${lastName}`;
  if (firstName) return firstName;
  if (lastName) return lastName;
  return user.email.split('@')[0];
}

export function DrawerMenu({ isOpen, onClose, selectedDestination }: DrawerMenuProps) {
  const { user } = useAuth();
  const location = useLocation();

  return (
    <>
      <div
        className={`fixed inset-0 bg-black/50 z-50 transition-opacity duration-250 ${
          isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
        onClick={onClose}
        aria-hidden={!isOpen}
      />

      <motion.aside
        initial={false}
        animate={{ x: isOpen ? 0 : '-100%' }}
        transition={{ type: 'tween', duration: 0.25, ease: 'easeOut' }}
        className="fixed top-0 left-0 bottom-0 w-[min(75vw,300px)] bg-white z-50 flex flex-col shadow-xl"
      >
        <div className="px-5 py-6 border-b border-gray-100 bg-gray-50">
          <div className="flex items-center gap-3">
            <img src={`${import.meta.env.BASE_URL}logo.png`} alt="CairCompanion" className="w-12 h-12" />
            <div>
              <div className="text-lg font-black tracking-tight">
                <span className="text-gray-900">C</span>
                <span className="text-orange-500">ai</span>
                <span className="text-gray-900">rIQ</span>
              </div>
              <p className="text-[10px] font-semibold text-gray-500 tracking-widest uppercase">CairCompanion</p>
            </div>
          </div>
          {user && (
            <div className="flex items-center gap-2 mt-4">
              <div className="w-8 h-8 rounded-full bg-[#6F42C1]/10 flex items-center justify-center">
                <span className="text-sm font-medium text-[#6F42C1]">
                  {user.first_name?.[0]}{user.last_name?.[0]}
                </span>
              </div>
              <span className="text-sm font-medium text-gray-800">{getUserDisplayName(user)}</span>
            </div>
          )}
        </div>

        <nav className="flex-1 overflow-y-auto py-2 hide-scrollbar">
          {drawerMenuItems.map((item) => {
            const Icon = item.icon;
            const isSelected =
              selectedDestination === item.destination ||
              location.pathname === item.path ||
              (item.path !== '/voice' && location.pathname.startsWith(item.path));

            return (
              <NavLink
                key={item.destination}
                to={item.path}
                onClick={onClose}
                className="block mx-3 my-0.5"
              >
                <div
                  className={cn(
                    'flex items-center gap-4 px-4 py-3.5 rounded-xl transition-colors',
                    isSelected
                      ? 'bg-[#6F42C1]/15 text-[#6F42C1] border border-[#6F42C1]/30'
                      : 'text-gray-700 hover:bg-gray-50'
                  )}
                >
                  <Icon className={cn('w-5 h-5', isSelected ? 'text-[#6F42C1]' : 'text-gray-500')} />
                  <span className={cn('text-[15px]', isSelected ? 'font-semibold' : 'font-medium')}>
                    {item.name}
                  </span>
                </div>
              </NavLink>
            );
          })}
        </nav>
      </motion.aside>
    </>
  );
}
