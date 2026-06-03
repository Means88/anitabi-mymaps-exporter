# AGENTS.md

## Project

Anitabi My Maps Exporter is a shared React + TypeScript UI plus a Chrome Manifest V3 wrapper for exporting Anitabi pilgrimage points to Google My Maps compatible CSV and KML files.

## Architecture

- Web app entry: `src/main.tsx`
- Shared export/search logic: `src/core/`
- Styles: `src/app.css`
- Chrome extension shell: `manifest.json`, `src/extension/`, `src/popup.html`, `src/app.html`
- Cloudflare Pages Functions:
  - `functions/api/anitabi/[[path]].ts` proxies stable Anitabi API detail routes.
  - `functions/api/search-index.ts` returns the local static search index for compatibility.
- Static search index: `public/data/search-index.json`
- Search index generator: `scripts/build-search-index.ts`

## Development

Use Node.js 24+ with Corepack-enabled pnpm 11.

```sh
corepack pnpm install
corepack pnpm dev
corepack pnpm lint
corepack pnpm typecheck
corepack pnpm build
corepack pnpm test
```

Vite dev serves the web app and locally maps `/api/search-index` to `public/data/search-index.json`. `/api/anitabi/*` proxies `https://api.anitabi.cn/*`.

## Search Index

The app does not proxy `https://www.anitabi.cn/d/g.json` at runtime on Cloudflare Pages. Refresh the local trimmed index manually:

```sh
curl -L https://www.anitabi.cn/d/g.json -o tmp/g.json
corepack pnpm build:search-index
```

The generated index keeps only fields needed for work search:

- `id`
- `cn`
- `alias`
- `title`
- `city`
- `cover`
- `pointsLength`

Keep `tmp/g.json` out of git; it is ignored.

## Cloudflare Pages

Deploy this repository root as a Cloudflare Pages project.

- Build command: `pnpm build`
- Build output directory: `dist`
- Production branch: `main`
- Recommended environment variables:
  - `NODE_VERSION=24`
  - `PNPM_VERSION=11.5.1`

Do not use dashboard Direct Upload for normal deploys if Functions are needed. Use Git integration or Wrangler so `functions/` remains active.

## Data Rules

- Final export data should come from stable Anitabi API endpoints:
  - `https://api.anitabi.cn/bangumi/{id}/lite`
  - `https://api.anitabi.cn/bangumi/{id}/points/detail?haveImage=true`
- The local search index is only for finding works.
- Preserve origin/originURL in exports and UI where point source data appears.
- Keep CSV UTF-8 with BOM for Google My Maps compatibility.
- KML folders should group placemarks by work.

## UI Notes

- The app uses React + TypeScript + Radix UI.
- Follow the bright, colorful anime pilgrimage workbench direction.
- Large page panels should use smaller radii; small controls/cards may use larger pill or rounded styles.
- Search results should behave like a select dropdown: attached to the input, opaque background, square popover, simple dividers.
