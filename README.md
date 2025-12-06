# Social Network Frontend

Ce projet est la partie frontend d'un réseau social développé avec Next.js pour tester le backend lors des TDs avec les étudiants.

## Prérequis

- Node.js (version 16 ou supérieure)
- npm (gestionnaire de paquets Node.js)
- Backend Laravel en cours d'exécution sur `http://localhost:8000`

## Installation

1. Clonez le dépôt :

```bash
git clone https://github.com/votre-nom-de-utilisateur/social-network-frontend.git
```

2. Naviguez vers le répertoire du projet :

```bash
cd social-network-frontend
```

3. Installez les dépendances :

```bash
npm install
```

4. Configurez l'URL de l'API dans `src/config/api.js` si nécessaire (par défaut: `http://localhost:8000`)

5. Démarrez le serveur de développement :

```bash
npm run dev
```

6. Ouvrez [http://localhost:3000](http://localhost:3000) dans votre navigateur pour voir le réseau social.

## Fonctionnalités

- ✅ Authentification (connexion/inscription)
- ✅ Protection des routes (redirection automatique si non authentifié)
- ✅ Affichage des posts avec images
- ✅ Création de posts avec images
- ✅ Suppression de posts
- ✅ Affichage et création de commentaires
- ✅ Suppression de commentaires
- ✅ États de chargement
- ✅ Gestion d'erreurs améliorée
- ⚠️ Likes (fonctionnalité désactivée - route backend manquante)

## Améliorations récentes

- Correction des routes API (`/api/auth/login` et `/api/auth/signup`)
- Ajout de la protection de routes avec composant `ProtectedRoute`
- Amélioration de la gestion des erreurs (vérifications `error.response`, gestion des erreurs réseau)
- Ajout d'états de chargement pour une meilleure UX
- Correction de la structure des données (posts et commentaires)
- Redirection automatique si déjà connecté/déconnecté
- Mise à jour des métadonnées de l'application
- Correction du texte des boutons
- Support correct des images (`image_url` au lieu de `image`)

## Notes importantes

- **Route des likes** : La fonctionnalité de like est actuellement désactivée car la route `/api/posts/{postId}/likes` n'existe pas encore dans le backend. Un message informatif s'affiche si l'utilisateur tente de liker un post.
- **Structure des données** : Le backend retourne directement des tableaux pour les posts et commentaires (pas dans un objet wrapper).
- **Authentification** : Le token est stocké dans `localStorage` sous la clé `social-network-token`.
- **Images** : Les images des posts utilisent le champ `image_url` qui contient l'URL complète.

## Structure du projet

```
src/
├── app/
│   ├── home/          # Page principale (feed des posts)
│   ├── login/         # Page de connexion
│   ├── register/      # Page d'inscription
│   ├── layout.js      # Layout principal
│   └── page.js        # Page d'accueil (redirection)
├── components/
│   └── ProtectedRoute.jsx  # Composant de protection de route
└── config/
    └── api.js         # Configuration de l'URL de l'API
```
