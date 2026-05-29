import Link from 'next/link';

export default function TermsPage() {
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
          <h1 className="text-4xl md:text-5xl font-black text-white mb-4 uppercase tracking-tighter">Terms of Service</h1>
          <p className="text-[10px] font-black uppercase tracking-[0.3em] text-violet-500">Last Updated: May 2026</p>
        </div>

        <div className="space-y-6">

          <section className="p-8 rounded-2xl bg-white/2 border border-white/5 space-y-4">
            <h2 className="text-lg font-black text-white uppercase tracking-tight flex items-center gap-3">
              <span className="text-violet-500 text-sm">01</span> Acceptance of Terms
            </h2>
            <p className="text-slate-400 leading-relaxed text-sm">
              By accessing or using LinkMe (&quot;the Service&quot;, &quot;we&quot;, &quot;us&quot;, or &quot;our&quot;), you agree to be bound by these Terms of Service. If you do not agree to these terms, please do not use the Service. We may update these terms from time to time — continued use of the Service after updates constitutes acceptance of the revised terms.
            </p>
          </section>

          <section className="p-8 rounded-2xl bg-white/2 border border-white/5 space-y-4">
            <h2 className="text-lg font-black text-white uppercase tracking-tight flex items-center gap-3">
              <span className="text-violet-500 text-sm">02</span> Description of Service
            </h2>
            <p className="text-slate-400 leading-relaxed text-sm">
              LinkMe is an AI-powered learning platform that searches YouTube for tutorials and organises them into personalised, step-by-step learning paths. LinkMe is designed for any topic — from coding and music to cooking, fitness, finance, languages, and beyond. The Service is available via <strong className="text-white">linkme.ng</strong>.
            </p>
            <p className="text-slate-400 leading-relaxed text-sm">
              LinkMe is a free service. We reserve the right to introduce paid plans in the future, with advance notice to existing users.
            </p>
          </section>

          <section className="p-8 rounded-2xl bg-white/2 border border-white/5 space-y-4">
            <h2 className="text-lg font-black text-white uppercase tracking-tight flex items-center gap-3">
              <span className="text-violet-500 text-sm">03</span> Account Registration
            </h2>
            <p className="text-slate-400 leading-relaxed text-sm">
              To access certain features (saving learning paths, tracking progress, receiving reminders), you must create an account. You agree to:
            </p>
            <ul className="space-y-3 text-slate-400 text-sm leading-relaxed">
              <li className="flex items-start gap-3"><span className="text-violet-500 mt-0.5 shrink-0">—</span> Provide accurate and truthful information when registering</li>
              <li className="flex items-start gap-3"><span className="text-violet-500 mt-0.5 shrink-0">—</span> Keep your password secure and not share your account with others</li>
              <li className="flex items-start gap-3"><span className="text-violet-500 mt-0.5 shrink-0">—</span> Notify us immediately if you suspect unauthorised access to your account</li>
              <li className="flex items-start gap-3"><span className="text-violet-500 mt-0.5 shrink-0">—</span> Be responsible for all activity that occurs under your account</li>
            </ul>
            <p className="text-slate-400 leading-relaxed text-sm">
              You must be at least 13 years old to create an account. By registering, you confirm that you meet this age requirement.
            </p>
          </section>

          <section className="p-8 rounded-2xl bg-white/2 border border-white/5 space-y-4">
            <h2 className="text-lg font-black text-white uppercase tracking-tight flex items-center gap-3">
              <span className="text-violet-500 text-sm">04</span> Acceptable Use
            </h2>
            <p className="text-slate-400 leading-relaxed text-sm">You agree to use LinkMe only for lawful purposes. You must not:</p>
            <ul className="space-y-3 text-slate-400 text-sm leading-relaxed">
              <li className="flex items-start gap-3"><span className="text-violet-500 mt-0.5 shrink-0">—</span> Use the Service in any way that violates applicable laws or regulations</li>
              <li className="flex items-start gap-3"><span className="text-violet-500 mt-0.5 shrink-0">—</span> Attempt to gain unauthorised access to any part of the Service or its infrastructure</li>
              <li className="flex items-start gap-3"><span className="text-violet-500 mt-0.5 shrink-0">—</span> Scrape, crawl, or use automated tools to extract data from the Service without permission</li>
              <li className="flex items-start gap-3"><span className="text-violet-500 mt-0.5 shrink-0">—</span> Submit false, misleading, or malicious content through the Service</li>
              <li className="flex items-start gap-3"><span className="text-violet-500 mt-0.5 shrink-0">—</span> Attempt to disrupt or overload the Service (e.g. DDoS attacks, spam)</li>
              <li className="flex items-start gap-3"><span className="text-violet-500 mt-0.5 shrink-0">—</span> Use the Service to harass, abuse, or harm any person</li>
              <li className="flex items-start gap-3"><span className="text-violet-500 mt-0.5 shrink-0">—</span> Impersonate any person or entity, or misrepresent your affiliation with any person or entity</li>
            </ul>
            <p className="text-slate-400 leading-relaxed text-sm">
              We reserve the right to suspend or terminate your account immediately if you violate these rules.
            </p>
          </section>

          <section className="p-8 rounded-2xl bg-white/2 border border-white/5 space-y-4">
            <h2 className="text-lg font-black text-white uppercase tracking-tight flex items-center gap-3">
              <span className="text-violet-500 text-sm">05</span> AI-Generated Content
            </h2>
            <p className="text-slate-400 leading-relaxed text-sm">
              LinkMe uses AI (Google Gemini) to generate learning paths and recommendations. While we strive for quality and accuracy, AI-generated content may occasionally contain errors, outdated information, or omissions. We do not guarantee the accuracy, completeness, or fitness for a particular purpose of any AI-generated learning path.
            </p>
            <p className="text-slate-400 leading-relaxed text-sm">
              LinkMe curates and links to YouTube videos but does not create or own that content. We are not responsible for the accuracy, quality, or availability of third-party videos.
            </p>
          </section>

          <section className="p-8 rounded-2xl bg-white/2 border border-white/5 space-y-4">
            <h2 className="text-lg font-black text-white uppercase tracking-tight flex items-center gap-3">
              <span className="text-violet-500 text-sm">06</span> YouTube Integration
            </h2>
            <p className="text-slate-400 leading-relaxed text-sm">
              LinkMe integrates with the YouTube API to search for tutorials and, optionally, to create playlists on your YouTube account. Your use of this feature is subject to the{' '}
              <a href="https://www.youtube.com/t/terms" target="_blank" rel="noopener noreferrer" className="text-violet-400 hover:underline">YouTube Terms of Service</a>{' '}
              and{' '}
              <a href="https://policies.google.com/privacy" target="_blank" rel="noopener noreferrer" className="text-violet-400 hover:underline">Google&apos;s Privacy Policy</a>.
              You can revoke LinkMe&apos;s access to your YouTube account at any time in your Google account settings or within LinkMe&apos;s Settings page.
            </p>
          </section>

          <section className="p-8 rounded-2xl bg-white/2 border border-white/5 space-y-4">
            <h2 className="text-lg font-black text-white uppercase tracking-tight flex items-center gap-3">
              <span className="text-violet-500 text-sm">07</span> Intellectual Property
            </h2>
            <p className="text-slate-400 leading-relaxed text-sm">
              The LinkMe platform — including its design, codebase, branding, and AI system — is owned by LinkMe and protected by intellectual property laws. You may not copy, reproduce, or distribute any part of the Service without our written permission.
            </p>
            <p className="text-slate-400 leading-relaxed text-sm">
              You retain ownership of any data you input into the Service (your learning topics, saved paths, and progress). By using the Service, you grant us a limited, non-exclusive licence to store and process that data solely to provide the Service to you.
            </p>
          </section>

          <section className="p-8 rounded-2xl bg-white/2 border border-white/5 space-y-4">
            <h2 className="text-lg font-black text-white uppercase tracking-tight flex items-center gap-3">
              <span className="text-violet-500 text-sm">08</span> Privacy
            </h2>
            <p className="text-slate-400 leading-relaxed text-sm">
              Your use of the Service is also governed by our{' '}
              <Link href="/privacy" className="text-violet-400 hover:underline">Privacy Policy</Link>,
              which is incorporated into these Terms by reference. By using LinkMe, you consent to the data practices described in the Privacy Policy.
            </p>
          </section>

          <section className="p-8 rounded-2xl bg-white/2 border border-white/5 space-y-4">
            <h2 className="text-lg font-black text-white uppercase tracking-tight flex items-center gap-3">
              <span className="text-violet-500 text-sm">09</span> Account Termination
            </h2>
            <p className="text-slate-400 leading-relaxed text-sm">
              You may stop using the Service and request deletion of your account at any time by contacting us at <a href="mailto:support@linkme.ng" className="text-violet-400 hover:underline">support@linkme.ng</a>.
            </p>
            <p className="text-slate-400 leading-relaxed text-sm">
              We reserve the right to suspend or permanently terminate your account, with or without notice, if you breach these Terms, engage in conduct that we determine is harmful to other users or the Service, or for any other reason at our sole discretion. Upon termination, your right to use the Service ceases immediately.
            </p>
          </section>

          <section className="p-8 rounded-2xl bg-white/2 border border-white/5 space-y-4">
            <h2 className="text-lg font-black text-white uppercase tracking-tight flex items-center gap-3">
              <span className="text-violet-500 text-sm">10</span> Disclaimer of Warranties
            </h2>
            <p className="text-slate-400 leading-relaxed text-sm">
              THE SERVICE IS PROVIDED &quot;AS IS&quot; AND &quot;AS AVAILABLE&quot; WITHOUT WARRANTIES OF ANY KIND, EITHER EXPRESS OR IMPLIED. WE DO NOT WARRANT THAT THE SERVICE WILL BE UNINTERRUPTED, ERROR-FREE, OR FREE OF HARMFUL COMPONENTS. YOUR USE OF THE SERVICE IS AT YOUR SOLE RISK.
            </p>
          </section>

          <section className="p-8 rounded-2xl bg-white/2 border border-white/5 space-y-4">
            <h2 className="text-lg font-black text-white uppercase tracking-tight flex items-center gap-3">
              <span className="text-violet-500 text-sm">11</span> Limitation of Liability
            </h2>
            <p className="text-slate-400 leading-relaxed text-sm">
              TO THE FULLEST EXTENT PERMITTED BY LAW, LINKME SHALL NOT BE LIABLE FOR ANY INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR PUNITIVE DAMAGES ARISING FROM YOUR USE OF, OR INABILITY TO USE, THE SERVICE — INCLUDING BUT NOT LIMITED TO LOSS OF DATA, LOSS OF PROFITS, OR BUSINESS INTERRUPTION — EVEN IF WE HAVE BEEN ADVISED OF THE POSSIBILITY OF SUCH DAMAGES.
            </p>
          </section>

          <section className="p-8 rounded-2xl bg-white/2 border border-white/5 space-y-4">
            <h2 className="text-lg font-black text-white uppercase tracking-tight flex items-center gap-3">
              <span className="text-violet-500 text-sm">12</span> Changes to These Terms
            </h2>
            <p className="text-slate-400 leading-relaxed text-sm">
              We reserve the right to modify these Terms at any time. When we make material changes, we will update the &quot;Last Updated&quot; date at the top of this page and, where appropriate, notify registered users by email. Your continued use of the Service after any changes constitutes your acceptance of the updated Terms.
            </p>
          </section>

          <section className="p-8 rounded-2xl bg-white/2 border border-white/5 space-y-4">
            <h2 className="text-lg font-black text-white uppercase tracking-tight flex items-center gap-3">
              <span className="text-violet-500 text-sm">13</span> Governing Law
            </h2>
            <p className="text-slate-400 leading-relaxed text-sm">
              These Terms are governed by and construed in accordance with the laws of the Federal Republic of Nigeria, without regard to its conflict of law provisions. Any disputes arising from these Terms or your use of the Service shall be subject to the exclusive jurisdiction of the courts of Nigeria.
            </p>
          </section>

          <section className="p-8 rounded-2xl bg-white/2 border border-white/5 space-y-4">
            <h2 className="text-lg font-black text-white uppercase tracking-tight flex items-center gap-3">
              <span className="text-violet-500 text-sm">14</span> Contact Us
            </h2>
            <p className="text-slate-400 leading-relaxed text-sm">
              If you have any questions about these Terms, please contact us at:{' '}
              <a href="mailto:support@linkme.ng" className="text-violet-400 hover:underline font-bold">support@linkme.ng</a>
            </p>
          </section>

        </div>

        <div className="flex flex-col md:flex-row items-center justify-between gap-6 mt-16 pt-8 border-t border-white/5 text-[10px] font-black uppercase tracking-widest text-slate-600">
          <p>© {new Date().getFullYear()} LinkMe. All Rights Reserved.</p>
          <Link href="/privacy" className="hover:text-violet-400 transition-all">Privacy Policy</Link>
        </div>
      </div>
    </div>
  );
}
