'use client';

import React from 'react';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/Button';

/**
 * Professional Landing Page: Clean Minimalism
 * Focus: High-performance, clean typography, and zero-distraction.
 */
export default function HomePage() {
  const { isAuthenticated, isGuest, continueAsGuest, isLoading } = useAuth();

  const handleGuestMode = async () => {
    await continueAsGuest();
    window.location.href = '/chat';
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] relative overflow-hidden font-sans selection:bg-white/10 text-slate-200">
      
      {/* Navigation */}
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

      {/* Hero */}
      <main className="relative z-10 flex flex-col items-center justify-center px-6 pt-48 pb-32 md:pt-64 md:pb-48 text-center animate-in fade-in duration-700">
        <div className="inline-flex items-center gap-3 px-4 py-1.5 rounded-full border border-[#262626] bg-[#111111] mb-8">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
          <span className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Professional Learning Framework v2.1</span>
        </div>

        <h1 className="text-5xl md:text-[5.5rem] lg:text-[7rem] font-bold text-white leading-[0.9] tracking-tighter mb-8 max-w-5xl uppercase">
          Neural Mastery <br className="hidden md:block" />
          Architecture.
        </h1>

        <p className="text-base md:text-lg text-slate-500 max-w-2xl leading-relaxed mb-12 font-medium">
          Deploying Neural Mastery Architecture. LinkMe synthesizes 10,000+ data nodes into actionable learning protocols.
        </p>

        <div className="flex flex-col sm:flex-row items-center gap-3 w-full sm:w-auto">
          <Button 
            variant="primary" 
            size="lg" 
            className="w-full sm:w-auto min-w-[200px]"
            onClick={() => window.location.href = '/signup'}
          >
            Start mastering
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

      {/* Features */}
      <section id="features" className="relative z-10 px-6 py-32 md:px-12 lg:px-24 border-t border-[#262626]">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-20">
            <h2 className="text-3xl md:text-5xl font-bold text-white tracking-tighter uppercase">
              How it works
            </h2>
            <Link href="/signup" className="text-[10px] font-bold uppercase tracking-widest text-slate-500 hover:text-white transition-all">
              Join the waitlist ↗
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="rounded-2xl bg-[#111111] p-10 border border-[#262626] flex flex-col justify-between h-[320px] transition-all hover:border-[#444444]">
              <div className="w-8 h-8 rounded bg-white/5 flex items-center justify-center text-lg">🎯</div>
              <div>
                <h3 className="text-lg font-bold text-white uppercase mb-2">Neural Synthesis</h3>
                <p className="text-sm text-slate-500 font-medium leading-relaxed">
                  Advanced discovery engines evaluating 10,000+ data nodes to identify optimal mastery resources.
                </p>
              </div>
            </div>

            <div className="rounded-2xl bg-[#111111] p-10 border border-[#262626] flex flex-col justify-between h-[320px] transition-all hover:border-[#444444]">
              <div className="w-8 h-8 rounded bg-white/5 flex items-center justify-center text-lg">🧱</div>
              <div>
                <h3 className="text-lg font-bold text-white uppercase mb-2">Mastery Architecture</h3>
                <p className="text-sm text-slate-500 font-medium leading-relaxed">
                  Structural curriculum design deploying sequential nodes for comprehensive technical skill acquisition.
                </p>
              </div>
            </div>

            <div className="rounded-2xl bg-[#111111] p-10 border border-[#262626] flex flex-col justify-between h-[320px] transition-all hover:border-[#444444]">
              <div className="w-8 h-8 rounded bg-white/5 flex items-center justify-center text-lg">🔗</div>
              <div>
                <h3 className="text-lg font-bold text-white uppercase mb-2">Registry Synchronization</h3>
                <p className="text-sm text-slate-500 font-medium leading-relaxed">
                  Seamlessly export synthesized playlists to your external YouTube registry and maintain mastery state.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="relative z-10 px-6 py-32 md:px-12 lg:px-24 border-t border-[#262626]">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-20">
             <h2 className="text-3xl md:text-5xl font-bold text-white tracking-tighter mb-4 uppercase">
              Join the Beta
            </h2>
            <p className="text-slate-600 text-[10px] font-bold uppercase tracking-[0.4em]">Simple Plans for Early Adopters</p>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            <div className="rounded-2xl bg-[#111111] p-10 border border-[#262626] transition-all">
              <h3 className="text-sm font-bold text-white uppercase tracking-widest mb-2">Basic</h3>
              <div className="flex items-baseline gap-2 mb-8">
                <span className="text-4xl font-bold text-white shadow-sm">$0</span>
                <span className="text-[10px] font-bold text-slate-700 uppercase tracking-widest">/ Individual</span>
              </div>
              <ul className="space-y-4 mb-10">
                {['Unlimited path discovery', 'Goal tracking', 'Community support'].map((f, i) => (
                  <li key={i} className="flex items-center gap-3 text-[12px] font-medium text-slate-500">
                    <span className="text-emerald-500">✓</span> {f}
                  </li>
                ))}
              </ul>
              <Button variant="outline" className="w-full py-5 text-[10px] uppercase font-bold" onClick={() => window.location.href = '/signup'}>
                Get Access
              </Button>
            </div>

            <div className="rounded-2xl bg-[#111111] p-10 border border-white/5 transition-all">
              <h3 className="text-sm font-bold text-white uppercase tracking-widest mb-2">Pro</h3>
              <div className="flex items-baseline gap-2 mb-8">
                <span className="text-4xl font-bold text-white">$9</span>
                <span className="text-[10px] font-bold text-slate-700 uppercase tracking-widest">/ Monthly</span>
              </div>
              <ul className="space-y-4 mb-10">
                {['YouTube Playlist Syncing', 'Priority path updates', 'Premium features'].map((f, i) => (
                  <li key={i} className="flex items-center gap-3 text-[12px] font-medium text-slate-300">
                    <span className="text-white">✓</span> {f}
                  </li>
                ))}
              </ul>
              <Button variant="primary" className="w-full py-5 text-[10px] uppercase font-bold" onClick={() => window.location.href = '/signup'}>
                Join Pro Waitlist
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 px-6 py-20 border-t border-[#262626] bg-[#0a0a0a]">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-start justify-between gap-16">
          <div className="max-w-xs space-y-4">
             <div className="flex items-center gap-3">
              <span className="text-xl">🔗</span>
              <span className="text-xl font-bold tracking-tighter text-white uppercase">LinkMe</span>
            </div>
            <p className="text-[11px] font-bold text-slate-700 leading-relaxed italic border-l border-[#262626] pl-5">
              Reframing the future of human learning. High-speed mastery built for those who value clarity.
            </p>
          </div>
          
          <div className="flex flex-wrap gap-20">
             <div className="space-y-6">
                <span className="text-[10px] font-bold uppercase tracking-widest text-slate-800">Explore</span>
                <ul className="space-y-3">
                   <li><Link href="/signup" className="text-[10px] font-bold uppercase tracking-widest text-slate-500 hover:text-white transition-colors">Start Mastering</Link></li>
                   <li><Link href="/chat" className="text-[10px] font-bold uppercase tracking-widest text-slate-500 hover:text-white transition-colors">Dashboard</Link></li>
                </ul>
             </div>
             <div className="space-y-6">
                <span className="text-[10px] font-bold uppercase tracking-widest text-slate-800">Legal</span>
                <ul className="space-y-3">
                   <li><Link href="/privacy" className="text-[10px] font-bold uppercase tracking-widest text-slate-500 hover:text-white transition-colors">Privacy</Link></li>
                   <li><Link href="/terms" className="text-[10px] font-bold uppercase tracking-widest text-slate-500 hover:text-white transition-colors">Conditions</Link></li>
                </ul>
             </div>
          </div>
        </div>
        
        <div className="max-w-7xl mx-auto mt-20 pt-8 border-t border-[#262626] flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-[10px] font-bold text-slate-800 uppercase tracking-widest">
            © 2026 LinkMe. All Rights Reserved.
          </p>
          <div className="flex items-center gap-6">
             <span className="text-[11px] font-bold uppercase tracking-widest text-emerald-900">Alpha Status: Online</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
