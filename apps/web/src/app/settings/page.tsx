'use client';

import React, { useState } from 'react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import { useAuth } from '../../providers/AuthProvider';
import {
  Settings as SettingsIcon,
  Users,
  CreditCard,
  Building,
  Mail,
  ShieldAlert,
  Save
} from 'lucide-react';

export default function SettingsPage() {
  const { user } = useAuth();
  const [activeSettingsTab, setActiveSettingsTab] = useState<'general' | 'team' | 'subscription'>('general');

  // General settings state
  const [companyName, setCompanyName] = useState('Calcoster360 Inc.');
  const [companyEmail, setCompanyEmail] = useState('billing@calcoster360.com');
  const [currency, setCurrency] = useState('INR');

  return (
    <DashboardLayout title="Settings">
      <div className="bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-5 md:p-6 h-full flex flex-col overflow-y-auto select-none text-left">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-zinc-200 dark:border-zinc-850 pb-5 mb-5 shrink-0">
          <div>
            <h2 className="text-xs font-bold text-zinc-900 dark:text-zinc-50">Settings & Workspace Config</h2>
            <p className="text-[10px] text-zinc-400 font-medium">Manage members, company billing defaults, and dashboard preferences.</p>
          </div>
        </div>

        {/* Settings Tab Selector */}
        <div className="flex gap-1.5 border-b border-zinc-100 dark:border-zinc-850 pb-4 mb-6 shrink-0">
          {[
            { id: 'general', name: 'General', icon: Building },
            { id: 'team', name: 'Team Members', icon: Users },
            { id: 'subscription', name: 'Subscription', icon: CreditCard }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveSettingsTab(tab.id as any)}
              className={`h-7 px-3 text-xs font-semibold rounded-lg flex items-center gap-1.5 transition-colors cursor-pointer ${
                activeSettingsTab === tab.id
                  ? 'bg-primary text-primary-foreground'
                  : 'text-zinc-500 hover:bg-zinc-50 dark:hover:bg-zinc-900 hover:text-zinc-900'
              }`}
            >
              <tab.icon className="h-3.5 w-3.5" />
              {tab.name}
            </button>
          ))}
        </div>

        {/* Tab Contents */}
        <div className="max-w-md space-y-4">
          {activeSettingsTab === 'general' && (
            <div className="space-y-4">
              {/* Company Name */}
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">Company Name</label>
                <input
                  type="text"
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  className="w-full h-8 px-3 border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 rounded-lg text-xs focus:outline-none focus:ring-1 focus:ring-primary text-zinc-900 dark:text-zinc-100"
                />
              </div>

              {/* Billing Email */}
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">Billing Email</label>
                <input
                  type="email"
                  value={companyEmail}
                  onChange={(e) => setCompanyEmail(e.target.value)}
                  className="w-full h-8 px-3 border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 rounded-lg text-xs focus:outline-none focus:ring-1 focus:ring-primary text-zinc-900 dark:text-zinc-100"
                />
              </div>

              {/* Primary Currency */}
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">Default Currency</label>
                <select
                  value={currency}
                  onChange={(e) => setCurrency(e.target.value)}
                  className="w-full h-8 px-2 border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 rounded-lg text-xs focus:outline-none focus:ring-1 focus:ring-primary text-zinc-900 dark:text-zinc-100 font-semibold"
                >
                  <option value="INR">INR (₹)</option>
                  <option value="USD">USD ($)</option>
                  <option value="EUR">EUR (€)</option>
                </select>
              </div>

              <button className="h-8 px-4 bg-primary hover:bg-primary-hover text-white text-xs font-semibold rounded-lg flex items-center gap-1.5 mt-2">
                <Save className="h-3.5 w-3.5" /> Save Configuration
              </button>
            </div>
          )}

          {activeSettingsTab === 'team' && (
            <div className="space-y-4">
              <div className="flex justify-between items-center pb-2 border-b border-zinc-100 dark:border-zinc-900">
                <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">Members (1)</span>
                <button className="h-7 px-2.5 bg-zinc-50 border border-zinc-200 hover:bg-zinc-100 text-[10px] font-bold rounded-lg text-zinc-700">
                  Invite Member
                </button>
              </div>

              <div className="space-y-1">
                <div className="flex items-center justify-between p-3 bg-zinc-50/50 dark:bg-zinc-900/10 border border-zinc-200/50 dark:border-zinc-800 rounded-xl text-xs">
                  <div className="flex items-center gap-2.5">
                    <img
                      src={user?.photoURL || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=100"}
                      alt={user?.displayName || "User"}
                      className="w-7 h-7 rounded-full object-cover"
                    />
                    <div className="leading-none text-left">
                      <span className="font-bold text-zinc-800 dark:text-zinc-200">{user?.displayName || 'Amit Kumar'}</span>
                      <span className="block text-[9px] text-zinc-400 mt-1 font-medium">{user?.email || 'amit@calcoster360.com'}</span>
                    </div>
                  </div>
                  <span className="text-[10px] bg-primary/10 text-primary px-2 py-0.5 rounded font-bold uppercase">Owner</span>
                </div>
              </div>
            </div>
          )}

          {activeSettingsTab === 'subscription' && (
            <div className="space-y-4 border border-zinc-200 dark:border-zinc-850 p-5 rounded-2xl bg-zinc-50/20 dark:bg-zinc-900/10">
              <div className="flex justify-between items-start">
                <div className="text-left">
                  <span className="text-xs font-bold text-zinc-800 dark:text-zinc-200">Professional Subscription</span>
                  <span className="block text-[10px] text-zinc-400 mt-1 font-medium">Billed monthly (Renewing on July 31, 2026)</span>
                </div>
                <span className="text-[10px] bg-green-500/10 text-green-500 px-2 py-0.5 rounded font-bold uppercase">Active</span>
              </div>

              <div className="mt-4 pt-4 border-t border-zinc-200 dark:border-zinc-800 flex justify-between items-center text-xs shrink-0 font-semibold">
                <span className="text-zinc-500">Workspace Usage:</span>
                <span className="text-zinc-800 dark:text-zinc-200">25 of 50 active calculators</span>
              </div>

              <button className="w-full h-8 bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700/80 text-xs font-bold rounded-lg text-zinc-800 dark:text-zinc-200 transition-colors">
                Manage Billing In Stripe
              </button>
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
