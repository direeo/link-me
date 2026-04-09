import type { Metadata } from "next";
import { Inter, Outfit } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/contexts/AuthContext";

const inter = Inter({
  subsets: ["latin"],
  display: 'swap',
  variable: '--font-inter',
});

const outfit = Outfit({
  subsets: ["latin"],
  display: 'swap',
  variable: '--font-outfit',
});

export const metadata: Metadata = {
  title: "LinkMe | Master Any Skill with AI-Curated Learning Paths",
  description: "LinkMe uses AI to build structured learning paths from the best YouTube tutorials. Stop searching, start mastering.",
  keywords: ["tutorials", "learning path", "AI tutor", "youtube learning", "skill mastery", "curated education", "LinkMe"],
  authors: [{ name: "LinkMe Founders" }],
  openGraph: {
    title: "LinkMe | AI-Powered Learning for the Modern World",
    description: "Personalized learning paths created from world-class tutorials.",
    url: "https://linkme-rust.vercel.app",
    siteName: "LinkMe",
    images: [{ url: "/og-image.png", width: 1200, height: 630, alt: "LinkMe - Smart Tutorial Discovery" }],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "LinkMe | AI-Powered Learning Paths",
    description: "Stop wasting time searching. Get a structured learning path in seconds.",
    images: ["/og-image.png"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${inter.variable} ${outfit.variable}`} suppressHydrationWarning>
       <body className="min-h-screen bg-[#050508] text-white antialiased font-sans relative flex flex-col" suppressHydrationWarning>
          <AuthProvider>
             <div className="relative z-10 flex-1 flex flex-col">
                {children}
             </div>
          </AuthProvider>
       </body>
    </html>
  );
}
