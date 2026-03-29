'use client';

import React from 'react';
import Link from 'next/link';

/**
 * Terms of Service: Neural Midnight Edition
 */
export default function TermsPage() {
  return (
    <div className="min-h-screen bg-[#050508] text-slate-300 py-32 px-6 selection:bg-violet-500/30 relative overflow-hidden">
      {/* Background Orbs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="orb orb-indigo top-[5%] -right-[10%] opacity-20" />
        <div className="orb orb-purple bottom-[15%] -left-[10%] opacity-15" />
      </div>

      <div className="max-w-3xl mx-auto relative z-10">
        <Link
          href="/"
          className="inline-flex items-center gap-2 mb-16 text-xs font-black uppercase tracking-[0.2em] text-slate-500 hover:text-violet-400 transition-all group"
        >
          <svg className="w-4 h-4 transition-transform group-hover:-translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Back to Command Center
        </Link>

        <div className="glass-panel rounded-[2rem] p-8 md:p-12 border-white/5 premium-glow-violet mb-20 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <h1 className="text-4xl md:text-5xl font-black text-white mb-4 uppercase tracking-tighter">Terms of Service</h1>
            <p className="text-[10px] font-black uppercase tracking-[0.3em] text-violet-500 mb-12">System Update: March 29, 2024</p>

            <div className="space-y-12 font-body font-medium">
            <section className="space-y-4">
                <h2 className="text-xl font-black text-white uppercase tracking-tight flex items-center gap-3">
                    <span className="text-violet-500">01</span> Binding Agreement
                </h2>
                <p className="text-slate-400 leading-relaxed">
                By accessing or interacting with LinkMe ("the Platform"), you agree to be bound by these formal protocols and Terms of Service. If you do not agree to these terms, please do not use the Platform.
                </p>
            </section>

            <section className="space-y-4">
                <h2 className="text-xl font-black text-white uppercase tracking-tight flex items-center gap-3">
                    <span className="text-violet-500">02</span> Neural Integration & Content
                </h2>
                <p className="text-slate-400 leading-relaxed border-l-2 border-violet-500/30 pl-4 py-2 italic font-medium">
                LinkMe uses advanced AI neural architectures to synthesize learning paths and curate world-class tutorial data. While we strive for extreme accuracy, AI-generated content may sometimes contain inaccuracies.
                </p>
            </section>

            <section className="space-y-4">
                <h2 className="text-xl font-black text-white uppercase tracking-tight flex items-center gap-3">
                    <span className="text-violet-500">03</span> YouTube Protocol
                </h2>
                <p className="text-slate-400 leading-relaxed">
                LinkMe integrates with YouTube APIs to search for and synchronize automated playlists. Your use of these features is subject to the <a href="https://www.youtube.com/t/terms" target="_blank" rel="noopener noreferrer" className="text-violet-400 hover:underline">YouTube Terms of Service</a>. We are not responsible for the content archived on the YouTube platform.
                </p>
            </section>

            <section className="space-y-4">
                <h2 className="text-xl font-black text-white uppercase tracking-tight flex items-center gap-3">
                    <span className="text-violet-500">04</span> Intellectual Property
                </h2>
                <p className="text-slate-400 leading-relaxed">
                LinkMe, its neural architecture, codebase, and premium design are the exclusive property of LinkMe AI. You retain ownership of your generated learning paths, but grant us a non-exclusive license to process and preserve them for your use.
                </p>
            </section>

            <section className="space-y-4">
                <h2 className="text-xl font-black text-white uppercase tracking-tight flex items-center gap-3">
                    <span className="text-violet-500">05</span> Liability Disclaimer
                </h2>
                <div className="p-5 rounded-2xl bg-black/40 border border-white/5 uppercase text-[10px] leading-relaxed tracking-widest text-slate-500">
                    LINKME IS PROVIDED "AS IS." WE DISCLAIM ALL WARRANTIES, EXPRESS OR IMPLIED. WE SHALL NOT BE LIABLE FOR ANY DAMAGES ARISING FROM YOUR USE OF THE PLATFORM.
                </div>
            </section>
            </div>
        </div>

        <div className="flex flex-col md:flex-row items-center justify-between gap-6 pt-12 border-t border-white/5 text-[10px] font-black uppercase tracking-widest text-slate-600">
          <p>© 2024 LinkMe Technologies. Standard Mastery Codex.</p>
          <div className="flex gap-8">
            <Link href="/privacy" className="hover:text-violet-400 transition-all">Privacy Codex</Link>
          </div>
        </div>
      </div>
    </div>
  );
}
