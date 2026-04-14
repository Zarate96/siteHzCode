'use client';
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Menu, X } from 'lucide-react';

export default function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { name: 'Inicio', href: '/' },
    { name: 'Blog', href: '/blog' },
    { name: 'Portafolio', href: '/portfolio' },
    { name: 'Cotización', href: '/cotizacion' },
  ];

  const bgColor = isScrolled ? 'bg-[#050505]/90 backdrop-blur-md shadow-[0_4px_30px_rgba(0,0,0,0.5)] border-b border-gray-800' : 'bg-transparent';

  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${bgColor}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          
          {/* Logo */}
          <div className="flex-shrink-0 flex items-center">
            <Link href="/" className="font-[Manrope] text-2xl font-bold tracking-tighter text-white flex items-center gap-2 group">
              <span className="text-hzgold-500 group-hover:drop-shadow-[0_0_10px_rgba(184,150,107,0.8)] transition-all">&lang;</span>
              HzCode
              <span className="text-hzgold-500 group-hover:drop-shadow-[0_0_10px_rgba(184,150,107,0.8)] transition-all">/&rang;</span>
            </Link>
          </div>

          {/* Desktop Menu */}
          <div className="hidden md:flex space-x-8 items-center">
            {navLinks.map((link) => {
              const isActive = pathname === link.href || (link.href !== '/' && pathname.startsWith(link.href));
              return (
                <Link
                  key={link.name}
                  href={link.href}
                  className={`text-sm font-medium uppercase tracking-widest transition-colors duration-300 ${isActive ? 'text-hzgold-400' : 'text-gray-400 hover:text-white'}`}
                >
                  {link.name}
                </Link>
              );
            })}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="text-gray-300 hover:text-white focus:outline-none focus:text-hzgold-400"
            >
              {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>

        </div>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-[#0a0a0a] border-b border-gray-800 shadow-2xl absolute top-20 left-0 w-full">
          <div className="px-4 pt-2 pb-6 space-y-2 text-center">
            {navLinks.map((link) => {
              const isActive = pathname === link.href || (link.href !== '/' && pathname.startsWith(link.href));
              return (
                <Link
                  key={link.name}
                  href={link.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`block px-3 py-4 rounded-md text-base font-bold uppercase tracking-widest ${isActive ? 'text-hzgold-400 bg-hzgold-900/10' : 'text-gray-300 hover:text-white hover:bg-gray-900'}`}
                >
                  {link.name}
                </Link>
              );
            })}
          </div>
        </div>
      )}
    </nav>
  );
}
