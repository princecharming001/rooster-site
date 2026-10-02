# Rooster marketing site

Static, dependency-free multi-page site. Node 18+ only.

## Run locally
```bash
npm run dev
```
Builds `src/` into `dist/` and serves it at http://localhost:4321 with rebuild-on-save.

## Change the brand, links and demo calendar
Everything lives in `site.config.mjs`:
- `name`, `tagline`, `description`
- `calendlyUrl`: paste your Calendly link. Every "Book a demo" button and the `/demo/` page use it. Until it's set, demo buttons route to `/demo/` which explains what to do.
- `signupUrl`: where "Start free" goes. Now `/app/`, the Rooster app in demo mode (`public/app/index.html`, one self-contained file built by `pnpm build:single` in the app repo, `apps/web/dist-single/index.html`). The pilot form is still at `/start/`; set `signupUrl` back to `/start/` to use it again.
- `supportEmail`: contact + forms fall back to `mailto:` this address.
- `formEndpoint`: optional Formspree/Basin-style POST endpoint for the contact and pilot forms.
- `basePath`: subpath the site is served under. `""` now that the site lives at https://therooster.farm (custom domain, `public/CNAME`). Set it to `/rooster-site` only if you go back to the github.io project URL.

## Structure
- `src/layout.html`: page shell (head, nav, footer).
- `src/partials/`: `nav`, `footer`, `chick` (the mascot SVG; use `{{chick}}` or `{{chick:chick--lg chick--peck}}` in any page).
- `src/pages/**/*.html`: one file per page; nested folders become nested URLs. Each starts with a `<!-- meta {...} -->` block for title, description and nav section.
- `public/styles.css`: design tokens at the top, all components, all mascot animations.
- `public/js/main.js`: nav, scroll reveal, morning-feed demo, pricing toggle, forms, Calendly embed.
- `build.mjs` / `serve.mjs`: builder and dev server.

## Mascot animations
Classes on the `{{chick}}` partial: `chick--logo`, `chick--sm/md/lg`, `chick--peck` (pecks), `chick--walk` (legs move; the footer band moves it across the screen). Idle bob, blink and occasional wing flap are on by default. The hero chick "crows" every few seconds with a speech bubble (`data-crow` / `data-speech`). All motion respects `prefers-reduced-motion`.

## Deploy
Pushing to `main` deploys to GitHub Pages automatically (`.github/workflows/deploy.yml`). For any other static host: Build command `node build.mjs`, output directory `dist/`.
- Vercel/Netlify: set those two values, done. Clean URLs work because every page is `folder/index.html`.
- GitHub Pages / S3: upload `dist/`.

## Before launch
- Replace the three placeholder testimonials on the home page with real, permissioned pilot quotes.
- Fill the founder bio on `/about/`.
- Have a lawyer review `/privacy/` and `/terms/` (they're marked as drafts).
- Set `domain` in `site.config.mjs` so `sitemap.txt` is correct.
