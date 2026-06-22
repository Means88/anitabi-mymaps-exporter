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
  - `functions/api/geo2025.ts` returns static per-work fallback data.
- Static fallback data: `public/data/geo2025/`
- Static search index: `public/data/search-index.json`
- Snapshot/search generator: `scripts/build-geo2025-fallback.ts`

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

Vite dev serves the web app with static assets from `public/`, locally maps `/api/geo2025` to `public/data/geo2025`, and proxies `/api/anitabi/*` to `https://api.anitabi.cn/*`.

## Snapshot And Search Index

The app does not request the old main-site search endpoint at runtime. Refresh the static fallback and search index from an exported Anitabi IndexedDB `geo2025` snapshot:

```sh
cp /path/to/anitabi-geo2025.json data/geo2025.json
curl -L "https://www.anitabi.cn/d/users.csv?d=qixb" -o data/users.csv
corepack pnpm build:geo2025-fallback
```

`vite build`, `corepack pnpm build`, and `corepack pnpm package:chrome` run the same snapshot generator before bundling, so `data/geo2025.json` and `data/users.csv` must exist for production builds.

The generated search index keeps only fields needed for work search:

- `id`
- `cn`
- `alias`
- `title`
- `city`
- `cover`
- `pointsLength`

The generated fallback splits work detail into `public/data/geo2025/works/{bangumiId}.json` and writes `public/data/geo2025/manifest.json`. Keep `data/geo2025.json` in git as the versioned snapshot input. `data/users.csv` is a build input and should not be placed under `public/`.

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
- In the extension environment, prefer Anitabi main-site IndexedDB data when available.
- Static `geo2025` files and the local search index are fallback data generated from the same snapshot.
- Preserve origin/originURL in exports and UI where point source data appears.
- Keep CSV UTF-8 with BOM for Google My Maps compatibility.
- KML folders should group placemarks by work.

## UI Notes

- The app uses React + TypeScript + Radix UI.
- Follow the bright, colorful anime pilgrimage workbench direction.
- Large page panels should use smaller radii; small controls/cards may use larger pill or rounded styles.
- Search results should behave like a select dropdown: attached to the input, opaque background, square popover, simple dividers.
