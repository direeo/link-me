import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/contexts/AuthContext";

const inter = Inter({
  subsets: ["latin"],
  display: 'swap',
  variable: '--font-inter',
});

export const metadata: Metadata = {
  title: "LinkMe | Professional AI Learning Paths",
  description: "Curated learning paths from the best YouTube tutorials. Optimized for speed and clarity.",
  keywords: ["tutorials", "learning path", "AI tutor", "youtube learning", "skill mastery", "curated education", "LinkMe"],
  authors: [{ name: "LinkMe Founders" }],
  openGraph: {
    title: "LinkMe | Professional AI Learning for the Modern World",
    description: "Personalized learning paths created from world-class tutorials. Structured, smart, and efficient.",
    url: "https://linkme-rust.vercel.app",
    siteName: "LinkMe",
    images: [{ url: "/og-image.png", width: 1200, height: 630, alt: "LinkMe - Smart Tutorial Discovery" }],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "LinkMe | AI-Powered Learning Paths",
    description: "Get a structured learning path for any topic in seconds.",
    images: ["/og-image.png"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${inter.variable}`}>
       <body className="min-h-screen bg-[#050505] text-[#ededed] antialiased font-sans relative flex flex-col">
          {/* HIGH-INTENSITY DECORATIVE LAYER (Vercel look) */}
          <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
             <div className="orb orb-violet w-[1000px] h-[1000px] -top-[500px] -left-[500px]" />
             <div className="orb orb-indigo w-[800px] h-[800px] -bottom-[400px] -right-[400px]" />
             <div className="orb orb-pink w-[500px] h-[500px] top-[30%] right-[-150px]" />
          </div>

          <AuthProvider>
             <div className="relative z-10 flex-1 flex flex-col overflow-x-hidden">
                {children}
             </div>
          </AuthProvider>
       </body>
    </html>
  );
}
