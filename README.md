# Mon Vieux Grimoire

Application web de notation de livres permettant aux utilisateurs de consulter, ajouter et noter des livres.

## Prérequis

- [Docker](https://www.docker.com/get-started/) et Docker Compose (recommandé)
- OU [Bun](https://bun.sh/docs/installation) pour le backend (obligatoire si vous n'utilisez pas Docker)
- [Node.js](https://nodejs.org/) (version 18+) pour le frontend

## Lancement du projet

### Option 1 : Avec Docker (recommandé)

La méthode la plus simple pour démarrer l'application est d'utiliser Docker Compose, qui configurera automatiquement le frontend, le backend et la base de données MongoDB.

```bash
# À la racine du projet
docker-compose -f docker-compose.dev.yml up
```

L'application sera disponible sur :
- Frontend : http://localhost:3000
- Backend : http://localhost:4000

### Option 2 : Sans Docker

#### Backend (avec Bun)

⚠️ **IMPORTANT** : Le backend utilise **Bun** au lieu de Node.js pour ses performances supérieures. Certaines fonctionnalités comme la gestion de fichiers sont spécifiques à Bun et ne fonctionneront pas avec Node.js.

```bash
# Installation de Bun (si non installé)
curl -fsSL https://bun.sh/install | bash

# Dans le dossier back
cd back
bun install
bun dev  # Lance le serveur en mode développement
```

Le backend sera disponible sur http://localhost:8080

#### Frontend (avec Node.js)

```bash
# Dans le dossier app
cd app
npm install
npm start
```

Le frontend sera disponible sur http://localhost:3000

## Structure du projet

- `app/` - Frontend React
- `back/` - Backend Bun.js
- `docker-compose.dev.yml` - Configuration Docker pour l'environnement de développement

## Notes importantes

- Le backend utilise Bun.js pour ses performances supérieures à Node.js et son runtime optimisé
- La gestion des fichiers (upload d'images) est implémentée avec les API de Bun et ne fonctionnera pas avec Node.js
- Le stockage des images se fait dans le dossier `back/uploads/`
- MongoDB est utilisé comme base de données

## Fonctionnalités principales

- Authentification des utilisateurs
- Liste des livres avec tri par note moyenne
- Consultation des détails d'un livre
- Ajout, modification et suppression de livres
- Notation des livres