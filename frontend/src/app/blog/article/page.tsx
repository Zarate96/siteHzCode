'use client';

import React, { useEffect, useState, Suspense } from 'react';
import { api } from '@/services/api';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';

function ArticleContent() {
  const searchParams = useSearchParams();
  const slug = searchParams.get('slug');
  const [blog, setBlog] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    async function fetchBlog() {
      if (!slug) {
        setError(true);
        setLoading(false);
        return;
      }
      const data = await api.getBlogBySlug(slug);
      if (data && !data.message) {
        setBlog(data);
      } else {
        setError(true);
      }
      setLoading(false);
    }
    fetchBlog();
  }, [slug]);

  if (loading) {
    return (
      <main className="min-h-screen bg-[#050505] text-white flex justify-center items-center">
         <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-hzgold-500"></div>
      </main>
    );
  }

  if (error || !blog) {
    return (
      <main className="min-h-screen bg-[#050505] text-white flex flex-col justify-center items-center">
         <h1 className="text-3xl font-bold mb-4">Artículo no encontrado</h1>
         <Link href="/blog" className="text-hzgold-500 hover:text-hzgold-400">&larr; Volver al blog</Link>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#050505] text-white py-20 px-4">
      <article className="max-w-3xl mx-auto">
        <Link href="/blog" className="text-hzgold-500 hover:text-hzgold-400 mb-8 inline-block">&larr; Volver al blog</Link>
        <header className="mb-10">
          <span className="text-hzgold-400 block mb-2">{new Date(blog.fecha || Date.now()).toLocaleDateString()}</span>
          <h1 className="text-4xl md:text-5xl font-bold font-[Manrope] mb-6">{blog.titulo}</h1>
          <div className="h-64 md:h-96 w-full bg-[#111111] rounded-lg flex items-center justify-center text-gray-500 border border-gray-800">
            Image Placeholder
          </div>
        </header>
        <section className="prose prose-invert prose-yellow max-w-none heading-font">
          <div dangerouslySetInnerHTML={{ __html: blog.contenido || '<p>Contenido del artículo no disponible.</p>' }} />
        </section>
      </article>
    </main>
  );
}

export default function BlogArticle() {
  return (
    <Suspense fallback={
       <main className="min-h-screen bg-[#050505] text-white flex justify-center items-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-hzgold-500"></div>
       </main>
    }>
      <ArticleContent />
    </Suspense>
  );
}
