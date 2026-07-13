'use client';

import React from 'react';
import { Bell, HelpCircle, Search, ChevronRight, LogOut } from 'lucide-react';
import { useSelector } from 'react-redux';
import { RootState } from '../../store';
import { useAuth } from '../../providers/AuthProvider';

interface TopbarProps {
  title?: string;
  breadcrumbs?: Array<{ label: string; href?: string }>;
}

export default function Topbar({ title, breadcrumbs }: TopbarProps) {
  const { user, logout } = useAuth();
  const activeCalculator = useSelector((state: RootState) => {
    const list = state.calculator.calculators;
    const activeId = state.calculator.activeCalculatorId;
    return list.find(c => c.id === activeId);
  });

  return (
    <header className="h-14 border-b border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 flex items-center justify-between px-6 select-none shrink-0">
      {/* Breadcrumbs / Title */}
      <div className="flex items-center gap-2 text-xs font-medium text-zinc-500">
        {breadcrumbs ? (
          breadcrumbs.map((crumb, idx) => (
            <React.Fragment key={crumb.label}>
              {idx > 0 && <ChevronRight className="h-3.5 w-3.5 text-zinc-400" />}
              {crumb.href ? (
                <span className="hover:text-zinc-900 dark:hover:text-zinc-200 cursor-pointer transition-colors">
                  {crumb.label}
                </span>
              ) : (
                <span className="text-zinc-900 dark:text-zinc-50 font-semibold">
                  {crumb.label}
                </span>
              )}
            </React.Fragment>
          ))
        ) : (
          <span className="text-zinc-900 dark:text-zinc-50 font-semibold text-sm">
            {title || (activeCalculator ? activeCalculator.name : 'Calcoster360')}
          </span>
        )}
      </div>

      {/* Search & Actions */}
      <div className="flex items-center gap-4">
        {/* Search Input */}
        <div className="relative w-64 md:w-80 max-w-xs md:max-w-md hidden sm:block">
          <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-zinc-400" />
          <input
            type="text"
            placeholder="Search cost fields, calculators... (⌘K)"
            className="w-full h-8 pl-9 pr-8 text-xs bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-colors text-zinc-900 dark:text-zinc-100"
          />
          <kbd className="absolute right-2.5 top-2 h-4 px-1.5 text-[9px] font-sans font-medium bg-zinc-200/50 dark:bg-zinc-800 text-zinc-500 dark:text-zinc-400 rounded flex items-center border border-zinc-300/40 dark:border-zinc-700/60">
            ⌘K
          </kbd>
        </div>

        {/* Action Buttons */}
        <button className="text-zinc-500 dark:text-zinc-400 hover:text-zinc-800 dark:hover:text-zinc-200 p-1.5 hover:bg-zinc-100 dark:hover:bg-zinc-800/60 rounded-lg transition-colors">
          <HelpCircle className="h-4 w-4" />
        </button>

        {/* Notifications */}
        <button className="relative text-zinc-500 dark:text-zinc-400 hover:text-zinc-800 dark:hover:text-zinc-200 p-1.5 hover:bg-zinc-100 dark:hover:bg-zinc-800/60 rounded-lg transition-colors">
          <Bell className="h-4 w-4" />
          <span className="absolute top-1 right-1 w-2 h-2 bg-primary rounded-full ring-2 ring-white dark:ring-zinc-950"></span>
        </button>

        {/* Divider */}
        <div className="h-5 w-[1px] bg-zinc-200 dark:bg-zinc-800"></div>

        {/* User Card */}
        {user && (
          <div className="flex items-center gap-3 pl-1.5">
            <div className="flex items-center gap-2.5">
              <img
                src={user.photoURL || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=100"}
                alt={user.displayName || "User"}
                className="w-7 h-7 rounded-full border border-zinc-200 dark:border-zinc-750 object-cover"
              />
              <div className="hidden md:block leading-none text-left">
                <span className="block text-xs font-semibold text-zinc-900 dark:text-zinc-50">
                  {user.displayName || 'Google User'}
                </span>
                <span className="text-[9px] text-zinc-400 font-medium max-w-[120px] truncate block mt-0.5">
                  {user.email}
                </span>
              </div>
            </div>
            
            <button
              onClick={logout}
              title="Sign Out"
              className="text-zinc-400 hover:text-red-500 hover:bg-red-500/5 p-1.5 rounded-lg transition-colors cursor-pointer border border-transparent hover:border-red-500/10"
            >
              <LogOut className="h-3.5 w-3.5" />
            </button>
          </div>
        )}
      </div>
    </header>
  );
}
