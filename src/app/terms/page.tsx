import React from 'react';
import Link from 'next/link';

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-[#0a0a0f] text-slate-300 py-20 px-6">
      <div className="max-w-3xl mx-auto">
        <Link
          href="/"
          className="inline-flex items-center gap-2 mb-12 text-sm font-medium text-slate-500 hover:text-violet-400 transition-colors"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Back to Home
        </Link>

        <h1 className="text-4xl font-bold text-white mb-4">Terms of Service</h1>
        <p className="text-sm text-slate-500 mb-12">Last Updated: March 28, 2024</p>

        <section className="space-y-8">
          <div>
            <h2 className="text-xl font-semibold text-white mb-4">1. Acceptance of Terms</h2>
            <p>
              By accessing or using LinkMe, you agree to be bound by these Terms of Service. If you do not agree to these terms, please do not use the Platform.
            </p>
          </div>

          <div>
            <h2 className="text-xl font-semibold text-white mb-4">2. Account Creation & Security</h2>
            <ul className="list-disc pl-6 space-y-2">
              <li>To use certain features, you must create an account. You agree to provide accurate, current, and complete information.</li>
              <li>You are responsible for maintaining the confidentiality of your account credentials. Any activity under your account is your responsibility.</li>
              <li>Notify us immediately at <a href="mailto:hello@linkme-ai.com" className="text-violet-400 hover:text-violet-300 transition-colors">hello@linkme-ai.com</a> if you suspect any unauthorized access.</li>
            </ul>
          </div>

          <div>
            <h2 className="text-xl font-semibold text-white mb-4">3. Use of AI & Content</h2>
            <p>
              LinkMe uses advanced AI models to generate learning paths and search for tutorials. While we strive for accuracy, AI-generated content may sometimes contain errors or inaccuracies.
            </p>
            <p className="mt-4">
              <strong className="text-slate-200">User Conduct:</strong> You agree not to use the platform to generate or share harmful, illegal, or offensive content. Unauthorized automated scrapers or bots are prohibited.
            </p>
          </div>

          <div>
            <h2 className="text-xl font-semibold text-white mb-4">4. YouTube Integration</h2>
            <p>
              LinkMe integrates with YouTube APIs to search for and sync video playlists. Your use of these features is subject to the <a href="https://www.youtube.com/t/terms" target="_blank" rel="noopener noreferrer" className="text-violet-400 hover:underline">YouTube Terms of Service</a>. We are not responsible for content found on YouTube.
            </p>
          </div>

          <div>
            <h2 className="text-xl font-semibold text-white mb-4">5. Intellectual Property</h2>
            <p>
              LinkMe, its logo, design, and proprietary code are the property of LinkMe AI. You retain ownership of your generated learning paths, but grant us a non-exclusive license to store and display them for your use.
            </p>
          </div>

          <div>
            <h2 className="text-xl font-semibold text-white mb-4">6. Limitation of Liability</h2>
            <div className="bg-slate-900/50 border border-slate-800 p-4 rounded-xl">
              <p className="text-xs uppercase font-bold text-slate-500 mb-2">Disclaimer</p>
              <p className="text-sm">
                LINKME IS PROVIDED "AS IS" AND "AS AVAILABLE." WE DISCLAIM ALL WARRANTIES, EXPRESS OR IMPLIED. WE SHALL NOT BE LIABLE FOR ANY INDIRECT, INCIDENTAL, OR CONSEQUENTIAL DAMAGES ARISING FROM YOUR USE OF THE PLATFORM.
              </p>
            </div>
          </div>

          <div>
            <h2 className="text-xl font-semibold text-white mb-4">7. Termination</h2>
            <p>
              We reserve the right to suspend or terminate your account at our sole discretion, without notice, for conduct that we believe violates these Terms of Service.
            </p>
          </div>

          <div>
            <h2 className="text-xl font-semibold text-white mb-4">8. Governing Law</h2>
            <p>
              These terms are governed by the laws of your jurisdiction. Any disputes shall be resolved in the appropriate courts.
            </p>
          </div>
        </section>

        <div className="mt-20 pt-8 border-t border-slate-900 flex justify-between items-center text-xs text-slate-600">
          <p>© 2024 LinkMe. Master Any Skill with AI.</p>
          <div className="flex gap-4">
            <Link href="/privacy" className="hover:text-slate-400 transition-colors">Privacy Policy</Link>
          </div>
        </div>
      </div>
    </div>
  );
}
