'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../../store';
import { setActiveCalculatorId } from '../../store/slices/calculatorSlice';
import DashboardLayout from '../../components/layout/DashboardLayout';
import { useAuth } from '../../providers/AuthProvider';
import {
  Calculator,
  FileText,
  DollarSign,
  TrendingUp,
  ArrowUpRight,
  Clock,
  Layers,
  Sparkles,
  Star
} from 'lucide-react';

export default function DashboardPage() {
  const router = useRouter();
  const dispatch = useDispatch();
  const { user } = useAuth();
  const calculators = useSelector((state: RootState) => state.calculator.calculators);
  const fields = useSelector((state: RootState) => state.library.fields);
  const quotations = useSelector((state: RootState) => state.quotation.quotations);

  // Compute stats
  const totalCalcs = calculators.length;
  const totalQuotes = quotations.length;
  const approvedQuotes = quotations.filter(q => q.status === 'Approved');
  const totalValue = approvedQuotes.reduce((sum, q) => sum + q.totalCost, 0);

  const handleCalculatorClick = (id: string) => {
    dispatch(setActiveCalculatorId(id));
    router.push('/cost-calculators');
  };

  const getFirstName = () => {
    if (user?.displayName) {
      return user.displayName.split(' ')[0];
    }
    return 'Amit';
  };

  return (
    <DashboardLayout title="Dashboard">
      <div className="space-y-6 text-left select-none">
        {/* Welcome Banner */}
        <div className="bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-5 md:p-6 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-sm">
          <div>
            <h1 className="text-sm font-bold text-zinc-900 dark:text-zinc-50 flex items-center gap-1.5">
              Hello, {getFirstName()} 👋
            </h1>
            <p className="text-xs text-zinc-400 mt-1 font-medium">
              Here is what is happening across your cost calculators today.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] bg-primary/10 text-primary border border-primary/20 px-2 py-1 rounded-lg font-bold flex items-center gap-1">
              <Sparkles className="h-3 w-3 animate-spin" />
              AI Assistant Ready
            </span>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Card 1 */}
          <div className="bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-4 flex items-center gap-4 shadow-sm hover:shadow-md transition-shadow">
            <div className="p-3 bg-blue-500/10 text-blue-600 dark:text-blue-400 rounded-xl">
              <Calculator className="h-5 w-5" />
            </div>
            <div className="leading-none text-left">
              <span className="text-[10px] uppercase font-bold text-zinc-400 tracking-wider">Calculators</span>
              <span className="block text-lg font-extrabold text-zinc-900 dark:text-zinc-50 mt-1">{totalCalcs} Active</span>
            </div>
          </div>

          {/* Card 2 */}
          <div className="bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-4 flex items-center gap-4 shadow-sm hover:shadow-md transition-shadow">
            <div className="p-3 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 rounded-xl">
              <TrendingUp className="h-5 w-5" />
            </div>
            <div className="leading-none text-left">
              <span className="text-[10px] uppercase font-bold text-zinc-400 tracking-wider">Calculations</span>
              <span className="block text-lg font-extrabold text-zinc-900 dark:text-zinc-50 mt-1">28 Runs</span>
            </div>
          </div>

          {/* Card 3 */}
          <div className="bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-4 flex items-center gap-4 shadow-sm hover:shadow-md transition-shadow">
            <div className="p-3 bg-purple-500/10 text-purple-600 dark:text-purple-400 rounded-xl">
              <FileText className="h-5 w-5" />
            </div>
            <div className="leading-none text-left">
              <span className="text-[10px] uppercase font-bold text-zinc-400 tracking-wider">Quotations</span>
              <span className="block text-lg font-extrabold text-zinc-900 dark:text-zinc-50 mt-1">{totalQuotes} Generated</span>
            </div>
          </div>

          {/* Card 4 */}
          <div className="bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-4 flex items-center gap-4 shadow-sm hover:shadow-md transition-shadow">
            <div className="p-3 bg-amber-500/10 text-amber-600 dark:text-amber-400 rounded-xl">
              <DollarSign className="h-5 w-5" />
            </div>
            <div className="leading-none text-left">
              <span className="text-[10px] uppercase font-bold text-zinc-400 tracking-wider">Total Value</span>
              <span className="block text-lg font-extrabold text-zinc-900 dark:text-zinc-50 mt-1">
                ₹{(totalValue / 1000).toFixed(1)}k
              </span>
            </div>
          </div>
        </div>

        {/* Content Section Split */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Chart Card */}
          <div className="bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-5 lg:col-span-2 shadow-sm flex flex-col justify-between">
            <div className="flex items-center justify-between border-b border-zinc-100 dark:border-zinc-850 pb-3 mb-4">
              <h3 className="text-xs font-bold text-zinc-900 dark:text-zinc-50">Monthly Quotation Volume</h3>
              <span className="text-[10px] text-zinc-400 font-semibold">Updated 5m ago</span>
            </div>

            {/* Custom SVG Bar Chart */}
            <div className="h-44 w-full flex items-end justify-between px-2 pt-6">
              {[
                { month: 'Jan', val: 30 },
                { month: 'Feb', val: 45 },
                { month: 'Mar', val: 65 },
                { month: 'Apr', val: 55 },
                { month: 'May', val: 80 },
                { month: 'Jun', val: 95 },
                { month: 'Jul', val: 120 }
              ].map((item, idx) => (
                <div key={idx} className="flex flex-col items-center flex-1 group">
                  <span className="text-[9px] font-bold text-zinc-400 opacity-0 group-hover:opacity-100 transition-opacity mb-1.5">{item.val}</span>
                  <div
                    className="w-8 bg-zinc-100 dark:bg-zinc-900 hover:bg-primary dark:hover:bg-primary rounded-t-md transition-all duration-350 cursor-pointer"
                    style={{ height: `${(item.val / 120) * 110}px` }}
                  ></div>
                  <span className="text-[9px] text-zinc-500 font-semibold mt-2">{item.month}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Activity Log / Recent list */}
          <div className="bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-5 shadow-sm">
            <h3 className="text-xs font-bold text-zinc-900 dark:text-zinc-50 border-b border-zinc-100 dark:border-zinc-850 pb-3 mb-4">
              System Updates
            </h3>
            <div className="space-y-4">
              {[
                { text: 'Generated Quotation for Acme Corporates', time: '10m ago', icon: FileText },
                { text: 'Updated Ink Cost field in library', time: '2h ago', icon: Layers },
                { text: 'Restored Version 2 of Printing calculator', time: '1d ago', icon: Clock }
              ].map((act, idx) => (
                <div key={idx} className="flex gap-3 text-xs">
                  <div className="p-1 bg-zinc-50 dark:bg-zinc-900 rounded-lg h-7 w-7 flex items-center justify-center shrink-0 border border-zinc-100 dark:border-zinc-850">
                    <act.icon className="h-3.5 w-3.5 text-zinc-500" />
                  </div>
                  <div className="text-left leading-tight">
                    <span className="font-semibold text-zinc-800 dark:text-zinc-350">{act.text}</span>
                    <span className="block text-[9px] text-zinc-450 mt-1 font-medium">{act.time}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Bottom Split: Recent Calculators & Library Fields */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Recent Calculators */}
          <div className="bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-5 shadow-sm">
            <div className="flex justify-between items-center border-b border-zinc-100 dark:border-zinc-850 pb-3 mb-4">
              <h3 className="text-xs font-bold text-zinc-900 dark:text-zinc-50">Recent Calculators</h3>
              <span className="text-[10px] text-primary font-semibold hover:underline cursor-pointer">View All</span>
            </div>

            <div className="space-y-1">
              {calculators.slice(0, 3).map((calc) => (
                <div
                  key={calc.id}
                  onClick={() => handleCalculatorClick(calc.id)}
                  className="flex items-center justify-between p-2.5 hover:bg-zinc-50 dark:hover:bg-zinc-900/50 border border-transparent hover:border-zinc-200/50 dark:hover:border-zinc-800/40 rounded-xl cursor-pointer transition-all text-xs"
                >
                  <div className="flex items-center gap-2.5">
                    <div className="p-1.5 bg-primary/10 text-primary rounded-lg">
                      <Calculator className="h-4 w-4" />
                    </div>
                    <div className="leading-none text-left">
                      <span className="font-bold text-zinc-800 dark:text-zinc-200">{calc.name}</span>
                      <span className="block text-[10px] text-zinc-400 mt-1 font-semibold">{calc.industry}</span>
                    </div>
                  </div>
                  <ArrowUpRight className="h-4 w-4 text-zinc-400 hover:text-zinc-800" />
                </div>
              ))}
            </div>
          </div>

          {/* Frequently used Cost Fields */}
          <div className="bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-5 shadow-sm">
            <div className="flex justify-between items-center border-b border-zinc-100 dark:border-zinc-850 pb-3 mb-4">
              <h3 className="text-xs font-bold text-zinc-900 dark:text-zinc-50">Frequently Used Fields</h3>
              <span className="text-[10px] text-primary font-semibold hover:underline cursor-pointer">View Library</span>
            </div>

            <div className="space-y-1.5">
              {fields.slice(0, 3).map((field) => (
                <div
                  key={field.id}
                  className="flex items-center justify-between p-2.5 hover:bg-zinc-50 dark:hover:bg-zinc-900/50 border border-transparent hover:border-zinc-200/50 dark:hover:border-zinc-800/40 rounded-xl transition-all text-xs"
                >
                  <div className="flex items-center gap-2.5">
                    <div className="p-1.5 bg-zinc-100 dark:bg-zinc-850 rounded-lg text-zinc-650 dark:text-zinc-350">
                      <Star className="h-4 w-4 fill-amber-400 text-amber-400 shrink-0" />
                    </div>
                    <div className="leading-none text-left">
                      <span className="font-bold text-zinc-800 dark:text-zinc-200">{field.label}</span>
                      <span className="block text-[10px] text-zinc-400 mt-1 font-medium">{field.category} Cost</span>
                    </div>
                  </div>
                  <span className="text-[10px] text-zinc-500 font-bold bg-zinc-100 dark:bg-zinc-850 px-2 py-0.5 rounded">
                    {field.type === 'Percentage' ? `${field.defaultValue}%` : `₹${field.defaultValue}/${field.unit}`}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
