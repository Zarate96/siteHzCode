'use client';

import React, { useState } from 'react';
import { api } from '@/services/api';
import Script from 'next/script';
import { Phone, Mail, Globe, Send, CheckCircle2, AlertCircle } from 'lucide-react';
import { FaLinkedin, FaWhatsapp } from 'react-icons/fa6';
import Link from 'next/link';

const RECAPTCHA_SITE_KEY = '6LfGGLgsAAAAAGM2Gi__RUzKv3OyQ4KsDdnmw6l6';

declare global {
  interface Window {
    grecaptcha: any;
  }
}

const CONTACT_ITEMS = [
  {
    icon: <FaWhatsapp className="w-5 h-5" />,
    label: 'WhatsApp',
    value: '56 3196 0050',
    href: 'https://wa.me/5215631960050?text=Hola%2C%20me%20interesa%20cotizar%20un%20proyecto',
  },
  {
    icon: <Phone className="w-5 h-5" />,
    label: 'Teléfono',
    value: '56 3196 0050',
    href: 'tel:5631960050',
  },
  {
    icon: <Mail className="w-5 h-5" />,
    label: 'Email',
    value: 'hugo.zarate@hzcode.mx',
    href: 'mailto:hugo.zarate@hzcode.mx',
  },
  {
    icon: <Globe className="w-5 h-5" />,
    label: 'Sitio web',
    value: 'hzcode.mx',
    href: 'https://hzcode.mx',
  },
  {
    icon: <FaLinkedin className="w-5 h-5" />,
    label: 'LinkedIn',
    value: 'Hugo Zarate',
    href: 'https://www.linkedin.com/in/hugo-zarate-861038229/',
  },
];

export default function CotizacionPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    project_type: 'web_app',
    budget: '',
    message: '',
  });
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('loading');
    try {
      let recaptchaToken = '';
      if (window.grecaptcha) {
        recaptchaToken = await window.grecaptcha.execute(RECAPTCHA_SITE_KEY, {
          action: 'submit_cotizacion',
        });
      }
      await api.sendContactMessage({
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        subject: `Nueva Cotización: ${formData.project_type} — Presupuesto: ${formData.budget}`,
        message: formData.message,
        recaptcha_token: recaptchaToken,
      });
      setStatus('success');
      setFormData({ name: '', email: '', phone: '', project_type: 'web_app', budget: '', message: '' });
    } catch (err) {
      console.error(err);
      setStatus('error');
    }
  };

  return (
    <>
      <Script
        src={`https://www.google.com/recaptcha/api.js?render=${RECAPTCHA_SITE_KEY}`}
        strategy="lazyOnload"
      />

      <main className="min-h-screen bg-[#050505] text-white">

        {/* ── Hero ── */}
        <section className="relative py-24 px-4 text-center overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-b from-[#10141e] to-[#050505]" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[300px] bg-hzgold-700/15 blur-[120px] rounded-full pointer-events-none" />
          <div className="relative z-10 max-w-3xl mx-auto">
            <span className="text-xs font-mono text-hzgold-500 uppercase tracking-widest mb-4 block">
              Hablemos de tu proyecto
            </span>
            <h1 className="text-4xl md:text-6xl font-bold mb-6">
              Solicitar <span className="text-hzgold-400">Cotización</span>
            </h1>
            <p className="text-gray-400 text-lg leading-relaxed">
              Cuéntanos sobre tu idea. Respondemos en menos de 24 horas con una propuesta técnica inicial sin costo.
            </p>
          </div>
        </section>

        {/* ── Main grid: form + contact card ── */}
        <section className="max-w-6xl mx-auto px-4 pb-32">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">

            {/* ── Form (2/3) ── */}
            <div className="lg:col-span-2 bg-[#111111] border border-gray-800 rounded-2xl p-8 shadow-2xl">

              {/* Success state */}
              {status === 'success' && (
                <div className="text-center py-16 space-y-5">
                  <div className="w-20 h-20 mx-auto bg-hzgold-900/40 rounded-full flex items-center justify-center border border-hzgold-700">
                    <CheckCircle2 className="w-10 h-10 text-hzgold-400" />
                  </div>
                  <h2 className="text-2xl font-bold text-white">¡Solicitud enviada!</h2>
                  <p className="text-gray-400 max-w-md mx-auto">
                    Hemos recibido tu cotización. Nos pondremos en contacto contigo a la brevedad.
                  </p>
                  <p className="text-gray-500 text-sm">Revisa tu correo electrónico para una confirmación.</p>
                  <button
                    onClick={() => setStatus('idle')}
                    className="mt-4 px-6 py-2 border border-gray-700 text-gray-300 rounded-full hover:border-hzgold-600 hover:text-hzgold-400 transition-colors text-sm"
                  >
                    Enviar otra cotización
                  </button>
                </div>
              )}

              {/* Error banner */}
              {status === 'error' && (
                <div className="flex items-center gap-3 bg-red-900/20 border border-red-800 text-red-400 p-4 rounded-xl mb-6 text-sm">
                  <AlertCircle className="w-5 h-5 flex-shrink-0" />
                  Ocurrió un error al enviar tu solicitud. Intenta nuevamente o contáctanos directamente.
                </div>
              )}

              {status !== 'success' && (
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Nombre completo <span className="text-hzgold-500">*</span>
                      </label>
                      <input
                        required
                        type="text"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        placeholder="Hugo Zarate"
                        className="w-full bg-[#0d0d0d] border border-gray-700 rounded-xl px-4 py-3 text-white placeholder-gray-600 focus:outline-none focus:border-hzgold-600 transition-colors text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Correo electrónico <span className="text-hzgold-500">*</span>
                      </label>
                      <input
                        required
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        placeholder="correo@empresa.com"
                        className="w-full bg-[#0d0d0d] border border-gray-700 rounded-xl px-4 py-3 text-white placeholder-gray-600 focus:outline-none focus:border-hzgold-600 transition-colors text-sm"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">Teléfono</label>
                      <input
                        type="tel"
                        name="phone"
                        value={formData.phone}
                        onChange={handleChange}
                        placeholder="55 1234 5678"
                        className="w-full bg-[#0d0d0d] border border-gray-700 rounded-xl px-4 py-3 text-white placeholder-gray-600 focus:outline-none focus:border-hzgold-600 transition-colors text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Tipo de proyecto <span className="text-hzgold-500">*</span>
                      </label>
                      <select
                        required
                        name="project_type"
                        value={formData.project_type}
                        onChange={handleChange}
                        className="w-full bg-[#0d0d0d] border border-gray-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-hzgold-600 transition-colors text-sm [&>option]:bg-[#111111]"
                      >
                        <option value="web_app">Aplicación Web Escalable</option>
                        <option value="landing_page">Landing Page Moderna</option>
                        <option value="serverless_migration">Migración a Arquitectura Serverless</option>
                        <option value="automation">Automatización e Integraciones</option>
                        <option value="consulting">Consultoría Técnica AWS / Python</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Presupuesto estimado (MXN)
                    </label>
                    <input
                      type="text"
                      name="budget"
                      value={formData.budget}
                      onChange={handleChange}
                      placeholder="Ej. $15,000 - $30,000"
                      className="w-full bg-[#0d0d0d] border border-gray-700 rounded-xl px-4 py-3 text-white placeholder-gray-600 focus:outline-none focus:border-hzgold-600 transition-colors text-sm"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Descripción del proyecto <span className="text-hzgold-500">*</span>
                    </label>
                    <textarea
                      required
                      name="message"
                      rows={5}
                      value={formData.message}
                      onChange={handleChange}
                      placeholder="Describe brevemente los requerimientos, objetivos y si tienes algún deadline."
                      className="w-full bg-[#0d0d0d] border border-gray-700 rounded-xl px-4 py-3 text-white placeholder-gray-600 focus:outline-none focus:border-hzgold-600 transition-colors text-sm resize-none"
                    />
                  </div>

                  <button
                    disabled={status === 'loading'}
                    type="submit"
                    className="w-full flex items-center justify-center gap-2 bg-hzgold-600 hover:bg-hzgold-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-[#050505] font-bold py-4 px-6 rounded-xl text-sm"
                  >
                    {status === 'loading' ? (
                      'Enviando...'
                    ) : (
                      <>
                        Enviar Cotización <Send className="w-4 h-4" />
                      </>
                    )}
                  </button>
                  <p className="text-center text-xs text-gray-600">
                    Protegido por reCAPTCHA · Respondemos en menos de 24 horas
                  </p>
                </form>
              )}
            </div>

            {/* ── Contact card (1/3) ── */}
            <div className="space-y-6">

              {/* Direct contact */}
              <div className="bg-[#111111] border border-gray-800 rounded-2xl p-7">
                <h2 className="text-white font-bold text-lg mb-1">Contacto directo</h2>
                <p className="text-gray-500 text-sm mb-6">
                  ¿Prefieres hablar primero? Escríbenos por cualquiera de estos canales.
                </p>
                <ul className="space-y-4">
                  {CONTACT_ITEMS.map((item) => (
                    <li key={item.label}>
                      <a
                        href={item.href}
                        target={item.href.startsWith('http') ? '_blank' : undefined}
                        rel={item.href.startsWith('http') ? 'noopener noreferrer' : undefined}
                        className="flex items-center gap-4 group"
                      >
                        <span className="w-10 h-10 rounded-xl bg-gray-900 border border-gray-700 flex items-center justify-center text-gray-400 group-hover:border-hzgold-600 group-hover:text-hzgold-400 transition-all flex-shrink-0">
                          {item.icon}
                        </span>
                        <div>
                          <p className="text-xs text-gray-600 font-mono uppercase tracking-widest">{item.label}</p>
                          <p className="text-gray-300 text-sm group-hover:text-hzgold-400 transition-colors">
                            {item.value}
                          </p>
                        </div>
                      </a>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Process summary */}
              <div className="bg-[#111111] border border-gray-800 rounded-2xl p-7">
                <h2 className="text-white font-bold text-lg mb-4">¿Cómo funciona?</h2>
                <ol className="space-y-4">
                  {[
                    { step: '01', text: 'Envías tu cotización con los detalles del proyecto.' },
                    { step: '02', text: 'Respondemos en menos de 24 hrs con preguntas clave.' },
                    { step: '03', text: 'Llamada de discovery gratuita (30 min).' },
                    { step: '04', text: 'Propuesta técnica y económica formal en 2-3 días.' },
                  ].map((item) => (
                    <li key={item.step} className="flex items-start gap-4">
                      <span className="text-hzgold-500 font-mono text-xs font-bold mt-0.5 flex-shrink-0">
                        {item.step}
                      </span>
                      <p className="text-gray-400 text-sm leading-relaxed">{item.text}</p>
                    </li>
                  ))}
                </ol>
              </div>

            </div>
          </div>
        </section>

      </main>
    </>
  );
}
