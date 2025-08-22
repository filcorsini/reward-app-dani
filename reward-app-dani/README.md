# Ricompense di DANI – Vite + React + Tailwind

Questo progetto contiene l'app già pronta per il deploy su **Vercel**.

## Sviluppo locale
```bash
npm install
npm run dev
```

## Build
```bash
npm run build
```

## Deploy su Vercel (via GitHub)
1. Crea un nuovo repository su GitHub e carica i file di questa cartella.
2. Vai su https://vercel.com/new e collega l'account GitHub.
3. Seleziona il repository e premi **Import**.
4. Vercel rileverà **Vite** automaticamente. Build: `vite build`, Output: `dist/`.
5. Premi **Deploy**: otterrai un URL tipo `https://reward-app-dani.vercel.app`.
6. (Facoltativo) Imposta un dominio personalizzato dalle **Project Settings**.

## Deploy via CLI (alternativa)
```bash
npm i -g vercel
vercel
```
Rispondi alle domande interattive e alla fine riceverai l'URL del deploy.

—
