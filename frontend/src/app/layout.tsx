import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "HzCode | Desarrollo Web Serverless & Consultoría",
  description: "Especializado en el desarrollo de aplicaciones web ultra optimizadas, enfocadas en arquitectura serverless con AWS, Python, y Next.js.",
};

import Footer from "@/components/Footer";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased text-[#e0e0e0]`}
      suppressHydrationWarning
    >
      <body className="min-h-full flex flex-col bg-[#050505]" suppressHydrationWarning>
        <main className="flex-grow">
          {children}
        </main>
        <Footer />
      </body>
    </html>
  );
}
