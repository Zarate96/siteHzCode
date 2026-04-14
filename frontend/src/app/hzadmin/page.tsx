'use client';

import React, { useState, useEffect } from 'react';
import { api } from '@/services/api';
import { Trash2, PlusCircle } from 'lucide-react';

export default function AdminPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [jwtToken, setJwtToken] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [blogs, setBlogs] = useState<any[]>([]);
  
  // Blog Form State
  const [title, setTitle] = useState('');
  const [slug, setSlug] = useState('');
  const [summary, setSummary] = useState('');
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Check local storage for existing session
    const savedToken = localStorage.getItem('hz_admin_jwt');
    if (savedToken) {
      setJwtToken(savedToken);
      setIsAuthenticated(true);
    }
  }, []);

  useEffect(() => {
    if (isAuthenticated) {
      loadBlogs();
    }
  }, [isAuthenticated]);

  const loadBlogs = async () => {
    const data = await api.getBlogs();
    setBlogs(data || []);
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const token = await api.login(username, password);
      setJwtToken(token);
      localStorage.setItem('hz_admin_jwt', token);
      setIsAuthenticated(true);
    } catch (err: any) {
      alert(err.message || 'Login failed');
    }
    setLoading(false);
  };

  const handleLogout = () => {
    localStorage.removeItem('hz_admin_jwt');
    setJwtToken('');
    setIsAuthenticated(false);
  };

  const handleDelete = async (deleteSlug: string) => {
    if (window.confirm(`¿Estás seguro de eliminar el blog ${deleteSlug}?`)) {
      try {
        await api.deleteBlog(deleteSlug, jwtToken);
        alert('Blog eliminado');
        loadBlogs();
      } catch (err) {
        alert('Error de autenticación o en el servidor. Tu sesión puede haber expirado.');
        handleLogout();
      }
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.createBlog({
        titulo: title,
        slug: slug,
        resumen: summary,
        contenido: content,
        fecha: new Date().toISOString()
      }, jwtToken);
      alert('Blog creado exitosamente!');
      setTitle('');
      setSlug('');
      setSummary('');
      setContent('');
      loadBlogs();
    } catch (err) {
      alert('Error de autenticación o formato inválido. Tu sesión puede haber expirado.');
      handleLogout();
    }
    setLoading(false);
  };

  if (!isAuthenticated) {
    return (
      <main className="min-h-screen bg-[#0d1117] text-white flex items-center justify-center p-4">
        <form onSubmit={handleLogin} className="bg-[#161b22] border border-gray-700 p-8 rounded-xl shadow-2xl max-w-sm w-full">
          <h1 className="text-2xl font-bold mb-6 text-center text-blue-400">Panel de Administración</h1>
          <div className="mb-4">
            <label className="block text-sm font-medium mb-2">Usuario</label>
            <input 
              type="text" 
              required
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full bg-[#0d1117] border border-gray-700 rounded px-4 py-2 focus:border-hzgold-500" 
              placeholder="admin"
            />
          </div>
          <div className="mb-6">
            <label className="block text-sm font-medium mb-2">Contraseña</label>
            <input 
              type="password" 
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-[#0d1117] border border-gray-700 rounded px-4 py-2 focus:border-hzgold-500" 
              placeholder="••••••••"
            />
          </div>
          <button disabled={loading} type="submit" className="w-full bg-hzgold-600 hover:bg-hzgold-500 text-white font-bold py-2 px-4 rounded transition-colors disabled:opacity-50">
            {loading ? 'Accediendo...' : 'Entrar'}
          </button>
        </form>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#0d1117] text-white py-20 px-4">
      <div className="max-w-6xl mx-auto space-y-12">
        <div className="flex justify-between items-center bg-[#161b22] border border-gray-800 p-6 rounded-xl">
           <h1 className="text-3xl font-bold font-[Manrope] text-hzgold-400">Panel de Administración</h1>
           <button onClick={handleLogout} className="px-4 py-2 bg-red-600/20 text-red-500 border border-red-500/50 rounded hover:bg-red-600 hover:text-white transition-colors">
             Cerrar Sesión
           </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          
          {/* CREATE BLOG FORM */}
          <section className="bg-[#161b22] border border-gray-800 p-8 rounded-xl">
            <h2 className="text-2xl font-bold mb-6 flex items-center text-blue-400">
               <PlusCircle className="mr-2" /> Crear Nuevo Blog
            </h2>
            <form onSubmit={handleCreate} className="space-y-4">
              <div>
                <label className="block text-sm mb-1 text-gray-400">Título</label>
                <input required type="text" value={title} onChange={(e) => setTitle(e.target.value)} className="w-full bg-[#0d1117] border border-gray-700 rounded px-4 py-2 focus:border-blue-500" />
              </div>
              <div>
                <label className="block text-sm mb-1 text-gray-400">Slug (URL amigable)</label>
                <input required type="text" value={slug} onChange={(e) => setSlug(e.target.value)} className="w-full bg-[#0d1117] border border-gray-700 rounded px-4 py-2 focus:border-blue-500" placeholder="mi-primer-blog" />
              </div>
              <div>
                <label className="block text-sm mb-1 text-gray-400">Resumen</label>
                <textarea required rows={2} value={summary} onChange={(e) => setSummary(e.target.value)} className="w-full bg-[#0d1117] border border-gray-700 rounded px-4 py-2 focus:border-blue-500"></textarea>
              </div>
              <div>
                <label className="block text-sm mb-1 text-gray-400">Contenido (Admite HTML)</label>
                <textarea required rows={8} value={content} onChange={(e) => setContent(e.target.value)} className="w-full bg-[#0d1117] border border-gray-700 rounded px-4 py-2 focus:border-blue-500 font-mono text-sm"></textarea>
              </div>
              <button disabled={loading} type="submit" className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-3 px-4 rounded transition-colors disabled:opacity-50">
                {loading ? 'Guardando...' : 'Publicar Blog'}
              </button>
            </form>
          </section>

          {/* LIST BLOGS */}
          <section className="bg-[#161b22] border border-gray-800 p-8 rounded-xl">
            <h2 className="text-2xl font-bold mb-6 text-indigo-400">Artículos Publicados ({blogs.length})</h2>
            <div className="space-y-4 max-h-[600px] overflow-y-auto pr-2">
              {blogs.map((blog, idx) => (
                <div key={idx} className="bg-[#0d1117] border border-gray-700 p-4 rounded-lg flex justify-between items-start group hover:border-blue-500 transition-colors">
                  <div>
                    <h3 className="font-bold text-lg">{blog.titulo}</h3>
                    <p className="text-sm text-gray-500 font-mono mb-2">/{blog.slug}</p>
                    <span className="text-xs text-gray-400 bg-gray-800 px-2 py-1 rounded">{new Date(blog.fecha).toLocaleDateString()}</span>
                  </div>
                  <button 
                    onClick={() => handleDelete(blog.slug)}
                    className="p-2 text-gray-500 hover:text-red-500 hover:bg-red-500/10 rounded transition-colors"
                    title="Eliminar"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
              ))}
              {blogs.length === 0 && (
                <div className="text-gray-500 text-center py-12">No hay blogs guardados.</div>
              )}
            </div>
          </section>

        </div>
      </div>
    </main>
  );
}
