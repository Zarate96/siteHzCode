'use client';

import React, { useEffect, useState } from 'react';
import { api } from '@/services/api';
import Link from 'next/link';

export default function BlogPage() {
  const [blogs, setBlogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchBlogs() {
      const data = await api.getBlogs();
      setBlogs(data || []);
      setLoading(false);
    }
    fetchBlogs();
  }, []);

  return (
    <main className="min-h-screen bg-[#050505] text-white py-24 px-4">
      <div className="max-w-5xl mx-auto">
        <h1 className="text-4xl font-bold mb-12 font-[Manrope] text-center">Blog</h1>
        
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-hzgold-500"></div>
          </div>
        ) : blogs.length === 0 ? (
          <div className="text-center text-gray-400">No hay artículos publicados aún.</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {blogs.map((blog, idx) => (
              <article key={idx} className="bg-[#111111] border border-gray-800 rounded-lg overflow-hidden hover:border-hzgold-500 hover:-translate-y-1 transition-all duration-300">
                <div className="h-48 bg-[#1a1a1a] w-full overflow-hidden flex items-center justify-center text-gray-600">
                  {/* Imagen dinámica en el futuro cuando el S3 se configure */}
                  <span>Image Placeholder</span>
                </div>
                <div className="p-6">
                  <span className="text-xs text-hzgold-400 mb-2 block">{new Date(blog.fecha || Date.now()).toLocaleDateString()}</span>
                  <h2 className="text-xl font-bold mb-3 line-clamp-2">{blog.titulo}</h2>
                  <p className="text-gray-400 mb-4 line-clamp-3 text-sm">{blog.resumen}</p>
                  <Link href={`/blog/article?slug=${blog.slug}`} className="text-hzgold-500 hover:text-hzgold-400 font-medium text-sm">
                    Leer más &rarr;
                  </Link>
                </div>
              </article>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
