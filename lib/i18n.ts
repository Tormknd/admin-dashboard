export type Language = 'en' | 'fr';

export const translations = {
  en: {
    title: 'System Monitor',
    subtitle: 'Live Port Tracking',
    secureConnection: 'Secure Connection',
    activeListeners: 'Active Listeners',
    scanning: 'Scanning...',
    failedToLoad: 'Failed to load system data.',
    noListeners: 'No active listeners found.',
    port: 'Port',
    service: 'Service',
    pid: 'PID',
    user: 'User',
    protocol: 'Protocol',
  },
  fr: {
    title: 'Moniteur Système',
    subtitle: 'Surveillance des Ports en Temps Réel',
    secureConnection: 'Connexion Sécurisée',
    activeListeners: 'Écouteurs Actifs',
    scanning: 'Analyse...',
    failedToLoad: 'Échec du chargement des données système.',
    noListeners: 'Aucun écouteur actif trouvé.',
    port: 'Port',
    service: 'Service',
    pid: 'PID',
    user: 'Utilisateur',
    protocol: 'Protocole',
  },
} as const;

export type TranslationKey = keyof typeof translations.en;

