import React from 'react';
import Link from 'next/link';
import { Mail, Phone, Globe } from 'lucide-react';
import { FaLinkedin } from 'react-icons/fa6';

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-[#050505] border-t border-gray-800 py-12 relative overflow-hidden">
      {/* Decorative top line */}
      <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-[800px] h-[1px] bg-gradient-to-r from-transparent via-hzgold-600/50 to-transparent"></div>
      <div className="absolute -top-24 left-1/2 transform -translate-x-1/2 w-[400px] h-32 bg-hzgold-700/10 blur-[80px] rounded-full pointer-events-none"></div>

      <div className="max-w-6xl mx-auto px-4 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 mb-12">

          {/* Brand */}
          <div className="flex flex-col items-center md:items-start text-center md:text-left">
            <Link href="/">
              <img
                src="/logo.png"
                alt="HzCode Logo"
                className="h-10 md:h-14 mb-4 object-contain drop-shadow-[0_0_8px_rgba(184,150,107,0.3)] hover:scale-105 transition-transform duration-300"
              />
            </Link>
            <p className="text-gray-400 text-sm leading-relaxed">
              Transformando la operación empresarial mediante tecnología robusta y escalable.
            </p>
            <p className="text-hzgold-600 text-xs font-mono mt-2 tracking-widest uppercase">
              Software Dev Insights
            </p>
          </div>

          {/* Contact */}
          <div className="flex flex-col items-center md:items-start">
            <h3 className="text-white font-semibold text-sm uppercase tracking-widest mb-5 font-[Manrope]">
              Contacto
            </h3>
            <ul className="space-y-3">
              <li>
                <a
                  href="tel:5631960050"
                  className="flex items-center gap-3 text-gray-400 hover:text-hzgold-400 transition-colors text-sm group"
                >
                  <span className="w-8 h-8 rounded-full bg-gray-900 border border-gray-800 flex items-center justify-center group-hover:border-hzgold-700 transition-colors flex-shrink-0">
                    <Phone className="w-3.5 h-3.5" />
                  </span>
                  56 3196 0050
                </a>
              </li>
              <li>
                <a
                  href="mailto:hugo.zarate@hzcode.mx"
                  className="flex items-center gap-3 text-gray-400 hover:text-hzgold-400 transition-colors text-sm group"
                >
                  <span className="w-8 h-8 rounded-full bg-gray-900 border border-gray-800 flex items-center justify-center group-hover:border-hzgold-700 transition-colors flex-shrink-0">
                    <Mail className="w-3.5 h-3.5" />
                  </span>
                  hugo.zarate@hzcode.mx
                </a>
              </li>
              <li>
                <a
                  href="https://hzcode.mx"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 text-gray-400 hover:text-hzgold-400 transition-colors text-sm group"
                >
                  <span className="w-8 h-8 rounded-full bg-gray-900 border border-gray-800 flex items-center justify-center group-hover:border-hzgold-700 transition-colors flex-shrink-0">
                    <Globe className="w-3.5 h-3.5" />
                  </span>
                  hzcode.mx
                </a>
              </li>
              <li>
                <a
                  href="https://www.linkedin.com/in/hugo-zarate-861038229/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 text-gray-400 hover:text-hzgold-400 transition-colors text-sm group"
                >
                  <span className="w-8 h-8 rounded-full bg-gray-900 border border-gray-800 flex items-center justify-center group-hover:border-hzgold-700 transition-colors flex-shrink-0">
                    <FaLinkedin className="w-3.5 h-3.5" />
                  </span>
                  Hugo Zarate
                </a>
              </li>
            </ul>
          </div>

          {/* Quick links */}
          <div className="flex flex-col items-center md:items-start">
            <h3 className="text-white font-semibold text-sm uppercase tracking-widest mb-5 font-[Manrope]">
              Servicios
            </h3>
            <ul className="space-y-3 text-sm">
              {[
                { label: 'Arquitectura & Backend', href: '/#about' },
                { label: 'Cloud & DevOps', href: '/#about' },
                { label: 'Automatización & IA', href: '/#about' },
                { label: 'Solicitar Cotización', href: '/cotizacion' },
              ].map((link) => (
                <li key={link.label}>
                  <Link
                    href={link.href}
                    className="text-gray-400 hover:text-hzgold-400 transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

        </div>
      </div>

      {/* Copyright */}
      <div className="border-t border-gray-900/50 pt-8 text-center text-sm text-gray-500 font-mono px-4 relative z-10">
        &copy; {currentYear} HzCode · Hugo Zarate Ortiz · Todos los derechos reservados.
      </div>
    </footer>
  );
}
