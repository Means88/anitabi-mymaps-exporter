# Chrome Web Store Privacy Policy

Last updated: June 3, 2026

This document describes the privacy practices for the **Anitabi My Maps Exporter** Chrome extension.

## Extension Purpose

Anitabi My Maps Exporter helps users export pilgrimage location data from Anitabi map pages into Google My Maps compatible CSV and KML files.

The extension is designed for a single purpose: exporting Anitabi work and location data selected by the user.

## Data the Extension Handles

The extension may handle the following data only when needed to provide its export features:

- The current Anitabi map page URL, used to read the `bangumiId` for the currently viewed work.
- Anitabi work and location data returned by Anitabi public API endpoints, including work titles, location names, coordinates, image URLs, origin attribution, and origin URLs.
- User interface preferences stored locally in the browser, such as theme and language.
- Temporary export selections made by the user during the current extension session.

The extension does not collect passwords, payment information, authentication tokens, personal messages, contact lists, health information, financial information, or browsing history.

## How Data Is Used

The extension uses data only to:

- Detect the currently viewed Anitabi work.
- Display export controls on supported Anitabi map pages.
- Let the user add selected Anitabi locations to a temporary export list.
- Generate CSV and KML files for download.
- Remember local interface preferences such as theme and language.

The extension does not use user data for advertising, tracking, profiling, analytics, creditworthiness, or any unrelated purpose.

## Data Sharing

The extension does not sell, rent, or transfer user data to advertising platforms, data brokers, analytics services, or other information resellers.

The extension makes network requests to the following Anitabi endpoints in order to provide its core export functionality:

- `https://api.anitabi.cn/*`
- `https://www.anitabi.cn/d/g.json`

These requests are used to retrieve Anitabi work, search, and location data selected or requested by the user. The extension does not send exported CSV/KML files to any server.

Generated CSV and KML files are saved locally through the browser download flow.

## Data Storage

Temporary export selections are held in extension page memory and are cleared when the extension page is closed or refreshed.

Theme and language preferences may be stored locally in the user's browser using `localStorage`.

The extension does not operate a remote database and does not store user export lists on a developer-controlled server.

## Remote Code

The extension does not execute remotely hosted code. Its JavaScript, CSS, HTML, fonts, and image assets are bundled with the extension package.

The extension may fetch remote Anitabi API data, but fetched data is not executed as code.

## Permissions Used

The extension requests the narrowest permissions needed for its export workflow:

- `activeTab`: Used to communicate with the currently active Anitabi map tab after user interaction.
- `tabs`: Used to read the active tab URL so the extension can detect the current `bangumiId`.
- `downloads`: Used to save generated CSV and KML files through Chrome's download API.
- `https://api.anitabi.cn/*`: Used to fetch Anitabi work and location data needed for exports.
- `https://www.anitabi.cn/d/g.json`: Used to fetch the Anitabi search index for work search.

The content script is limited to:

- `https://www.anitabi.cn/map*`
- `https://anitabi.cn/map*`

## Limited Use Statement

The extension's use of user data is limited to providing and improving its single export purpose. User data is not sold, used for advertising, transferred to data brokers, or used for unrelated purposes.

If the extension ever uses information received from Google APIs, that use will adhere to the Chrome Web Store User Data Policy, including the Limited Use requirements.

## User Control

Users control which Anitabi locations are added to the temporary export list and when CSV or KML files are downloaded.

Users can clear the temporary export list from the extension interface.

Users can uninstall the extension at any time through Chrome's extension management page.

## Contact

For privacy questions or requests, please contact the developer through the project repository:

https://github.com/Means88/anitabi-mymaps-exporter
