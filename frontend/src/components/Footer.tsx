import React from 'react';
import Link from 'next/link';
import { Mail } from 'lucide-react';
import { FaGithub, FaLinkedin, FaXTwitter } from 'react-icons/fa6';

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-[#050505] border-t border-gray-800 py-12 relative overflow-hidden">
      {/* Decorative gradient blur in background */}
      <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-[800px] h-[1px] bg-gradient-to-r from-transparent via-hzgold-600/50 to-transparent"></div>
      <div className="absolute -top-24 left-1/2 transform -translate-x-1/2 w-[400px] h-32 bg-hzgold-700/10 blur-[80px] rounded-full pointer-events-none"></div>

      <div className="max-w-6xl mx-auto px-4 relative z-10 flex flex-col md:flex-row justify-between items-center gap-8">
        
        {/* Logo / Brand Section */}
        <div className="flex flex-col items-center md:items-start text-center md:text-left">
          <Link href="/">
            <img src="/logo.png" alt="HzCode Logo" className="h-10 md:h-14 mb-4 object-contain drop-shadow-[0_0_8px_rgba(184,150,107,0.3)] hover:scale-105 transition-transform duration-300" />
          </Link>
          <p className="text-gray-400 max-w-sm text-sm leading-relaxed">
            Especializado en el desarrollo de aplicaciones web serverless y consultoría cloud. Llevando ideas a la nube con elegancia y rendimiento.
          </p>
        </div>

        {/* Social Links */}
        <div className="flex gap-6 items-center">
          <a href="https://github.com/Zarate96" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-hzgold-400 transition-colors duration-300 p-2 hover:bg-hzgold-900/30 rounded-full">
            <FaGithub className="w-6 h-6" />
          </a>
          <a href="https://linkedin.com/" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-hzgold-400 transition-colors duration-300 p-2 hover:bg-hzgold-900/30 rounded-full">
            <FaLinkedin className="w-6 h-6" />
          </a>
          <a href="https://twitter.com/" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-hzgold-400 transition-colors duration-300 p-2 hover:bg-hzgold-900/30 rounded-full">
            <FaXTwitter className="w-6 h-6" />
          </a>
          <a href="mailto:hola@hzcode.mx" className="text-gray-400 hover:text-hzgold-400 transition-colors duration-300 p-2 hover:bg-hzgold-900/30 rounded-full">
            <Mail className="w-6 h-6" />
          </a>
        </div>
      </div>

      {/* Copyright Line */}
      <div className="mt-12 pt-8 border-t border-gray-900/50 text-center text-sm text-gray-500 font-mono px-4 relative z-10">
        &copy; {currentYear} HzCode / Hugo Zarate Ortiz. Todos los derechos reservados.
      </div>
    </footer>
  );
}
