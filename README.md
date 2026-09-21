# JP2Sched

A no-login weekly schedule organizer for students. Add subjects by hand, or
snap a photo of your ERC and let AI lay out the term for you. Everything is
saved **in your browser** — no account, no database, no server to run.

## How it works

- **Frontend:** React + Vite + Tailwind, deployed as a static site.
- **Data:** your subjects, semesters, and profile live in the browser's
  `localStorage` (per device/browser). Move them between devices with
  **Settings → Backup & restore** (Export/Import JSON).
- **ERC Scan (AI):** the only server-side piece — a single Vercel serverless
  function at [`api/erc_scan.js`](api/erc_scan.js). It forwards the photo to
  Google Gemini and returns the parsed subjects. Your Gemini API key stays on
  the server (a Vercel env var); it is never shipped to the browser.

There is no login, no MySQL, and no PHP.

## Local development

```bash
npm install
npm run dev          # http://localhost:5173 — full app except ERC scan
```

The app opens straight to the dashboard. Add/edit subjects, semesters, and
your profile — all persist in `localStorage`.

To test the **ERC scan** locally you need the serverless function running, which
plain `npm run dev` does not do. Use the Vercel CLI:

```bash
npm i -g vercel
cp .env.example .env        # then paste your real GEMINI_API_KEY into .env
vercel dev                  # serves the app AND /api/erc_scan together
```

Get a free Gemini key at https://aistudio.google.com/apikey.

## Deploy to Vercel (free)

1. Push this repo to GitHub/GitLab.
2. In Vercel, **Add New → Project** and import the repo. Vercel auto-detects
   Vite (build `vite build`, output `dist`) and the `api/` function.
3. **Project → Settings → Environment Variables**, add:
   - `GEMINI_API_KEY` = your Gemini key
   - *(optional)* `GEMINI_MODEL` = a model override if the default is retired
     (e.g. `gemini-2.0-flash`)
4. **Deploy.** Adding subjects works entirely client-side; the ERC scan calls
   the serverless function.

`.env` is gitignored, so your key is never pushed — you set it in Vercel.

## Project layout

```
api/erc_scan.js     Vercel serverless function (Gemini vision → subjects JSON)
public/             static assets served at the site root (favicon)
src/
  pages/            Landing, Dashboard, Subjects, Schedule, Settings
  components/       schedule grid, modals, cards, sidebar…
  hooks/            useSubjects, useProfile, useTerm (localStorage-backed)
  utils/            schedule/term helpers, readStore/writeStore
vercel.json         SPA rewrites (client routing) that exclude /api
```
