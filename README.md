# Anitabi My Maps Exporter

Chrome Manifest V3 extension MVP for exporting Anitabi pilgrimage points to Google My Maps compatible files.

## Recommended shape

The first version is built as a shared React + TypeScript UI plus a thin Chrome extension wrapper.

- Plain web page mode lowers installation cost and uses same-origin `/api/...` proxy routes when hosted on Cloudflare Pages or the Vite dev server.
- Chrome extension mode adds the capabilities that a plain web page cannot reliably provide: one-click export from the current Anitabi map page, injected floating panel, current tab URL context, and access to `https://www.anitabi.cn/d/g.json` through host permissions when the search index lacks CORS headers.
- The two modes share the same UI and export core, so CSV/KML behavior does not diverge.

When hosted on Cloudflare Pages, the included Functions proxy these same paths:

- `/api/anitabi/*` -> `https://api.anitabi.cn/*`
- `/api/search-index` -> `https://www.anitabi.cn/d/g.json`

## Features

- Works on `https://www.anitabi.cn/map?bangumiId=...` and `https://anitabi.cn/map?bangumiId=...`.
- Injects a floating `导出` entry on Anitabi map pages; clicking it opens the exporter as a right-side in-page panel instead of a separate popup window.
- Reads `bangumiId` from the current URL, manual input, or a pasted Anitabi map URL.
- Fetches final export data from stable Anitabi API endpoints:
  - `https://api.anitabi.cn/bangumi/{id}/lite`
  - `https://api.anitabi.cn/bangumi/{id}/points/detail?haveImage=true`
- Uses `https://www.anitabi.cn/d/g.json` only as a search index.
- Default-selects all points, then allows per-point selection.
- Supports a temporary multi-work list with point deletion, group deletion, clear all, and dedupe by `{bangumiId}:{pointId}`.
- Uses a bright anime pilgrimage workbench visual style with system, light, and dark theme modes.
- Supports Chinese, English, and Japanese UI labels with an in-app language switch.
- Uses React + TypeScript + Radix UI for the app shell: Radix ToggleGroup for theme/language controls, ScrollArea for dense lists, and Toast for progressive status feedback.
- Exports:
  - UTF-8 BOM CSV for Google My Maps import.
  - KML with folders per work and placemark descriptions containing thumbnail, origin attribution, origin link, and Anitabi link.

## Install locally

1. Open Chrome and go to `chrome://extensions`.
1. Enable `Developer mode`.
1. Run `pnpm install && pnpm build` in this directory.
1. Click `Load unpacked`.
1. Select this directory: `anitabi-mymaps-exporter`.

## Use

1. Open an Anitabi map page, for example `https://www.anitabi.cn/map?bangumiId=465493`.
1. Click the injected `导出` button, or click the extension action and choose `打开导出器`.
1. Review the default-selected point list and uncheck unwanted points.
1. Click `加入选中`.
1. Search another work by Chinese name, original title, or bangumiId, load it, select points, and click `加入选中` again.
1. Download CSV or KML from the temporary list.

## Use as a plain web page

Run `pnpm dev` for local development, or host the Vite build output in `dist/`. Paste a bangumiId or Anitabi map URL, then export CSV/KML with the same UI.

For Cloudflare Pages, deploy this directory as the project root, set the build command to `pnpm build`, and set the output directory to `dist`. Keep `functions/api/anitabi/[[path]].js` and `functions/api/search-index.js` active. The app will call the same-origin proxy automatically on `http:` and `https:` pages; extension pages still use the direct Anitabi API URLs.

## Google My Maps

- For CSV, choose the `latitude` and `longitude` columns as location fields, then use `point_cn` or `point_name` as the title field.
- For KML, import the downloaded `.kml`; folders are grouped by work.

## Development

The web app is Vite + React + TypeScript. The extension shell is still plain MV3 content/background/popup scripts.
Use Node.js 24+ with Corepack-enabled pnpm 11.

```sh
corepack pnpm install
corepack pnpm dev
corepack pnpm typecheck
corepack pnpm build
corepack pnpm test
```

## Notes

This extension keeps origin and origin URL fields next to exported screenshot data. Exported data and source attribution should follow Anitabi's CC BY-NC-SA 4.0 guidance. KMZ is not implemented in this MVP; KML is provided as the Google My Maps and Google Earth import format.
