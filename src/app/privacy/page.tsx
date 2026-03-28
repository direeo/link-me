import React from 'react';
import Link from 'next/link';

export default function PrivacyPage() {
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

        <h1 className="text-4xl font-bold text-white mb-4">Privacy Policy</h1>
        <p className="text-sm text-slate-500 mb-12">Last Updated: March 28, 2024</p>

        <section className="space-y-8">
          <div>
            <h2 className="text-xl font-semibold text-white mb-4">1. Introduction</h2>
            <p>
              Welcome to LinkMe. We are committed to protecting your privacy and providing a secure environment for discovering and organizing learning resources. This Privacy Policy explains how we collect, use, and safeguard your personal information.
            </p>
          </div>

          <div>
            <h2 className="text-xl font-semibold text-white mb-4">2. Information We Collect</h2>
            <div className="space-y-4">
              <p>
                <strong className="text-slate-200">Account Information:</strong> When you sign up, we collect your email address, name, and a hashed version of your password.
              </p>
              <p>
                <strong className="text-slate-200">YouTube Data:</strong> If you choose to connect your YouTube account, we use Google OAuth to access your YouTube account. We only request permissions necessary to create and manage playlists specifically created by LinkMe. We do not access your private videos, subscriptions, or other sensitive YouTube data.
              </p>
              <p>
                <strong className="text-slate-200">Learning Data:</strong> We store the learning paths you generate, the topics you search for, and your progress tracking to provide a personalized experience.
              </p>
            </div>
          </div>

          <div>
            <h2 className="text-xl font-semibold text-white mb-4">3. How We Use Your Information</h2>
            <ul className="list-disc pl-6 space-y-2">
              <li>To provide and manage your LinkMe account.</li>
              <li>To generate personalized learning paths using AI.</li>
              <li>To synchronize curated tutorials with your YouTube account (only with your explicit permission).</li>
              <li>To improve our AI discovery algorithms and user experience.</li>
              <li>To communicate important updates or security alerts.</li>
            </ul>
          </div>

          <div>
            <h2 className="text-xl font-semibold text-white mb-4">4. Data Security</h2>
            <p>
              We prioritize the security of your data. Your account information is stored in encrypted databases (Turso), and we use industry-standard security protocols for all data transmissions. However, no method of transmission over the internet is 100% secure.
            </p>
          </div>

          <div>
            <h2 className="text-xl font-semibold text-white mb-4">5. Third-Party Services</h2>
            <p>
              LinkMe integrates with third-party services like YouTube (Google APIs). Your use of these services is subject to their respective privacy policies. We do not sell or share your personal data with third-party advertisers.
            </p>
          </div>

          <div>
            <h2 className="text-xl font-semibold text-white mb-4">6. Your Rights & Choice</h2>
            <p>
              You can access, update, or delete your account at any time through the settings page. You can also revoke LinkMe's access to your YouTube account via your Google Security Settings.
            </p>
          </div>

          <div>
            <h2 className="text-xl font-semibold text-white mb-4">7. Contact Us</h2>
            <p>
              If you have any questions about this Privacy Policy, please contact us at <a href="mailto:hello@linkme-ai.com" className="text-violet-400 hover:text-violet-300">hello@linkme-ai.com</a>.
            </p>
          </div>
        </section>

        <div className="mt-20 pt-8 border-t border-slate-900 flex justify-between items-center text-xs text-slate-600">
          <p>© 2024 LinkMe. All rights reserved.</p>
          <div className="flex gap-4">
            <Link href="/terms" className="hover:text-slate-400 transition-colors">Terms of Service</Link>
          </div>
        </div>
      </div>
    </div>
  );
}
