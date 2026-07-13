'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../providers/AuthProvider';
import { Loader2 } from 'lucide-react';

export default function LoginPage() {
  const { user, loading, signInWithGoogle } = useAuth();
  const router = useRouter();
  const [signingIn, setSigningIn] = useState(false);

  useEffect(() => {
    if (!loading && user) {
      router.push('/dashboard');
    }
  }, [user, loading, router]);

  const handleSignIn = async () => {
    setSigningIn(true);
    try {
      await signInWithGoogle();
    } catch (error) {
      console.error(error);
    } finally {
      setSigningIn(false);
    }
  };

  if (loading || (user && !signingIn)) {
    return (
      <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 flex items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 flex items-center justify-center px-4 select-none">
      {/* Glow Effect */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[400px] h-[200px] bg-primary/5 rounded-full blur-[80px] pointer-events-none"></div>

      <div className="w-full max-w-sm bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-6 md:p-8 shadow-sm relative z-10 space-y-6">
        {/* Brand Header */}
        <div className="flex flex-col items-center text-center space-y-3">
          <img 
            src="/logo.png" 
            alt="Calcoster360 Logo" 
            className="h-10 w-10 object-contain rounded-xl shadow-md border border-zinc-200/50 dark:border-zinc-800" 
          />
          <div className="space-y-1">
            <h1 className="text-base font-black text-zinc-900 dark:text-zinc-50 tracking-tight">
              Welcome to Calcoster360
            </h1>
            <p className="text-[11px] text-zinc-400 font-medium max-w-[240px] mx-auto leading-normal">
              Visually build costing logic and compile custom quotations instantly.
            </p>
          </div>
        </div>

        {/* Action Button */}
        <div className="space-y-3 pt-2">
          <button
            onClick={handleSignIn}
            disabled={signingIn}
            className="w-full h-9 border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 hover:bg-zinc-50 dark:hover:bg-zinc-900/60 disabled:bg-zinc-50 dark:disabled:bg-zinc-950 transition-colors rounded-lg text-xs font-semibold text-zinc-800 dark:text-zinc-200 flex items-center justify-center gap-2 cursor-pointer shadow-sm"
          >
            {signingIn ? (
              <Loader2 className="h-4 w-4 animate-spin text-zinc-400" />
            ) : (
              <svg className="h-4 w-4 shrink-0" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" fill="#FBBC05"/>
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" fill="#EA4335"/>
              </svg>
            )}
            <span>{signingIn ? 'Signing in...' : 'Sign in with Google'}</span>
          </button>

          <div className="text-[10px] text-zinc-450 text-center font-medium leading-relaxed max-w-[260px] mx-auto">
            By signing in, you agree to our <span className="text-primary hover:underline cursor-pointer">Terms of Service</span> and <span className="text-primary hover:underline cursor-pointer">Privacy Policy</span>.
          </div>
        </div>
      </div>
    </div>
  );
}
