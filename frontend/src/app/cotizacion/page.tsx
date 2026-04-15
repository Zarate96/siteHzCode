'use client';

import React, { useState, useEffect } from 'react';
import { api } from '@/services/api';
import Script from 'next/script';

const RECAPTCHA_SITE_KEY = '6LfGGLgsAAAAAGM2Gi__RUzKv3OyQ4KsDdnmw6l6';

declare global {
  interface Window {
    grecaptcha: any;
  }
}

export default function CotizacionPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    project_type: 'web_app', // default
    budget: '',
    message: ''
  });
  
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('loading');
    
    try {
      // Get reCAPTCHA v3 token
      let recaptchaToken = '';
      if (window.grecaptcha) {
        recaptchaToken = await window.grecaptcha.execute(RECAPTCHA_SITE_KEY, { action: 'submit_cotizacion' });
      }

      await api.sendContactMessage({
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        subject: `Nueva Cotización: ${formData.project_type} - Presupuesto: ${formData.budget}`,
        message: formData.message,
        recaptcha_token: recaptchaToken
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
    <Script src={`https://www.google.com/recaptcha/api.js?render=${RECAPTCHA_SITE_KEY}`} strategy="lazyOnload" />
    <main className="min-h-screen bg-[#0d1117] text-white py-20 px-4">
      <div className="max-w-3xl mx-auto bg-[#161b22] border border-gray-700 p-8 rounded-lg shadow-xl">
        <h1 className="text-4xl font-bold mb-6 font-[Manrope] text-center text-blue-400">Solicitar Cotización</h1>
        <p className="text-gray-300 text-center mb-10">
          Cuéntanos sobre tu idea y nos pondremos en contacto contigo lo antes posible para proyectarlo en la nube.
        </p>

        {/* Full success screen — replaces the form */}
        {status === 'success' && (
          <div className="text-center py-12 space-y-6">
            <div className="w-20 h-20 mx-auto bg-green-600/20 rounded-full flex items-center justify-center border-2 border-green-500">
              <svg className="w-10 h-10 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
            </div>
            <h2 className="text-2xl font-bold text-green-400">¡Solicitud Enviada!</h2>
            <p className="text-gray-300 text-lg max-w-md mx-auto">
              Hemos recibido tu cotización exitosamente. Nos pondremos en contacto contigo a la brevedad posible.
            </p>
            <p className="text-gray-500 text-sm">Revisa tu correo electrónico para una confirmación.</p>
            <button
              onClick={() => setStatus('idle')}
              className="mt-4 px-6 py-2 border border-gray-600 text-gray-300 rounded hover:bg-gray-800 transition-colors"
            >
              Enviar otra cotización
            </button>
          </div>
        )}

        {status === 'error' && (
          <div className="bg-red-600/20 border border-red-500 text-red-400 p-4 rounded mb-6 text-center">
            Ocurrió un error al enviar tu solicitud. Intenta nuevamente más tarde.
          </div>
        )}

        {status !== 'success' && (
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium mb-2">Nombre completo *</label>
              <input required type="text" name="name" value={formData.name} onChange={handleChange} className="w-full bg-[#0d1117] border border-gray-700 rounded px-4 py-2 focus:outline-none focus:border-blue-500" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Correo electrónico *</label>
              <input required type="email" name="email" value={formData.email} onChange={handleChange} className="w-full bg-[#0d1117] border border-gray-700 rounded px-4 py-2 focus:outline-none focus:border-blue-500" />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium mb-2">Teléfono</label>
              <input type="tel" name="phone" value={formData.phone} onChange={handleChange} className="w-full bg-[#0d1117] border border-gray-700 rounded px-4 py-2 focus:outline-none focus:border-blue-500" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Tipo de Proyecto *</label>
              <select required name="project_type" value={formData.project_type} onChange={handleChange} className="w-full bg-[#0d1117] border border-gray-700 rounded px-4 py-2 focus:outline-none focus:border-blue-500 text-white [&>option]:bg-[#161b22]">
                <option value="web_app">Aplicación Web Escalable</option>
                <option value="landing_page">Landing Page Moderna</option>
                <option value="serverless_migration">Migración a Arquitectura Serverless</option>
                <option value="consulting">Consultoría Técnica AWS / Python</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Presupuesto Estimado (MXN)</label>
            <input type="text" name="budget" placeholder="Ej. $10,000 - $20,000" value={formData.budget} onChange={handleChange} className="w-full bg-[#0d1117] border border-gray-700 rounded px-4 py-2 focus:outline-none focus:border-blue-500" />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Descripción del Proyecto *</label>
            <textarea required name="message" rows={5} value={formData.message} onChange={handleChange} placeholder="Describe brevemente los requerimientos, los objetivos y si tienes algún deadline." className="w-full bg-[#0d1117] border border-gray-700 rounded px-4 py-2 focus:outline-none focus:border-blue-500"></textarea>
          </div>

          <button disabled={status === 'loading'} type="submit" className="w-full bg-blue-600 hover:bg-blue-500 transition-colors text-white font-bold py-3 px-4 rounded disabled:opacity-50">
            {status === 'loading' ? 'Enviando...' : 'Enviar Cotización'}
          </button>
        </form>
        )}
      </div>
    </main>
    </>
  );
}
