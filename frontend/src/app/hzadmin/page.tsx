'use client';

import React, { useState, useEffect, useRef } from 'react';
import { api } from '@/services/api';
import { Trash2, PlusCircle, Inbox, FileText, CheckCircle, Circle, FolderOpen, User, Upload, ImageIcon, X } from 'lucide-react';

// ─────────────────────────────────────────────
// Reusable Image Uploader Component
// ─────────────────────────────────────────────
function ImageUploader({ token, onUploaded, currentUrl = '' }: {
  token: string;
  onUploaded: (url: string) => void;
  currentUrl?: string;
}) {
  const [uploading, setUploading] = useState(false);
  const [preview, setPreview] = useState(currentUrl);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFile = async (file: File) => {
    if (!file) return;
    setUploading(true);
    try {
      const { upload_url, public_url } = await api.getPresignedUploadUrl(file.name, file.type, token);
      await api.uploadFileToS3(upload_url, file);
      setPreview(public_url);
      onUploaded(public_url);
    } catch (err) {
      alert('Error al subir la imagen. Verifica los permisos de S3.');
    }
    setUploading(false);
  };

  return (
    <div
      className="relative border-2 border-dashed border-gray-700 rounded-lg overflow-hidden cursor-pointer hover:border-hzgold-500 transition-colors group"
      style={{ minHeight: 140 }}
      onClick={() => inputRef.current?.click()}
      onDragOver={(e) => e.preventDefault()}
      onDrop={(e) => { e.preventDefault(); const f = e.dataTransfer.files[0]; if (f) handleFile(f); }}
    >
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFile(f); }}
      />
      {uploading && (
        <div className="absolute inset-0 bg-[#0d1117]/80 flex items-center justify-center z-10">
          <div className="text-hzgold-400 animate-pulse flex flex-col items-center gap-2">
            <Upload className="w-8 h-8" />
            <span className="text-sm">Subiendo...</span>
          </div>
        </div>
      )}
      {preview ? (
        <div className="relative">
          <img src={preview} alt="preview" className="w-full h-36 object-cover" />
          <button
            type="button"
            onClick={(e) => { e.stopPropagation(); setPreview(''); onUploaded(''); }}
            className="absolute top-2 right-2 bg-red-600 rounded-full p-1 hover:bg-red-500 transition-colors"
          >
            <X className="w-3 h-3 text-white" />
          </button>
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center h-36 text-gray-500 group-hover:text-hzgold-400 transition-colors">
          <ImageIcon className="w-8 h-8 mb-2" />
          <span className="text-sm">Arrastra una imagen o haz clic</span>
        </div>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────
// Main Admin Page
// ─────────────────────────────────────────────
export default function AdminPage() {
  const [activeTab, setActiveTab] = useState<'blogs' | 'mensajes' | 'portafolio' | 'about'>('blogs');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [jwtToken, setJwtToken] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Blog state
  const [blogs, setBlogs] = useState<any[]>([]);
  const [title, setTitle] = useState('');
  const [slug, setSlug] = useState('');
  const [summary, setSummary] = useState('');
  const [content, setContent] = useState('');
  const [blogImage, setBlogImage] = useState('');

  // Messages state
  const [messages, setMessages] = useState<any[]>([]);

  // Portfolio state
  const [projects, setProjects] = useState<any[]>([]);
  const [projectTitle, setProjectTitle] = useState('');
  const [projectDesc, setProjectDesc] = useState('');
  const [projectUrl, setProjectUrl] = useState('');
  const [projectImage, setProjectImage] = useState('');
  const [projectTags, setProjectTags] = useState('');

  // About state
  const [aboutData, setAboutData] = useState({ name: '', title: '', bio_1: '', bio_2: '', avatar_url: '' });
  const [aboutSaving, setAboutSaving] = useState(false);

  const [loading, setLoading] = useState(false);

  // ── Auth ────────────────────────────────────
  useEffect(() => {
    const savedToken = localStorage.getItem('hz_admin_jwt');
    if (savedToken) { setJwtToken(savedToken); setIsAuthenticated(true); }
  }, []);

  useEffect(() => {
    if (isAuthenticated && jwtToken) {
      loadBlogs();
      loadMessages();
      loadProjects();
      loadAbout();
    }
  }, [isAuthenticated, jwtToken]);

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

  // ── Blog ────────────────────────────────────
  const loadBlogs = async () => setBlogs((await api.getBlogs()) || []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.createBlog({
        titulo: title, slug, resumen: summary, contenido: content,
        imagen_url: blogImage, fecha: new Date().toISOString()
      }, jwtToken);
      alert('Blog creado exitosamente!');
      setTitle(''); setSlug(''); setSummary(''); setContent(''); setBlogImage('');
      loadBlogs();
    } catch {
      alert('Error de autenticación o formato inválido. Tu sesión puede haber expirado.');
      handleLogout();
    }
    setLoading(false);
  };

  const handleDeleteBlog = async (deleteSlug: string) => {
    if (window.confirm(`¿Eliminar el blog "${deleteSlug}"?`)) {
      try {
        await api.deleteBlog(deleteSlug, jwtToken);
        loadBlogs();
      } catch {
        alert('Error al eliminar. Tu sesión puede haber expirado.');
        handleLogout();
      }
    }
  };

  // ── Messages ────────────────────────────────
  const loadMessages = async () => setMessages((await api.getMessages(jwtToken)) || []);

  const handleToggleMessage = async (id: string, currentStatus: boolean) => {
    try {
      await api.updateMessageStatus(id, !currentStatus, jwtToken);
      loadMessages();
    } catch { alert('Error updating status'); }
  };

  // ── Portfolio ───────────────────────────────
  const loadProjects = async () => setProjects((await api.getProjects()) || []);

  const handleCreateProject = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.createProject({
        title: projectTitle, description: projectDesc,
        image_url: projectImage, project_url: projectUrl,
        tags: projectTags.split(',').map(t => t.trim()).filter(Boolean),
      }, jwtToken);
      alert('Proyecto creado!');
      setProjectTitle(''); setProjectDesc(''); setProjectUrl(''); setProjectImage(''); setProjectTags('');
      loadProjects();
    } catch {
      alert('Error al crear proyecto. Tu sesión puede haber expirado.');
      handleLogout();
    }
    setLoading(false);
  };

  const handleDeleteProject = async (id: string) => {
    if (window.confirm('¿Eliminar este proyecto?')) {
      try {
        await api.deleteProject(id, jwtToken);
        loadProjects();
      } catch {
        alert('Error al eliminar proyecto.');
      }
    }
  };

  // ── About ───────────────────────────────────
  const loadAbout = async () => {
    const data = await api.getAbout();
    if (data) setAboutData({ name: data.name || '', title: data.title || '', bio_1: data.bio_1 || '', bio_2: data.bio_2 || '', avatar_url: data.avatar_url || '' });
  };

  const handleSaveAbout = async (e: React.FormEvent) => {
    e.preventDefault();
    setAboutSaving(true);
    try {
      await api.updateAbout(aboutData, jwtToken);
      alert('Sección "Sobre mí" actualizada!');
    } catch {
      alert('Error al guardar. Tu sesión puede haber expirado.');
      handleLogout();
    }
    setAboutSaving(false);
  };

  // ── LOGIN FORM ──────────────────────────────
  if (!isAuthenticated) {
    return (
      <main className="min-h-screen bg-[#0d1117] text-white flex items-center justify-center p-4">
        <form onSubmit={handleLogin} className="bg-[#161b22] border border-gray-700 p-8 rounded-xl shadow-2xl max-w-sm w-full">
          <h1 className="text-2xl font-bold mb-6 text-center text-hzgold-400">Panel de Administración</h1>
          <div className="mb-4">
            <label className="block text-sm font-medium mb-2">Usuario</label>
            <input type="text" required value={username} onChange={(e) => setUsername(e.target.value)}
              className="w-full bg-[#0d1117] border border-gray-700 rounded px-4 py-2 focus:border-hzgold-500" placeholder="admin" />
          </div>
          <div className="mb-6">
            <label className="block text-sm font-medium mb-2">Contraseña</label>
            <input type="password" required value={password} onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-[#0d1117] border border-gray-700 rounded px-4 py-2 focus:border-hzgold-500" placeholder="••••••••" />
          </div>
          <button disabled={loading} type="submit" className="w-full bg-hzgold-600 hover:bg-hzgold-500 text-white font-bold py-2 px-4 rounded transition-colors disabled:opacity-50">
            {loading ? 'Accediendo...' : 'Entrar'}
          </button>
        </form>
      </main>
    );
  }

  // ── Tab navigation config ───────────────────
  const tabs = [
    { id: 'blogs', label: 'Blogs', icon: <FileText className="w-4 h-4" /> },
    {
      id: 'mensajes', label: 'Cotizaciones', icon: <Inbox className="w-4 h-4" />,
      badge: messages.filter(m => !m.is_answered).length
    },
    { id: 'portafolio', label: 'Portafolio', icon: <FolderOpen className="w-4 h-4" /> },
    { id: 'about', label: 'Sobre Mí', icon: <User className="w-4 h-4" /> },
  ] as const;

  // ── DASHBOARD ───────────────────────────────
  return (
    <main className="min-h-screen bg-[#0d1117] text-white py-20 px-4">
      <div className="max-w-6xl mx-auto space-y-8">

        {/* Header */}
        <div className="flex flex-wrap justify-between items-center bg-[#161b22] border border-gray-800 p-6 rounded-xl gap-4">
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="text-2xl font-bold font-[Manrope] text-hzgold-400 mr-2">Panel de Administración</h1>
            {tabs.map(tab => (
              <button key={tab.id} onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center gap-2 px-4 py-2 rounded transition-colors text-sm font-medium ${activeTab === tab.id ? 'bg-hzgold-600 text-white' : 'hover:bg-gray-800 text-gray-400'}`}>
                {tab.icon} {tab.label}
                {'badge' in tab && tab.badge > 0 && (
                  <span className="bg-red-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">{tab.badge}</span>
                )}
              </button>
            ))}
          </div>
          <button onClick={handleLogout} className="px-4 py-2 bg-red-600/20 text-red-500 border border-red-500/50 rounded hover:bg-red-600 hover:text-white transition-colors text-sm">
            Cerrar Sesión
          </button>
        </div>

        {/* ── TAB: BLOGS ─────────────────────────── */}
        {activeTab === 'blogs' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <section className="bg-[#161b22] border border-gray-800 p-8 rounded-xl">
              <h2 className="text-2xl font-bold mb-6 flex items-center text-blue-400"><PlusCircle className="mr-2" /> Crear Nuevo Blog</h2>
              <form onSubmit={handleCreate} className="space-y-4">
                <div>
                  <label className="block text-sm mb-1 text-gray-400">Título</label>
                  <input required type="text" value={title} onChange={e => setTitle(e.target.value)}
                    className="w-full bg-[#0d1117] border border-gray-700 rounded px-4 py-2 focus:border-blue-500" />
                </div>
                <div>
                  <label className="block text-sm mb-1 text-gray-400">Slug (URL amigable)</label>
                  <input required type="text" value={slug} onChange={e => setSlug(e.target.value)}
                    className="w-full bg-[#0d1117] border border-gray-700 rounded px-4 py-2 focus:border-blue-500" placeholder="mi-primer-blog" />
                </div>
                <div>
                  <label className="block text-sm mb-1 text-gray-400">Imagen de portada</label>
                  <ImageUploader token={jwtToken} onUploaded={setBlogImage} currentUrl={blogImage} />
                </div>
                <div>
                  <label className="block text-sm mb-1 text-gray-400">Resumen</label>
                  <textarea required rows={2} value={summary} onChange={e => setSummary(e.target.value)}
                    className="w-full bg-[#0d1117] border border-gray-700 rounded px-4 py-2 focus:border-blue-500" />
                </div>
                <div>
                  <label className="block text-sm mb-1 text-gray-400">Contenido (Admite HTML)</label>
                  <textarea required rows={8} value={content} onChange={e => setContent(e.target.value)}
                    className="w-full bg-[#0d1117] border border-gray-700 rounded px-4 py-2 focus:border-blue-500 font-mono text-sm" />
                </div>
                <button disabled={loading} type="submit"
                  className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-3 px-4 rounded transition-colors disabled:opacity-50">
                  {loading ? 'Guardando...' : 'Publicar Blog'}
                </button>
              </form>
            </section>
            <section className="bg-[#161b22] border border-gray-800 p-8 rounded-xl">
              <h2 className="text-2xl font-bold mb-6 text-indigo-400">Artículos Publicados ({blogs.length})</h2>
              <div className="space-y-4 max-h-[600px] overflow-y-auto pr-2">
                {blogs.map((blog, idx) => (
                  <div key={idx} className="bg-[#0d1117] border border-gray-700 p-4 rounded-lg flex justify-between items-start hover:border-blue-500 transition-colors">
                    <div className="flex gap-3 flex-1 min-w-0">
                      {blog.imagen_url && <img src={blog.imagen_url} alt="" className="w-16 h-14 object-cover rounded flex-shrink-0" />}
                      <div className="min-w-0">
                        <h3 className="font-bold text-lg truncate">{blog.titulo}</h3>
                        <p className="text-sm text-gray-500 font-mono">/{blog.slug}</p>
                        <span className="text-xs text-gray-400 bg-gray-800 px-2 py-1 rounded">{new Date(blog.fecha).toLocaleDateString()}</span>
                      </div>
                    </div>
                    <button onClick={() => handleDeleteBlog(blog.slug)} className="p-2 text-gray-500 hover:text-red-500 hover:bg-red-500/10 rounded transition-colors flex-shrink-0">
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                ))}
                {blogs.length === 0 && <div className="text-gray-500 text-center py-12">No hay blogs guardados.</div>}
              </div>
            </section>
          </div>
        )}

        {/* ── TAB: MENSAJES ──────────────────────── */}
        {activeTab === 'mensajes' && (
          <div className="bg-[#161b22] border border-gray-800 p-8 rounded-xl">
            <h2 className="text-2xl font-bold mb-6 flex items-center text-hzgold-400"><Inbox className="mr-2" /> Bandeja de Cotizaciones y Contacto</h2>
            <div className="space-y-4">
              {messages.map((msg) => (
                <div key={msg.id} className={`p-6 rounded-lg border flex flex-col md:flex-row gap-6 transition-all ${msg.is_answered ? 'bg-[#0d1117]/50 border-gray-800 opacity-70' : 'bg-[#0d1117] border-hzgold-500/30'}`}>
                  <div className="flex-1">
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="font-bold text-xl text-white">{msg.asunto}</h3>
                      <span className="text-xs font-mono text-gray-500">{new Date(msg.fecha).toLocaleString()}</span>
                    </div>
                    <div className="grid grid-cols-2 gap-4 text-sm mb-4 text-gray-400">
                      <p><strong className="text-gray-300">De:</strong> {msg.nombre} ({msg.email})</p>
                      {msg.telefono && <p><strong className="text-gray-300">Tel:</strong> {msg.telefono}</p>}
                    </div>
                    <div className="bg-[#161b22] p-4 rounded text-gray-300 font-mono text-sm whitespace-pre-wrap">{msg.mensaje}</div>
                  </div>
                  <div className="flex md:flex-col justify-end items-center md:items-end gap-4 min-w-[150px]">
                    <button onClick={() => handleToggleMessage(msg.id, msg.is_answered)}
                      className={`flex items-center gap-2 px-4 py-2 rounded-full font-bold text-sm transition-all ${msg.is_answered ? 'bg-gray-800 text-gray-400 hover:bg-gray-700' : 'bg-green-600/20 text-green-500 border border-green-500/30 hover:bg-green-600 hover:text-white'}`}>
                      {msg.is_answered ? <><CheckCircle className="w-4 h-4" /> Resuelto</> : <><Circle className="w-4 h-4 text-hzgold-500" /> Pendiente</>}
                    </button>
                  </div>
                </div>
              ))}
              {messages.length === 0 && <div className="text-gray-500 text-center py-12 border border-dashed border-gray-800 rounded-xl">Aún no hay mensajes en tu bandeja.</div>}
            </div>
          </div>
        )}

        {/* ── TAB: PORTAFOLIO ────────────────────── */}
        {activeTab === 'portafolio' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <section className="bg-[#161b22] border border-gray-800 p-8 rounded-xl">
              <h2 className="text-2xl font-bold mb-6 flex items-center text-hzgold-400"><PlusCircle className="mr-2" /> Agregar Proyecto</h2>
              <form onSubmit={handleCreateProject} className="space-y-4">
                <div>
                  <label className="block text-sm mb-1 text-gray-400">Nombre del Proyecto *</label>
                  <input required type="text" value={projectTitle} onChange={e => setProjectTitle(e.target.value)}
                    className="w-full bg-[#0d1117] border border-gray-700 rounded px-4 py-2 focus:border-hzgold-500" />
                </div>
                <div>
                  <label className="block text-sm mb-1 text-gray-400">Imagen del Proyecto</label>
                  <ImageUploader token={jwtToken} onUploaded={setProjectImage} currentUrl={projectImage} />
                </div>
                <div>
                  <label className="block text-sm mb-1 text-gray-400">Descripción *</label>
                  <textarea required rows={3} value={projectDesc} onChange={e => setProjectDesc(e.target.value)}
                    className="w-full bg-[#0d1117] border border-gray-700 rounded px-4 py-2 focus:border-hzgold-500" />
                </div>
                <div>
                  <label className="block text-sm mb-1 text-gray-400">URL del Proyecto</label>
                  <input type="url" value={projectUrl} onChange={e => setProjectUrl(e.target.value)}
                    className="w-full bg-[#0d1117] border border-gray-700 rounded px-4 py-2 focus:border-hzgold-500" placeholder="https://..." />
                </div>
                <div>
                  <label className="block text-sm mb-1 text-gray-400">Tags (separados por coma)</label>
                  <input type="text" value={projectTags} onChange={e => setProjectTags(e.target.value)}
                    className="w-full bg-[#0d1117] border border-gray-700 rounded px-4 py-2 focus:border-hzgold-500" placeholder="Python, AWS, Django" />
                </div>
                <button disabled={loading} type="submit"
                  className="w-full bg-hzgold-600 hover:bg-hzgold-500 text-white font-bold py-3 px-4 rounded transition-colors disabled:opacity-50">
                  {loading ? 'Guardando...' : 'Publicar Proyecto'}
                </button>
              </form>
            </section>
            <section className="bg-[#161b22] border border-gray-800 p-8 rounded-xl">
              <h2 className="text-2xl font-bold mb-6 text-indigo-400">Proyectos ({projects.length})</h2>
              <div className="space-y-4 max-h-[600px] overflow-y-auto pr-2">
                {projects.map((p) => (
                  <div key={p.id} className="bg-[#0d1117] border border-gray-700 p-4 rounded-lg flex justify-between items-start hover:border-hzgold-500/50 transition-colors">
                    <div className="flex gap-3 flex-1 min-w-0">
                      {p.image_url && <img src={p.image_url} alt="" className="w-16 h-14 object-cover rounded flex-shrink-0" />}
                      <div className="min-w-0">
                        <h3 className="font-bold text-lg truncate">{p.title}</h3>
                        <p className="text-sm text-gray-400 line-clamp-2">{p.description}</p>
                        {p.tags?.length > 0 && (
                          <div className="flex flex-wrap gap-1 mt-1">
                            {p.tags.map((t: string, i: number) => <span key={i} className="text-xs px-1.5 py-0.5 bg-hzgold-900/40 text-hzgold-400 rounded">{t}</span>)}
                          </div>
                        )}
                      </div>
                    </div>
                    <button onClick={() => handleDeleteProject(p.id)} className="p-2 text-gray-500 hover:text-red-500 hover:bg-red-500/10 rounded transition-colors flex-shrink-0">
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                ))}
                {projects.length === 0 && <div className="text-gray-500 text-center py-12">No hay proyectos todavía.</div>}
              </div>
            </section>
          </div>
        )}

        {/* ── TAB: SOBRE MÍ ─────────────────────── */}
        {activeTab === 'about' && (
          <div className="bg-[#161b22] border border-gray-800 p-8 rounded-xl max-w-3xl mx-auto">
            <h2 className="text-2xl font-bold mb-6 flex items-center text-hzgold-400"><User className="mr-2" /> Editar Sección "Sobre Mí"</h2>
            <form onSubmit={handleSaveAbout} className="space-y-5">
              <div>
                <label className="block text-sm mb-1 text-gray-400">Nombre completo</label>
                <input type="text" value={aboutData.name} onChange={e => setAboutData(prev => ({ ...prev, name: e.target.value }))}
                  className="w-full bg-[#0d1117] border border-gray-700 rounded px-4 py-2 focus:border-hzgold-500" />
              </div>
              <div>
                <label className="block text-sm mb-1 text-gray-400">Título / Especialidad</label>
                <input type="text" value={aboutData.title} onChange={e => setAboutData(prev => ({ ...prev, title: e.target.value }))}
                  className="w-full bg-[#0d1117] border border-gray-700 rounded px-4 py-2 focus:border-hzgold-500" />
              </div>
              <div>
                <label className="block text-sm mb-1 text-gray-400">Foto de perfil</label>
                <ImageUploader token={jwtToken} onUploaded={url => setAboutData(prev => ({ ...prev, avatar_url: url }))} currentUrl={aboutData.avatar_url} />
              </div>
              <div>
                <label className="block text-sm mb-1 text-gray-400">Párrafo 1</label>
                <textarea rows={4} value={aboutData.bio_1} onChange={e => setAboutData(prev => ({ ...prev, bio_1: e.target.value }))}
                  className="w-full bg-[#0d1117] border border-gray-700 rounded px-4 py-2 focus:border-hzgold-500 text-sm" />
              </div>
              <div>
                <label className="block text-sm mb-1 text-gray-400">Párrafo 2 (admite HTML)</label>
                <textarea rows={4} value={aboutData.bio_2} onChange={e => setAboutData(prev => ({ ...prev, bio_2: e.target.value }))}
                  className="w-full bg-[#0d1117] border border-gray-700 rounded px-4 py-2 focus:border-hzgold-500 font-mono text-sm" />
              </div>
              <button disabled={aboutSaving} type="submit"
                className="w-full bg-hzgold-600 hover:bg-hzgold-500 text-white font-bold py-3 px-4 rounded transition-colors disabled:opacity-50">
                {aboutSaving ? 'Guardando...' : 'Guardar Cambios'}
              </button>
            </form>
          </div>
        )}

      </div>
    </main>
  );
}
