# Michael Oliveri Site — Claude project context

> This is a **standalone project**. It is not part of Crypto-Synth,
> it is not under any other project. When Claude Code is started from
> this folder, this file is the source of truth for project context.

---

## What this is

Portfolio site for Michael Oliveri Studio — vanilla HTML/CSS/JS,
deployed to Vercel at https://michaeloliveri.com.

- **Repo:** `moliveri101/michaeloliveri-site`
- **Live:** https://michaeloliveri.com
- **Stack:** Vanilla HTML + CSS + JS (no framework, no build step)
- **Deploy:** Vercel static hosting

## Files of note

- `index.html` — entire site markup, section-per-category
- `main.js` — section show/hide, lightbox, grid layout
- `style.css` — all styling (Courier Prime type)
- `vercel.json` — cache headers (7-day on `/images/`, 1-hour on CSS/JS)
- `images/<category>/<project>/*.jpg` — all image assets
- `versions/` — point-in-time snapshots, kept in repo for rollback/reference

## Content structure

Categories (left sidebar nav):

- **Spatial Works** — Deep Space Drip Culture · NASA Nourishment · Hydrocarbons · Pollo Doh Loco · Mice & Polar Bear · Cage'n Fish · Reverse Skinner Box · Neon · Havana 2000 · Public Art
- **Sound / Light**
- **Video**
- **Photography** — Drawings from Jupiter · Nano Insects · Mieses to Pieces · Nano Scapes
- **Bio / CV**
- **Reviews**
- **Contact**

## Working style

- Edit `index.html` / `style.css` / `main.js` directly — no framework, no
  dev server required to see changes locally (just open the file or
  serve with any static server).
- Commit with clear conventional messages.
- Push to `main` → Vercel redeploys automatically.

## Vault filing

See `C:\Users\moliv\.claude\CLAUDE.md` for the global vault pointer.
The project's Obsidian note lives at
`C:\Users\moliv\Documents\brain\Projects\Michael Oliveri Site.md`.

Work done on this site should propagate per the vault's `_CLAUDE.md`
rules: dev work → Dev Logs/ + project note + daily note; tasks →
Boards/Freelance Artist + Tasks/.
