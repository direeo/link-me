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
    <div className="min-h-screen relative overflow-hidden selection:bg-violet-500/30 text-slate-200">
      
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 px-6 py-6 md:px-12 lg:px-24 flex items-center justify-between border-b border-white/5 bg-[#0a0a0a]/60 backdrop-blur-xl">
        <div className="flex items-center gap-3 transition-transform hover:scale-[1.02]">
          <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center shadow-2xl">
            <span className="text-xl font-black text-black">🔗</span>
          </div>
          <span className="text-xl font-bold tracking-tighter text-white uppercase sm:block">LinkMe</span>
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
      <main className="relative z-10 flex flex-col items-center justify-center px-6 pt-48 pb-32 md:pt-64 md:pb-48 text-center">
        <div className="inline-flex items-center gap-3 px-4 py-2 rounded-full border border-white/5 bg-white/5 mb-10 overflow-hidden relative">
          <div className="absolute inset-0 progress-shimmer opacity-20" />
          <span className="w-2 h-2 rounded-full bg-violet-500 shadow-[0_0_10px_rgba(139,92,246,0.5)]" />
          <span className="text-[10px] font-bold uppercase tracking-[0.3em] text-slate-400 relative z-10">Professional Learning v2.1</span>
        </div>

        <h1 className="text-5xl md:text-[6rem] lg:text-[8rem] font-bold text-white leading-[0.85] tracking-tighter mb-10 uppercase max-w-6xl">
          Master any <br className="hidden md:block" />
          Skill. Fast.
        </h1>

        <p className="text-base md:text-xl text-slate-400 max-w-2xl leading-relaxed mb-14 font-medium italic">
          LinkMe converts millions of YouTube tutorials into structured, step-by-step learning paths tailored to your specific goals.
        </p>

        <div className="flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto">
          <Button 
            variant="primary" 
            size="lg" 
            className="w-full sm:w-auto min-w-[240px] py-8 text-xs font-bold uppercase tracking-widest shadow-[0_20px_50px_rgba(139,92,246,0.3)]"
            onClick={() => window.location.href = '/signup'}
          >
            Start Mastery Path
          </Button>
          <Button 
            variant="outline" 
            size="lg" 
            className="w-full sm:w-auto min-w-[240px] py-8 text-xs font-bold uppercase tracking-widest border-white/10 hover:bg-white/5"
            onClick={handleGuestMode}
          >
            Preview Platform
          </Button>
        </div>
      </main>

      {/* Features Grid */}
      <section className="relative z-10 px-6 py-32 md:px-12 lg:px-24 border-t border-white/5 bg-[#0a0a0a]/40 backdrop-blur-md">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="glass-card rounded-3xl p-12 flex flex-col justify-between h-[400px]">
             <div className="w-12 h-12 rounded-xl bg-violet-500/10 flex items-center justify-center text-2xl border border-violet-500/20">🎯</div>
             <div>
                <h3 className="text-xl font-bold text-white uppercase mb-4 tracking-tight">Smart Discovery</h3>
                <p className="text-slate-400 leading-relaxed font-medium">LinkMe evaluates thousands of resources to identify the highest-quality tutorials for your specific level.</p>
             </div>
          </div>

          <div className="glass-card rounded-3xl p-12 flex flex-col justify-between h-[400px]">
             <div className="w-12 h-12 rounded-xl bg-blue-500/10 flex items-center justify-center text-2xl border border-blue-500/20">🧱</div>
             <div>
                <h3 className="text-xl font-bold text-white uppercase mb-4 tracking-tight">Structured Curriculums</h3>
                <p className="text-slate-400 leading-relaxed font-medium">Every path is organized into logical, sequential stages, ensuring a seamless flow from basics to expert techniques.</p>
             </div>
          </div>

          <div className="glass-card rounded-3xl p-12 flex flex-col justify-between h-[400px]">
             <div className="w-12 h-12 rounded-xl bg-pink-500/10 flex items-center justify-center text-2xl border border-pink-500/20">🔗</div>
             <div>
                <h3 className="text-xl font-bold text-white uppercase mb-4 tracking-tight">YouTube Integration</h3>
                <p className="text-slate-400 leading-relaxed font-medium">Seamlessly sync your personalized learning paths directly to your YouTube account as organized playlists.</p>
             </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 px-6 py-24 border-t border-white/5 bg-black/60">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-10">
          <div className="flex items-center gap-3">
             <span className="text-2xl">🔗</span>
             <span className="text-xl font-bold tracking-tighter text-white uppercase">LinkMe</span>
          </div>
          <p className="text-[10px] font-bold text-slate-700 uppercase tracking-widest">© 2026 LinkMe. REFRAMING GLOBAL LEARNING.</p>
          <div className="flex gap-8">
             <Link href="/terms" className="text-[10px] font-bold text-slate-700 hover:text-white uppercase tracking-widest transition-colors">Terms</Link>
             <Link href="/privacy" className="text-[10px] font-bold text-slate-700 hover:text-white uppercase tracking-widest transition-colors">Privacy</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
