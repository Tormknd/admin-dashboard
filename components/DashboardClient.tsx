'use client';

import useSWR from 'swr';
import { PortInfo } from '@/lib/server-cmd';
import { Activity, Server, AlertCircle } from 'lucide-react';
import clsx from 'clsx';
import { useLanguage } from '@/lib/LanguageContext';
import { LanguageSwitch } from '@/components/LanguageSwitch';

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export function DashboardClient() {
  const { data, error, isLoading } = useSWR<{ data: PortInfo[] }>(
    '/api/system/ports',
    fetcher,
    { refreshInterval: 5000 }
  );
  const { t } = useLanguage();

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
            <div className="overflow-x-auto">
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
                  {data?.data?.map((item, idx) => (
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
                  {(!data?.data || data.data.length === 0) && !isLoading && (
                    <tr>
                      <td colSpan={5} className="p-8 text-center text-neutral-500">
                        {t('noListeners')}
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}

