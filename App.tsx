import React, { useEffect, useState } from 'react';
import { Log, LogFormData, User } from './types';
import { logService } from './services/logService';
import { authService } from './services/authService';
import LogForm from './components/LogForm';
import AuthForm from './components/AuthForm';

// Minimalist Apple-style background
const Background = () => (
  <div className="fixed inset-0 -z-10 bg-[#f5f5f7]">
    {/* Soft subtle gradient mesh */}
    <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] rounded-full bg-blue-100/50 blur-[120px]" />
    <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] rounded-full bg-purple-100/50 blur-[120px]" />
  </div>
);

function App() {
  const [user, setUser] = useState<User | null>(null);
  const [logs, setLogs] = useState<Log[]>([]);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingLog, setEditingLog] = useState<Log | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isOffline, setIsOffline] = useState(false);

  // Check auth on load
  useEffect(() => {
    const currentUser = authService.getCurrentUser();
    if (currentUser) {
      setUser(currentUser);
      fetchLogs();
    }
  }, []);

  const fetchLogs = async () => {
    setIsLoading(true);
    try {
      const data = await logService.getAll();
      setLogs(data.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()));
      setIsOffline(false);
    } catch (err) {
      console.warn('Backend unavailable, switching to offline mode.');
      // Only use offline mode if no user or specifically handling offline cache
      // For auth app, usually require online, but let's try to show local if exists
      setIsOffline(true);
      const localData = logService.getAllLocal();
      setLogs(localData.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()));
    } finally {
      setIsLoading(false);
    }
  };

  const handleLoginSuccess = (user: User) => {
    setUser(user);
    fetchLogs();
  };

  const handleLogout = () => {
    authService.logout();
    setUser(null);
    setLogs([]);
  };

  const handleCreate = async (data: LogFormData) => {
    setIsSubmitting(true);
    try {
      let success = false;
      if (!isOffline) {
        try {
          await logService.create(data);
          success = true;
        } catch (err) {
          console.warn('Online creation failed.', err);
          setIsOffline(true);
        }
      }

      if (isOffline || !success) {
        logService.createLocal(data);
      }

      await fetchLogs();
      setIsFormOpen(false);
    } catch (err) {
      alert('Failed to save log');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpdate = async (data: LogFormData) => {
    if (!editingLog?._id) return;
    setIsSubmitting(true);
    
    try {
      const isLocalLog = editingLog._id.startsWith('local-');

      if (!isOffline && !isLocalLog) {
         await logService.update(editingLog._id, data);
      } else {
         if (isLocalLog) logService.updateLocal(editingLog._id, data);
         else throw new Error("Cannot update server entry while offline");
      }

      await fetchLogs();
      setEditingLog(null);
      setIsFormOpen(false);
    } catch (err) {
      alert('Failed to update log');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!window.confirm('Delete this entry?')) return;
    
    const previousLogs = [...logs];
    setLogs(prev => prev.filter(log => log._id !== id));

    try {
      const isLocalLog = id.startsWith('local-');
      if (!isOffline && !isLocalLog) {
        await logService.delete(id);
      } else {
        if (isLocalLog) logService.deleteLocal(id);
        else throw new Error("Cannot delete server entry while offline");
      }
    } catch (err) {
      setLogs(previousLogs);
      alert('Failed to delete log');
    }
  };

  const openEdit = (log: Log) => {
    setEditingLog(log);
    setIsFormOpen(true);
  };

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <Background />
        <AuthForm onLoginSuccess={handleLoginSuccess} />
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-20 font-sans text-gray-900">
      <Background />

      {/* Navigation Bar - Glass Effect */}
      <header className="sticky top-0 z-30 backdrop-blur-xl bg-white/70 border-b border-white/50 shadow-sm supports-[backdrop-filter]:bg-white/60">
        <div className="max-w-6xl mx-auto px-6 h-16 flex justify-between items-center">
          <div className="flex items-center gap-3">
             <div className="w-8 h-8 bg-gradient-to-br from-gray-900 to-gray-700 rounded-lg flex items-center justify-center text-white shadow-md">
                <span className="font-bold text-sm">MB</span>
             </div>
             <h1 className="text-lg font-semibold tracking-tight text-gray-800">My Blog</h1>
          </div>
          
          <div className="flex items-center gap-4">
            <span className="hidden sm:block text-sm font-medium text-gray-500">Hi, {user.username}</span>
            <button 
              onClick={handleLogout}
              className="px-4 py-2 rounded-xl text-sm font-medium text-gray-600 hover:bg-gray-100 transition-colors"
            >
              Log Out
            </button>
            <button
              onClick={() => setIsFormOpen(true)}
              className="px-5 py-2 rounded-xl bg-gray-900 text-white text-sm font-semibold shadow-lg shadow-gray-900/20 hover:scale-105 active:scale-95 transition-all duration-200"
            >
              + New Entry
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-6 py-10 relative z-10">
        {/* Connection Status */}
        {isOffline && (
           <div className="mb-6 mx-auto max-w-fit px-4 py-1.5 rounded-full bg-amber-100 text-amber-800 text-xs font-semibold border border-amber-200 flex items-center gap-2">
             <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse"></span>
             Offline Mode
           </div>
        )}

        {/* Modal */}
        {isFormOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
             <div className="absolute inset-0 bg-gray-900/20 backdrop-blur-sm transition-opacity" onClick={() => setIsFormOpen(false)}></div>
            <div className="w-full max-w-2xl relative animate-fade-in-up">
              <LogForm
                initialData={editingLog}
                onSubmit={editingLog ? handleUpdate : handleCreate}
                onCancel={() => { setIsFormOpen(false); setEditingLog(null); }}
                isSubmitting={isSubmitting}
              />
            </div>
          </div>
        )}

        {/* Loading */}
        {isLoading && (
          <div className="flex justify-center py-24">
             <div className="w-8 h-8 border-2 border-gray-200 border-t-gray-800 rounded-full animate-spin"></div>
          </div>
        )}

        {/* Empty State */}
        {!isLoading && logs.length === 0 && (
          <div className="text-center py-32">
            <h3 className="text-2xl font-bold text-gray-300">No entries yet</h3>
            <p className="text-gray-400 mt-2">Start writing your story today.</p>
          </div>
        )}

        {/* Masonry Grid Layout */}
        <div className="columns-1 md:columns-2 lg:columns-3 gap-6 space-y-6">
          {logs.map((log) => (
            <div 
              key={log._id} 
              onClick={() => openEdit(log)}
              className="break-inside-avoid group relative bg-white rounded-3xl overflow-hidden shadow-[0_2px_8px_rgba(0,0,0,0.04)] hover:shadow-[0_12px_24px_rgba(0,0,0,0.08)] border border-gray-100 transition-all duration-300 hover:-translate-y-1 cursor-pointer"
            >
              {/* Image Cover */}
              {log.image && (
                <div className="h-48 overflow-hidden relative">
                  <img src={log.image} alt={log.title} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-60"></div>
                </div>
              )}

              <div className="p-6">
                <div className="flex items-center gap-2 mb-3">
                   <span className="text-[11px] font-bold tracking-wider text-gray-400 uppercase">
                     {new Date(log.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                   </span>
                   {log.tags.length > 0 && (
                     <div className="flex gap-1">
                       {log.tags.slice(0, 2).map((tag, i) => (
                         <span key={i} className="px-2 py-0.5 rounded-md bg-gray-100 text-gray-500 text-[10px] font-semibold uppercase tracking-wide">
                           {tag}
                         </span>
                       ))}
                     </div>
                   )}
                </div>

                <h3 className="text-xl font-bold text-gray-900 mb-2 leading-snug group-hover:text-blue-600 transition-colors">
                  {log.title}
                </h3>
                
                <p className="text-gray-500 text-sm line-clamp-3 leading-relaxed mb-4">
                  {log.content}
                </p>

                <div className="flex items-center justify-between pt-2 border-t border-gray-50 mt-2">
                  <span className="text-xs text-gray-300 font-medium">Read more</span>
                  <button
                    onClick={(e) => log._id && handleDelete(log._id, e)}
                    className="p-2 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-full transition-all"
                  >
                     <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                       <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                     </svg>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}

export default App;