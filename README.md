# OrdoMaroc AI

Assistant Clinique Intelligent adapté à la pharmacopée marocaine. Génération d'ordonnances, encyclopédie médicale et analyse clinique alimentée par l'intelligence artificielle (Google Gemini).

## Fonctionnalités

*   **Génération d'ordonnances** : Créez des prescriptions structurées basées sur des symptômes ou des pathologies.
*   **Base de données Maroc** : Suggestions de médicaments disponibles au Maroc (DCI et Noms Commerciaux).
*   **Modes Spécialisés** : Médecin, Étudiant (avec raisonnement clinique), Urgence, Pédiatrie.
*   **Analyse Multimodale** : Analyse d'images et de vidéos pour l'aide au diagnostic (via Gemini 1.5 Pro).
*   **Export PDF & Impression** : Format A4 professionnel.
*   **Authentification** : Connexion sécurisée via Firebase (Google Auth).

## Installation Locale

1.  Cloner le dépôt :
    ```bash
    git clone https://github.com/votre-username/ordomaroc-ai.git
    cd ordomaroc-ai
    ```

2.  Installer les dépendances :
    ```bash
    npm install
    ```

3.  Configurer les variables d'environnement :
    Créez un fichier `.env` à la racine et ajoutez votre clé API Google Gemini :
    ```env
    VITE_API_KEY=votre_cle_api_google_ici
    ```
    *Note : Pour le déploiement Vercel, ajoutez cette clé dans les paramètres du projet.*

4.  Lancer le serveur de développement :
    ```bash
    npm run dev
    ```

## Déploiement (Vercel)

Ce projet est configuré pour être déployé facilement sur Vercel.
1.  Connectez votre dépôt GitHub à Vercel.
2.  Ajoutez la variable d'environnement `API_KEY` (ou `VITE_API_KEY` selon votre config de service).
3.  Déployez.

## Technologies

*   React 18
*   TypeScript
*   Vite
*   Tailwind CSS
*   Google GenAI SDK
*   Firebase Auth
