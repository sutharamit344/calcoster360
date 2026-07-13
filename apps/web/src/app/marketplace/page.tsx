'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { useDispatch } from 'react-redux';
import { addCalculator } from '../../store/slices/calculatorSlice';
import DashboardLayout from '../../components/layout/DashboardLayout';
import { ShoppingBag, ArrowUpRight, ShieldCheck, Heart, User } from 'lucide-react';

export default function MarketplacePage() {
  const dispatch = useDispatch();
  const router = useRouter();

  const marketplaceItems = [
    {
      id: 'market-1',
      name: 'Interior Designer Costing Sheet',
      author: 'Rohan Sharma',
      downloads: '1.2k',
      rating: '4.8',
      price: 'Free',
      description: 'Calculate site supervision, wall paints, MDF panel laminates, electrical fittings, and custom margin percentages.',
      industry: 'Construction & Decor'
    },
    {
      id: 'market-2',
      name: 'App Development Budget Estimator',
      author: 'Vercel Expert',
      downloads: '850',
      rating: '4.9',
      price: 'Free',
      description: 'Estimate hours for API integration, database architecture, design mockups, QA sessions, and server overhead margins.',
      industry: 'Software & Agencies'
    }
  ];

  const handleInstallMarketplaceItem = (item: typeof marketplaceItems[0]) => {
    dispatch(addCalculator({
      name: `${item.name} (Imported)`,
      industry: item.industry,
      description: item.description,
      blocks: [], // Start fresh or standard templates
      profiles: [],
      history: [],
      isActive: true,
      settings: {
        defaultCurrency: '₹',
        requireAllFields: false,
        allowCustomMargins: true
      },
      createdBy: item.author,
      updatedBy: 'Amit Kumar'
    }));

    router.push('/cost-calculators');
  };

  return (
    <DashboardLayout title="Marketplace">
      <div className="space-y-6 text-left select-none">
        {/* Header Hero */}
        <div className="bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-5 md:p-6 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-xs font-bold text-zinc-900 dark:text-zinc-50">Calcoster360 Marketplace</h1>
            <p className="text-[10px] text-zinc-400 mt-1 font-medium">Explore calculators developed by industry leaders. Download and customize instantly.</p>
          </div>
          <span className="text-[10px] bg-primary/10 text-primary border border-primary/20 px-2 py-1 rounded-lg font-bold flex items-center gap-1.5 shrink-0">
            <ShieldCheck className="h-3.5 w-3.5" /> Checked Safe
          </span>
        </div>

        {/* Listings Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {marketplaceItems.map(item => (
            <div key={item.id} className="bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-5 flex flex-col justify-between shadow-sm hover:shadow-md transition-shadow">
              <div className="space-y-3">
                <div className="flex justify-between items-start">
                  <span className="text-xs font-bold text-zinc-900 dark:text-zinc-50">{item.name}</span>
                  <span className="text-[10px] bg-green-500/10 text-green-500 px-2 py-0.5 rounded font-bold">{item.price}</span>
                </div>
                <div className="flex items-center gap-2 text-[10px] text-zinc-400 font-semibold">
                  <span className="flex items-center gap-0.5"><User className="h-3 w-3" /> By {item.author}</span>
                  <span>•</span>
                  <span>{item.downloads} downloads</span>
                  <span>•</span>
                  <span className="flex items-center gap-0.5"><Heart className="h-3 w-3 fill-rose-500 text-rose-500" /> {item.rating}</span>
                </div>
                <p className="text-[11px] text-zinc-550 leading-relaxed font-medium">{item.description}</p>
              </div>

              <div className="mt-5 pt-4 border-t border-zinc-100 dark:border-zinc-850 flex gap-2 shrink-0">
                <button
                  onClick={() => handleInstallMarketplaceItem(item)}
                  className="flex-1 h-8 bg-zinc-50 hover:bg-zinc-100 dark:bg-zinc-900 dark:hover:bg-zinc-800/80 border border-zinc-200 dark:border-zinc-850 text-xs font-semibold rounded-lg flex items-center justify-center gap-1 transition-colors cursor-pointer"
                >
                  Download & Customize <ArrowUpRight className="h-3.5 w-3.5 text-zinc-400" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </DashboardLayout>
  );
}
