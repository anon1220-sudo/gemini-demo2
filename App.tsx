import React, { useEffect, useState } from 'react';
import { Log, LogFormData } from './types';
import { logService } from './services/logService';
import LogForm from './components/LogForm';

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
      // Try to fetch from backend
      const data = await logService.getAll();
      setLogs(data.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()));
      setIsOffline(false);
    } catch (err) {
      console.warn('Backend unavailable, switching to offline mode.');
      setIsOffline(true);
      // Fallback to local storage
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
      // 尝试在线创建
      if (!isOffline) {
        try {
          await logService.create(data);
          success = true;
        } catch (err) {
          console.warn('Online creation failed, attempting local fallback.', err);
          setIsOffline(true);
        }
      }

      // 如果离线或在线创建失败，降级为本地创建
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
      // 判断是否为本地生成的日志ID
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

      // 只有在离线模式且是本地日志，或者虽然是在线模式但更新失败且无法回退时处理
      if (!success) {
        if (isLocalLog) {
          logService.updateLocal(editingLog._id, data);
        } else if (isOffline || !success) {
           // 如果试图更新服务器上的日志但连接失败
           alert("Connection lost. Cannot update server entry. Please check your connection.");
           setIsOffline(true);
           // 可选：在这里调用 createLocal(data) 帮用户存为新副本，防止数据丢失
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

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this log?')) return;
    try {
      const isLocalLog = id.startsWith('local-');
      
      if (!isOffline && !isLocalLog) {
        try {
          await logService.delete(id);
        } catch (err) {
          console.warn('Online delete failed.', err);
          setIsOffline(true);
          alert("Connection lost. Cannot delete server entry.");
        }
      } else {
        // 如果是本地日志直接删除，如果是服务器日志在离线状态下无法删除
        if (isLocalLog) {
          logService.deleteLocal(id);
        } else {
           alert("Offline mode: Cannot delete server entry.");
        }
      }
      await fetchLogs();
    } catch (err) {
      alert('Failed to delete log');
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
    <div className="min-h-screen pb-12">
      {/* Header */}
      <header className="bg-secondary text-white shadow-md sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
            </svg>
            <h1 className="text-xl font-bold tracking-tight">My Learning Blog</h1>
          </div>
          <button
            onClick={() => setIsFormOpen(true)}
            className="bg-primary hover:bg-blue-600 text-white px-4 py-2 rounded-lg font-medium transition-colors shadow-sm flex items-center gap-2 text-sm"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            New Entry
          </button>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-8">
        {/* Offline Indicator */}
        {isOffline && (
          <div className="bg-amber-50 border-l-4 border-amber-500 p-4 mb-6 rounded shadow-sm">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <svg className="h-5 w-5 text-amber-500 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
                <p className="text-sm text-amber-700">
                  <strong>Offline Mode:</strong> Cannot connect to backend server. Changes are saved to your browser's local storage.
                </p>
              </div>
              <button 
                onClick={fetchLogs} 
                className="text-sm text-amber-700 hover:text-amber-900 underline ml-4 whitespace-nowrap"
              >
                Retry Connection
              </button>
            </div>
          </div>
        )}

        {/* Form Overlay */}
        {isFormOpen && (
          <div className="fixed inset-0 bg-black/50 z-20 flex items-center justify-center p-4 overflow-y-auto backdrop-blur-sm">
            <div className="w-full max-w-2xl animate-fade-in-up">
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
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          </div>
        )}

        {/* Empty State */}
        {!isLoading && logs.length === 0 && (
          <div className="text-center py-20 bg-white rounded-xl shadow-sm border border-gray-100">
            <div className="bg-blue-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
            </div>
            <h3 className="text-xl font-medium text-gray-900 mb-2">No logs found</h3>
            <p className="text-gray-500 max-w-sm mx-auto">Start your learning journey by creating your first entry.</p>
          </div>
        )}

        {/* Logs List */}
        <div className="space-y-6">
          {logs.map((log) => (
            <article key={log._id} className="bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow duration-300 border border-gray-100 overflow-hidden group">
              <div className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <div className="flex items-center gap-3 mb-2">
                       <span className="text-sm font-semibold text-primary bg-blue-50 px-2 py-1 rounded">
                        {new Date(log.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                      </span>
                      {log.tags.map((tag, idx) => (
                        <span key={idx} className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">#{tag}</span>
                      ))}
                    </div>
                    <h2 className="text-2xl font-bold text-gray-800">{log.title}</h2>
                  </div>
                  <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={() => openEdit(log)}
                      className="p-2 text-gray-400 hover:text-primary hover:bg-blue-50 rounded-full transition-colors"
                      title="Edit"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                        <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                      </svg>
                    </button>
                    <button
                      onClick={() => log._id && handleDelete(log._id)}
                      className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-full transition-colors"
                      title="Delete"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                      </svg>
                    </button>
                  </div>
                </div>
                <div className="prose prose-slate max-w-none">
                  <p className="text-gray-600 whitespace-pre-wrap leading-relaxed">{log.content}</p>
                </div>
              </div>
            </article>
          ))}
        </div>
      </main>
    </div>
  );
}

export default App;