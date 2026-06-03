# Anitabi My Maps Exporter

[中文](README.md) | [English](README.en.md) | [日本語](README.ja.md)

Anitabi My Maps Exporter は、Anitabi の聖地巡礼スポットを Google My Maps に取り込める CSV または KML として出力するツールです。通常の Web アプリとしても、Anitabi の地図ページで右側のフローティングパネルを開く Chrome 拡張としても使えます。

## 機能

- Anitabi の地図 URL、Bangumi ID、または現在のページから作品を読み込みます。
- 作品情報、スポットのサムネイル、話数、時間、座標、出典を表示します。
- 初期状態では全スポットを選択し、不要なスポットだけ外せます。
- 他の作品を検索し、複数作品のスポットを一つの一時リストに追加できます。
- 一時リストは作品ごとにグループ化され、単一スポット削除、作品単位削除、全消去に対応します。
- Google My Maps で緯度経度を認識しやすい UTF-8 BOM 付き CSV を出力します。
- 作品ごとのフォルダを持つ KML を出力し、サムネイル、出典、Anitabi リンクを保持します。
- ライト、ダーク、システム連動テーマに対応します。
- 中国語、英語、日本語の UI 表示に対応します。

## Chrome 拡張のインストール

1. このプロジェクトで `pnpm install && pnpm build` を実行します。
2. Chrome で `chrome://extensions` を開きます。
3. `Developer mode` を有効にします。
4. `Load unpacked` をクリックします。
5. `anitabi-mymaps-exporter` のプロジェクトディレクトリを選択します。

## 使い方

1. `https://www.anitabi.cn/map?bangumiId=465493` などの Anitabi 地図ページを開きます。
2. ページ内に追加された `导出` ボタン、または拡張機能の入口からエクスポーターを開きます。
3. スポット一覧を確認し、不要なスポットの選択を外します。
4. `加入选中` をクリックします。
5. 必要に応じて他の作品を検索し、スポットを追加します。
6. 一時リストから CSV または KML をダウンロードします。

## Web アプリモード

デプロイ済みの Web ページを直接利用できます。Bangumi ID または Anitabi 地図 URL を入力し、複数作品対応の一時リストから CSV/KML を出力できます。

## 出典表記

出力データには、利用可能な場合 Anitabi の origin と origin URL を保持します。Anitabi および元の投稿者が示す出典表記と CC BY-NC-SA 4.0 の条件に従ってください。
