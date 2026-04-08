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
    <div className="min-h-screen relative overflow-hidden selection:bg-violet-600/30 text-white selection:text-white">
      
      {/* Navigation (Optimized Spacing) */}
      <nav className="fixed top-0 left-0 right-0 z-50 px-6 py-5 md:px-12 lg:px-24 flex items-center justify-between border-b border-white/5 bg-[#0a0a0a]/40 backdrop-blur-3xl">
        <div className="flex items-center gap-3 transition-transform hover:scale-[1.02]">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-white to-slate-200 flex items-center justify-center shadow-[0_0_20px_rgba(255,255,255,0.2)]">
            <span className="text-lg font-black text-black">🔗</span>
          </div>
          <span className="text-xl font-bold tracking-tighter text-white uppercase sm:block">LinkMe</span>
        </div>
        
        <div className="flex items-center gap-6">
          {!isLoading && (
            <>
              {isAuthenticated || isGuest ? (
                <Button variant="primary" size="sm" onClick={() => window.location.href = '/chat'} className="btn-premium px-5 h-10 font-black tracking-widest text-[10px]">
                  DASHBOARD
                </Button>
              ) : (
                <>
                  <Link href="/login" className="text-[10px] font-black text-slate-400 hover:text-white transition-colors hidden sm:block tracking-widest">
                    SIGN IN
                  </Link>
                  <Button variant="primary" size="sm" onClick={() => window.location.href = '/signup'} className="btn-premium px-5 h-10 font-black tracking-widest text-[10px]">
                    GET STARTED
                  </Button>
                </>
              )}
            </>
          )}
        </div>
      </nav>

      {/* Hero Section (Aired Out) */}
      <main className="relative z-10 flex flex-col items-center justify-center px-6 pt-56 pb-32 md:pt-72 md:pb-48 text-center animate-in fade-in zoom-in duration-1000">
        <div className="inline-flex items-center gap-3 px-5 py-2.5 rounded-full border border-white/10 bg-white/5 mb-12 overflow-hidden group">
           <div className="absolute inset-0 bg-gradient-to-r from-transparent via-violet-500/10 to-transparent animate-shimmer" />
          <span className="w-2 h-2 rounded-full bg-violet-500 shadow-[0_0_15px_rgba(139,92,246,1)] animate-pulse" />
          <span className="text-[9px] font-black uppercase tracking-[0.5em] text-slate-400 relative z-10">Professional Learning Path v2.1</span>
        </div>

        <h1 className="text-5xl md:text-[5rem] lg:text-[7rem] font-black text-white leading-[0.85] tracking-tighter mb-12 uppercase max-w-6xl [text-shadow:0_20px_50px_rgba(0,0,0,0.8)]">
          Master any <br className="hidden md:block" />
          Skill. Fast.
        </h1>

        <p className="text-base md:text-xl text-slate-400 max-w-2xl leading-relaxed mb-16 font-medium italic opacity-90 mx-auto">
          LinkMe synthesizes millions of tutorials into high-density, structured learning paths tailored to your exact professional goals.
        </p>

        <div className="flex flex-col sm:flex-row items-center gap-5 w-full sm:w-auto">
          <Button 
            variant="primary" 
            size="lg" 
            className="w-full sm:w-auto min-w-[240px] py-4 h-16 font-black tracking-widest btn-premium text-xs"
            onClick={() => window.location.href = '/signup'}
          >
            Start Mastery Path
          </Button>
          <Button 
            variant="outline" 
            size="lg" 
            className="w-full sm:w-auto min-w-[240px] py-4 h-16 font-black tracking-widest border-white/20 hover:bg-white/5 transition-all text-xs"
            onClick={handleGuestMode}
          >
            Preview Platform
          </Button>
        </div>
      </main>

      {/* Grid Section (Balanced Cards) */}
      <section className="relative z-10 px-6 py-40 md:px-12 lg:px-24 border-t border-white/10 bg-[#050505]/60 backdrop-blur-3xl">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="glass-card p-12 h-[420px] flex flex-col justify-between group">
             <div className="w-16 h-16 rounded-3xl bg-violet-600/10 flex items-center justify-center text-3xl border border-violet-600/20 group-hover:bg-violet-600/30 transition-all shadow-xl shadow-violet-600/20">🎯</div>
             <div>
                <h3 className="text-xl font-black text-white uppercase mb-4 tracking-tighter">Smart Discovery</h3>
                <p className="text-slate-400 leading-relaxed font-semibold italic text-sm">Advanced engine evaluating tutorials to identify the highest-fidelity mastery resources.</p>
             </div>
          </div>

          <div className="glass-card p-12 h-[420px] flex flex-col justify-between group">
             <div className="w-16 h-16 rounded-3xl bg-indigo-600/10 flex items-center justify-center text-3xl border border-indigo-600/20 group-hover:bg-indigo-600/30 transition-all shadow-xl shadow-indigo-600/20">🧱</div>
             <div>
                <h3 className="text-xl font-black text-white uppercase mb-4 tracking-tighter">Structured Pathways</h3>
                <p className="text-slate-400 leading-relaxed font-semibold italic text-sm">Every course is organized into logical, sequential nodes for complete technical skill acquisition.</p>
             </div>
          </div>

          <div className="glass-card p-12 h-[420px] flex flex-col justify-between group">
             <div className="w-16 h-16 rounded-3xl bg-pink-600/10 flex items-center justify-center text-3xl border border-pink-600/20 group-hover:bg-pink-600/30 transition-all shadow-xl shadow-pink-600/20">🔗</div>
             <div>
                <h3 className="text-xl font-black text-white uppercase mb-4 tracking-tighter">Direct Sync</h3>
                <p className="text-slate-400 leading-relaxed font-semibold italic text-sm">Seamlessly synchronize and export your personalized learning paths directly to your profile.</p>
             </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 px-6 py-24 border-t border-white/10 bg-[#030303]">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-10">
          <div className="flex items-center gap-4">
             <div className="w-9 h-9 rounded-xl bg-white flex items-center justify-center">
                <span className="text-black font-black text-base">🔗</span>
             </div>
             <span className="text-xl font-bold tracking-tighter text-white uppercase">LinkMe</span>
          </div>
          <p className="text-[10px] font-black text-slate-800 uppercase tracking-[0.4em] italic">© 2026. REFRAMING GLOBAL LEARNING.</p>
          <div className="flex gap-12 font-black tracking-[0.3em] text-[9px] text-slate-600">
             <Link href="/terms" className="hover:text-white transition-colors uppercase">Terms Node</Link>
             <Link href="/privacy" className="hover:text-white transition-colors uppercase">Privacy Registry</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
