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
  title: "HzCode | Desarrollo deSoftware & Consultoría",
  description: "Especializado en el desarrollo de aplicaciones moviles ultra optimizadas, enfocadas en arquitectura serverless con AWS, Python, y Next.js.",
};

import Footer from "@/components/Footer";
import Navbar from "@/components/Navbar";
import ChatWidget from "@/components/ChatWidget";
import { FaWhatsapp } from 'react-icons/fa6';

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
        <Navbar />
        <main className="flex-grow">
          {children}
        </main>
        <Footer />
        {/* Floating WhatsApp button */}
        <a
          href="https://wa.me/5215631960050?text=Hola%2C%20me%20interesa%20cotizar%20un%20proyecto"
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Contactar por WhatsApp"
          className="fixed bottom-24 right-6 z-50 flex items-center justify-center w-14 h-14 rounded-full bg-[#25D366] hover:bg-[#1ebe5d] text-white shadow-lg hover:shadow-[#25D366]/30 hover:scale-110 transition-all duration-300"
        >
          <FaWhatsapp size={26} />
        </a>
        <ChatWidget />
      </body>
    </html>
  );
}
