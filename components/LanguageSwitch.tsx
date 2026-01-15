'use client';

import { useLanguage } from '@/lib/LanguageContext';
import { Languages } from 'lucide-react';
import clsx from 'clsx';

export function LanguageSwitch() {
  const { language, setLanguage } = useLanguage();

  return (
    <div className="flex items-center gap-1 bg-neutral-800 rounded-lg p-1">
      <Languages className="w-3 h-3 text-neutral-400" />
      <button
        onClick={() => setLanguage('en')}
        className={clsx(
          'px-2 py-1 text-xs font-medium rounded transition-colors',
          language === 'en'
            ? 'bg-blue-500 text-white'
            : 'text-neutral-400 hover:text-neutral-200'
        )}
      >
        EN
      </button>
      <button
        onClick={() => setLanguage('fr')}
        className={clsx(
          'px-2 py-1 text-xs font-medium rounded transition-colors',
          language === 'fr'
            ? 'bg-blue-500 text-white'
            : 'text-neutral-400 hover:text-neutral-200'
        )}
      >
        FR
      </button>
    </div>
  );
}

