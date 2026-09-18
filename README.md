# Bibliothèque de quartier

Application de gestion d'une bibliothèque de quartier — API Express + PostgreSQL et interface web statique (HTML/CSS/JS) consommant l'API via `fetch()`.

Projet réalisé dans le cadre du Module 3 (Semaines 14-15) — Akieni Academy, Cohorte 2. Par jude Koy le developpeur trop sexy !

## Prérequis

- [Node.js](https://nodejs.org/) (v18 ou plus récent recommandé)
- [PostgreSQL](https://www.postgresql.org/) (v13 ou plus récent recommandé)
- npm (installé avec Node.js)

## Installation

1. Cloner le dépôt puis installer les dépendances :

   ```bash
   git clone <url-du-depot>
   cd bibliotheque-quartier
   npm install
   ```

2. Créer la base de données PostgreSQL (vide) :

   ```bash
   createdb bibliotheque
   ```

   Ou depuis `psql` :

   ```sql
   CREATE DATABASE bibliotheque;
   ```

3. Créer les tables en exécutant le script SQL fourni :

   ```bash
   psql -d bibliotheque -f database/schema.sql
   ```

   Ce script supprime puis recrée toutes les tables (`auteurs`, `adherents`, `livres`, `emprunts`), avec leurs contraintes, index et clés étrangères. Il peut être relancé à tout moment pour repartir d'une base vide.

## Configuration (`.env`)

Copier le fichier d'exemple puis renseigner vos propres valeurs :

```bash
cp .env.example .env
```

Variables attendues :

Variable - Description - Exemple 

`PORT` : Port d'écoute du serveur Express : `3000` 
`DB_HOST` : Hôte PostgreSQL : `localhost` 
`DB_PORT` : Port PostgreSQL : `5432` 
`DB_NAME` : Nom de la base de données : `bibliotheque` 
`DB_USER` : Utilisateur PostgreSQL : `postgres` 
`DB_PASSWORD` : Mot de passe PostgreSQL : `change_me` 

Le fichier `.env` n'est jamais versionné (voir `.gitignore`).

## Lancement du serveur

```bash
npm start        # production
npm run dev       # développement, avec rechargement automatique (nodemon)
```

Le serveur démarre par défaut sur `http://localhost:3000`. L'interface frontend est servie automatiquement en statique depuis ce même serveur (dossier `frontend/`) : ouvrez simplement `http://localhost:3000` dans un navigateur.

Une route de contrôle est disponible pour vérifier la connexion à la base :

GET /api/health


## Structure du projet

backend/
  config/       → connexion PostgreSQL (pool)
  routes/       → déclaration des URL de l'API
  controllers/  → logique métier et requêtes SQL
  middlewares/  → logger, validation des entrées, gestion centralisée des erreurs
  utils/        → classe d'erreur applicative (AppError)
  server.js     → point d'entrée
database/
  schema.sql          → script de création des tables
  diagramme-erd.md    → diagramme entité-relation (Mermaid)
frontend/
  .html, css/, js/   → interface consommant l'API via fetch()


## Documentation de l'API

Toutes les routes sont préfixées par `/api`.

Ressource : 

Auteurs : GET  `/api/auteurs` : Liste des auteurs 

GET : `/api/auteurs/:id` : Détail d'un auteur 
POST : `/api/auteurs` : Créer un auteur 
PUT : `/api/auteurs/:id` : Modifier un auteur 
DELETE : `/api/auteurs/:id` : Supprimer un auteur 
Adhérents : GET : `/api/adherents` : Liste des adhérents 
GET : `/api/adherents/:id` : Détail d'un adhérent 
GET : `/api/adherents/:id/emprunts` : Historique des emprunts d'un adhérent 
POST : `/api/adherents` : Créer un adhérent 
PUT : `/api/adherents/:id` : Modifier un adhérent 
DELETE : `/api/adherents/:id` : Supprimer un adhérent 
Livres : GET : `/api/livres?search=&page=&limit=` : Liste paginée, recherche par titre/auteur 
GET : `/api/livres/:id` : Détail d'un livre 
POST : `/api/livres` : Créer un livre 
PUT : `/api/livres/:id` : Modifier un livre 
DELETE : `/api/livres/:id` : Supprimer un livre 
Emprunts : GET : `/api/emprunts?statut=tous\|en_cours\|en_retard` | Liste des emprunts, filtrable 
POST : `/api/emprunts` : Créer un emprunt 
PUT : `/api/emprunts/:id/retour` : Enregistrer le retour d'un livre 
Statistiques : GET : `/api/stats` : Tableau de bord (totaux, livre le plus emprunté, adhérent le plus actif) 

Toutes les erreurs sont renvoyées au format homogène :

```json
{ "statut": "erreur", "message": "..." }
```

## Choix de modélisation

- `emprunts.date_retour_effective` est nullable. `NULL` signifie que l'emprunt est en cours. C'est ce champ qui distingue un emprunt actif d'un emprunt terminé et qui permet de calculer les retards en SQL (`date_retour_prevue < CURRENT_DATE AND date_retour_effective IS NULL`), sans jamais stocker le retard lui-même.
- `livres.disponible` est dénormalisé.** Ce booléen évite de recalculer la disponibilité à chaque lecture ; il est mis à jour uniquement à l'intérieur d'une transaction SQL lors de la création ou du retour d'un emprunt, pour garantir que l'emprunt et le changement de statut du livre réussissent ou échouent ensemble.
- Suppressions en `RESTRICT` (comportement par défaut).** Les clés étrangères (`livres.auteur_id`, `emprunts.livre_id`, `emprunts.adherent_id`) ne sont **pas** en cascade : on ne peut pas supprimer un auteur, un livre ou un adhérent tant qu'il existe des enregistrements liés (livres ou emprunts), afin de ne jamais perdre l'historique des emprunts. L'API renvoie dans ce cas une erreur 409 explicite.
- Voir [`database/diagramme-erd.md`](database/diagramme-erd.md) pour le schéma complet des relations.


