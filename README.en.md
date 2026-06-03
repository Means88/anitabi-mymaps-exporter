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

1. Run `pnpm install && pnpm build` in this project.
2. Open `chrome://extensions` in Chrome.
3. Enable `Developer mode`.
4. Click `Load unpacked`.
5. Select the `anitabi-mymaps-exporter` project directory.

## Usage

1. Open an Anitabi map page, for example `https://www.anitabi.cn/map?bangumiId=465493`.
2. Click the injected `导出` button, or open the exporter from the extension action.
3. Review the place list and unselect places you do not need.
4. Click `加入选中`.
5. Optionally search another work and add more places.
6. Download CSV or KML from the temporary list.

## Web App Mode

You can use the deployed web page directly. Enter a Bangumi ID or Anitabi map URL, then export CSV/KML with the same multi-work temporary list.

## Source Attribution

Exported data keeps Anitabi origin and origin URL fields where available. Please follow the source attribution and CC BY-NC-SA 4.0 guidance from Anitabi and the underlying contributors.

## License

This project is licensed under the [MIT License](LICENSE).
