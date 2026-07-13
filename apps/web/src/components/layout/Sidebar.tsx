'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Layers,
  Library,
  FileText,
  BarChart3,
  ShoppingBag,
  Users,
  Settings,
  CreditCard,
  Calculator,
  Compass
} from 'lucide-react';

interface SidebarProps {
  className?: string;
}

export default function Sidebar({ className = '' }: SidebarProps) {
  const pathname = usePathname();

  const mainNav = [
    { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
    { name: 'Cost Calculators', href: '/cost-calculators', icon: Calculator },
    { name: 'Templates', href: '/templates', icon: Layers },
    { name: 'Cost Library', href: '/cost-library', icon: Library },
    { name: 'Quotations', href: '/quotations', icon: FileText },
    { name: 'Reports', href: '/reports', icon: BarChart3 },
    { name: 'Marketplace', href: '/marketplace', icon: ShoppingBag },
  ];

  const settingsNav = [
    { name: 'Team', href: '/settings/team', icon: Users },
    { name: 'Settings', href: '/settings', icon: Settings },
    { name: 'Subscription', href: '/settings/subscription', icon: CreditCard },
  ];

  const isActive = (href: string) => {
    if (href === '/cost-calculators' && pathname.startsWith('/cost-calculators')) {
      return true;
    }
    return pathname === href;
  };

  return (
    <aside className={`w-64 border-r border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/50 flex flex-col h-full select-none ${className}`}>
      {/* Logo */}
      <div className="h-14 border-b border-zinc-200 dark:border-zinc-800 flex items-center px-6 gap-2.5">
        <img src="/logo.png" alt="Calcoster360 Logo" className="h-6 w-6 object-contain rounded-md shadow-sm" />
        <div>
          <span className="font-bold text-sm tracking-tight text-zinc-900 dark:text-zinc-50">Calcoster360</span>
          <span className="block text-[10px] text-zinc-500 font-medium -mt-1">Smart Cost Calculator</span>
        </div>
      </div>

      {/* Nav Content */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-6">
        {/* Main Sections */}
        <div className="space-y-1">
          {mainNav.map((item) => {
            const active = isActive(item.href);
            return (
              <Link
                key={item.name}
                href={item.href}
                className={`flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-medium transition-colors ${
                  active
                    ? 'bg-primary text-primary-foreground font-semibold shadow-sm'
                    : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800/60'
                }`}
              >
                <item.icon className="h-4 w-4 shrink-0" />
                {item.name}
              </Link>
            );
          })}
        </div>

        {/* Settings Division */}
        <div className="space-y-1">
          <span className="px-3 text-[10px] uppercase font-bold text-zinc-400 tracking-wider">Settings</span>
          <div className="mt-2 space-y-1">
            {settingsNav.map((item) => {
              const active = isActive(item.href);
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-medium transition-colors ${
                    active
                      ? 'bg-primary text-primary-foreground font-semibold shadow-sm'
                      : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800/60'
                  }`}
                >
                  <item.icon className="h-4 w-4 shrink-0" />
                  {item.name}
                </Link>
              );
            })}
          </div>
        </div>
      </div>

      {/* Plan Banner */}
      <div className="p-4 border-t border-zinc-200 dark:border-zinc-800">
        <div className="bg-white dark:bg-zinc-900 p-4 rounded-xl border border-zinc-200 dark:border-zinc-800 shadow-sm">
          <div className="flex items-center justify-between text-xs font-bold mb-1">
            <span className="text-zinc-800 dark:text-zinc-200 flex items-center gap-1.5">
              👑 Professional Plan
            </span>
          </div>
          <div className="text-[10px] text-zinc-500 mb-2">25 / 50 Calculators</div>
          <div className="w-full bg-zinc-100 dark:bg-zinc-800 h-1.5 rounded-full overflow-hidden mb-3">
            <div className="bg-primary h-full rounded-full" style={{ width: '50%' }}></div>
          </div>
          <button className="w-full py-1.5 px-3 bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700/80 transition-colors rounded-lg text-[10px] font-semibold text-zinc-800 dark:text-zinc-200 text-center">
            Upgrade Plan
          </button>
        </div>
      </div>
    </aside>
  );
}
