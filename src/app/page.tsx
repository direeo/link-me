'use client';

import React from 'react';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/Button';

export default function HomePage() {
  const { isAuthenticated, isGuest, continueAsGuest, isLoading } = useAuth();

  const handleGuestMode = async () => {
    await continueAsGuest();
    window.location.href = '/chat';
  };

  return (
    <div className="min-h-screen relative overflow-hidden bg-[#0a0a0a] text-slate-200">
      
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 px-6 py-4 md:px-12 lg:px-24 flex items-center justify-between border-b border-[#262626] bg-[#0a0a0a]/90 backdrop-blur-sm">
        <div className="flex items-center gap-3 transition-all">
          <div className="w-8 h-8 rounded bg-white flex items-center justify-center">
            <span className="text-base font-black text-black">🔗</span>
          </div>
          <span className="text-lg font-bold tracking-tight text-white uppercase sm:block">LinkMe</span>
        </div>
        
        <div className="flex items-center gap-6">
          {!isLoading && (
            <>
              {isAuthenticated || isGuest ? (
                <Button variant="primary" size="sm" onClick={() => window.location.href = '/chat'}>
                  Dashboard
                </Button>
              ) : (
                <>
                  <Link href="/login" className="text-xs font-bold text-slate-500 hover:text-white transition-colors hidden sm:block">
                    SIGN IN
                  </Link>
                  <Button variant="primary" size="sm" onClick={() => window.location.href = '/signup'}>
                    CREATE ACCOUNT
                  </Button>
                </>
              )}
            </>
          )}
        </div>
      </nav>

      {/* Hero Section */}
      <main className="relative z-10 flex flex-col items-center justify-center px-6 pt-48 pb-32 md:pt-64 md:pb-48 text-center animate-in fade-in duration-700">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-[#262626] bg-[#111111] mb-10">
          <span className="w-1 h-1 rounded-full bg-emerald-500" />
          <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-500">Professional Learning Framework v2.1</span>
        </div>

        <h1 className="text-5xl md:text-[5.5rem] lg:text-[7rem] font-bold text-white leading-[0.9] tracking-tighter mb-10 uppercase max-w-5xl">
          Master any <br className="hidden md:block" />
          Skill. Fast.
        </h1>

        <p className="text-base md:text-lg text-slate-500 max-w-2xl leading-relaxed mb-14 font-medium italic">
          LinkMe converts millions of YouTube tutorials into structured, step-by-step learning paths tailored to your specific goals.
        </p>

        <div className="flex flex-col sm:flex-row items-center gap-3 w-full sm:w-auto">
          <Button 
            variant="primary" 
            size="lg" 
            className="w-full sm:w-auto min-w-[200px]"
            onClick={() => window.location.href = '/signup'}
          >
            Start Mastery Path
          </Button>
          <Button 
            variant="outline" 
            size="lg" 
            className="w-full sm:w-auto min-w-[200px]"
            onClick={handleGuestMode}
          >
            Preview Platform
          </Button>
        </div>
      </main>

      {/* Features Grid */}
      <section className="relative z-10 px-6 py-32 md:px-12 lg:px-24 border-t border-[#262626]">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="glass-card rounded-2xl p-10 flex flex-col justify-between h-[320px]">
             <div className="w-8 h-8 rounded bg-white/5 flex items-center justify-center text-lg">🎯</div>
             <div>
                <h3 className="text-lg font-bold text-white uppercase mb-4 tracking-tight">Smart Discovery</h3>
                <p className="text-sm text-slate-500 font-medium leading-relaxed">Our engine identifies the highest-quality tutorials for your specific level and learning goals.</p>
             </div>
          </div>

          <div className="glass-card rounded-2xl p-10 flex flex-col justify-between h-[320px]">
             <div className="w-8 h-8 rounded bg-white/5 flex items-center justify-center text-lg">🧱</div>
             <div>
                <h3 className="text-lg font-bold text-white uppercase mb-4 tracking-tight">Structured Curriculums</h3>
                <p className="text-sm text-slate-500 font-medium leading-relaxed">Every path is organized into sequential stages, ensuring a seamless flow from basics to expert techniques.</p>
             </div>
          </div>

          <div className="glass-card rounded-2xl p-10 flex flex-col justify-between h-[320px]">
             <div className="w-8 h-8 rounded bg-white/5 flex items-center justify-center text-lg">🔗</div>
             <div>
                <h3 className="text-lg font-bold text-white uppercase mb-4 tracking-tight">YouTube Integration</h3>
                <p className="text-sm text-slate-500 font-medium leading-relaxed">Seamlessly sync your personalized learning paths directly to your YouTube account as organized playlists.</p>
             </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 px-6 py-24 border-t border-[#262626] bg-[#0a0a0a]">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-10">
          <div className="flex items-center gap-3">
             <span className="text-xl">🔗</span>
             <span className="text-lg font-bold tracking-tighter text-white uppercase">LinkMe</span>
          </div>
          <p className="text-[10px] font-bold text-slate-800 uppercase tracking-widest">© 2026 LinkMe. All Rights Reserved.</p>
          <div className="flex gap-8">
             <Link href="/terms" className="text-[10px] font-bold text-slate-500 hover:text-white uppercase tracking-widest">Terms</Link>
             <Link href="/privacy" className="text-[10px] font-bold text-slate-500 hover:text-white uppercase tracking-widest">Privacy</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
