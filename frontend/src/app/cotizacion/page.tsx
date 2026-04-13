'use client';

import React, { useState } from 'react';
import { api } from '@/services/api';

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
      // Usaremos el mismo endpoint de contacto pero enriquecido para cotizaciones
      await api.sendContactMessage({
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        subject: `Nueva Cotización: ${formData.project_type} - Presupuesto: ${formData.budget}`,
        message: formData.message
      });
      setStatus('success');
      setFormData({ name: '', email: '', phone: '', project_type: 'web_app', budget: '', message: '' });
    } catch (err) {
      console.error(err);
      setStatus('error');
    }
  };

  return (
    <main className="min-h-screen bg-[#0d1117] text-white py-20 px-4">
      <div className="max-w-3xl mx-auto bg-[#161b22] border border-gray-700 p-8 rounded-lg shadow-xl">
        <h1 className="text-4xl font-bold mb-6 font-[Manrope] text-center text-blue-400">Solicitar Cotización</h1>
        <p className="text-gray-300 text-center mb-10">
          Cuéntanos sobre tu idea y nos pondremos en contacto contigo lo antes posible para proyectarlo en la nube.
        </p>

        {status === 'success' && (
          <div className="bg-green-600/20 border border-green-500 text-green-400 p-4 rounded mb-6 text-center">
            ¡Tu solicitud de cotización ha sido enviada con éxito! Te contactaremos a la brevedad.
          </div>
        )}

        {status === 'error' && (
          <div className="bg-red-600/20 border border-red-500 text-red-400 p-4 rounded mb-6 text-center">
            Ocurrió un error al enviar tu solicitud. Intenta nuevamente más tarde.
          </div>
        )}

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
      </div>
    </main>
  );
}
