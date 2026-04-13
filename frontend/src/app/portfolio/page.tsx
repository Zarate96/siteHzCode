import React from 'react';

export default function PortfolioPage() {
  return (
    <main className="min-h-screen bg-[#0d1117] text-white py-20 px-4">
      <div className="max-w-5xl mx-auto">
        <h1 className="text-4xl font-bold mb-6 font-[Manrope] text-center">Portafolio</h1>
        <p className="text-center text-gray-400 mb-12">
          Una selección de mis proyectos web y aplicaciones más recientes.
        </p>

        {/* MOCK DATA OF PORTFOLIO FOR NOW */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <article className="group relative bg-[#161b22] border border-gray-700 rounded-lg overflow-hidden">
            <div className="h-64 bg-gray-800 w-full flex items-center justify-center border-b border-gray-700 group-hover:scale-105 transition-transform duration-500">
               <span className="text-gray-500">Demo Image Placeholder</span>
            </div>
            <div className="p-6 relative z-10 bg-[#161b22]">
              <h2 className="text-2xl font-bold mb-2">Sistema de Reportes Kraken</h2>
              <p className="text-gray-400 mb-4">
                Generador automatizado de reportes con información de inteligencia de negocios para toma de decisiones. 
                Desarrollado con Python en el backend.
              </p>
              <a href="#" className="inline-block px-4 py-2 border border-blue-500 text-blue-400 rounded hover:bg-blue-600 hover:text-white transition-colors">
                Ver Proyecto
              </a>
            </div>
          </article>

          <article className="group relative bg-[#161b22] border border-gray-700 rounded-lg overflow-hidden">
            <div className="h-64 bg-gray-800 w-full flex items-center justify-center border-b border-gray-700 group-hover:scale-105 transition-transform duration-500">
               <span className="text-gray-500">Demo Image Placeholder</span>
            </div>
            <div className="p-6 relative z-10 bg-[#161b22]">
              <h2 className="text-2xl font-bold mb-2">Plataforma de Automatización</h2>
              <p className="text-gray-400 mb-4">
                Solución integral web construida en Django para la orquestación y automatización de tareas en infraestructura corporativa.
              </p>
              <a href="#" className="inline-block px-4 py-2 border border-blue-500 text-blue-400 rounded hover:bg-blue-600 hover:text-white transition-colors">
                Ver Proyecto
              </a>
            </div>
          </article>
        </div>
      </div>
    </main>
  );
}
