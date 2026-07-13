'use client';

import React, { useEffect } from 'react';
import Sidebar from './Sidebar';
import Topbar from './Topbar';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { LayoutDashboard, Calculator, Library, MoreHorizontal, Loader2 } from 'lucide-react';
import { useAuth } from '../../providers/AuthProvider';

interface DashboardLayoutProps {
  children: React.ReactNode;
  breadcrumbs?: Array<{ label: string; href?: string }>;
  title?: string;
}

export default function DashboardLayout({ children, breadcrumbs, title }: DashboardLayoutProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, loading } = useAuth();

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    }
  }, [user, loading, router]);

  const mobileNav = [
    { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
    { name: 'Calculators', href: '/cost-calculators', icon: Calculator },
    { name: 'Library', href: '/cost-library', icon: Library },
    { name: 'Settings', href: '/settings', icon: MoreHorizontal },
  ];

  if (loading || !user) {
    return (
      <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 flex items-center justify-center select-none">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-background text-foreground">
      {/* Sidebar for Desktop */}
      <Sidebar className="hidden md:flex shrink-0" />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden relative">
        <Topbar breadcrumbs={breadcrumbs} title={title} />

        <main className="flex-1 overflow-y-auto bg-zinc-50 dark:bg-zinc-950 p-4 md:p-6 pb-20 md:pb-6">
          {children}
        </main>

        {/* Bottom Tab Bar for Mobile */}
        <nav className="md:hidden fixed bottom-0 left-0 right-0 h-16 border-t border-zinc-200 dark:border-zinc-800 bg-white/95 dark:bg-zinc-900/95 backdrop-blur-md flex items-center justify-around z-50">
          {mobileNav.map((item) => {
            const active = pathname.startsWith(item.href);
            return (
              <Link
                key={item.name}
                href={item.href}
                className={`flex flex-col items-center justify-center gap-1 w-16 h-full transition-colors ${
                  active ? 'text-primary' : 'text-zinc-400 dark:text-zinc-500 hover:text-zinc-600'
                }`}
              >
                <item.icon className="h-5 w-5" />
                <span className="text-[10px] font-semibold">{item.name}</span>
              </Link>
            );
          })}
        </nav>
      </div>
    </div>
  );
}
