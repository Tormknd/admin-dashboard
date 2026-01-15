# Configuration du Cron pour le Cleanup Automatique

Pour que les fichiers de la zone de transit soient automatiquement supprimés après 24h, configure un cron job.

## Sur le serveur

```bash
crontab -e
```

Ajoute cette ligne (adapte le port et les credentials) :

```bash
# Cleanup des fichiers transit toutes les heures
0 * * * * curl -u admin:password http://localhost:8888/api/cron/cleanup >> /var/log/admin-dashboard-cleanup.log 2>&1
```

Ou si tu préfères utiliser wget :

```bash
0 * * * * wget --http-user=admin --http-password=password -q -O - http://localhost:8888/api/cron/cleanup >> /var/log/admin-dashboard-cleanup.log 2>&1
```

## Sécurité

La route `/api/cron/cleanup` est protégée :
- En production, elle accepte uniquement les requêtes depuis localhost ou réseaux privés (192.168.x, 10.x)
- En dev, elle est accessible sans restriction

## Vérification

Pour tester manuellement :

```bash
curl http://localhost:8888/api/cron/cleanup
```

Ou avec auth si nécessaire :

```bash
curl -u admin:password http://localhost:8888/api/cron/cleanup
```

