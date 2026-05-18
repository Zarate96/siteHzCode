'use client';

import React, { useState, useEffect } from 'react';
import { api } from '@/services/api';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Pagination, Navigation, Autoplay } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/pagination';
import 'swiper/css/navigation';
import {
  Terminal, Server, Code2, Cloud, Quote, ChevronRight, CheckCircle2
} from 'lucide-react';
import Link from 'next/link';

export default function Home() {
  const [activeTab, setActiveTab] = useState<'about' | 'experience'>('about');
  const [about, setAbout] = useState<any>(null);

  useEffect(() => {
    api.getAbout().then((data) => { if (data) setAbout(data); });
  }, []);

  const name = about?.name || 'Hugo Zarate Ortiz';
  const title = about?.title || 'Ingeniero en TI especializado en desarrollo web.';
  const bio1 = about?.bio_1 || 'Me he desempeñado en una amplia variedad de proyectos como desarrollador web, desde trabajos independientes hasta colaboraciones con empresas internacionales de consultoría. Mi enfoque se basa en el aprendizaje autodidacta y la búsqueda constante de nuevos desafíos.';
  const bio2 = about?.bio_2 || 'Mi pasión por aprender me ha llevado a trabajar en diferentes proyectos y tecnologías, lo que me permite aportar <strong>soluciones innovadoras y efectivas</strong> a cualquier proyecto en el que esté involucrado.';
  const avatarUrl = about?.avatar_url || '';

  return (
    <main className="min-h-screen bg-[#050505] text-white overflow-hidden">

      {/* 1. HEADER SECTION (Parallax / Center) */}
      <header className="relative h-screen flex justify-center items-center overflow-hidden">
        {/* Abstract animated background */}
        <div className="absolute inset-0 bg-gradient-to-b from-[#10141e] to-[#0d1117]">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-hzgold-600/20 rounded-full blur-[120px]"></div>
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-hzgold-700/20 rounded-full blur-[120px]"></div>
        </div>

        <div className="relative z-10 text-center px-4">
          <div className="flex justify-center mb-6">
            {/* The src="/logo.png" automatically looks in the frontend/public directory */}
            <img
              src="/logo.png"
              alt="HzCode"
              className="h-20 md:h-28 object-contain drop-shadow-[0_0_15px_rgba(184,150,107,0.3)] hover:scale-105 transition-transform duration-500"
            />
          </div>
          <a href="#about" className="inline-flex items-center text-hzgold-400 hover:text-blue-300 transition-colors">
            Explorar <ChevronRight className="ml-1 w-5 h-5 animate-bounce" />
          </a>
        </div>
      </header>

      {/* 2. TABS SECTION (.tabs view in old HTML) */}
      <section id="about" className="max-w-6xl mx-auto py-24 px-4">
        {/* Tab Controls */}
        <div className="flex border-b border-gray-800 mb-12">
          <button
            onClick={() => setActiveTab('about')}
            className={`px-8 py-4 text-sm md:text-lg font-bold font-[Manrope] uppercase tracking-wider transition-colors border-b-2 ${activeTab === 'about' ? 'text-hzgold-400 border-hzgold-400 bg-hzgold-900/10' : 'text-gray-500 border-transparent hover:text-gray-300'}`}
          >
            Sobre mí
          </button>
          <button
            onClick={() => setActiveTab('experience')}
            className={`px-8 py-4 text-sm md:text-lg font-bold font-[Manrope] uppercase tracking-wider transition-colors border-b-2 ${activeTab === 'experience' ? 'text-hzgold-400 border-hzgold-400 bg-hzgold-900/10' : 'text-gray-500 border-transparent hover:text-gray-300'}`}
          >
            Experiencia
          </button>
        </div>

        {/* Tab Content: About */}
        {activeTab === 'about' && (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 space-y-16">
            <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-center bg-[#111111]/50 p-8 rounded-2xl border border-gray-800/80 backdrop-blur-sm">
              <div className="md:col-span-8">
                <h2 className="text-3xl md:text-4xl font-bold mb-3">{name}</h2>
                <span className="text-hzgold-400 text-lg block mb-6">{title}</span>
                <p className="mb-4 text-gray-300 text-lg leading-relaxed">{bio1}</p>
                <p className="text-gray-300 text-lg leading-relaxed" dangerouslySetInnerHTML={{ __html: bio2 }} />
              </div>
              <div className="md:col-span-4 flex justify-center">
                <div className="w-56 h-56 rounded-2xl bg-gradient-to-tr from-hzgold-600 to-hzgold-900 p-1 rotate-3 hover:rotate-0 transition-transform duration-500 shadow-2xl">
                  <div className="w-full h-full bg-[#050505] rounded-xl overflow-hidden relative">
                    {avatarUrl ? (
                      <img src={avatarUrl} alt={name} className="w-full h-full object-cover" />
                    ) : (
                      <div className="absolute inset-0 bg-hzgold-500/10 flex items-center justify-center text-gray-500">Avatar</div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tab Content: Experience */}
        {activeTab === 'experience' && (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="space-y-8">

              {/* GGE - Actual */}
              <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-center bg-[#111111]/50 p-8 rounded-2xl border border-gray-800/80 backdrop-blur-sm group hover:border-hzgold-500/50 transition-colors">
                <div className="md:col-span-3">
                  <div className="h-32 bg-gray-900 rounded-xl flex flex-col items-center justify-center text-gray-600 group-hover:scale-105 transition-transform duration-500">
                    <img
                      src="/GGE_logo.png"
                      alt="HzCode"
                    />
                  </div>
                </div>
                <div className="md:col-span-9">
                  <div className="flex flex-wrap justify-between items-start mb-2">
                    <h2 className="text-2xl md:text-3xl font-bold text-white">Fullstack Developer | GGE</h2>
                    <span className="text-hzgold-500 font-mono text-sm">Marzo 2025 - Actualidad</span>
                  </div>
                  <span className="text-gray-500 font-mono mb-4 block text-sm">gge.edu.mx</span>
                  <p className="text-gray-300 text-lg leading-relaxed">
                    Implementación de soluciones End-to-End para el ecosistema educativo bajo principios de <strong>Clean Architecture</strong> y <strong>DDD</strong>. Enfoque en sistemas escalables mediante la separación de responsabilidades y el uso de <strong>Bounded Contexts</strong>.
                  </p>
                  <div className="flex flex-wrap gap-2 mt-4 text-xs font-mono text-gray-400">
                    <span>Python</span> • <span>AWS</span> • <span>Docker</span> • <span>Django</span> • <span>Solid</span>
                  </div>
                </div>
              </div>

              {/* Santander */}
              <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-center bg-[#111111]/50 p-8 rounded-2xl border border-gray-800/80 backdrop-blur-sm group hover:border-hzgold-500/50 transition-colors">
                <div className="md:col-span-3">
                  <div className="h-32 bg-gray-900 rounded-xl flex flex-col items-center justify-center text-gray-600 group-hover:scale-105 transition-transform duration-500">
                    <img
                      src="/santander_logo.png"
                      alt="HzCode"
                    />
                  </div>
                </div>
                <div className="md:col-span-9">
                  <div className="flex flex-wrap justify-between items-start mb-2">
                    <h2 className="text-2xl md:text-3xl font-bold text-white">Senior Software Developer | Santander</h2>
                    <span className="text-gray-500 font-mono text-sm">Julio 2024 - Abril 2025</span>
                  </div>
                  <span className="text-gray-500 font-mono mb-4 block text-sm">santander.com (USA Remote)</span>
                  <p className="text-gray-300 text-lg leading-relaxed">
                    Desarrollo de aplicaciones con <strong>Django</strong> para automatizar y optimizar la entrada de datos críticos de negocio en bases de datos gestionadas por IT. Implementación de flujos de automatización con Python en entornos Azure.
                  </p>
                  <div className="flex flex-wrap gap-2 mt-4 text-xs font-mono text-gray-400">
                    <span>Django</span> • <span>Azure</span> • <span>PostgreSQL</span> • <span>Agile</span>
                  </div>
                </div>
              </div>

              {/* Matersys / Gentera */}
              <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-center bg-[#111111]/50 p-8 rounded-2xl border border-gray-800/80 backdrop-blur-sm group hover:border-hzgold-500/50 transition-colors">
                <div className="md:col-span-3">
                  <div className="h-32 bg-gray-900 rounded-xl flex flex-col items-center justify-center text-gray-600 group-hover:scale-105 transition-transform duration-500">
                    <img
                      src="/yastas_logo.png"
                      alt="HzCode"
                    />
                  </div>
                </div>
                <div className="md:col-span-9">
                  <div className="flex flex-wrap justify-between items-start mb-2">
                    <h2 className="text-2xl md:text-3xl font-bold text-white">Desarrollador Python | Matersys</h2>
                    <span className="text-gray-500 font-mono text-sm">Julio 2023 - Julio 2024</span>
                  </div>
                  <span className="text-gray-500 font-mono mb-4 block text-sm">matersys.com</span>
                  <p className="text-gray-300 text-lg leading-relaxed">
                    Mantenimiento y despliegue de servicios de lógica de negocio mediante APIs REST en <strong>GCP</strong> para el proyecto Yastas (Gentera). Implementación bajo <strong>Arquitectura Hexagonal</strong> y paradigmas orientados a eventos usando <strong>FastAPI</strong> y <strong>Flask</strong>.
                  </p>
                  <div className="flex flex-wrap gap-2 mt-4 text-xs font-mono text-gray-400">
                    <span>FastAPI</span> • <span>GCP</span> • <span>Hexagonal Architecture</span> • <span>Event-driven</span>
                  </div>
                </div>
              </div>

              {/* Stefanini (Existente, pero actualizado con fechas) */}
              <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-center bg-[#111111]/50 p-8 rounded-2xl border border-gray-800/80 backdrop-blur-sm group hover:border-hzgold-500/50 transition-colors">
                <div className="md:col-span-3">
                  <div className="h-32 bg-gray-900 rounded-xl flex flex-col items-center justify-center text-gray-600 group-hover:scale-105 transition-transform duration-500">
                    <img
                      src="/walmart_logo.png"
                      alt="HzCode"
                    />
                  </div>
                </div>
                <div className="md:col-span-9">
                  <div className="flex flex-wrap justify-between items-start mb-2">
                    <h2 className="text-2xl md:text-3xl font-bold text-white">Desarrollador Backend | Stefanini</h2>
                    <span className="text-gray-500 font-mono text-sm">Julio 2022 - Mayo 2023</span>
                  </div>
                  <span className="text-gray-500 font-mono mb-4 block text-sm">stefanini.com</span>
                  <p className="text-gray-300 text-lg leading-relaxed">
                    Formé parte del equipo Kraken de Walmart, enfocado en la generación automatizada de reportes detallados y herramientas de recopilación/análisis de datos para toma de decisiones estratégicas.
                  </p>
                </div>
              </div>

              {/* Inetum (Existente, pero actualizado con fechas) */}
              <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-center bg-[#111111]/50 p-8 rounded-2xl border border-gray-800/80 backdrop-blur-sm group hover:border-hzgold-500/50 transition-colors">
                <div className="md:col-span-3">
                  <div className="h-32 bg-gray-900 rounded-xl flex flex-col items-center justify-center text-gray-600 group-hover:scale-105 transition-transform duration-500">
                    <img
                      src="/inetum_logo.png"
                      alt="HzCode"
                    />
                  </div>
                </div>
                <div className="md:col-span-9">
                  <div className="flex flex-wrap justify-between items-start mb-2">
                    <h2 className="text-2xl md:text-3xl font-bold text-white">Desarrollador Python | Inetum</h2>
                    <span className="text-gray-500 font-mono text-sm">Agosto 2021 - Junio 2022</span>
                  </div>
                  <span className="text-gray-500 font-mono mb-4 block text-sm">inetum.com</span>
                  <p className="text-gray-300 text-lg leading-relaxed">
                    Encargado del desarrollo de soluciones web y scripts de automatización corporativa para Telefónica utilizando <strong>Django</strong> y técnicas de <strong>Web Scraping</strong>.
                  </p>
                </div>
              </div>

            </div>
          </div>
        )}
      </section>
      {/* 3. SKILL CARDS (.habilities-container in old HTML) */}
      <section className="py-24 bg-[#080808] border-y border-gray-800/50">
        <div className="max-w-6xl mx-auto px-4">
          <h2 className="text-3xl md:text-5xl font-bold mb-16 text-center">Habilidades Técnicas</h2>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-6">
            {[
              { name: 'Python', pct: 'w-[95%]', icon: <Terminal className="w-8 h-8" /> },
              { name: 'Django', pct: 'w-[90%]', icon: <Server className="w-8 h-8" /> },
              { name: 'AWS', pct: 'w-[85%]', icon: <Cloud className="w-8 h-8" /> },
              { name: 'Golang', pct: 'w-[75%]', icon: <Code2 className="w-8 h-8" /> },
              { name: 'Flask', pct: 'w-[80%]', icon: <Server className="w-8 h-8" /> },
            ].map((skill, i) => (
              <div key={i} className="bg-[#111111] border border-gray-800 rounded-xl p-6 text-center hover:-translate-y-2 hover:border-hzgold-500/50 transition-all duration-300 shadow-xl group">
                <div className="w-16 h-16 mx-auto bg-gray-900 rounded-full flex items-center justify-center text-gray-400 group-hover:text-hzgold-400 transition-colors mb-4">
                  {skill.icon}
                </div>
                <h3 className="font-bold text-lg mb-4">{skill.name}</h3>
                <div className="w-full bg-gray-900 rounded-full h-1.5 overflow-hidden">
                  <div className={`bg-hzgold-500 h-1.5 rounded-full ${skill.pct}`}></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 4. SERVICES SWIPER (.services-container in old HTML) */}
      <section className="py-24 max-w-6xl mx-auto px-4">
        <h2 className="text-3xl md:text-5xl font-bold mb-16 text-center text-white">Servicios</h2>
        <div className="rounded-2xl overflow-hidden shadow-2xl border border-gray-800 relative bg-[#0a0a0a]">
          <Swiper
            modules={[Pagination, Navigation, Autoplay]}
            pagination={{ clickable: true }}
            navigation
            autoplay={{ delay: 5000 }}
            loop={true}
            className="w-full h-[400px]"
          >
            {/* Servicio 1: Arquitectura y Backend */}
            <SwiperSlide>
              <div className="flex flex-col items-center justify-center h-full p-12 text-center">
                <h3 className="text-3xl md:text-4xl font-bold mb-6 text-hzgold-400">Arquitectura de Software y Backend</h3>
                <p className="text-gray-300 text-lg md:text-xl max-w-3xl leading-relaxed">
                  Especializado en el desarrollo End-to-End con <strong>Python (Django, FastAPI)</strong>. Diseño sistemas escalables utilizando <strong>Domain-Driven Design (DDD)</strong> y <strong>Clean Architecture</strong> para asegurar soluciones corporativas robustas y mantenibles.
                </p>
              </div>
            </SwiperSlide>

            {/* Servicio 2: Cloud & DevOps */}
            <SwiperSlide>
              <div className="flex flex-col items-center justify-center h-full p-12 text-center">
                <h3 className="text-3xl md:text-4xl font-bold mb-6 text-hzgold-300">Cloud Solutions & DevOps</h3>
                <p className="text-gray-300 text-lg md:text-xl max-w-3xl leading-relaxed">
                  Implementación de infraestructuras de alta disponibilidad en <strong>AWS, GCP y Azure</strong>. Despliegue de microservicios, <strong>arquitecturas orientadas a eventos</strong> y automatización continua para optimizar el rendimiento y la seguridad del negocio.
                </p>
              </div>
            </SwiperSlide>

            {/* Servicio 3: IA & Automatización */}
            <SwiperSlide>
              <div className="flex flex-col items-center justify-center h-full p-12 text-center">
                <h3 className="text-3xl md:text-4xl font-bold mb-6 text-hzgold-400">Automatización e Inteligencia Artificial</h3>
                <p className="text-gray-300 text-lg md:text-xl max-w-3xl leading-relaxed">
                  Integración de <strong>agentes de IA</strong> y herramientas de análisis inteligente de datos. Impulso la productividad empresarial mediante flujos automatizados con scripts de Python y soluciones tecnológicas de vanguardia adaptadas a procesos críticos.
                </p>
              </div>
            </SwiperSlide>
          </Swiper>
        </div>
      </section>

      {/* 5. RECOMMENDATIONS (.recomendations in old HTML) */}
      <section className="py-24 bg-[#111111] border-y border-gray-800/50">
        <div className="max-w-6xl mx-auto px-4">
          <h2 className="text-3xl md:text-5xl font-bold mb-16 text-center">Recomendaciones</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                text: "Hugo es una persona dedicada que cumple sus compromisos en tiempo y forma, colaborativa y muy capaz. Inquieto, busca soluciones.",
                name: "Giancarlo Marino",
                title: "CEO at MIENLACE"
              },
              {
                text: "Excelente colaborador, comprometido, responsable y fiel cumplidor de sus obligaciones.  Preocupado siempre por mejorar.",
                name: "Oscar Daniel Vásquez Cruz",
                title: "Director de Proyectos - Cloud TI"
              },
              {
                text: "Profesionista dedicado, apasionado y enfocado completamente en temas de programación y desarrollo de alta disponibilidad.",
                name: "Juan León Cruz",
                title: "Líder de Proyecto - Kraken"
              }
            ].map((rec, i) => (
              <div key={i} className="bg-[#050505] border border-gray-800 p-8 rounded-2xl relative shadow-lg">
                <Quote className="absolute top-6 right-6 w-12 h-12 text-gray-800" />
                <p className="text-gray-300 italic mb-8 relative z-10 text-lg leading-relaxed">"{rec.text}"</p>
                <div>
                  <h4 className="font-bold text-white text-lg">{rec.name}</h4>
                  <span className="text-hzgold-400 text-sm">{rec.title}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 6. CALL TO ACTION (Cotizaciones) */}
      <section className="relative overflow-hidden w-full py-24 text-center bg-gradient-to-tr from-hzgold-900 to-[#10141e] border-t border-hzgold-900/30">
        <div className="relative z-10">
          <h2 className="text-3xl md:text-6xl font-bold mb-6 text-white text-shadow-sm">¿Listo para llevar tu idea a la nube?</h2>
          <p className="text-lg md:text-2xl mb-12 max-w-2xl mx-auto text-blue-200">
            Solicita una cotización hoy y transformemos tu proyecto en una realidad infinitamente escalable.
          </p>
          <Link href="/cotizacion">
            <span className="inline-flex items-center bg-white text-hzgold-900 px-10 py-5 rounded-full font-bold text-lg shadow-xl shadow-hzgold-500/20 hover:scale-105 hover:bg-gray-50 transition-all cursor-pointer">
              Solicitar Cotización <CheckCircle2 className="ml-2 w-6 h-6" />
            </span>
          </Link>
        </div>
      </section>

    </main>
  );
}
