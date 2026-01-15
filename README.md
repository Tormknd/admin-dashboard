# 🎛️ Admin Dashboard

![Next.js](https://img.shields.io/badge/Next.js-16-black?style=flat&logo=next.js)
![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue?style=flat&logo=typescript)
![Statut](https://img.shields.io/badge/Statut-En_Dev-green)
![License](https://img.shields.io/badge/License-MIT-grey)

> **"Attends, le port 3000 est déjà pris ou pas ?"**

## 📖 L'Histoire

Je gère un VPS Hetzner sur lequel je déploie pas mal de projets : des backends Node.js, des scripts Python, du Next.js et des conteneurs Docker. Plus j'ajoutais de services, plus c'était le chaos. Je me retrouvais constamment à devoir me connecter en SSH juste pour lancer un `netstat` ou un `lsof` pour comprendre pourquoi j'avais une erreur `EADDRINUSE` ou pour me rappeler où j'avais déployé telle API.

**Ce projet est ma solution.**

Je voulais construire un Panel Admin centralisé, un véritable "Couteau Suisse" pour mon serveur. L'objectif n'est pas de remplacer des outils lourds comme Grafana, mais d'avoir un dashboard léger, agréable et extensible pour regrouper tous les petits outils du quotidien que je trouve utiles.

## 🏗️ Philosophie & Architecture

L'approche est minimaliste : **Zéro dépendance sur l'hôte**.
Le dashboard effectue ses propres vérifications système en utilisant les commandes Linux standards via une architecture modulaire.

Aujourd'hui, le focus est mis sur le **Live Port Monitor**, mais la structure du code (Next.js App Router + API Routes isolées) est conçue pour intégrer très facilement de nouveaux outils de monitoring (disque, logs, processus) au fur et à mesure que les besoins se présenteront.

## ✨ Fonctionnalités (Port Monitor)

- **Suivi Temps Réel** : Rafraîchissement automatique des ports occupés (SWR polling).
- **Identification des Processus** : Voir instantanément quel utilisateur/PID utilise quel port.
- **Support Protocoles** : Distinction claire entre IPv4 et IPv6.
- **Sécurité by Design** : Commandes système hardcodées pour empêcher toute injection shell.
- **Internationalisation** : Support EN/FR avec switch de langue.

![Aperçu du Dashboard](./public/admin-dashboard-img.png)

## 🛡️ Sécurité

Comme ce dashboard expose des infos système, la sécurité était la priorité, pas une option.

1.  **Authentification** : Protégé par un **Middleware Basic Auth**. Pas de base de données requise, les identifiants sont dans le `.env.local`.
2.  **Isolation** : L'interface ne parle jamais au shell directement. Elle passe par une API (`/api/system/ports`) qui exécute une commande strictement définie :
    ```bash
    lsof -iTCP -sTCP:LISTEN -P -n
    ```
3.  **Performance** : Optimisé pour une consommation RAM/CPU minime sur le VPS.

## 🚀 Démarrage

### 1. Prérequis
Le serveur doit avoir `lsof` installé :
```bash
sudo apt-get install lsof
```

### 2. Installation

```bash
git clone https://github.com/votre-user/admin-dashboard.git
cd admin-dashboard
npm install
```

### 3. Configuration

Créez un fichier `.env.local`. **Ne commitez pas ce fichier.**

```env
DASHBOARD_USER=admin
DASHBOARD_PWD=votre_mot_de_passe_robuste
# Optionnel : Port interne du dashboard
PORT=8888
```

### 4. Déploiement (PM2)

```bash
npm run build
pm2 start ecosystem.config.js
```

## ⚠️ Note sur les Permissions

Le dashboard tourne avec les privilèges de l'utilisateur qui lance le processus Node.js.

* Lancé en `root` : Il voit tous les ports.
* Lancé en utilisateur standard (recommandé) : Il voit uniquement les processus appartenant à cet utilisateur.

## 🤝 Contribution

Le projet est conçu pour être évolutif. Si vous avez besoin d'un outil spécifique et que vous souhaitez l'ajouter, les Pull Requests sont les bienvenues.

---

*Développé par Chhaju*
