import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAppStore } from '@/store/useAppStore';

const navItems = [
  { name: 'Dashboard', path: '/' },
  { name: 'Trips', path: '/trips' },
  { name: 'Settings', path: '/settings' },
];

const Sidebar: React.FC = () => {
  const isSidebarOpen = useAppStore((state) => state.isSidebarOpen);
  const location = useLocation();

  return (
    <aside
      className={`fixed inset-y-0 left-0 z-30 flex w-64 flex-col border-r bg-background transition-transform duration-300 md:relative md:translate-x-0 ${
        isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
      }`}
    >
      {/* Cần khoảng trống phía trên ở mobile để không đè lên header nếu header fixed. 
          Tuy nhiên trong layout này header nằm bên phải sidebar, nên không cần pt-16 nếu sidebar full height */}
      <div className="flex h-16 items-center border-b px-6 md:hidden">
        <span className="font-bold text-lg">Menu</span>
      </div>
      <div className="flex-1 overflow-y-auto py-4 px-3">
        <nav className="space-y-1">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.name}
                to={item.path}
                className={`flex items-center rounded-md px-3 py-2 text-sm font-medium transition-colors ${
                  isActive
                    ? 'bg-primary text-primary-foreground shadow-sm'
                    : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                }`}
              >
                {item.name}
              </Link>
            );
          })}
        </nav>
      </div>
    </aside>
  );
};

export default Sidebar;
