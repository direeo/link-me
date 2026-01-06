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
  title: "LinkMe - Smart Tutorial Discovery",
  description: "Find the best learning resources without wasting time. LinkMe uses AI to curate the most relevant tutorial videos from YouTube.",
  keywords: ["tutorials", "learning", "youtube", "education", "programming", "courses"],
  authors: [{ name: "LinkMe Team" }],
  openGraph: {
    title: "LinkMe - Smart Tutorial Discovery",
    description: "Find the best learning resources without wasting time.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={inter.variable}>
      <body className="min-h-screen bg-[#0a0a0f] text-white antialiased">
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}
