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
    <div className="min-h-screen relative overflow-hidden selection:bg-violet-500/30 text-white selection:text-white">
      
      {/* Navigation (High-End Glass) */}
      <nav className="fixed top-0 left-0 right-0 z-50 px-6 py-6 md:px-12 lg:px-24 flex items-center justify-between border-b border-white/5 bg-[#0a0a0a]/40 backdrop-blur-3xl">
        <div className="flex items-center gap-3 transition-transform hover:scale-[1.02]">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-white to-slate-200 flex items-center justify-center shadow-[0_0_20px_rgba(255,255,255,0.2)]">
            <span className="text-xl font-black text-black">🔗</span>
          </div>
          <span className="text-xl font-bold tracking-tighter text-white uppercase sm:block">LinkMe</span>
        </div>
        
        <div className="flex items-center gap-6">
          {!isLoading && (
            <>
              {isAuthenticated || isGuest ? (
                <Button variant="primary" size="sm" onClick={() => window.location.href = '/chat'} className="font-bold tracking-widest shadow-[0_0_15px_rgba(139,92,246,0.2)]">
                  DASHBOARD
                </Button>
              ) : (
                <>
                  <Link href="/login" className="text-xs font-bold text-slate-400 hover:text-white transition-colors hidden sm:block tracking-widest">
                    SIGN IN
                  </Link>
                  <Button variant="primary" size="sm" onClick={() => window.location.href = '/signup'} className="font-bold tracking-widest shadow-[0_0_15px_rgba(139,92,246,0.2)]">
                    GET STARTED
                  </Button>
                </>
              )}
            </>
          )}
        </div>
      </nav>

      {/* Hero Section (Fidelity restoration) */}
      <main className="relative z-10 flex flex-col items-center justify-center px-6 pt-48 pb-32 md:pt-64 md:pb-48 text-center animate-in fade-in zoom-in duration-1000">
        <div className="inline-flex items-center gap-3 px-4 py-2 rounded-full border border-white/5 bg-white/5 mb-10 overflow-hidden group">
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-[200%] group-hover:translate-x-[200%] transition-transform duration-700" />
          <span className="w-2 h-2 rounded-full bg-violet-500 shadow-[0_0_15px_rgba(139,92,246,1)] animate-pulse" />
          <span className="text-[10px] font-bold uppercase tracking-[0.4em] text-slate-400">Professional Learning Path v2.1</span>
        </div>

        <h1 className="text-5xl md:text-[6.5rem] lg:text-[8rem] font-bold text-white leading-[0.85] tracking-tighter mb-10 uppercase max-w-6xl [text-shadow:0_10px_30px_rgba(0,0,0,0.5)]">
          Master any <br className="hidden md:block" />
          Skill. Fast.
        </h1>

        <p className="text-base md:text-xl text-slate-400 max-w-2xl leading-relaxed mb-16 font-medium italic opacity-80">
          LinkMe converts millions of YouTube tutorials into high-density, structured learning paths tailored to your exact professional goals.
        </p>

        <div className="flex flex-col sm:flex-row items-center gap-5 w-full sm:w-auto">
          <Button 
            variant="primary" 
            size="lg" 
            className="w-full sm:w-auto min-w-[260px] py-9 text-xs font-bold uppercase tracking-[0.2em] shadow-[0_20px_50px_rgba(139,92,246,0.3)] hover:shadow-[0_20px_60px_rgba(139,92,246,0.4)] hover:-translate-y-1 transition-all"
            onClick={() => window.location.href = '/signup'}
          >
            Start Mastery Path
          </Button>
          <Button 
            variant="outline" 
            size="lg" 
            className="w-full sm:w-auto min-w-[260px] py-9 text-xs font-bold uppercase tracking-[0.2em] border-white/10 hover:bg-white/5 hover:border-white/20 transition-all"
            onClick={handleGuestMode}
          >
            Preview Platform
          </Button>
        </div>
      </main>

      {/* Grid Section (Glass Cards) */}
      <section className="relative z-10 px-6 py-40 md:px-12 lg:px-24 border-t border-white/5 bg-[#0a0a0a]/40 backdrop-blur-3xl">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="glass-card p-12 h-[420px] flex flex-col justify-between group">
             <div className="w-14 h-14 rounded-2xl bg-violet-600/10 flex items-center justify-center text-3xl border border-violet-600/20 group-hover:bg-violet-600/20 transition-all">🎯</div>
             <div>
                <h3 className="text-xl font-bold text-white uppercase mb-4 tracking-tighter">Smart Discovery</h3>
                <p className="text-slate-400 leading-relaxed font-medium">Advanced engines evaluating millions of tutorials to identify the highest-fidelity mastery resources.</p>
             </div>
          </div>

          <div className="glass-card p-12 h-[420px] flex flex-col justify-between group">
             <div className="w-14 h-14 rounded-2xl bg-indigo-600/10 flex items-center justify-center text-3xl border border-indigo-600/20 group-hover:bg-indigo-600/20 transition-all">🧱</div>
             <div>
                <h3 className="text-xl font-bold text-white uppercase mb-4 tracking-tighter">Structured Learning</h3>
                <p className="text-slate-400 leading-relaxed font-medium">Curriculums organized into logical, sequential nodes for complete technical skill acquisition from zero to elite.</p>
             </div>
          </div>

          <div className="glass-card p-12 h-[420px] flex flex-col justify-between group">
             <div className="w-14 h-14 rounded-2xl bg-pink-600/10 flex items-center justify-center text-3xl border border-pink-600/20 group-hover:bg-pink-600/20 transition-all">🔗</div>
             <div>
                <h3 className="text-xl font-bold text-white uppercase mb-4 tracking-tighter">YouTube Sync</h3>
                <p className="text-slate-400 leading-relaxed font-medium">Seamlessly synchronize and export your personalized learning paths directly to your YouTube node as organized playlists.</p>
             </div>
          </div>
        </div>
      </section>

      {/* Footer (Stealth Modern) */}
      <footer className="relative z-10 px-6 py-24 border-t border-white/5 bg-[#070707]">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-10">
          <div className="flex items-center gap-4">
             <div className="w-8 h-8 rounded-lg bg-white flex items-center justify-center">
                <span className="text-black font-black">🔗</span>
             </div>
             <span className="text-xl font-bold tracking-tighter text-white uppercase">LinkMe</span>
          </div>
          <p className="text-[11px] font-bold text-slate-800 uppercase tracking-[0.4em]">© 2026 LinkMe. REFRAMING GLOBAL LEARNING.</p>
          <div className="flex gap-12 font-bold tracking-widest text-[10px] text-slate-600">
             <Link href="/terms" className="hover:text-white transition-colors uppercase">Terms Node</Link>
             <Link href="/privacy" className="hover:text-white transition-colors uppercase">Privacy Registry</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
