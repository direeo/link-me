'use client';

import React from 'react';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/Button';

/**
 * Premium Landing Page: Professional Minimalism Reset
 * Focus: High-performance scrolling, minimalist typography, and crisp 1px borders.
 */
export default function HomePage() {
  const { isAuthenticated, isGuest, continueAsGuest, isLoading } = useAuth();

  const handleGuestMode = async () => {
    await continueAsGuest();
    window.location.href = '/chat';
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] relative overflow-hidden font-sans selection:bg-white/10">
      
      {/* Standard Pro Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 px-6 py-4 md:px-12 lg:px-24 flex items-center justify-between border-b border-[#262626] bg-[#0a0a0a]/90 backdrop-blur-sm">
        <div className="flex items-center gap-3 transition-transform duration-150 hover:scale-[1.01]">
          <div className="w-8 h-8 rounded-lg bg-white flex items-center justify-center shadow-lg">
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
                    Sign In
                  </Link>
                  <Button variant="primary" size="sm" onClick={() => window.location.href = '/signup'}>
                    Create Account
                  </Button>
                </>
              )}
            </>
          )}
        </div>
      </nav>

      {/* --- High-End Typography Hero --- */}
      <main className="relative z-10 flex flex-col items-center justify-center px-6 pt-48 pb-32 md:pt-64 md:pb-48 text-center animate-in fade-in duration-700">
        <div className="inline-flex items-center gap-3 px-4 py-1.5 rounded-full border border-[#262626] bg-[#111111] mb-8 transition-all hover:border-white/20">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
          <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Professional Learning Framework v2.1</span>
        </div>

        <h1 className="text-5xl md:text-[5.5rem] lg:text-[7rem] font-bold text-white leading-[0.9] tracking-tighter mb-8 max-w-5xl">
          Curated learning paths <br className="hidden md:block" />
          built by intelligence.
        </h1>

        <p className="text-base md:text-lg text-slate-500 max-w-2xl leading-relaxed mb-12 font-medium">
          Stop searching. Start mastering. LinkMe builds structured paths from world-class tutorials, designed for speed and technical clarity.
        </p>

        <div className="flex flex-col sm:flex-row items-center gap-3 w-full sm:w-auto">
          <Button 
            variant="primary" 
            size="lg" 
            className="w-full sm:w-auto min-w-[200px]"
            onClick={() => window.location.href = '/signup'}
          >
            Start Mastery
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

      {/* --- Minimal Feature Index --- */}
      <section id="features" className="relative z-10 px-6 py-32 md:px-12 lg:px-24 border-t border-[#262626]">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-20">
            <h2 className="text-3xl md:text-5xl font-bold text-white tracking-tighter uppercase">
              The Framework
            </h2>
            <Link href="/signup" className="text-[10px] font-bold uppercase tracking-widest text-[#8b5cf6] hover:text-white transition-all">
              Technical Overview ↗
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Feature 1 */}
            <div className="rounded-2xl bg-[#111111] p-10 border border-[#262626] flex flex-col justify-between h-[320px] transition-all hover:bg-[#161616] hover:border-[#333333]">
              <div className="w-8 h-8 rounded bg-white/5 flex items-center justify-center text-lg">🎯</div>
              <div>
                <h3 className="text-lg font-bold text-white uppercase mb-2">Automated Curation</h3>
                <p className="text-sm text-slate-500 font-medium leading-relaxed">
                  We filter the noise, identifying only the highest-quality tutorial resources for your specific learning goals.
                </p>
              </div>
            </div>

            {/* Feature 2 */}
            <div className="rounded-2xl bg-[#111111] p-10 border border-[#262626] flex flex-col justify-between h-[320px] transition-all hover:bg-[#161616] hover:border-[#333333]">
              <div className="w-8 h-8 rounded bg-white/5 flex items-center justify-center text-lg">🧱</div>
              <div>
                <h3 className="text-lg font-bold text-white uppercase mb-2">Structural Mastery</h3>
                <p className="text-sm text-slate-500 font-medium leading-relaxed">
                  Every path is organized into logical, sequential stages that ensure comprehensive topic coverage from scratch.
                </p>
              </div>
            </div>

            {/* Feature 3 */}
            <div className="rounded-2xl bg-[#111111] p-10 border border-[#262626] flex flex-col justify-between h-[320px] transition-all hover:bg-[#161616] hover:border-[#333333]">
              <div className="w-8 h-8 rounded bg-white/5 flex items-center justify-center text-lg">🔗</div>
              <div>
                <h3 className="text-lg font-bold text-white uppercase mb-2">Native Integration</h3>
                <p className="text-sm text-slate-500 font-medium leading-relaxed">
                  Sync your synthesized paths directly to your YouTube workspace for a seamless cross-platform experience.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* --- Performance Footer --- */}
      <footer className="relative z-10 px-6 py-20 border-t border-[#262626] bg-[#0a0a0a]">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-start justify-between gap-16">
          <div className="max-w-xs space-y-4">
             <div className="flex items-center gap-3">
              <span className="text-xl">🔗</span>
              <span className="text-xl font-bold tracking-tighter text-white uppercase">LinkMe</span>
            </div>
            <p className="text-[11px] font-bold text-slate-700 leading-relaxed italic border-l border-[#262626] pl-5">
              High-performance learning paths for the world's most technical skillsets. Minimal noise, infinite mastery.
            </p>
          </div>
          
          <div className="flex flex-wrap gap-20">
             <div className="space-y-6">
                <span className="text-[10px] font-bold uppercase tracking-widest text-slate-800">Platform</span>
                <ul className="space-y-3">
                   <li><Link href="/signup" className="text-[10px] font-bold uppercase tracking-widest text-slate-500 hover:text-white transition-colors">Start Mastering</Link></li>
                   <li><Link href="/chat" className="text-[10px] font-bold uppercase tracking-widest text-slate-500 hover:text-white transition-colors">Workspace</Link></li>
                </ul>
             </div>
             <div className="space-y-6">
                <span className="text-[10px] font-bold uppercase tracking-widest text-slate-800">Legal Codex</span>
                <ul className="space-y-3">
                   <li><Link href="/privacy" className="text-[10px] font-bold uppercase tracking-widest text-slate-500 hover:text-white transition-colors">Privacy</Link></li>
                   <li><Link href="/terms" className="text-[10px] font-bold uppercase tracking-widest text-slate-500 hover:text-white transition-colors">Conditions</Link></li>
                </ul>
             </div>
          </div>
        </div>
        
        <div className="max-w-7xl mx-auto mt-20 pt-8 border-t border-[#262626] flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-[10px] font-bold text-slate-800 uppercase tracking-widest">
            © 2024 LinkMe. All Rights Reserved.
          </p>
          <div className="flex items-center gap-6">
             <span className="text-[10px] font-bold uppercase tracking-widest text-[#8b5cf6]">Node Active: Master Branch</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
