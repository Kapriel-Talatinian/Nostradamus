# Ask Nostradamus

Web app mystique prédisant les tendances crypto/bourse grâce à GPT.

## Installation

```bash
npm install
```

Créez un fichier `.env` à la racine avec votre clé OpenAI :

```
OPENAI_API_KEY=sk-...
```

## Développement

```
npm run dev
```

## Build production

```
npm run build
npm start
```

Déployable sur Vercel ou exportable via Capacitor pour iOS.

## Usage

L'application offre 3 questions gratuites par jour, stockées dans `localStorage`. Une PWA est générée grâce à `next-pwa` pour ajout à l'écran d'accueil.

**Disclaimer :** Ce n’est pas un conseil financier.
