'use client';

import useSWR from 'swr';
import { PortInfo } from '@/lib/server-cmd';
import { Activity, Server, AlertCircle, Search, ChevronDown, ChevronUp } from 'lucide-react';
import clsx from 'clsx';
import { useLanguage } from '@/lib/LanguageContext';
import { LanguageSwitch } from '@/components/LanguageSwitch';
import TransitZone from '@/components/TransitZone';
import ClipboardZone from '@/components/ClipboardZone';
import { useState, useMemo } from 'react';

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export function DashboardClient() {
  const { data, error, isLoading } = useSWR<{ data: PortInfo[] }>(
    '/api/system/ports',
    fetcher,
    { refreshInterval: 5000 }
  );
  const { t } = useLanguage();
  const [searchQuery, setSearchQuery] = useState('');
  const [isExpanded, setIsExpanded] = useState(false);

  const filteredPorts = useMemo(() => {
    if (!data?.data) return [];
    if (!searchQuery.trim()) return data.data;

    const query = searchQuery.toLowerCase();
    return data.data.filter(item => 
      item.port.toString().includes(query) ||
      item.command.toLowerCase().includes(query) ||
      item.user.toLowerCase().includes(query) ||
      item.pid.includes(query) ||
      item.protocol.toLowerCase().includes(query)
    );
  }, [data?.data, searchQuery]);

  const MAX_HEIGHT = 400;

  return (
    <main className="min-h-screen bg-neutral-950 text-neutral-200 p-8 font-mono">
      <div className="max-w-5xl mx-auto space-y-8">
        <header className="flex items-center justify-between border-b border-neutral-800 pb-6">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-500/10 rounded-lg">
              <Server className="w-6 h-6 text-blue-400" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-white">{t('title')}</h1>
              <p className="text-xs text-neutral-500">{t('subtitle')}</p>
            </div>
          </div>
          <LanguageSwitch />
        </header>

        <div className="bg-neutral-900 rounded-xl border border-neutral-800 overflow-hidden shadow-2xl">
          <div className="p-4 border-b border-neutral-800 flex justify-between items-center bg-neutral-900/50">
            <h2 className="text-sm font-semibold text-neutral-300 flex items-center gap-2">
              <Activity className="w-4 h-4" /> {t('activeListeners')}
            </h2>
            {isLoading && <span className="text-xs text-neutral-500 animate-pulse">{t('scanning')}</span>}
          </div>

          {error ? (
            <div className="p-8 text-center text-red-400 flex flex-col items-center gap-2">
              <AlertCircle className="w-8 h-8" />
              <p>{t('failedToLoad')}</p>
            </div>
          ) : (
            <div className="relative">
              <div 
                className={clsx(
                  "relative overflow-x-auto transition-all duration-300",
                  !isExpanded && filteredPorts.length > 5 ? "overflow-y-hidden" : "overflow-y-auto"
                )}
                style={{
                  maxHeight: !isExpanded && filteredPorts.length > 5 ? `${MAX_HEIGHT}px` : filteredPorts.length > 10 ? '600px' : 'none'
                }}
              >
                <div className="sticky top-0 z-20 bg-neutral-900/95 border-b border-neutral-800 p-3 backdrop-blur-sm">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-500" />
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Rechercher par port, service, utilisateur..."
                      className="w-full pl-10 pr-4 py-2 bg-neutral-800 border border-neutral-700 rounded-lg text-neutral-200 placeholder-neutral-500 focus:outline-none focus:border-blue-500 text-sm"
                    />
                  </div>
                </div>
                
                <table className="w-full text-left text-sm">
                  <thead className="bg-neutral-950 text-neutral-500 uppercase text-xs tracking-wider">
                    <tr>
                      <th className="px-6 py-3 font-medium">{t('port')}</th>
                      <th className="px-6 py-3 font-medium">{t('service')}</th>
                      <th className="px-6 py-3 font-medium">{t('pid')}</th>
                      <th className="px-6 py-3 font-medium">{t('user')}</th>
                      <th className="px-6 py-3 font-medium">{t('protocol')}</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-neutral-800">
                    {filteredPorts.map((item, idx) => (
                      <tr 
                        key={`${item.pid}-${item.port}-${idx}`} 
                        className="hover:bg-neutral-800/50 transition-colors"
                      >
                        <td className="px-6 py-4 font-bold text-blue-400">
                          :{item.port}
                        </td>
                        <td className="px-6 py-4">
                          <span className={clsx(
                            "px-2 py-1 rounded text-xs font-medium",
                            item.command === 'node' ? "bg-green-500/20 text-green-300" :
                            item.command === 'python' || item.command === 'python3' ? "bg-yellow-500/20 text-yellow-300" :
                            item.command === 'nginx' ? "bg-purple-500/20 text-purple-300" :
                            "bg-neutral-800 text-neutral-400"
                          )}>
                            {item.command}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-neutral-500">{item.pid}</td>
                        <td className="px-6 py-4 text-neutral-500">{item.user}</td>
                        <td className="px-6 py-4 text-neutral-600 text-xs">{item.protocol}</td>
                      </tr>
                    ))}
                    {filteredPorts.length === 0 && !isLoading && (
                      <tr>
                        <td colSpan={5} className="p-8 text-center text-neutral-500">
                          {searchQuery ? 'Aucun résultat trouvé' : t('noListeners')}
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              {!isExpanded && filteredPorts.length > 5 && (
                <>
                  <div className="absolute bottom-0 left-0 right-0 h-20 bg-gradient-to-t from-neutral-900 to-transparent pointer-events-none" />
                  <button
                    onClick={() => setIsExpanded(true)}
                    className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-2 px-4 py-2 bg-neutral-800/90 hover:bg-neutral-700 border border-neutral-700 rounded-lg text-sm text-neutral-300 transition-colors backdrop-blur-sm"
                  >
                    <ChevronDown className="w-4 h-4" />
                    Voir tout ({filteredPorts.length} ports)
                  </button>
                </>
              )}

              {isExpanded && filteredPorts.length > 5 && (
                <div className="sticky bottom-0 left-0 right-0 p-3 bg-neutral-900 border-t border-neutral-800">
                  <button
                    onClick={() => setIsExpanded(false)}
                    className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-neutral-800 hover:bg-neutral-700 border border-neutral-700 rounded-lg text-sm text-neutral-300 transition-colors"
                  >
                    <ChevronUp className="w-4 h-4" />
                    Réduire
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <TransitZone />
          <ClipboardZone />
        </div>
      </div>
    </main>
  );
}

