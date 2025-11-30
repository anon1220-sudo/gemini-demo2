import { AuthResponse } from '../types';

// Use relative path. Vercel routes /api to server.js. 
// Vite proxy handles this locally.
const API_URL = '/api/auth';

const handleRequest = async (promise: Promise<Response>) => {
  try {
    const response = await promise;
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || '操作失败');
    }
    return await response.json();
  } catch (error) {
    if (error instanceof TypeError && error.message === 'Failed to fetch') {
      console.error('Network Error:', error);
      throw new Error('无法连接到服务器。\n如果是本地运行，请确保已启动后端 (node server/server.js)。');
    }
    throw error;
  }
};

export const authService = {
  login: async (email: string, password: string): Promise<AuthResponse> => {
    return handleRequest(fetch(`${API_URL}/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    }));
  },

  register: async (username: string, email: string, password: string): Promise<AuthResponse> => {
    return handleRequest(fetch(`${API_URL}/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, email, password }),
    }));
  },

  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  },

  getCurrentUser: () => {
    const userStr = localStorage.getItem('user');
    return userStr ? JSON.parse(userStr) : null;
  },

  getToken: () => {
    return localStorage.getItem('token');
  }
};