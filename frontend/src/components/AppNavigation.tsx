import React from 'react';
import { Link, useLocation } from 'react-router-dom';

const navItems = [
  { label: 'Customer View', path: '/' },
  { label: 'Admin View', path: '/admin' },
];

export const AppNavigation: React.FC = () => {
  const location = useLocation();

  return (
    <nav className="flex justify-center mb-8">
      <div className="inline-flex items-center gap-3 bg-gray-800/50 border border-gray-700 rounded-full px-4 py-2">
        {navItems.map((item) => {
          const isActive =
            item.path === '/'
              ? location.pathname === item.path
              : location.pathname.startsWith(item.path);

          return (
            <Link
              key={item.path}
              to={item.path}
              className={`px-4 py-1.5 text-sm font-medium rounded-full border transition-all duration-200 ${
                isActive
                  ? 'bg-green-500/10 border-green-500 text-green-300'
                  : 'bg-gray-900/60 border-transparent text-gray-300 hover:text-gray-100'
              }`}
            >
              {item.label}
            </Link>
          );
        })}
      </div>
    </nav>
  );
};

