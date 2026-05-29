import Link from 'next/link';

export default function NotFound() {
    return (
        <div className="min-h-screen bg-[#050508] flex items-center justify-center p-6 relative overflow-hidden">
            <div className="absolute top-[-10%] right-[-10%] w-[50%] h-[50%] bg-violet-600/10 rounded-full blur-[120px] pointer-events-none" />
            <div className="absolute bottom-[-10%] left-[-10%] w-[50%] h-[50%] bg-indigo-600/10 rounded-full blur-[120px] pointer-events-none" />

            <div className="relative z-10 text-center max-w-md animate-in fade-in zoom-in-95 duration-500">
                {/* Logo */}
                <Link href="/" className="inline-flex items-center gap-3 mb-12 group">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-600 to-indigo-600 flex items-center justify-center shadow-lg shadow-violet-500/20 transition-transform group-hover:scale-110">
                        <span className="text-white font-black text-xl">L</span>
                    </div>
                    <span className="text-2xl font-black tracking-tighter text-white uppercase">LinkMe</span>
                </Link>

                {/* 404 */}
                <div className="mb-8">
                    <p className="text-[120px] font-black text-white/5 leading-none select-none">404</p>
                    <h1 className="text-2xl font-black text-white uppercase tracking-widest -mt-6">Page Not Found</h1>
                    <p className="text-slate-500 text-sm mt-4 leading-relaxed">
                        The page you&apos;re looking for doesn&apos;t exist or has been moved.
                    </p>
                </div>

                {/* Actions */}
                <div className="flex flex-col sm:flex-row gap-3 justify-center">
                    <Link
                        href="/chat"
                        className="px-8 py-3 rounded-2xl bg-gradient-to-r from-violet-600 to-indigo-600 text-white text-[10px] font-black uppercase tracking-[0.2em] hover:opacity-90 transition-opacity"
                    >
                        Go to Chat
                    </Link>
                    <Link
                        href="/"
                        className="px-8 py-3 rounded-2xl border border-white/10 text-slate-400 text-[10px] font-black uppercase tracking-[0.2em] hover:border-white/20 hover:text-white transition-all"
                    >
                        Home
                    </Link>
                </div>
            </div>
        </div>
    );
}
