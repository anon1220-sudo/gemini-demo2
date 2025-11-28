import React, { useEffect, useState } from 'react';
import { Log, LogFormData } from './types';
import { logService } from './services/logService';
import LogForm from './components/LogForm';

// Background Component with Blobs and Particles
const BackgroundEffects = () => (
  <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
    <div className="absolute inset-0 bg-gradient-to-br from-slate-100 via-blue-50 to-purple-50"></div>
    
    {/* Animated Gradient Blobs */}
    <div className="absolute top-0 -left-4 w-72 h-72 bg-purple-300 rounded-full mix-blend-multiply filter blur-2xl opacity-40 animate-blob"></div>
    <div className="absolute top-0 -right-4 w-72 h-72 bg-yellow-200 rounded-full mix-blend-multiply filter blur-2xl opacity-40 animate-blob animation-delay-2000"></div>
    <div className="absolute -bottom-8 left-20 w-72 h-72 bg-blue-300 rounded-full mix-blend-multiply filter blur-2xl opacity-40 animate-blob animation-delay-4000"></div>
    <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-pink-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-1000"></div>

    {/* Floating Particles */}
    {[...Array(6)].map((_, i) => (
      <div 
        key={i}
        className="absolute bg-white/40 backdrop-blur-sm rounded-full shadow-sm animate-float"
        style={{
          width: Math.random() * 20 + 10 + 'px',
          height: Math.random() * 20 + 10 + 'px',
          top: Math.random() * 100 + '%',
          left: Math.random() * 100 + '%',
          animationDuration: Math.random() * 5 + 5 + 's',
          animationDelay: Math.random() * 2 + 's',
        }}
      />
    ))}
  </div>
);

function App() {
  const [logs, setLogs] = useState<Log[]>([]);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingLog, setEditingLog] = useState<Log | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isOffline, setIsOffline] = useState(false);

  const fetchLogs = async () => {
    setIsLoading(true);
    try {
      const data = await logService.getAll();
      setLogs(data.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()));
      setIsOffline(false);
    } catch (err) {
      console.warn('Backend unavailable, switching to offline mode.');
      setIsOffline(true);
      const localData = logService.getAllLocal();
      setLogs(localData.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()));
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, []);

  const handleCreate = async (data: LogFormData) => {
    setIsSubmitting(true);
    try {
      let success = false;
      if (!isOffline) {
        try {
          await logService.create(data);
          success = true;
        } catch (err) {
          console.warn('Online creation failed, attempting local fallback.', err);
          setIsOffline(true);
        }
      }

      if (isOffline || !success) {
        logService.createLocal(data);
      }

      await fetchLogs();
      setIsFormOpen(false);
    } catch (err) {
      console.error(err);
      alert('Failed to save log');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpdate = async (data: LogFormData) => {
    if (!editingLog?._id) return;
    setIsSubmitting(true);
    
    try {
      let success = false;
      const isLocalLog = editingLog._id.startsWith('local-');

      if (!isOffline && !isLocalLog) {
        try {
          await logService.update(editingLog._id, data);
          success = true;
        } catch (err) {
          console.warn('Online update failed.', err);
          setIsOffline(true);
        }
      }

      if (!success) {
        if (isLocalLog) {
          logService.updateLocal(editingLog._id, data);
        } else if (isOffline || !success) {
           alert("Connection lost. Cannot update server entry. Please check your connection.");
           setIsOffline(true);
        }
      }

      await fetchLogs();
      setEditingLog(null);
      setIsFormOpen(false);
    } catch (err) {
      console.error(err);
      alert('Failed to update log');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent click from bubbling up
    if (!window.confirm('Are you sure you want to delete this log?')) return;
    
    // Optimistic UI Update: Remove immediately
    const previousLogs = [...logs];
    setLogs(prev => prev.filter(log => log._id !== id));

    try {
      const isLocalLog = id.startsWith('local-');
      
      if (!isOffline && !isLocalLog) {
        await logService.delete(id);
      } else {
        if (isLocalLog) {
          logService.deleteLocal(id);
        } else {
           throw new Error("Cannot delete server entry while offline.");
        }
      }
      // If success, we are done. No need to refetch as we already updated state.
    } catch (err) {
      // Revert state if failed
      console.warn('Delete failed, reverting UI.', err);
      setLogs(previousLogs);
      
      // Determine if we should switch to offline mode
      if (!id.startsWith('local-') && !isOffline) {
        setIsOffline(true);
        alert("Connection lost. Failed to delete entry from server.");
      } else {
        alert(err instanceof Error ? err.message : 'Failed to delete log');
      }
    }
  };

  const openEdit = (log: Log) => {
    setEditingLog(log);
    setIsFormOpen(true);
  };

  const closeForm = () => {
    setIsFormOpen(false);
    setEditingLog(null);
  };

  return (
    <div className="min-h-screen pb-12 relative">
      <BackgroundEffects />

      {/* Glass Header */}
      <header className="sticky top-0 z-20 backdrop-blur-md bg-white/70 border-b border-white/50 shadow-sm transition-all duration-300">
        <div className="max-w-5xl mx-auto px-6 py-4 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="bg-gradient-to-tr from-blue-500 to-purple-500 p-2 rounded-xl text-white shadow-lg">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
            </div>
            <h1 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-gray-800 to-gray-600 tracking-tight">
              My Learning Blog
            </h1>
          </div>
          <button
            onClick={() => setIsFormOpen(true)}
            className="group relative px-5 py-2.5 rounded-2xl bg-gray-900 text-white font-medium shadow-lg shadow-blue-500/20 hover:shadow-blue-500/40 hover:-translate-y-0.5 transition-all duration-300 overflow-hidden"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-purple-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            <span className="relative flex items-center gap-2">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              New Entry
            </span>
          </button>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-8 relative z-10">
        {/* Offline Indicator - Glass Style */}
        {isOffline && (
          <div className="mb-8 rounded-2xl bg-amber-50/80 backdrop-blur-sm border border-amber-200/50 p-4 shadow-sm animate-fade-in-up">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <div className="p-2 bg-amber-100 rounded-full mr-3 text-amber-600">
                  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                </div>
                <div>
                  <h3 className="font-semibold text-amber-800">Offline Mode Active</h3>
                  <p className="text-sm text-amber-700/80">
                    Changes are saved locally. Connect to backend for full features.
                  </p>
                </div>
              </div>
              <button 
                onClick={fetchLogs} 
                className="px-4 py-2 bg-white/50 hover:bg-white rounded-xl text-sm font-medium text-amber-800 transition-colors border border-amber-200/50"
              >
                Retry
              </button>
            </div>
          </div>
        )}

        {/* Form Modal */}
        {isFormOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
             <div className="absolute inset-0 bg-slate-900/30 backdrop-blur-sm transition-opacity" onClick={closeForm}></div>
            <div className="w-full max-w-2xl relative animate-fade-in-up">
              <LogForm
                initialData={editingLog}
                onSubmit={editingLog ? handleUpdate : handleCreate}
                onCancel={closeForm}
                isSubmitting={isSubmitting}
              />
            </div>
          </div>
        )}

        {/* Loading State */}
        {isLoading && (
          <div className="flex justify-center py-20">
            <div className="relative">
              <div className="w-12 h-12 rounded-full border-4 border-gray-200"></div>
              <div className="w-12 h-12 rounded-full border-4 border-blue-500 border-t-transparent animate-spin absolute top-0 left-0"></div>
            </div>
          </div>
        )}

        {/* Empty State */}
        {!isLoading && logs.length === 0 && (
          <div className="text-center py-20 px-6 rounded-3xl bg-white/60 backdrop-blur-md border border-white/50 shadow-xl">
            <div className="bg-gradient-to-br from-blue-100 to-purple-100 w-20 h-20 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-inner">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
            </div>
            <h3 className="text-2xl font-bold text-gray-800 mb-2">Your story begins here</h3>
            <p className="text-gray-500 max-w-sm mx-auto">Capture your daily learnings in a beautiful way.</p>
          </div>
        )}

        {/* Logs List - Masonry-ish look */}
        <div className="space-y-8">
          {logs.map((log) => (
            <article 
              key={log._id} 
              className="group relative bg-white/70 backdrop-blur-md rounded-3xl p-8 shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] border border-white/60 transition-all duration-300 hover:-translate-y-1"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-blue-50/50 to-purple-50/50 opacity-0 group-hover:opacity-100 rounded-3xl transition-opacity duration-300 -z-10"></div>
              
              <div className="flex justify-between items-start mb-6">
                <div className="flex-1">
                  <div className="flex flex-wrap items-center gap-3 mb-3">
                     <span className="flex items-center gap-1.5 text-xs font-bold text-blue-600 bg-blue-100/50 px-3 py-1.5 rounded-full border border-blue-100">
                        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        {new Date(log.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                      </span>
                      {log.tags.map((tag, idx) => (
                        <span key={idx} className="text-xs font-medium text-purple-600 bg-purple-100/50 px-3 py-1.5 rounded-full border border-purple-100">
                          #{tag}
                        </span>
                      ))}
                  </div>
                  <h2 className="text-2xl font-bold text-gray-800 leading-tight group-hover:text-blue-600 transition-colors">
                    {log.title}
                  </h2>
                </div>
                
                {/* Action Buttons */}
                <div className="flex gap-2 ml-4 opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-x-2 group-hover:translate-x-0">
                  <button
                    onClick={() => openEdit(log)}
                    className="p-2.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-colors cursor-pointer"
                    title="Edit"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                      <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                    </svg>
                  </button>
                  <button
                    onClick={(e) => log._id && handleDelete(log._id, e)}
                    className="p-2.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-colors cursor-pointer"
                    title="Delete"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                  </button>
                </div>
              </div>
              
              <div className="prose prose-slate max-w-none">
                <p className="text-gray-600 whitespace-pre-wrap leading-relaxed text-[15px]">
                  {log.content}
                </p>
              </div>
            </article>
          ))}
        </div>
      </main>
    </div>
  );
}

export default App;