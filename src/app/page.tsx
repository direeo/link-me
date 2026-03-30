'use client';

import React from 'react';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/Button';

/**
 * Premium Landing Page: Clean Modern Dark Edition
 * Focus: High-performance scrolling, minimalist gradients, and 150ms snappy interactions.
 */
export default function HomePage() {
  const { isAuthenticated, isGuest, continueAsGuest, isLoading } = useAuth();

  const handleGuestMode = async () => {
    await continueAsGuest();
    window.location.href = '/chat';
  };

  return (
    <div className="min-h-screen bg-[#0c0c12] relative overflow-hidden font-body selection:bg-violet-500/30">
      
      {/* Optimized Background Gradients (No Blur Filter) */}
      <div className="neural-bg" />

      {/* --- High-Speed Navigation --- */}
      <nav className="fixed top-0 left-0 right-0 z-50 px-6 py-5 md:px-12 lg:px-24 flex items-center justify-between border-b border-white/5 bg-[#0c0c12]/80 backdrop-blur-md">
        <div className="flex items-center gap-3 group cursor-pointer transition-transform duration-150 hover:scale-[1.02]">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-violet-600 to-indigo-600 flex items-center justify-center shadow-lg shadow-violet-600/10">
            <span className="text-base font-black">🔗</span>
          </div>
          <span className="text-lg font-black tracking-tighter text-white uppercase group-hover:tracking-normal transition-all duration-150">LinkMe</span>
        </div>
        
        <div className="flex items-center gap-6">
          {!isLoading && (
            <>
              {isAuthenticated || isGuest ? (
                <Button variant="glow" size="sm" onClick={() => window.location.href = '/chat'}>
                  Resume Session
                </Button>
              ) : (
                <>
                  <Link href="/login" className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 hover:text-white transition-colors hidden sm:block">
                    Registry Login
                  </Link>
                  <Button variant="primary" size="sm" onClick={() => window.location.href = '/signup'}>
                    Initialize Profile
                  </Button>
                </>
              )}
            </>
          )}
        </div>
      </nav>

      {/* --- Hero Architecture --- */}
      <main className="relative z-10 flex flex-col items-center justify-center px-6 pt-48 pb-32 md:pt-64 md:pb-48 text-center animate-in fade-in slide-in-from-bottom-4 duration-700">
        {/* Elite Indicator */}
        <div className="inline-flex items-center gap-3 px-4 py-2 rounded-full border border-white/5 bg-white/5 mb-10 transition-all duration-150 hover:border-violet-500/30">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
          <span className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400">Next-Gen AI Learning Architecture</span>
        </div>

        {/* Master Headline */}
        <h1 className="text-5xl md:text-8xl lg:text-9xl font-black text-white leading-[0.85] tracking-tighter mb-8 max-w-5xl">
          Master Any Skill <br className="hidden md:block" />
          <span className="gradient-text">Without the Noise.</span>
        </h1>

        {/* Pro Subheadline */}
        <p className="text-base md:text-lg text-slate-500 max-w-2xl leading-relaxed mb-12 font-medium italic border-l-2 border-violet-500/20 pl-6">
          LinkMe uses proprietary AI to architect structured learning paths from the world's most elite tutorial data. Performance-first, distraction-free mastery.
        </p>

        {/* Dynamic CTA Matrix */}
        <div className="flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto">
          <Button 
            variant="glow" 
            size="lg" 
            className="w-full sm:w-auto min-w-[220px] font-black uppercase tracking-widest text-xs"
            onClick={() => window.location.href = '/signup'}
          >
            Commence Learning
          </Button>
          <Button 
            variant="outline" 
            size="lg" 
            className="w-full sm:w-auto min-w-[220px] font-black uppercase tracking-widest text-xs"
            onClick={handleGuestMode}
          >
            Explore Sandbox
          </Button>
        </div>

        {/* Status Indicators */}
        <div className="mt-20 flex flex-col items-center gap-4">
           <div className="flex -space-x-2">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="w-8 h-8 rounded-full border-2 border-[#0c0c12] bg-[#1a1a23] flex items-center justify-center text-[10px] font-bold text-slate-500 transition-transform duration-150 hover:scale-110">
                {String.fromCharCode(65 + i)}
              </div>
            ))}
          </div>
          <div className="text-[9px] font-black uppercase tracking-[0.4em] text-slate-700 flex items-center gap-2">
            Verified Nodes Active Across 150+ Technical Domains
          </div>
        </div>
      </main>

      {/* --- Performance Bento Grid --- */}
      <section id="features" className="relative z-10 px-6 py-32 md:px-12 lg:px-24 border-t border-white/5">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-20">
            <div className="max-w-xl">
              <h2 className="text-3xl md:text-5xl font-black text-white tracking-tighter mb-4 uppercase">
                Why <span className="text-violet-500">LinkMe?</span>
              </h2>
              <p className="text-slate-500 text-sm font-bold uppercase tracking-[0.3em]">Extreme Curation. Infinite Mastery.</p>
            </div>
            <Link href="/signup" className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-700 hover:text-white transition-all">
              Explore Operational Specs ↗
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-12 gap-5 auto-rows-[280px]">
            {/* Feature 1: AI Insight */}
            <div className="md:col-span-8 rounded-3xl bg-[#1a1a23] p-10 border border-white/5 flex flex-col justify-end group transition-all duration-150 hover:border-violet-500/20">
               <div className="w-10 h-10 rounded-xl bg-violet-600/10 border border-violet-500/20 flex items-center justify-center mb-6 transition-transform duration-150 group-hover:scale-110">
                   <span className="text-lg">🧠</span>
                </div>
                <h3 className="text-xl font-black text-white uppercase tracking-tight mb-2">Neural Resource Filtering</h3>
                <p className="text-slate-500 text-sm font-medium leading-relaxed max-w-lg">
                  Every tutorial in your path is analyzed for quality, difficulty, and relevance. We ignore the high-volume noise to find the high-impact knowledge.
                </p>
            </div>

            {/* Feature 2: Speed */}
            <div className="md:col-span-4 rounded-3xl bg-[#1a1a23] p-10 border border-white/5 flex flex-col justify-between group transition-all duration-150 hover:border-indigo-500/20">
               <div className="w-10 h-10 rounded-xl bg-indigo-600/10 border border-indigo-500/20 flex items-center justify-center transition-transform duration-150 group-hover:scale-110">
                   <span className="text-lg">⚡️</span>
                </div>
                <div>
                  <h3 className="text-lg font-black text-white uppercase tracking-tight mb-2">Instant Synthesis</h3>
                  <p className="text-xs text-slate-500 font-medium leading-relaxed">
                    Zero-latency curriculum design. Describe your intent, and LinkMe builds your path in seconds.
                  </p>
                </div>
            </div>

            {/* Feature 3: Progress */}
            <div className="md:col-span-4 rounded-3xl bg-[#1a1a23] p-10 border border-white/5 flex flex-col justify-between group transition-all duration-150 hover:border-cyan-500/20">
               <div className="w-10 h-10 rounded-xl bg-cyan-600/10 border border-cyan-500/20 flex items-center justify-center transition-transform duration-150 group-hover:scale-110">
                   <span className="text-lg">📊</span>
                </div>
                <div>
                  <h3 className="text-lg font-black text-white uppercase tracking-tight mb-2">Quantified Mastery</h3>
                  <p className="text-xs text-slate-500 font-medium leading-relaxed">
                    Track every node, every stage, and every achievement with our vertical performance timeline.
                  </p>
                </div>
            </div>

            {/* Feature 4: Integration */}
            <div className="md:col-span-8 rounded-3xl bg-[#1a1a23] p-10 border border-white/5 flex flex-col md:flex-row items-center gap-10 group transition-all duration-150 hover:border-red-500/20">
              <div className="flex-1">
                 <div className="w-10 h-10 rounded-xl bg-red-600/10 border border-red-500/20 flex items-center justify-center mb-6 transition-transform duration-150 group-hover:scale-110">
                   <span className="text-lg">🎬</span>
                </div>
                <h3 className="text-xl font-black text-white uppercase tracking-tight mb-2">Native YouTube Protocols</h3>
                <p className="text-slate-500 text-sm font-medium leading-relaxed">
                  Export entire paths directly to your YouTube profile. Access world-class learning within your existing native ecosystem.
                </p>
              </div>
              <div className="w-32 h-32 rounded-3xl bg-black/40 border border-white/5 flex items-center justify-center flex-shrink-0 group-hover:scale-105 transition-transform duration-150">
                  <div className="w-12 h-12 rounded-full bg-red-600 flex items-center justify-center shadow-red-600/40 shadow-xl">
                      <div className="w-0 h-0 border-t-[8px] border-t-transparent border-l-[12px] border-l-white border-b-[8px] border-b-transparent ml-1" />
                  </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* --- Global Pricing Node --- */}
      <section id="pricing" className="relative z-10 px-6 py-32 md:px-12 lg:px-24 border-t border-white/5">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-20">
             <h2 className="text-3xl md:text-5xl font-black text-white tracking-tighter mb-4 uppercase">
              The <span className="text-violet-500">Node Pricing</span>
            </h2>
            <p className="text-slate-600 text-[10px] font-black uppercase tracking-[0.5em]">Scalable Mastery Frameworks</p>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            {/* Tier 1 */}
            <div className="rounded-[2.5rem] bg-[#1a1a23] p-10 border border-white/5 transition-all duration-150 hover:border-white/10 group">
              <h3 className="text-sm font-black text-white uppercase tracking-widest mb-2">Essential Node</h3>
              <div className="flex items-baseline gap-2 mb-8">
                <span className="text-4xl font-black text-white">$0</span>
                <span className="text-[10px] font-black text-slate-700 uppercase tracking-widest">/ Per Architect</span>
              </div>
              <ul className="space-y-4 mb-10">
                {['Unlimited Path Synthesis', 'Vertical Objective Tracker', 'Community Registry Access'].map((f, i) => (
                  <li key={i} className="flex items-center gap-3 text-[11px] font-bold text-slate-500">
                    <span className="text-emerald-500">✦</span> {f}
                  </li>
                ))}
              </ul>
              <Button variant="outline" className="w-full py-5 text-[10px] uppercase font-black tracking-widest transition-all group-hover:bg-white group-hover:text-black hover:scale-100" onClick={() => window.location.href = '/signup'}>
                Access Platform
              </Button>
            </div>

            {/* Tier 2 */}
            <div className="rounded-[2.5rem] bg-[#1a1a23] p-10 border border-violet-500/20 relative group transition-all duration-150 hover:border-violet-500/50">
              <div className="absolute top-8 right-8 px-2 py-1 border border-violet-500/20 rounded-md text-[8px] font-black tracking-widest text-violet-400 uppercase">Pro Alpha</div>
              <h3 className="text-sm font-black text-white uppercase tracking-widest mb-2">Professional Mode</h3>
              <div className="flex items-baseline gap-2 mb-8">
                <span className="text-4xl font-black text-white">$9</span>
                <span className="text-[10px] font-black text-slate-700 uppercase tracking-widest">/ Per Session</span>
              </div>
              <ul className="space-y-4 mb-10">
                {['Native YouTube Syncing', 'Priority Neural Discovery', 'Advanced Export Protocols'].map((f, i) => (
                  <li key={i} className="flex items-center gap-3 text-[11px] font-bold text-slate-300">
                    <span className="text-violet-500">✦</span> {f}
                  </li>
                ))}
              </ul>
              <Button variant="primary" className="w-full py-5 text-[10px] uppercase font-black tracking-widest grayscale opacity-50 cursor-not-allowed">
                Waitlist Locked
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* --- Footer Protocols --- */}
      <footer className="relative z-10 px-6 py-20 border-t border-white/5 bg-[#0c0c12]">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-start justify-between gap-16">
          <div className="max-w-xs space-y-6">
             <div className="flex items-center gap-3 transition-transform duration-150 hover:scale-[1.02]">
              <span className="text-2xl">🔗</span>
              <span className="text-xl font-black tracking-tighter text-white uppercase">LinkMe</span>
            </div>
            <p className="text-[11px] font-bold text-slate-600 leading-relaxed italic border-l-2 border-white/5 pl-4">
              Architecting the future of human mastery through sequential AI curriculum design. High-performance learning for high-impact minds.
            </p>
          </div>
          
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-12">
             <div className="space-y-6">
                <span className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-800">Node Map</span>
                <ul className="space-y-3">
                   <li><Link href="/signup" className="text-[10px] font-black uppercase tracking-widest text-slate-500 hover:text-white transition-colors">Initialization</Link></li>
                   <li><Link href="/chat" className="text-[10px] font-black uppercase tracking-widest text-slate-500 hover:text-white transition-colors">Neural Architect</Link></li>
                </ul>
             </div>
             <div className="space-y-6">
                <span className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-800">Governance</span>
                <ul className="space-y-3">
                   <li><Link href="/privacy" className="text-[10px] font-black uppercase tracking-widest text-slate-500 hover:text-white transition-colors">Privacy Codex</Link></li>
                   <li><Link href="/terms" className="text-[10px] font-black uppercase tracking-widest text-slate-500 hover:text-white transition-colors">Use Protocol</Link></li>
                </ul>
             </div>
          </div>
        </div>
        
        <div className="max-w-7xl mx-auto mt-20 pt-8 border-t border-white/5 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-800">
            © 2024 LinkMe Technologies. Registered Mastery Framework.
          </p>
          <div className="flex items-center gap-6">
             <span className="text-[10px] font-black uppercase tracking-[0.2em] text-cyan-900">Alpha Branch: Stable</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
