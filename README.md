# Anitabi My Maps Exporter

## 中文

Anitabi My Maps Exporter 可以把 Anitabi 巡礼地点导出为 Google My Maps 可导入的 CSV 或 KML 文件。它既可以作为普通网页使用，也可以作为 Chrome 扩展在 Anitabi 地图页中打开右侧浮动面板。

### 功能

- 从 Anitabi 地图 URL、Bangumi ID 或当前页面读取作品。
- 展示作品信息、地点缩略图、集数、时间、坐标和来源。
- 默认全选地点，支持逐项取消选择。
- 支持搜索其它作品，并把多个作品的地点加入同一个临时清单。
- 临时清单按作品分组，支持删除单点、删除整组和清空。
- 导出 UTF-8 BOM CSV，适合 Google My Maps 识别经纬度字段。
- 导出 KML，按作品创建文件夹并保留截图、来源和 Anitabi 链接。
- 支持浅色、深色和跟随系统主题。
- 支持中文、英文和日文界面。

### 安装 Chrome 扩展

1. 在项目目录运行 `pnpm install && pnpm build`。
2. 打开 Chrome 的 `chrome://extensions`。
3. 开启 `Developer mode`。
4. 点击 `Load unpacked`。
5. 选择本项目目录 `anitabi-mymaps-exporter`。

### 使用

1. 打开 Anitabi 地图页，例如 `https://www.anitabi.cn/map?bangumiId=465493`。
2. 点击页面中注入的 `导出` 按钮，或点击扩展入口打开导出器。
3. 检查地点列表，取消不需要的地点。
4. 点击 `加入选中`。
5. 可继续搜索其它作品并追加地点。
6. 在临时清单中下载 CSV 或 KML。

### 普通网页模式

可以直接访问部署后的网页，输入 Bangumi ID 或 Anitabi 地图 URL 后导出。网页模式同样支持多作品临时清单和 CSV/KML 下载。

---

## English

Anitabi My Maps Exporter exports Anitabi pilgrimage locations as CSV or KML files that can be imported into Google My Maps. It works as a plain web app and as a Chrome extension that opens a right-side floating panel on Anitabi map pages.

### Features

- Load a work from an Anitabi map URL, Bangumi ID, or the current page.
- Show work information, place thumbnails, episode, time, coordinates, and source attribution.
- Select all places by default, then unselect individual places.
- Search other works and merge places from multiple works into one temporary list.
- Group the temporary list by work, with single-place deletion, whole-group deletion, and clear-all actions.
- Export UTF-8 BOM CSV for Google My Maps latitude/longitude import.
- Export KML with one folder per work and placemark descriptions that keep thumbnail, source, and Anitabi links.
- Support light, dark, and system theme modes.
- Support Chinese, English, and Japanese UI labels.

### Install the Chrome Extension

1. Run `pnpm install && pnpm build` in this project.
2. Open `chrome://extensions` in Chrome.
3. Enable `Developer mode`.
4. Click `Load unpacked`.
5. Select the `anitabi-mymaps-exporter` project directory.

### Usage

1. Open an Anitabi map page, for example `https://www.anitabi.cn/map?bangumiId=465493`.
2. Click the injected `导出` button, or open the exporter from the extension action.
3. Review the place list and unselect places you do not need.
4. Click `加入选中`.
5. Optionally search another work and add more places.
6. Download CSV or KML from the temporary list.

### Web App Mode

You can use the deployed web page directly. Enter a Bangumi ID or Anitabi map URL, then export CSV/KML with the same multi-work temporary list.

---

## 日本語

Anitabi My Maps Exporter は、Anitabi の聖地巡礼スポットを Google My Maps に取り込める CSV または KML として出力するツールです。通常の Web アプリとしても、Anitabi の地図ページで右側のフローティングパネルを開く Chrome 拡張としても使えます。

### 機能

- Anitabi の地図 URL、Bangumi ID、または現在のページから作品を読み込みます。
- 作品情報、スポットのサムネイル、話数、時間、座標、出典を表示します。
- 初期状態では全スポットを選択し、不要なスポットだけ外せます。
- 他の作品を検索し、複数作品のスポットを一つの一時リストに追加できます。
- 一時リストは作品ごとにグループ化され、単一スポット削除、作品単位削除、全消去に対応します。
- Google My Maps で緯度経度を認識しやすい UTF-8 BOM 付き CSV を出力します。
- 作品ごとのフォルダを持つ KML を出力し、サムネイル、出典、Anitabi リンクを保持します。
- ライト、ダーク、システム連動テーマに対応します。
- 中国語、英語、日本語の UI 表示に対応します。

### Chrome 拡張のインストール

1. このプロジェクトで `pnpm install && pnpm build` を実行します。
2. Chrome で `chrome://extensions` を開きます。
3. `Developer mode` を有効にします。
4. `Load unpacked` をクリックします。
5. `anitabi-mymaps-exporter` のプロジェクトディレクトリを選択します。

### 使い方

1. `https://www.anitabi.cn/map?bangumiId=465493` などの Anitabi 地図ページを開きます。
2. ページ内に追加された `导出` ボタン、または拡張機能の入口からエクスポーターを開きます。
3. スポット一覧を確認し、不要なスポットの選択を外します。
4. `加入选中` をクリックします。
5. 必要に応じて他の作品を検索し、スポットを追加します。
6. 一時リストから CSV または KML をダウンロードします。

### Web アプリモード

デプロイ済みの Web ページを直接利用できます。Bangumi ID または Anitabi 地図 URL を入力し、複数作品対応の一時リストから CSV/KML を出力できます。

---

## Source Attribution

Exported data keeps Anitabi origin and origin URL fields where available. Please follow the source attribution and CC BY-NC-SA 4.0 guidance from Anitabi and the underlying contributors.
