import { Log, LogFormData } from '../types';
import { authService } from './authService';

// Use relative path. Vercel routes /api to server.js. 
// Vite proxy handles this locally.
const API_URL = '/api/logs';
const STORAGE_KEY = 'learning_blog_offline_data';
const TIMEOUT_MS = 8000; // Increased timeout for serverless cold starts

// Helper for local storage management
const getLocalData = (): Log[] => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch (e) {
    return [];
  }
};

const setLocalData = (data: Log[]) => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
};

// Helper for fetch with timeout and Auth headers
const fetchWithAuth = async (url: string, options: RequestInit = {}) => {
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), TIMEOUT_MS);
  
  const token = authService.getToken();
  const headers = {
    ...options.headers,
    'Authorization': token ? `Bearer ${token}` : '',
  };

  try {
    const response = await fetch(url, {
      ...options,
      headers,
      signal: controller.signal
    });
    clearTimeout(id);
    
    if (response.status === 401) {
      // Token expired or invalid
      authService.logout();
      window.location.reload();
      throw new Error('Session expired');
    }
    
    return response;
  } catch (error) {
    clearTimeout(id);
    throw error;
  }
};

export const logService = {
  // Online methods
  getAll: async (): Promise<Log[]> => {
    const response = await fetchWithAuth(API_URL);
    if (!response.ok) throw new Error('Failed to fetch logs');
    return await response.json();
  },

  create: async (logData: LogFormData): Promise<Log> => {
    const payload = {
      ...logData,
      tags: logData.tags.split(',').map(tag => tag.trim()).filter(tag => tag !== '')
    };

    const response = await fetchWithAuth(API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    if (!response.ok) throw new Error('Failed to create log');
    return await response.json();
  },

  update: async (id: string, logData: LogFormData): Promise<Log> => {
    const payload = {
      ...logData,
      tags: logData.tags.split(',').map(tag => tag.trim()).filter(tag => tag !== '')
    };

    const response = await fetchWithAuth(`${API_URL}/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    if (!response.ok) throw new Error('Failed to update log');
    return await response.json();
  },

  delete: async (id: string): Promise<void> => {
    const response = await fetchWithAuth(`${API_URL}/${id}`, { method: 'DELETE' });
    if (!response.ok) {
       const text = await response.text();
       throw new Error(`Failed to delete log: ${text}`);
    }
  },

  // Offline / Fallback methods
  getAllLocal: (): Log[] => {
    return getLocalData();
  },

  createLocal: (logData: LogFormData): Log => {
    const logs = getLocalData();
    const newLog: Log = {
      _id: `local-${Date.now()}`,
      title: logData.title,
      content: logData.content,
      tags: logData.tags.split(',').map(tag => tag.trim()).filter(tag => tag !== ''),
      date: logData.date,
      image: logData.image,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    logs.unshift(newLog);
    setLocalData(logs);
    return newLog;
  },

  updateLocal: (id: string, logData: LogFormData): Log => {
    const logs = getLocalData();
    const index = logs.findIndex(l => l._id === id);
    if (index === -1) throw new Error('Log not found locally');

    const updatedLog = {
      ...logs[index],
      title: logData.title,
      content: logData.content,
      tags: logData.tags.split(',').map(tag => tag.trim()).filter(tag => tag !== ''),
      date: logData.date,
      image: logData.image,
      updatedAt: new Date().toISOString()
    };
    logs[index] = updatedLog;
    setLocalData(logs);
    return updatedLog;
  },

  deleteLocal: (id: string): void => {
    const logs = getLocalData().filter(l => l._id !== id);
    setLocalData(logs);
  }
};