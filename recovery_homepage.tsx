'use client';

// Landing page with premium Neural Midnight redesign
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
    <div className="min-h-screen bg-[#050508] relative overflow-hidden font-body selection:bg-violet-500/30">
      
      {/* --- Neural Background Architecture --- */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="orb orb-purple top-[10%] -left-[10%] opacity-20" />
        <div className="orb orb-indigo top-[40%] -right-[10%] opacity-20" />
        <div className="orb orb-purple bottom-[10%] left-[20%] opacity-10" />
      </div>

      {/* --- Navigation --- */}
      <nav className="fixed top-0 left-0 right-0 z-50 glass-panel border-b border-white/5 px-6 py-4 md:px-12 lg:px-24 flex items-center justify-between backdrop-blur-md">
        <div className="flex items-center gap-3 group cursor-pointer">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-violet-600 to-indigo-600 flex items-center justify-center shadow-lg shadow-violet-500/30 group-hover:scale-110 transition-transform duration-300">
            <span className="text-lg">≡ƒöù</span>
          </div>
          <span className="text-xl font-black tracking-tighter text-white uppercase group-hover:tracking-normal transition-all duration-300">LinkMe</span>
        </div>
        
        <div className="flex items-center gap-6">
          {!isLoading && (
            <>
              {isAuthenticated || isGuest ? (
                <Button variant="glow" size="sm" onClick={() => window.location.href = '/chat'}>
                  Resume Learning
                </Button>
              ) : (
                <>
                  <Link href="/login" className="text-xs font-bold uppercase tracking-widest text-slate-400 hover:text-white transition-colors hidden sm:block">
                    Sign In
                  </Link>
                  <Button variant="primary" size="sm" onClick={() => window.location.href = '/signup'}>
                    Get Started
                  </Button>
                </>
              )}
            </>
          )}
        </div>
      </nav>

      {/* --- Hero Section --- */}
      <main className="relative z-10 flex flex-col items-center justify-center px-6 pt-40 pb-32 md:pt-52 md:pb-48 text-center">
        {/* Elite Badge */}
        <div className="inline-flex items-center gap-3 px-4 py-2 rounded-full glass-card mb-10 animate-float border-violet-500/20">
          <span className="w-2 h-2 rounded-full bg-violet-500 animate-pulse shadow-[0_0_10px_rgba(139,92,246,1)]" />
          <span className="text-[10px] font-black uppercase tracking-[0.2em] text-violet-400">Next-Gen AI Learning Architecture</span>
        </div>

        {/* Master Headline */}
        <h1 className="text-5xl md:text-8xl lg:text-9xl font-black text-white leading-[0.9] tracking-tighter mb-8 max-w-5xl">
          Master Any Skill <br className="hidden md:block" />
          <span className="gradient-text drop-shadow-[0_0_30px_rgba(139,92,246,0.3)]">Without the Noise.</span>
        </h1>

        {/* Neural Subheadline */}
        <p className="text-lg md:text-xl text-slate-400 max-w-2xl leading-relaxed mb-12 font-medium">
          Stop drowning in search results. LinkMe uses AI to architect 
          structured learning paths from the world's most elite tutorials.
        </p>

        {/* CTA Matrix */}
        <div className="flex flex-col sm:flex-row items-center gap-5 w-full sm:w-auto">
          <Button 
            variant="glow" 
            size="lg" 
            className="w-full sm:w-auto min-w-[220px] shine-effect"
            onClick={() => window.location.href = '/signup'}
          >
            Start Your Journey
          </Button>
          <Button 
            variant="outline" 
            size="lg" 
            className="w-full sm:w-auto min-w-[220px]"
            onClick={handleGuestMode}
          >
            Explore as Guest
          </Button>
        </div>

        {/* Pulse Indicators */}
        <div className="mt-16 flex items-center gap-6 text-slate-600">
          <div className="flex -space-x-3">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className={`w-9 h-9 rounded-full border-2 border-[#050508] bg-slate-800 flex items-center justify-center text-[10px] font-bold`}>
                User
              </div>
            ))}
          </div>
          <div className="text-[10px] font-black uppercase tracking-widest flex items-center gap-2">
            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
            Join 1,000+ specialized learners
          </div>
        </div>
      </main>

      {/* --- Bento Box Features Section --- */}
      <section id="features" className="relative z-10 px-6 py-32 md:px-12 lg:px-24">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-20 text-center md:text-left">
            <div className="max-w-xl">
              <h2 className="text-4xl md:text-6xl font-black text-white tracking-tighter mb-4 uppercase">
                Why <span className="gradient-text">LinkMe?</span>
              </h2>
              <p className="text-slate-400 text-lg font-medium italic border-l-4 border-violet-500/40 pl-6">
                Most platforms give you search results. We give you a roadmap.
              </p>
            </div>
            <Link href="/signup" className="text-xs font-black uppercase tracking-[0.3em] text-violet-400 hover:text-white transition-colors duration-300">
              View All Features Γåù
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-12 gap-6 auto-rows-[300px]">
            
            {/* Bento 1: AI Discovery */}
            <div className="md:col-span-8 glass-card rounded-[2.5rem] p-10 flex flex-col justify-end relative overflow-hidden group">
              <div className="absolute top-10 right-10 w-40 h-40 bg-violet-600/10 blur-[80px] rounded-full group-hover:bg-violet-600/20 transition-all duration-700" />
              <div className="relative z-10">
                <div className="w-12 h-12 rounded-2xl bg-violet-500/10 border border-violet-500/20 flex items-center justify-center mb-6">
                   <span className="text-2xl">≡ƒºá</span>
                </div>
                <h3 className="text-2xl font-black text-white mb-3 uppercase tracking-tight">Neural Video Curation</h3>
                <p className="text-slate-400 max-w-lg font-medium leading-relaxed">
                  Our AI doesn't just search; it watches. It filters by quality, level, and recency 
                  to ensure you're learning from the absolute best resources available.
                </p>
              </div>
            </div>

            {/* Bento 2: Chat Interface */}
            <div className="md:col-span-4 glass-card rounded-[2.5rem] p-10 flex flex-col justify-between border-indigo-500/20">
               <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center mb-6">
                   <span className="text-2xl">≡ƒÆ¼</span>
                </div>
                <div>
                  <h3 className="text-xl font-black text-white mb-3 uppercase tracking-tight">Conversational Architect</h3>
                  <p className="text-sm text-slate-400 font-medium leading-relaxed">
                    Just chat. Tell us what you want to build, and we'll handle the curriculum design.
                  </p>
                </div>
            </div>

            {/* Bento 3: Timeline */}
            <div className="md:col-span-4 glass-card rounded-[2.5rem] p-10 flex flex-col justify-between border-cyan-500/20">
               <div className="w-12 h-12 rounded-2xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center mb-6">
                   <span className="text-2xl">≡ƒôè</span>
                </div>
                <div>
                  <h3 className="text-xl font-black text-white mb-3 uppercase tracking-tight">Mastery Timelines</h3>
                  <p className="text-sm text-slate-400 font-medium leading-relaxed">
                    Visualize your progress with our vertical milestone architecture. Every video brings you closer to 100%.
                  </p>
                </div>
            </div>

            {/* Bento 4: YouTube Sync */}
            <div className="md:col-span-8 glass-card rounded-[2.5rem] p-10 flex flex-col md:flex-row items-center gap-10 border-red-500/10 group">
              <div className="flex-1">
                <div className="w-12 h-12 rounded-2xl bg-red-500/10 border border-red-500/20 flex items-center justify-center mb-6">
                   <span className="text-2xl">≡ƒÄ¼</span>
                </div>
                <h3 className="text-2xl font-black text-white mb-3 uppercase tracking-tight">One-Click YouTube Sync</h3>
                <p className="text-slate-400 font-medium leading-relaxed">
                  Sync your entire curated path directly to your YouTube account with a single click. 
                  Learn where you're already comfortable.
                </p>
              </div>
              <div className="w-full md:w-1/3 aspect-video rounded-3xl bg-black/40 border border-white/5 flex items-center justify-center p-6 group-hover:scale-105 transition-transform duration-500">
                 <div className="w-16 h-16 rounded-full bg-red-600 flex items-center justify-center shadow-2xl shadow-red-600/50">
                    <div className="w-0 h-0 border-t-[10px] border-t-transparent border-l-[15px] border-l-white border-b-[10px] border-b-transparent ml-1" />
                 </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* --- Pricing Section --- */}
      <section id="pricing" className="relative z-10 px-6 py-32 md:px-12 lg:px-24">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-20">
             <h2 className="text-4xl md:text-6xl font-black text-white tracking-tighter mb-4 uppercase">
              The <span className="gradient-text">Pricing</span>
            </h2>
            <p className="text-slate-500 text-xs font-black uppercase tracking-[0.4em]">Simple. Direct. Powerful.</p>
          </div>

          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {/* Free Plan */}
            <div className="glass-panel rounded-[2.5rem] p-10 border-white/5 relative group">
              <h3 className="text-xl font-black text-white uppercase tracking-widest mb-2">Essential</h3>
              <div className="flex items-baseline gap-2 mb-8">
                <span className="text-5xl font-black text-white">$0</span>
                <span className="text-xs font-bold text-slate-500 uppercase tracking-widest">/ Path</span>
              </div>
              <ul className="space-y-5 mb-12">
                {['Unlimited AI Discovery', 'Vertical Learning Paths', 'Progress Tracking', 'Community Access'].map((feat, i) => (
                  <li key={i} className="flex items-center gap-3 text-sm font-bold text-slate-400">
                    <span className="text-violet-500">Γ£ª</span> {feat}
                  </li>
                ))}
              </ul>
              <Button variant="outline" className="w-full py-6" onClick={() => window.location.href = '/signup'}>
                Access Framework
              </Button>
            </div>

            {/* Pro Plan */}
            <div className="glass-panel rounded-[2.5rem] p-10 border-violet-500/40 bg-violet-600/[0.03] relative overflow-hidden premium-glow-violet group">
              <div className="absolute top-6 right-6 px-3 py-1 bg-violet-600 rounded-full text-[8px] font-black tracking-[0.2em] text-white uppercase">Featured</div>
              <h3 className="text-xl font-black text-white uppercase tracking-widest mb-2">Professional</h3>
              <div className="flex items-baseline gap-2 mb-8">
                <span className="text-5xl font-black text-white">$9</span>
                <span className="text-xs font-bold text-slate-500 uppercase tracking-widest">/ Monthly</span>
              </div>
              <ul className="space-y-5 mb-12">
                {['YouTube Playlist Integration', 'Advanced AI Architecting', 'Priority API Requests', 'Neural Note-Taking'].map((feat, i) => (
                  <li key={i} className="flex items-center gap-3 text-sm font-bold text-slate-200">
                    <span className="text-violet-400">Γ£ª</span> {feat}
                  </li>
                ))}
              </ul>
              <Button variant="primary" className="w-full py-6 grayscale opacity-50 cursor-not-allowed">
                Waitlist Only
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* --- Footer --- */}
      <footer className="relative z-10 px-6 py-20 border-t border-white/5 bg-[#050508]">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-start justify-between gap-16">
          <div className="max-w-xs space-y-6">
             <div className="flex items-center gap-3">
              <span className="text-2xl">≡ƒöù</span>
              <span className="text-xl font-black tracking-tighter text-white uppercase">LinkMe</span>
            </div>
            <p className="text-sm font-medium text-slate-500 leading-relaxed italic border-l-2 border-slate-800 pl-4">
              Designing the future of self-directed mastery through AI-curated neural roadmaps.
            </p>
          </div>
          
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-12">
             <div className="space-y-4">
                <span className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-500">Platform</span>
                <ul className="space-y-2">
                   <li><Link href="/signup" className="text-xs font-bold text-slate-400 hover:text-violet-400 transition-colors">Start Learning</Link></li>
                   <li><Link href="/chat" className="text-xs font-bold text-slate-400 hover:text-violet-400 transition-colors">AI Architect</Link></li>
                </ul>
             </div>
             <div className="space-y-4">
                <span className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-500">Corporate</span>
                <ul className="space-y-2">
                   <li><Link href="/privacy" className="text-xs font-bold text-slate-400 hover:text-violet-400 transition-colors">Privacy Codex</Link></li>
                   <li><Link href="/terms" className="text-xs font-bold text-slate-400 hover:text-violet-400 transition-colors">Terms of Use</Link></li>
                </ul>
             </div>
             <div className="space-y-4">
                <span className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-500">Support</span>
                <ul className="space-y-2">
                   <li><a href="mailto:hello@linkme-ai.com" className="text-xs font-bold text-slate-400 hover:text-violet-400 transition-colors">Neural Email</a></li>
                </ul>
             </div>
          </div>
        </div>
        
        <div className="max-w-7xl mx-auto mt-20 pt-8 border-t border-white/5 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-[10px] font-black uppercase tracking-widest text-slate-700">
            ┬⌐ 2024 LinkMe Technologies. Standardized Mastery Platforms.
          </p>
          <div className="flex items-center gap-6">
             <span className="text-[10px] font-black uppercase tracking-widest text-slate-700">Built in the Shadows</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
