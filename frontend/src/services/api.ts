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
  async sendContactMessage(formData: { name: string, email: string, subject?: string, phone?: string, message: string, recaptcha_token?: string }) {
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

  async getMessages(token: string) {
    try {
      const response = await fetch(`${API_BASE_URL}/api/contact`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (!response.ok) throw new Error('Authorization failed or server error');
      return await response.json();
    } catch (error) {
      console.error('Error fetching messages:', error);
      return [];
    }
  },

  async updateMessageStatus(id: string, isAnswered: boolean, token: string) {
    const response = await fetch(`${API_BASE_URL}/api/contact/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ is_answered: isAnswered })
    });
    if (!response.ok) throw new Error('Authorization failed or server error');
    return await response.json();
  },
  
  // --- PORTFOLIO ---
  async getProjects() {
    try {
      if (!API_BASE_URL) return [];
      const response = await fetch(`${API_BASE_URL}/api/portfolio`);
      if (!response.ok) return [];
      return await response.json();
    } catch (error) {
      console.error('Error fetching projects:', error);
      return [];
    }
  },

  async createProject(projectData: any, token: string) {
    const response = await fetch(`${API_BASE_URL}/api/portfolio`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
      body: JSON.stringify(projectData),
    });
    if (!response.ok) throw new Error('Failed to create project');
    return await response.json();
  },

  async deleteProject(id: string, token: string) {
    const response = await fetch(`${API_BASE_URL}/api/portfolio/${id}`, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${token}` },
    });
    if (!response.ok) throw new Error('Failed to delete project');
    return await response.json();
  },

  // --- ABOUT ---
  async getAbout() {
    try {
      if (!API_BASE_URL) return null;
      const response = await fetch(`${API_BASE_URL}/api/about`);
      if (!response.ok) return null;
      return await response.json();
    } catch (error) {
      console.error('Error fetching about:', error);
      return null;
    }
  },

  async updateAbout(aboutData: any, token: string) {
    const response = await fetch(`${API_BASE_URL}/api/about`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
      body: JSON.stringify(aboutData),
    });
    if (!response.ok) throw new Error('Failed to update about content');
    return await response.json();
  },

  // --- IMAGE UPLOAD ---
  async getPresignedUploadUrl(filename: string, contentType: string, token: string): Promise<{ upload_url: string; public_url: string }> {
    const response = await fetch(`${API_BASE_URL}/api/upload`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
      body: JSON.stringify({ filename, content_type: contentType }),
    });
    if (!response.ok) throw new Error('Failed to get upload URL');
    return await response.json();
  },

  async uploadFileToS3(uploadUrl: string, file: File): Promise<void> {
    const response = await fetch(uploadUrl, {
      method: 'PUT',
      headers: { 'Content-Type': file.type },
      body: file,
    });
    if (!response.ok) throw new Error('Failed to upload image to S3');
  },
};

