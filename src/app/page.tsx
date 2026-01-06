'use client';

// Landing page with hero section and features
import React from 'react';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';

export default function HomePage() {
  const { isAuthenticated, isGuest, continueAsGuest, isLoading } = useAuth();

  const handleGuestMode = async () => {
    await continueAsGuest();
    window.location.href = '/chat';
  };

  return (
    <div className="min-h-screen bg-[#0a0a0f] relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 -left-32 w-96 h-96 bg-violet-600/20 rounded-full blur-3xl animate-pulse-slow" />
        <div className="absolute top-1/2 -right-32 w-96 h-96 bg-indigo-600/20 rounded-full blur-3xl animate-pulse-slow" style={{ animationDelay: '1s' }} />
        <div className="absolute bottom-1/4 left-1/3 w-64 h-64 bg-purple-600/10 rounded-full blur-3xl animate-pulse-slow" style={{ animationDelay: '2s' }} />
      </div>

      {/* Navigation */}
      <nav className="relative z-10 flex items-center justify-between px-6 py-4 md:px-12 lg:px-24">
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-violet-500/30">
            <span className="text-xl">🔗</span>
          </div>
          <span className="text-xl font-bold gradient-text">LinkMe</span>
        </div>
        <div className="flex items-center gap-4">
          {!isLoading && (
            <>
              {isAuthenticated || isGuest ? (
                <Link
                  href="/chat"
                  className="px-4 py-2 text-sm font-medium text-white bg-gradient-to-r from-violet-600 to-indigo-600 rounded-xl hover:from-violet-500 hover:to-indigo-500 transition-all shadow-lg shadow-violet-500/30"
                >
                  Go to Chat
                </Link>
              ) : (
                <>
                  <Link
                    href="/login"
                    className="px-4 py-2 text-sm font-medium text-slate-300 hover:text-white transition-colors"
                  >
                    Sign In
                  </Link>
                  <Link
                    href="/signup"
                    className="px-4 py-2 text-sm font-medium text-white bg-gradient-to-r from-violet-600 to-indigo-600 rounded-xl hover:from-violet-500 hover:to-indigo-500 transition-all shadow-lg shadow-violet-500/30"
                  >
                    Get Started
                  </Link>
                </>
              )}
            </>
          )}
        </div>
      </nav>

      {/* Hero Section */}
      <main className="relative z-10 flex flex-col items-center justify-center px-6 pt-20 pb-32 md:pt-32 md:pb-40">
        {/* Badge */}
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass mb-8 animate-float">
          <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
          <span className="text-sm text-slate-300">AI-Powered Tutorial Discovery</span>
        </div>

        {/* Headline */}
        <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold text-center max-w-4xl leading-tight">
          Find the{' '}
          <span className="gradient-text glow-text">Perfect Tutorial</span>
          {' '}in Seconds
        </h1>

        {/* Subheadline */}
        <p className="mt-6 text-lg md:text-xl text-slate-400 text-center max-w-2xl">
          Stop wasting time on irrelevant videos. LinkMe uses smart search to curate the best
          learning resources tailored to your skill level and goals.
        </p>

        {/* CTA Buttons */}
        <div className="mt-10 flex flex-col sm:flex-row items-center gap-4">
          <Link
            href="/signup"
            className="w-full sm:w-auto px-8 py-4 text-lg font-semibold text-white bg-gradient-to-r from-violet-600 to-indigo-600 rounded-xl hover:from-violet-500 hover:to-indigo-500 transition-all shadow-lg shadow-violet-500/30 hover:shadow-xl hover:shadow-violet-500/40 hover:scale-105 shine-effect"
          >
            Start Learning Free
          </Link>
          <button
            onClick={handleGuestMode}
            className="w-full sm:w-auto px-8 py-4 text-lg font-semibold text-slate-300 border-2 border-slate-700 rounded-xl hover:border-violet-500 hover:text-white transition-all hover:bg-violet-500/10"
          >
            Try as Guest
          </button>
        </div>

        {/* Social proof */}
        <div className="mt-12 flex items-center gap-4 text-slate-500">
          <div className="flex -space-x-2">
            {[1, 2, 3, 4, 5].map((i) => (
              <div
                key={i}
                className="w-8 h-8 rounded-full bg-gradient-to-br from-violet-400 to-indigo-500 border-2 border-[#0a0a0f]"
              />
            ))}
          </div>
          <span className="text-sm">Join 10,000+ learners</span>
        </div>
      </main>

      {/* Features Section */}
      <section className="relative z-10 px-6 py-20 md:px-12 lg:px-24">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-4">
            Why Choose <span className="gradient-text">LinkMe</span>?
          </h2>
          <p className="text-slate-400 text-center mb-16 max-w-2xl mx-auto">
            We understand the frustration of searching for quality tutorials.
            That&apos;s why we built something better.
          </p>

          <div className="grid md:grid-cols-3 gap-8">
            {/* Feature 1 */}
            <div className="glass rounded-2xl p-8 hover:border-violet-500/50 transition-all duration-300 group">
              <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <svg className="w-7 h-7 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-3">Chat-Style Interface</h3>
              <p className="text-slate-400">
                Just tell us what you want to learn. Our conversational AI asks the right questions
                to find exactly what you need.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="glass rounded-2xl p-8 hover:border-violet-500/50 transition-all duration-300 group">
              <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <svg className="w-7 h-7 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-3">Smart Curation</h3>
              <p className="text-slate-400">
                We filter by quality, recency, and relevance. No more wading through outdated
                or clickbait videos.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="glass rounded-2xl p-8 hover:border-violet-500/50 transition-all duration-300 group">
              <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <svg className="w-7 h-7 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-3">Instant Results</h3>
              <p className="text-slate-400">
                Get 5-7 highly relevant tutorials in seconds. Save hours of searching and
                start learning immediately.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative z-10 px-6 py-20 md:px-12 lg:px-24">
        <div className="max-w-4xl mx-auto text-center glass rounded-3xl p-12 glow-violet">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Ready to Learn Smarter?
          </h2>
          <p className="text-slate-400 mb-8 max-w-xl mx-auto">
            Join thousands of learners who have discovered a better way to find tutorials.
          </p>
          <Link
            href="/signup"
            className="inline-flex px-8 py-4 text-lg font-semibold text-white bg-gradient-to-r from-violet-600 to-indigo-600 rounded-xl hover:from-violet-500 hover:to-indigo-500 transition-all shadow-lg shadow-violet-500/30 hover:shadow-xl hover:shadow-violet-500/40"
          >
            Get Started for Free
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 px-6 py-8 border-t border-slate-800">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="text-xl">🔗</span>
            <span className="font-semibold">LinkMe</span>
          </div>
          <p className="text-sm text-slate-500">
            © {new Date().getFullYear()} LinkMe. Find the perfect tutorials, faster.
          </p>
        </div>
      </footer>
    </div>
  );
}
