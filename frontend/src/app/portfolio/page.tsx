'use client';

import React, { useState, useEffect } from 'react';
import { api } from '@/services/api';
import { ExternalLink, FolderOpen } from 'lucide-react';

export default function PortfolioPage() {
  const [projects, setProjects] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.getProjects().then((data) => {
      setProjects(data || []);
      setLoading(false);
    });
  }, []);

  return (
    <main className="min-h-screen bg-[#0d1117] text-white py-20 px-4">
      <div className="max-w-5xl mx-auto">
        <h1 className="text-4xl md:text-5xl font-bold mb-4 font-[Manrope] text-center">Portafolio</h1>
        <p className="text-center text-gray-400 mb-16 text-lg">
          Una selección de mis proyectos web y aplicaciones más recientes.
        </p>

        {loading && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {[1, 2].map((i) => (
              <div key={i} className="bg-[#161b22] border border-gray-800 rounded-xl overflow-hidden animate-pulse">
                <div className="h-56 bg-gray-800" />
                <div className="p-6 space-y-3">
                  <div className="h-6 bg-gray-700 rounded w-3/4" />
                  <div className="h-4 bg-gray-800 rounded w-full" />
                  <div className="h-4 bg-gray-800 rounded w-2/3" />
                </div>
              </div>
            ))}
          </div>
        )}

        {!loading && projects.length === 0 && (
          <div className="text-center py-24 border border-dashed border-gray-800 rounded-2xl text-gray-500">
            <FolderOpen className="w-16 h-16 mx-auto mb-4 opacity-30" />
            <p className="text-xl">Próximamente — El portafolio está siendo actualizado.</p>
          </div>
        )}

        {!loading && projects.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {projects.map((project) => (
              <article
                key={project.id}
                className="group relative bg-[#161b22] border border-gray-700 rounded-xl overflow-hidden hover:border-hzgold-500/50 transition-all duration-300 shadow-lg"
              >
                {/* Image */}
                <div className="h-56 bg-gray-900 w-full overflow-hidden border-b border-gray-700 relative">
                  {project.image_url ? (
                    <img
                      src={project.image_url}
                      alt={project.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-600 group-hover:scale-105 transition-transform duration-500">
                      <FolderOpen className="w-12 h-12 opacity-30" />
                    </div>
                  )}
                </div>

                <div className="p-6">
                  <h2 className="text-2xl font-bold mb-2 text-white">{project.title}</h2>
                  <p className="text-gray-400 mb-4 leading-relaxed">{project.description}</p>

                  {/* Tags */}
                  {project.tags && project.tags.length > 0 && (
                    <div className="flex flex-wrap gap-2 mb-4">
                      {project.tags.map((tag: string, i: number) => (
                        <span key={i} className="text-xs px-2 py-1 bg-hzgold-900/40 text-hzgold-400 border border-hzgold-800/50 rounded-full">
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}

                  {project.project_url && (
                    <a
                      href={project.project_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 px-4 py-2 border border-hzgold-500/50 text-hzgold-400 rounded-lg hover:bg-hzgold-600 hover:text-white hover:border-hzgold-600 transition-colors"
                    >
                      Ver Proyecto <ExternalLink className="w-4 h-4" />
                    </a>
                  )}
                </div>
              </article>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
