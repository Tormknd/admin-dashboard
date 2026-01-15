'use client';

import { useState, useRef, useEffect } from 'react';
import { Upload, File, Trash2, Download, Clock, ShieldCheck, AlertCircle } from 'lucide-react';
import clsx from 'clsx';
import { useLanguage } from '@/lib/LanguageContext';

interface FileRecord {
  id: string;
  originalName: string;
  filename: string;
  size: number;
  uploadedAt: number;
  isPersistent: boolean;
}

export default function TransitZone() {
  const { t } = useLanguage();
  const [files, setFiles] = useState<FileRecord[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const [deleteAfter24h, setDeleteAfter24h] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetchFiles();
    const interval = setInterval(fetchFiles, 10000);
    return () => clearInterval(interval);
  }, []);

  const fetchFiles = async () => {
    try {
      const res = await fetch('/api/transit/list');
      const data = await res.json();
      if (Array.isArray(data)) setFiles(data);
    } catch (e) {
      console.error('Erreur chargement fichiers');
    }
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleUpload(e.dataTransfer.files[0]);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    if (e.target.files && e.target.files[0]) {
      handleUpload(e.target.files[0]);
    }
  };

  const handleUpload = async (file: File) => {
    setIsUploading(true);
    setError(null);

    const formData = new FormData();
    formData.append('file', file);
    formData.append('isPersistent', String(!deleteAfter24h));

    try {
      const res = await fetch('/api/transit/upload', {
        method: 'POST',
        body: formData,
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || 'Upload failed');
      }

      await fetchFiles();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsUploading(false);
      if (inputRef.current) inputRef.current.value = '';
    }
  };

  const handleDelete = async (filename: string) => {
    if (!confirm(t('deleteFileConfirm'))) return;
    
    await fetch(`/api/transit/delete?filename=${filename}`, { method: 'DELETE' });
    setFiles(files.filter(f => f.filename !== filename));
  };

  const formatSize = (bytes: number) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className="bg-neutral-900 rounded-xl border border-neutral-800 shadow-xl overflow-hidden">
      <div className="p-3 sm:p-4 border-b border-neutral-800 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 bg-neutral-900/50">
        <h2 className="text-sm font-semibold text-neutral-300 flex items-center gap-2">
          <Upload className="w-4 h-4 text-blue-400" /> {t('transitZone')}
        </h2>
        <span className="text-xs text-neutral-500">{t('temporaryStorage')}</span>
      </div>

      <div className="p-4 sm:p-6 space-y-4 sm:space-y-6">
        <div className="space-y-3">
          <form
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
            onClick={() => inputRef.current?.click()}
            className={clsx(
              "relative border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-all duration-200",
              dragActive 
                ? "border-blue-500 bg-blue-500/10" 
                : "border-neutral-700 hover:border-neutral-500 hover:bg-neutral-800/50",
              isUploading && "opacity-50 pointer-events-none"
            )}
          >
            <input
              ref={inputRef}
              type="file"
              className="hidden"
              onChange={handleChange}
            />
            
            <div className="flex flex-col items-center gap-2">
              {isUploading ? (
                <div className="animate-spin w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full" />
              ) : (
                <Upload className="w-8 h-8 text-neutral-400" />
              )}
              <p className="text-sm text-neutral-300 font-medium text-center px-2">
                {isUploading ? t('uploading') : t('dragOrClick')}
              </p>
              <p className="text-xs text-neutral-500">Min 5GB free space required</p>
            </div>
          </form>

          <div className="flex items-center gap-2 px-1">
            <input
              type="checkbox"
              id="deleteAfter24h"
              checked={deleteAfter24h}
              onChange={(e) => setDeleteAfter24h(e.target.checked)}
              className="w-4 h-4 rounded border-neutral-700 bg-neutral-800 text-blue-500 focus:ring-offset-neutral-900"
            />
            <label htmlFor="deleteAfter24h" className="text-sm text-neutral-400 select-none cursor-pointer flex items-center gap-2">
              <Clock className="w-3 h-3" />
              {t('deleteAfter24h')}
            </label>
          </div>

          {error && (
            <div className="p-3 bg-red-500/10 border border-red-500/20 rounded text-red-400 text-sm flex items-center gap-2">
              <AlertCircle className="w-4 h-4" />
              {error}
            </div>
          )}
        </div>

        <div className="space-y-2">
          <h3 className="text-xs font-medium text-neutral-500 uppercase tracking-wider mb-3">{t('filesOnServer')}</h3>
          
          {files.length === 0 ? (
            <div className="text-center py-8 text-neutral-600 text-sm">
              {t('noFiles')}
            </div>
          ) : (
            <div className="grid gap-2">
              {files.map((file) => (
                <div 
                  key={file.filename}
                  className="group flex items-center justify-between p-3 bg-neutral-800/30 border border-neutral-800 rounded-lg hover:border-neutral-700 transition-all"
                >
                  <div className="flex items-center gap-3 overflow-hidden">
                    <div className="p-2 bg-neutral-800 rounded">
                      <File className="w-5 h-5 text-neutral-400" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm text-neutral-200 truncate font-medium">{file.originalName}</p>
                      <div className="flex items-center gap-2 text-xs text-neutral-500">
                        <span>{formatSize(file.size)}</span>
                        <span>•</span>
                        <span className={clsx(
                          "flex items-center gap-1",
                          file.isPersistent ? "text-green-400" : "text-orange-400"
                        )}>
                          {file.isPersistent ? (
                            <><ShieldCheck className="w-3 h-3" /> Gardé</>
                          ) : (
                            <><Clock className="w-3 h-3" /> 24h</>
                          )}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <a 
                      href={`/api/transit/download?filename=${file.filename}&name=${encodeURIComponent(file.originalName)}`}
                      className="p-2 text-neutral-400 hover:text-blue-400 hover:bg-blue-400/10 rounded transition-colors"
                      title={t('download')}
                    >
                      <Download className="w-4 h-4" />
                    </a>
                    <button 
                      onClick={() => handleDelete(file.filename)}
                      className="p-2 text-neutral-400 hover:text-red-400 hover:bg-red-400/10 rounded transition-colors"
                      title={t('delete')}
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

