import React, { useState, useEffect, useRef } from 'react';
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
    image: ''
  });
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (initialData) {
      setFormData({
        title: initialData.title,
        content: initialData.content,
        tags: initialData.tags.join(', '),
        date: new Date(initialData.date).toISOString().split('T')[0],
        image: initialData.image || ''
      });
    }
  }, [initialData]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Basic size validation (2MB)
      if (file.size > 2 * 1024 * 1024) {
        alert("Image is too large. Please select an image under 2MB.");
        return;
      }

      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData(prev => ({ ...prev, image: reader.result as string }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <div className="bg-white/90 backdrop-blur-2xl rounded-[2rem] shadow-2xl p-8 border border-white/60">
      <div className="flex justify-between items-center mb-8">
        <h2 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-gray-900 to-gray-600">
          {initialData ? 'Edit Entry' : 'New Entry'}
        </h2>
        <button onClick={onCancel} className="p-2 bg-gray-100 rounded-full text-gray-500 hover:bg-gray-200 transition-colors">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Image Upload Area */}
        <div className="relative group">
           <label className="block text-sm font-semibold text-gray-700 mb-2 ml-1">Cover Image</label>
           <div 
             className={`relative w-full h-48 rounded-2xl overflow-hidden border-2 border-dashed transition-all cursor-pointer bg-gray-50 ${formData.image ? 'border-transparent' : 'border-gray-300 hover:border-blue-400'}`}
             onClick={() => fileInputRef.current?.click()}
           >
             {formData.image ? (
               <>
                 <img src={formData.image} alt="Preview" className="w-full h-full object-cover" />
                 <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                   <p className="text-white font-medium">Change Image</p>
                 </div>
               </>
             ) : (
               <div className="absolute inset-0 flex flex-col items-center justify-center text-gray-400">
                 <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                   <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                 </svg>
                 <span className="text-sm">Click to upload cover</span>
               </div>
             )}
           </div>
           <input 
             type="file" 
             ref={fileInputRef} 
             onChange={handleImageChange} 
             accept="image/*" 
             className="hidden" 
           />
           {formData.image && (
             <button 
               type="button"
               onClick={(e) => {
                 e.stopPropagation();
                 setFormData(prev => ({ ...prev, image: '' }));
               }}
               className="absolute top-9 right-2 p-1.5 bg-white/80 rounded-full shadow-sm text-gray-600 hover:text-red-500 text-xs font-bold"
               title="Remove image"
             >
               ✕
             </button>
           )}
        </div>

        <div>
          <label htmlFor="title" className="block text-sm font-semibold text-gray-700 mb-2 ml-1">Title</label>
          <input
            type="text"
            id="title"
            name="title"
            required
            value={formData.title}
            onChange={handleChange}
            className="w-full px-5 py-3 bg-gray-50 border-0 rounded-xl text-gray-800 focus:ring-2 focus:ring-blue-500/20 focus:bg-white transition-all duration-200"
            placeholder="What's on your mind?"
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
              className="w-full px-5 py-3 bg-gray-50 border-0 rounded-xl text-gray-800 focus:ring-2 focus:ring-blue-500/20 focus:bg-white transition-all duration-200"
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
              className="w-full px-5 py-3 bg-gray-50 border-0 rounded-xl text-gray-800 focus:ring-2 focus:ring-blue-500/20 focus:bg-white transition-all duration-200"
              placeholder="e.g. Code, Life"
            />
          </div>
        </div>

        <div>
          <label htmlFor="content" className="block text-sm font-semibold text-gray-700 mb-2 ml-1">Journal Entry</label>
          <textarea
            id="content"
            name="content"
            required
            rows={6}
            value={formData.content}
            onChange={handleChange}
            className="w-full px-5 py-3 bg-gray-50 border-0 rounded-xl text-gray-800 focus:ring-2 focus:ring-blue-500/20 focus:bg-white transition-all duration-200 resize-none leading-relaxed"
            placeholder="Write your detailed notes here..."
          />
        </div>

        <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
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
            className="px-8 py-2.5 rounded-xl bg-gray-900 text-white font-medium hover:shadow-lg hover:shadow-gray-900/20 hover:-translate-y-0.5 transition-all duration-300 disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {isSubmitting ? 'Saving...' : 'Save Entry'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default LogForm;