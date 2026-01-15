'use client';

import { useState, useEffect, useRef } from 'react';
import { Clipboard, Copy, Trash2, Check, X } from 'lucide-react';
import clsx from 'clsx';

interface ClipboardItem {
  id: string;
  content: string;
  createdAt: number;
  expiresAt?: number;
}

export default function ClipboardZone() {
  const [items, setItems] = useState<ClipboardItem[]>([]);
  const [input, setInput] = useState('');
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    fetchClipboard();
    const interval = setInterval(fetchClipboard, 5000);
    return () => clearInterval(interval);
  }, []);

  const fetchClipboard = async () => {
    try {
      const res = await fetch('/api/clipboard');
      const data = await res.json();
      if (Array.isArray(data)) setItems(data);
    } catch (e) {
      console.error('Erreur chargement clipboard');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    try {
      await fetch('/api/clipboard', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: input.trim() }),
      });
      setInput('');
      await fetchClipboard();
    } catch (e) {
      console.error('Erreur sauvegarde');
    }
  };

  const handleCopy = async (content: string, id: string) => {
    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(content);
      } else {
        const textArea = document.createElement('textarea');
        textArea.value = content;
        textArea.style.position = 'fixed';
        textArea.style.opacity = '0';
        document.body.appendChild(textArea);
        textArea.select();
        document.execCommand('copy');
        document.body.removeChild(textArea);
      }
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 2000);
    } catch (e) {
      console.error('Erreur copie', e);
    }
  };

  const handleDelete = async (id: string) => {
    await fetch(`/api/clipboard?id=${id}`, { method: 'DELETE' });
    setItems(items.filter(item => item.id !== id));
  };

  const handleClear = async () => {
    if (!confirm('Supprimer tout le contenu du clipboard ?')) return;
    await fetch('/api/clipboard?clear=true', { method: 'DELETE' });
    setItems([]);
  };

  const formatTime = (timestamp: number) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    
    if (minutes < 1) return 'À l\'instant';
    if (minutes < 60) return `Il y a ${minutes}min`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `Il y a ${hours}h`;
    return date.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' });
  };

  return (
    <div className="bg-neutral-900 rounded-xl border border-neutral-800 shadow-xl overflow-hidden">
      <div className="p-4 border-b border-neutral-800 flex justify-between items-center bg-neutral-900/50">
        <h2 className="text-sm font-semibold text-neutral-300 flex items-center gap-2">
          <Clipboard className="w-4 h-4 text-blue-400" /> Clipboard
        </h2>
        {items.length > 0 && (
          <button
            onClick={handleClear}
            className="text-xs text-neutral-400 hover:text-red-400 transition-colors flex items-center gap-1"
          >
            <X className="w-3 h-3" />
            Tout effacer
          </button>
        )}
      </div>

      <div className="p-6 space-y-6">
        <form onSubmit={handleSubmit} className="space-y-3">
          <textarea
            ref={textareaRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Colle ou tape du texte ici..."
            className="w-full h-24 px-3 py-2 bg-neutral-800 border border-neutral-700 rounded-lg text-neutral-200 placeholder-neutral-500 focus:outline-none focus:border-blue-500 resize-none font-mono text-sm"
          />
          <button
            type="submit"
            disabled={!input.trim()}
            className={clsx(
              "w-full px-4 py-2 rounded-lg font-medium text-sm transition-colors",
              input.trim()
                ? "bg-blue-500 hover:bg-blue-600 text-white"
                : "bg-neutral-800 text-neutral-500 cursor-not-allowed"
            )}
          >
            Ajouter au clipboard
          </button>
        </form>

        <div className="space-y-2">
          <h3 className="text-xs font-medium text-neutral-500 uppercase tracking-wider mb-3">
            Historique ({items.length})
          </h3>
          
          {items.length === 0 ? (
            <div className="text-center py-8 text-neutral-600 text-sm">
              Clipboard vide.
            </div>
          ) : (
            <div className="grid gap-2 max-h-96 overflow-y-auto">
              {items.map((item) => (
                <div
                  key={item.id}
                  className="group p-3 bg-neutral-800/30 border border-neutral-800 rounded-lg hover:border-neutral-700 transition-all"
                >
                  <div className="flex items-start justify-between gap-3 mb-2">
                    <span className="text-xs text-neutral-500">
                      {formatTime(item.createdAt)}
                    </span>
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => handleCopy(item.content, item.id)}
                        className="p-1.5 text-neutral-400 hover:text-blue-400 hover:bg-blue-400/10 rounded transition-colors"
                        title="Copier"
                      >
                        {copiedId === item.id ? (
                          <Check className="w-4 h-4 text-green-400" />
                        ) : (
                          <Copy className="w-4 h-4" />
                        )}
                      </button>
                      <button
                        onClick={() => handleDelete(item.id)}
                        className="p-1.5 text-neutral-400 hover:text-red-400 hover:bg-red-400/10 rounded transition-colors"
                        title="Supprimer"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                  <p className="text-sm text-neutral-200 font-mono whitespace-pre-wrap break-words">
                    {item.content}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

