# Anitabi My Maps Exporter

[中文](README.md) | [English](README.en.md) | [日本語](README.ja.md)

Anitabi My Maps Exporter exports Anitabi pilgrimage locations as CSV or KML files that can be imported into Google My Maps. It works as a plain web app and as a Chrome extension that opens a right-side floating panel on Anitabi map pages.

## Features

- Load a work from an Anitabi map URL, Bangumi ID, or the current page.
- Show work information, place thumbnails, episode, time, coordinates, and source attribution.
- Select all places by default, then unselect individual places.
- Search other works and merge places from multiple works into one temporary list.
- Group the temporary list by work, with single-place deletion, whole-group deletion, and clear-all actions.
- Export UTF-8 BOM CSV for Google My Maps latitude/longitude import.
- Export KML with one folder per work and placemark descriptions that keep thumbnail, source, and Anitabi links.
- Support light, dark, and system theme modes.
- Support Chinese, English, and Japanese UI labels.

## Install the Chrome Extension

Install from the [Chrome Web Store](https://chromewebstore.google.com/detail/anitabi-my-maps-exporter/fdhehgohnlgdlnhbngagpbcedfmnncee).

For a local development install:

1. Run `pnpm install && pnpm build` in this project.
2. Open `chrome://extensions` in Chrome.
3. Enable `Developer mode`.
4. Click `Load unpacked`.
5. Select the `anitabi-mymaps-exporter` project directory.

## Usage

1. Open an Anitabi map page, for example `https://www.anitabi.cn/map?bangumiId=465493`.
2. Click the injected `导出` button on the Anitabi page, or open the exporter from the extension action.
3. Confirm the work in `Bangumi ID / Anitabi URL`, or choose a work from `Search works`.
4. Review the point list. All points are selected by default; use `All`, `None`, or `Invert` if needed.
5. Click `Add selected {count}` to add the current selection to `Temporary List`.
6. Optionally choose another work from `Search works` and add more points.
7. In `Temporary List`, click `Download CSV` or `Download KML`.

## Interface Language

Use the top-right `Language` menu to choose `中`, `EN`, or `日`. Flow labels follow the selected language, for example English uses `Load work`, `Search works`, `Add selected {count}`, `Temporary List`, `Download CSV`, and `Download KML`.

## Web App Mode

You can use the deployed web page directly. Enter a Bangumi ID or Anitabi map URL in `Bangumi ID / Anitabi URL`, click `Load work`, then export from the same multi-work `Temporary List`. Web mode also supports `Search works`, `Download CSV`, and `Download KML`.

## Source Attribution

Exported data keeps Anitabi origin and origin URL fields where available. Please follow the source attribution and CC BY-NC-SA 4.0 guidance from Anitabi and the underlying contributors.

## License

This project is licensed under the [MIT License](LICENSE).
