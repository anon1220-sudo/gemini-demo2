import { Log, LogFormData } from '../types';

const API_URL = 'http://localhost:5000/api/logs';
const STORAGE_KEY = 'learning_blog_offline_data';

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

export const logService = {
  // Online methods
  getAll: async (): Promise<Log[]> => {
    const response = await fetch(API_URL);
    if (!response.ok) throw new Error('Failed to fetch logs');
    return await response.json();
  },

  create: async (logData: LogFormData): Promise<Log> => {
    const payload = {
      ...logData,
      tags: logData.tags.split(',').map(tag => tag.trim()).filter(tag => tag !== '')
    };

    const response = await fetch(API_URL, {
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

    const response = await fetch(`${API_URL}/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    if (!response.ok) throw new Error('Failed to update log');
    return await response.json();
  },

  delete: async (id: string): Promise<void> => {
    const response = await fetch(`${API_URL}/${id}`, { method: 'DELETE' });
    if (!response.ok) throw new Error('Failed to delete log');
  },

  // Offline / Fallback methods
  getAllLocal: (): Log[] => {
    return getLocalData();
  },

  createLocal: (logData: LogFormData): Log => {
    const logs = getLocalData();
    const newLog: Log = {
      _id: `local-${Date.now()}`, // Temporary local ID
      title: logData.title,
      content: logData.content,
      tags: logData.tags.split(',').map(tag => tag.trim()).filter(tag => tag !== ''),
      date: logData.date,
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