'use client';

import React from 'react';
import Link from 'next/link';

/**
 * Privacy Policy: Neural Midnight Edition
 */
export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-[#050508] text-slate-300 py-32 px-6 selection:bg-violet-500/30 relative overflow-hidden">
      {/* Background Orbs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="orb orb-purple top-[5%] -left-[10%] opacity-20" />
        <div className="orb orb-indigo bottom-[10%] -right-[10%] opacity-15" />
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

        <div className="glass-panel rounded-[2rem] p-8 md:p-12 border-white/5 premium-glow-violet mb-20">
            <h1 className="text-4xl md:text-5xl font-black text-white mb-4 uppercase tracking-tighter">Privacy Codex</h1>
            <p className="text-[10px] font-black uppercase tracking-[0.3em] text-violet-500 mb-12">Registry Update: March 29, 2024</p>

            <div className="space-y-12">
            <section className="space-y-4">
                <h2 className="text-xl font-black text-white uppercase tracking-tight flex items-center gap-3">
                    <span className="text-violet-500">01</span> Introduction
                </h2>
                <p className="text-slate-400 leading-relaxed font-medium">
                Welcome to LinkMe. We are committed to protecting your intellectual privacy and providing a secure environment for discovering and organizing global learning resources. This Privacy Policy explains our protocols for collecting and safeguarding your data.
                </p>
            </section>

            <section className="space-y-4">
                <h2 className="text-xl font-black text-white uppercase tracking-tight flex items-center gap-3">
                    <span className="text-violet-500">02</span> Information Matrix
                </h2>
                <div className="grid gap-4">
                    <div className="p-4 rounded-2xl bg-white/5 border border-white/5">
                        <strong className="text-white block mb-1 uppercase text-xs tracking-widest">Account Identification</strong>
                        <p className="text-sm text-slate-400">Secure storage of email, name, and encrypted access credentials.</p>
                    </div>
                    <div className="p-4 rounded-2xl bg-white/5 border border-white/5">
                        <strong className="text-white block mb-1 uppercase text-xs tracking-widest">YouTube Neural Link</strong>
                        <p className="text-sm text-slate-400">Permissions are strictly limited to automated playlist management. We never access private archives or sensitive social data.</p>
                    </div>
                    <div className="p-4 rounded-2xl bg-white/5 border border-white/5">
                        <strong className="text-white block mb-1 uppercase text-xs tracking-widest">Learning telemetry</strong>
                        <p className="text-sm text-slate-400">We analyze your search intent and progress to optimize our AI discovery algorithms.</p>
                    </div>
                </div>
            </section>

            <section className="space-y-4">
                <h2 className="text-xl font-black text-white uppercase tracking-tight flex items-center gap-3">
                    <span className="text-violet-500">03</span> Data Integrity
                </h2>
                <p className="text-slate-400 leading-relaxed font-medium">
                We prioritize extreme security. All account data is stored in distributed obsidian-grade databases (Turso). Your data is never sold to third-party entities.
                </p>
            </section>

            <section className="space-y-4">
                <h2 className="text-xl font-black text-white uppercase tracking-tight flex items-center gap-3">
                    <span className="text-violet-500">04</span> Contact Framework
                </h2>
                <p className="text-slate-400 leading-relaxed font-medium">
                Direct questions regarding these protocols to our security team at: 
                <a href="mailto:hello@linkme-ai.com" className="text-violet-400 hover:text-white transition-colors ml-2 font-bold underline decoration-violet-500/30">hello@linkme-ai.com</a>
                </p>
            </section>
            </div>
        </div>

        <div className="flex flex-col md:flex-row items-center justify-between gap-6 pt-12 border-t border-white/5 text-[10px] font-black uppercase tracking-widest text-slate-600">
          <p>© 2024 LinkMe Technologies. All Rights Reserved.</p>
          <div className="flex gap-8">
            <Link href="/terms" className="hover:text-violet-400 transition-all">Terms of Service</Link>
          </div>
        </div>
      </div>
    </div>
  );
}
