'use client';

import React from 'react';
import Link from 'next/link';
import { Calculator, ArrowRight, ShieldCheck, Sparkles, Database, Layers } from 'lucide-react';
import { useAuth } from '../providers/AuthProvider';

export default function MarketingLandingPage() {
  const { user } = useAuth();
  return (
    <div className="dark min-h-screen bg-zinc-950 text-white flex flex-col justify-between select-none relative overflow-hidden">
      {/* Background radial gradients for Vercel/Linear feel */}
      <div className="absolute inset-0 bg-[radial-gradient(#334155_1px,transparent_1px)] [background-size:24px_24px] opacity-25 pointer-events-none"></div>
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-primary/10 rounded-full blur-[120px] pointer-events-none"></div>

      {/* Header */}
      <header className="h-16 border-b border-zinc-900 bg-zinc-950/80 backdrop-blur-md flex items-center justify-between px-6 md:px-12 relative z-10">
        <div className="flex items-center gap-2.5">
          <img src="/logo.png" alt="Calcoster360 Logo" className="h-6 w-6 object-contain rounded-md shadow-sm" />
          <span className="font-bold text-sm tracking-tight">Calcoster360</span>
        </div>
        <Link
          href={user ? "/dashboard" : "/login"}
          className="h-8 px-4 bg-primary hover:bg-primary-hover text-white text-xs font-semibold rounded-lg flex items-center justify-center gap-1.5 transition-colors shadow-sm cursor-pointer"
        >
          {user ? "Console" : "Sign In"} <ArrowRight className="h-3.5 w-3.5" />
        </Link>
      </header>

      {/* Hero Section */}
      <main className="flex-1 flex flex-col items-center justify-center text-center px-6 max-w-4xl mx-auto py-12 relative z-10 space-y-8">
        <div className="space-y-4">
          <span className="px-3 py-1 bg-zinc-900 text-zinc-400 border border-zinc-800 rounded-full text-[10px] font-bold tracking-wide uppercase inline-flex items-center gap-1.5">
            <Sparkles className="h-3 w-3 text-primary animate-pulse" />
            Next-Gen Calculator Builder
          </span>

          <h1 className="text-3xl sm:text-5xl font-black tracking-tight text-white leading-tight">
            Build Any Cost Calculator.<br />
            <span className="text-primary bg-clip-text">Reuse Everywhere.</span>
          </h1>

          <p className="text-xs sm:text-sm text-zinc-400 max-w-lg mx-auto font-medium leading-relaxed">
            Calcoster360 is the no-code Cost Calculator Builder that helps manufacturing, construction, print shops, and digital agencies visually build costing logic and compile custom quotations instantly.
          </p>
        </div>

        {/* CTA buttons */}
        <div className="flex flex-col sm:flex-row items-center gap-3 justify-center shrink-0">
          <Link
            href={user ? "/dashboard" : "/login"}
            className="w-full sm:w-auto h-10 px-6 bg-primary hover:bg-primary-hover text-white text-xs font-semibold rounded-lg flex items-center justify-center gap-2 shadow-lg transition-colors cursor-pointer"
          >
            {user ? "Go to Console" : "Get Started For Free"} <ArrowRight className="h-4 w-4" />
          </Link>
          <a
            href="https://github.com"
            target="_blank"
            rel="noreferrer"
            className="w-full sm:w-auto h-10 px-5 border border-zinc-800 bg-zinc-900/50 hover:bg-zinc-900 hover:text-white text-xs font-semibold rounded-lg flex items-center justify-center gap-2 text-zinc-400 transition-colors"
          >
            Documentation
          </a>
        </div>

        {/* Features preview */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-12 max-w-3xl w-full">
          <div className="bg-zinc-900/40 border border-zinc-900 p-5 rounded-2xl text-left space-y-2">
            <div className="bg-primary/10 text-primary p-2 w-fit rounded-lg"><Layers className="h-4 w-4" /></div>
            <h4 className="text-xs font-bold text-white">Visual Cost Builder</h4>
            <p className="text-[11px] text-zinc-400 font-medium leading-relaxed">
              Drag-and-drop or select-and-add cost blocks, configure formulas, and build logic without spreadsheets or code.
            </p>
          </div>
          <div className="bg-zinc-900/40 border border-zinc-900 p-5 rounded-2xl text-left space-y-2">
            <div className="bg-primary/10 text-primary p-2 w-fit rounded-lg"><Database className="h-4 w-4" /></div>
            <h4 className="text-xs font-bold text-white">Cost Library Database</h4>
            <p className="text-[11px] text-zinc-400 font-medium leading-relaxed">
              Create global, reusable shared fields. Modify a single library rate to update all calculators in real-time.
            </p>
          </div>
          <div className="bg-zinc-900/40 border border-zinc-900 p-5 rounded-2xl text-left space-y-2">
            <div className="bg-primary/10 text-primary p-2 w-fit rounded-lg"><ShieldCheck className="h-4 w-4" /></div>
            <h4 className="text-xs font-bold text-white">Quotation Composer</h4>
            <p className="text-[11px] text-zinc-400 font-medium leading-relaxed">
              Run cost calculations with dynamic parameters, load custom profiles, and output print-ready customer quotes.
            </p>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="h-12 border-t border-zinc-900 flex items-center justify-between px-6 md:px-12 text-[10px] text-zinc-500 font-semibold relative z-10 shrink-0">
        <span>© 2026 Calcoster360 Inc. All rights reserved.</span>
        <div className="flex gap-4">
          <span className="hover:text-zinc-300 cursor-pointer">Privacy Policy</span>
          <span className="hover:text-zinc-300 cursor-pointer">Terms of Service</span>
        </div>
      </footer>
    </div>
  );
}
