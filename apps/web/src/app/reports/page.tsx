'use client';

import React from 'react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import {
  TrendingUp,
  BarChart3,
  Percent,
  DollarSign,
  ArrowUpRight,
  ShieldCheck,
  Zap
} from 'lucide-react';

export default function ReportsPage() {
  const metrics = [
    { name: 'Average Profit Margin', val: '17.4%', change: '+1.2%', icon: Percent, color: 'text-rose-500 bg-rose-500/10' },
    { name: 'Material Expense Ratio', val: '43.2%', change: '-2.4%', icon: TrendingUp, color: 'text-emerald-500 bg-emerald-500/10' },
    { name: 'Total Calculation Volume', val: '148 Runs', change: '+18.6%', icon: BarChart3, color: 'text-primary bg-primary/10' },
    { name: 'Quoted Revenue Value', val: '₹38.5k', change: '+9.4%', icon: DollarSign, color: 'text-amber-500 bg-amber-500/10' }
  ];

  return (
    <DashboardLayout title="Reports">
      <div className="space-y-6 text-left select-none">
        {/* Header Hero */}
        <div className="bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-5 md:p-6 shadow-sm">
          <h1 className="text-xs font-bold text-zinc-900 dark:text-zinc-50">Cost & Margin Reports</h1>
          <p className="text-[10px] text-zinc-400 mt-1 font-medium">Detailed breakdown of material cost allocations, labour yields, and quotation margins.</p>
        </div>

        {/* Metrics Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {metrics.map((metric, idx) => (
            <div key={idx} className="bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-4 flex items-center gap-4 shadow-sm hover:shadow-md transition-shadow">
              <div className={`p-3 rounded-xl ${metric.color}`}>
                <metric.icon className="h-5 w-5" />
              </div>
              <div className="leading-none text-left">
                <span className="text-[10px] uppercase font-bold text-zinc-400 tracking-wider">{metric.name}</span>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-base font-extrabold text-zinc-900 dark:text-zinc-50">{metric.val}</span>
                  <span className={`text-[9px] font-bold ${metric.change.startsWith('+') ? 'text-emerald-600' : 'text-red-500'}`}>
                    {metric.change}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Breakdown Charts Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Radial Cost Breakdown */}
          <div className="bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-5 shadow-sm">
            <h3 className="text-xs font-bold text-zinc-900 dark:text-zinc-50 border-b border-zinc-100 dark:border-zinc-850 pb-3 mb-4">
              Cost Allocation Breakdown
            </h3>
            <div className="flex flex-col sm:flex-row items-center justify-around gap-6 py-4">
              {/* Radial donut chart using SVGs */}
              <div className="relative h-32 w-32 shrink-0">
                <svg className="h-full w-full" viewBox="0 0 36 36">
                  {/* Background track */}
                  <path className="text-zinc-100 dark:text-zinc-850" strokeWidth="3" stroke="currentColor" fill="none" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
                  {/* Material segment (43.2%) */}
                  <path className="text-emerald-500" strokeWidth="3" strokeDasharray="43, 100" strokeLinecap="round" stroke="currentColor" fill="none" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831" />
                  {/* Labour segment (25%) */}
                  <path className="text-purple-500" strokeWidth="3" strokeDasharray="25, 100" strokeDashoffset="-43" strokeLinecap="round" stroke="currentColor" fill="none" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831" />
                  {/* Taxes segment (18%) */}
                  <path className="text-violet-500" strokeWidth="3" strokeDasharray="18, 100" strokeDashoffset="-68" strokeLinecap="round" stroke="currentColor" fill="none" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831" />
                  {/* Profits segment (14%) */}
                  <path className="text-rose-500" strokeWidth="3" strokeDasharray="14, 100" strokeDashoffset="-86" strokeLinecap="round" stroke="currentColor" fill="none" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831" />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                  <span className="text-[10px] text-zinc-400 font-bold uppercase">Expense</span>
                  <span className="text-sm font-extrabold text-zinc-800 dark:text-zinc-50">₹32,540</span>
                </div>
              </div>

              {/* Legends */}
              <div className="space-y-2 text-xs font-semibold w-full max-w-[200px]">
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-1.5 text-zinc-550 dark:text-zinc-450">
                    <span className="h-2.5 w-2.5 bg-emerald-500 rounded-sm"></span> Material
                  </span>
                  <span className="text-zinc-800 dark:text-zinc-200">43.2%</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-1.5 text-zinc-550 dark:text-zinc-450">
                    <span className="h-2.5 w-2.5 bg-purple-500 rounded-sm"></span> Labour
                  </span>
                  <span className="text-zinc-800 dark:text-zinc-200">25.0%</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-1.5 text-zinc-550 dark:text-zinc-450">
                    <span className="h-2.5 w-2.5 bg-violet-500 rounded-sm"></span> Taxes
                  </span>
                  <span className="text-zinc-800 dark:text-zinc-200">18.0%</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-1.5 text-zinc-550 dark:text-zinc-450">
                    <span className="h-2.5 w-2.5 bg-rose-500 rounded-sm"></span> Profit
                  </span>
                  <span className="text-zinc-800 dark:text-zinc-200">13.8%</span>
                </div>
              </div>
            </div>
          </div>

          {/* Line Chart */}
          <div className="bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-5 shadow-sm">
            <h3 className="text-xs font-bold text-zinc-900 dark:text-zinc-50 border-b border-zinc-100 dark:border-zinc-850 pb-3 mb-4">
              Margin Trend Over Time
            </h3>
            {/* Custom SVG Line Chart */}
            <div className="h-32 w-full pt-4">
              <svg className="w-full h-full" viewBox="0 0 100 30" preserveAspectRatio="none">
                {/* Background Grid Lines */}
                <line x1="0" y1="10" x2="100" y2="10" stroke="#f1f5f9" className="dark:stroke-zinc-800" strokeWidth="0.3" />
                <line x1="0" y1="20" x2="100" y2="20" stroke="#f1f5f9" className="dark:stroke-zinc-800" strokeWidth="0.3" />
                {/* Line Path */}
                <path d="M 0 25 Q 15 15 30 18 T 60 10 T 90 5 L 100 8" fill="none" stroke="var(--color-primary)" strokeWidth="1" strokeLinecap="round" />
                {/* Gradient Fill under Path */}
                <path d="M 0 25 Q 15 15 30 18 T 60 10 T 90 5 L 100 8 L 100 30 L 0 30 Z" fill="url(#line-gradient)" className="opacity-15" />
                <defs>
                  <linearGradient id="line-gradient" x1="0%" y1="0%" x2="0%" y2="100%">
                    <stop offset="0%" stopColor="var(--color-primary)" />
                    <stop offset="100%" stopColor="transparent" />
                  </linearGradient>
                </defs>
              </svg>
            </div>
            <div className="flex justify-between items-center text-[10px] text-zinc-500 font-semibold mt-2.5 px-1.5">
              <span>May</span>
              <span>Jun</span>
              <span>Jul</span>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
