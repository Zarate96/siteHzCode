// This service manages all HTTP calls to our new AWS Serverless Backend

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || '';

export const api = {
  // --- AUTH ---
  async login(username: string, password: string): Promise<string> {
    const response = await fetch(`${API_BASE_URL}/api/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ username, password }),
    });
    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.message || 'Login failed');
    }
    return data.token; // Returns the generated JWT
  },

  // --- BLOG ---
  async getBlogs() {
    try {
      if (!API_BASE_URL) return [];
      const response = await fetch(`${API_BASE_URL}/api/blog`);
      if (!response.ok) return [];
      return await response.json();
    } catch (error) {
      console.error('Error fetching blogs:', error);
      return [];
    }
  },

  async getBlogBySlug(slug: string) {
    try {
      const response = await fetch(`${API_BASE_URL}/api/blog/${slug}`);
      if (!response.ok) throw new Error('Network response was not ok');
      return await response.json();
    } catch (error) {
      console.error('Error fetching blog:', error);
      return null;
    }
  },

  async createBlog(blogData: any, secret: string) {
    const response = await fetch(`${API_BASE_URL}/api/blog`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${secret}`
      },
      body: JSON.stringify(blogData),
    });
    if (!response.ok) throw new Error('Authorization failed or server error');
    return await response.json();
  },

  async deleteBlog(slug: string, secret: string) {
    const response = await fetch(`${API_BASE_URL}/api/blog/${slug}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${secret}`
      }
    });
    if (!response.ok) throw new Error('Authorization failed or server error');
    return await response.json();
  },

  // --- CONTACTO Y COTIZACIONES ---
  async sendContactMessage(formData: { name: string, email: string, subject?: string, phone?: string, message: string }) {
    try {
      const response = await fetch(`${API_BASE_URL}/api/contact`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });
      if (!response.ok) throw new Error('Failed to send message');
      return await response.json();
    } catch (error) {
      console.error('Error sending message:', error);
      throw error;
    }
  },
  
  // En un futuro añadiremos las llamadas a experiencia, portafolio y recomendaciones.
};
