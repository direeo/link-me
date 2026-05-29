import Link from 'next/link';

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-[#050508] text-slate-300 py-24 px-6 selection:bg-violet-500/30 relative overflow-hidden">
      <div className="absolute top-[-10%] right-[-10%] w-[50%] h-[50%] bg-violet-600/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] left-[-10%] w-[50%] h-[50%] bg-indigo-600/10 rounded-full blur-[120px] pointer-events-none" />

      <div className="max-w-3xl mx-auto relative z-10">
        <Link
          href="/"
          className="inline-flex items-center gap-2 mb-16 text-xs font-black uppercase tracking-[0.2em] text-slate-500 hover:text-violet-400 transition-all group"
        >
          <svg className="w-4 h-4 transition-transform group-hover:-translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Back to Home
        </Link>

        <div className="mb-12">
          <h1 className="text-4xl md:text-5xl font-black text-white mb-4 uppercase tracking-tighter">Privacy Policy</h1>
          <p className="text-[10px] font-black uppercase tracking-[0.3em] text-violet-500">Last Updated: May 2026</p>
        </div>

        <div className="space-y-6">

          <section className="p-8 rounded-2xl bg-white/2 border border-white/5 space-y-4">
            <h2 className="text-lg font-black text-white uppercase tracking-tight flex items-center gap-3">
              <span className="text-violet-500 text-sm">01</span> Who We Are
            </h2>
            <p className="text-slate-400 leading-relaxed text-sm">
              LinkMe (&quot;we&quot;, &quot;us&quot;, or &quot;our&quot;) is an AI-powered learning platform that builds personalised learning paths from YouTube tutorials. Our service is accessible at <strong className="text-white">linkme.ng</strong>. This Privacy Policy explains what personal data we collect, why we collect it, and how we handle it.
            </p>
            <p className="text-slate-400 leading-relaxed text-sm">
              By using LinkMe, you agree to the practices described in this policy. If you do not agree, please do not use the service.
            </p>
          </section>

          <section className="p-8 rounded-2xl bg-white/2 border border-white/5 space-y-4">
            <h2 className="text-lg font-black text-white uppercase tracking-tight flex items-center gap-3">
              <span className="text-violet-500 text-sm">02</span> Information We Collect
            </h2>
            <div className="space-y-3">
              <div className="p-4 rounded-xl bg-black/30 border border-white/5">
                <strong className="text-white block mb-2 text-sm">Account Information</strong>
                <p className="text-sm text-slate-400 leading-relaxed">When you create an account, we collect your name, email address, and a hashed (encrypted) version of your password. We never store your password in plain text.</p>
              </div>
              <div className="p-4 rounded-xl bg-black/30 border border-white/5">
                <strong className="text-white block mb-2 text-sm">Learning Activity</strong>
                <p className="text-sm text-slate-400 leading-relaxed">We store the learning paths you save and your video progress (which videos you&apos;ve marked as watched) so we can restore your progress across sessions and send you relevant reminders.</p>
              </div>
              <div className="p-4 rounded-xl bg-black/30 border border-white/5">
                <strong className="text-white block mb-2 text-sm">Chat History</strong>
                <p className="text-sm text-slate-400 leading-relaxed">For registered users, we save your conversation history so you can return to previous learning paths. Guest users&apos; conversations are not saved.</p>
              </div>
              <div className="p-4 rounded-xl bg-black/30 border border-white/5">
                <strong className="text-white block mb-2 text-sm">YouTube Connection (Optional)</strong>
                <p className="text-sm text-slate-400 leading-relaxed">If you choose to connect your YouTube account, we store OAuth tokens to create playlists on your behalf. We only request the minimum permissions needed — we cannot read your private data, view your watch history, or post on your behalf beyond playlist management.</p>
              </div>
              <div className="p-4 rounded-xl bg-black/30 border border-white/5">
                <strong className="text-white block mb-2 text-sm">Technical Data</strong>
                <p className="text-sm text-slate-400 leading-relaxed">We may collect your IP address for rate limiting and fraud prevention. We do not build advertising profiles or track you across other websites.</p>
              </div>
            </div>
          </section>

          <section className="p-8 rounded-2xl bg-white/2 border border-white/5 space-y-4">
            <h2 className="text-lg font-black text-white uppercase tracking-tight flex items-center gap-3">
              <span className="text-violet-500 text-sm">03</span> How We Use Your Information
            </h2>
            <ul className="space-y-3 text-slate-400 text-sm leading-relaxed">
              <li className="flex items-start gap-3"><span className="text-violet-500 mt-0.5 shrink-0">—</span> To create and manage your account and authenticate your identity</li>
              <li className="flex items-start gap-3"><span className="text-violet-500 mt-0.5 shrink-0">—</span> To build and display your personalised learning paths and track your progress</li>
              <li className="flex items-start gap-3"><span className="text-violet-500 mt-0.5 shrink-0">—</span> To send daily learning reminder emails if you have enabled them in your settings</li>
              <li className="flex items-start gap-3"><span className="text-violet-500 mt-0.5 shrink-0">—</span> To send transactional emails such as email verification and password reset links</li>
              <li className="flex items-start gap-3"><span className="text-violet-500 mt-0.5 shrink-0">—</span> To protect the platform from abuse, spam, and unauthorised access</li>
              <li className="flex items-start gap-3"><span className="text-violet-500 mt-0.5 shrink-0">—</span> To improve the quality of our AI learning path recommendations over time</li>
            </ul>
          </section>

          <section className="p-8 rounded-2xl bg-white/2 border border-white/5 space-y-4">
            <h2 className="text-lg font-black text-white uppercase tracking-tight flex items-center gap-3">
              <span className="text-violet-500 text-sm">04</span> Data Sharing
            </h2>
            <p className="text-slate-400 leading-relaxed text-sm">
              <strong className="text-white">We do not sell your personal data.</strong> We do not share your information with advertisers or data brokers. We may share data only in the following limited circumstances:
            </p>
            <ul className="space-y-3 text-slate-400 text-sm leading-relaxed">
              <li className="flex items-start gap-3"><span className="text-violet-500 mt-0.5 shrink-0">—</span><span><strong className="text-slate-300">Service providers:</strong> We use third-party services to operate LinkMe, including our database provider (Turso), AI provider (Google Gemini), and email delivery service. These providers process data strictly on our behalf.</span></li>
              <li className="flex items-start gap-3"><span className="text-violet-500 mt-0.5 shrink-0">—</span><span><strong className="text-slate-300">YouTube API:</strong> When you connect YouTube, playlist data is sent to Google&apos;s API, subject to <a href="https://policies.google.com/privacy" target="_blank" rel="noopener noreferrer" className="text-violet-400 hover:underline">Google&apos;s Privacy Policy</a>.</span></li>
              <li className="flex items-start gap-3"><span className="text-violet-500 mt-0.5 shrink-0">—</span><span><strong className="text-slate-300">Legal requirements:</strong> We may disclose data if required by law or to protect the safety of our users.</span></li>
            </ul>
          </section>

          <section className="p-8 rounded-2xl bg-white/2 border border-white/5 space-y-4">
            <h2 className="text-lg font-black text-white uppercase tracking-tight flex items-center gap-3">
              <span className="text-violet-500 text-sm">05</span> Data Retention
            </h2>
            <p className="text-slate-400 leading-relaxed text-sm">
              We retain your personal data for as long as your account is active. If you request deletion of your account, we will delete your personal data within 30 days, except where we are required to retain it for legal or fraud prevention purposes. Anonymised, aggregated data may be retained indefinitely for service improvement.
            </p>
          </section>

          <section className="p-8 rounded-2xl bg-white/2 border border-white/5 space-y-4">
            <h2 className="text-lg font-black text-white uppercase tracking-tight flex items-center gap-3">
              <span className="text-violet-500 text-sm">06</span> Your Rights
            </h2>
            <p className="text-slate-400 leading-relaxed text-sm mb-2">Depending on where you are located, you may have the right to:</p>
            <ul className="space-y-3 text-slate-400 text-sm leading-relaxed">
              <li className="flex items-start gap-3"><span className="text-violet-500 mt-0.5 shrink-0">—</span> Access the personal data we hold about you</li>
              <li className="flex items-start gap-3"><span className="text-violet-500 mt-0.5 shrink-0">—</span> Correct inaccurate personal data</li>
              <li className="flex items-start gap-3"><span className="text-violet-500 mt-0.5 shrink-0">—</span> Request deletion of your personal data</li>
              <li className="flex items-start gap-3"><span className="text-violet-500 mt-0.5 shrink-0">—</span> Opt out of marketing and reminder emails at any time via your account settings</li>
              <li className="flex items-start gap-3"><span className="text-violet-500 mt-0.5 shrink-0">—</span> Disconnect your YouTube account at any time in Settings</li>
            </ul>
            <p className="text-slate-400 leading-relaxed text-sm">
              To exercise any of these rights, email us at <a href="mailto:support@linkme.ng" className="text-violet-400 hover:underline">support@linkme.ng</a>.
            </p>
          </section>

          <section className="p-8 rounded-2xl bg-white/2 border border-white/5 space-y-4">
            <h2 className="text-lg font-black text-white uppercase tracking-tight flex items-center gap-3">
              <span className="text-violet-500 text-sm">07</span> Cookies
            </h2>
            <p className="text-slate-400 leading-relaxed text-sm">
              LinkMe uses HTTP-only cookies solely to manage your authentication session (keeping you logged in). We do not use advertising cookies or third-party tracking cookies. You can clear cookies in your browser settings at any time, though this will log you out of your account.
            </p>
          </section>

          <section className="p-8 rounded-2xl bg-white/2 border border-white/5 space-y-4">
            <h2 className="text-lg font-black text-white uppercase tracking-tight flex items-center gap-3">
              <span className="text-violet-500 text-sm">08</span> Data Security
            </h2>
            <p className="text-slate-400 leading-relaxed text-sm">
              We use industry-standard security practices: passwords are hashed using bcrypt, authentication tokens are stored in HTTP-only cookies, all connections are encrypted via HTTPS, and we implement rate limiting to prevent brute-force attacks. No system is 100% secure — if you suspect unauthorised access to your account, contact us immediately.
            </p>
          </section>

          <section className="p-8 rounded-2xl bg-white/2 border border-white/5 space-y-4">
            <h2 className="text-lg font-black text-white uppercase tracking-tight flex items-center gap-3">
              <span className="text-violet-500 text-sm">09</span> Children&apos;s Privacy
            </h2>
            <p className="text-slate-400 leading-relaxed text-sm">
              LinkMe is not directed at children under 13 years of age. We do not knowingly collect personal data from children under 13. If you believe a child has provided us with personal information, please contact us and we will delete it promptly.
            </p>
          </section>

          <section className="p-8 rounded-2xl bg-white/2 border border-white/5 space-y-4">
            <h2 className="text-lg font-black text-white uppercase tracking-tight flex items-center gap-3">
              <span className="text-violet-500 text-sm">10</span> Changes to This Policy
            </h2>
            <p className="text-slate-400 leading-relaxed text-sm">
              We may update this Privacy Policy from time to time. When we do, we will update the &quot;Last Updated&quot; date at the top of this page. For significant changes, we will notify registered users by email. Your continued use of LinkMe after changes are posted constitutes your acceptance of the updated policy.
            </p>
          </section>

          <section className="p-8 rounded-2xl bg-white/2 border border-white/5 space-y-4">
            <h2 className="text-lg font-black text-white uppercase tracking-tight flex items-center gap-3">
              <span className="text-violet-500 text-sm">11</span> Contact Us
            </h2>
            <p className="text-slate-400 leading-relaxed text-sm">
              If you have questions about this Privacy Policy or how we handle your data, please contact us at:{' '}
              <a href="mailto:support@linkme.ng" className="text-violet-400 hover:underline font-bold">support@linkme.ng</a>
            </p>
          </section>

        </div>

        <div className="flex flex-col md:flex-row items-center justify-between gap-6 mt-16 pt-8 border-t border-white/5 text-[10px] font-black uppercase tracking-widest text-slate-600">
          <p>© {new Date().getFullYear()} LinkMe. All Rights Reserved.</p>
          <Link href="/terms" className="hover:text-violet-400 transition-all">Terms of Service</Link>
        </div>
      </div>
    </div>
  );
}
