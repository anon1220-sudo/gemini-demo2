import React, { useState, useEffect } from 'react';
import { Log, LogFormData } from '../types';

interface LogFormProps {
  initialData?: Log | null;
  onSubmit: (data: LogFormData) => Promise<void>;
  onCancel: () => void;
  isSubmitting: boolean;
}

const LogForm: React.FC<LogFormProps> = ({ initialData, onSubmit, onCancel, isSubmitting }) => {
  const [formData, setFormData] = useState<LogFormData>({
    title: '',
    content: '',
    tags: '',
    date: new Date().toISOString().split('T')[0],
  });

  useEffect(() => {
    if (initialData) {
      setFormData({
        title: initialData.title,
        content: initialData.content,
        tags: initialData.tags.join(', '),
        date: new Date(initialData.date).toISOString().split('T')[0],
      });
    }
  }, [initialData]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <div className="bg-white/90 backdrop-blur-xl rounded-3xl shadow-2xl p-8 border border-white/50">
      <div className="flex justify-between items-center mb-8">
        <h2 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-gray-900 to-gray-600">
          {initialData ? 'Edit Entry' : 'Create New Entry'}
        </h2>
        <button onClick={onCancel} className="text-gray-400 hover:text-gray-600 transition-colors">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label htmlFor="title" className="block text-sm font-semibold text-gray-700 mb-2 ml-1">Title</label>
          <input
            type="text"
            id="title"
            name="title"
            required
            value={formData.title}
            onChange={handleChange}
            className="w-full px-5 py-3 bg-gray-50/50 border border-gray-200 rounded-xl focus:ring-4 focus:ring-blue-100 focus:border-blue-500 focus:bg-white outline-none transition-all duration-300"
            placeholder="What did you learn today?"
          />
        </div>

        <div className="grid grid-cols-2 gap-6">
          <div>
            <label htmlFor="date" className="block text-sm font-semibold text-gray-700 mb-2 ml-1">Date</label>
            <input
              type="date"
              id="date"
              name="date"
              required
              value={formData.date}
              onChange={handleChange}
              className="w-full px-5 py-3 bg-gray-50/50 border border-gray-200 rounded-xl focus:ring-4 focus:ring-blue-100 focus:border-blue-500 focus:bg-white outline-none transition-all duration-300"
            />
          </div>

          <div>
            <label htmlFor="tags" className="block text-sm font-semibold text-gray-700 mb-2 ml-1">Tags</label>
            <input
              type="text"
              id="tags"
              name="tags"
              value={formData.tags}
              onChange={handleChange}
              className="w-full px-5 py-3 bg-gray-50/50 border border-gray-200 rounded-xl focus:ring-4 focus:ring-blue-100 focus:border-blue-500 focus:bg-white outline-none transition-all duration-300"
              placeholder="React, Design..."
            />
          </div>
        </div>

        <div>
          <label htmlFor="content" className="block text-sm font-semibold text-gray-700 mb-2 ml-1">Content</label>
          <textarea
            id="content"
            name="content"
            required
            rows={6}
            value={formData.content}
            onChange={handleChange}
            className="w-full px-5 py-3 bg-gray-50/50 border border-gray-200 rounded-xl focus:ring-4 focus:ring-blue-100 focus:border-blue-500 focus:bg-white outline-none transition-all duration-300 resize-none"
            placeholder="Write your detailed notes here..."
          />
        </div>

        <div className="flex justify-end gap-3 pt-4">
          <button
            type="button"
            onClick={onCancel}
            className="px-6 py-2.5 rounded-xl text-gray-600 hover:bg-gray-100 font-medium transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="px-8 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-blue-500 text-white font-medium hover:shadow-lg hover:shadow-blue-500/30 hover:-translate-y-0.5 transition-all duration-300 disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {isSubmitting ? 'Saving...' : 'Save Log'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default LogForm;