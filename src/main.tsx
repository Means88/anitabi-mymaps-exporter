import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { createRoot } from "react-dom/client";
import * as Popover from "@radix-ui/react-popover";
import * as ScrollArea from "@radix-ui/react-scroll-area";
import * as Toast from "@radix-ui/react-toast";
import * as ToggleGroup from "@radix-ui/react-toggle-group";
import * as core from "./core";
import "./app.css";

const THEME_STORAGE_KEY = "anitabi-exporter-theme";
const LANGUAGE_STORAGE_KEY = "anitabi-exporter-language";
const APP_PARAMS = new URLSearchParams(window.location.search);
const INITIAL_BANGUMI_ID = APP_PARAMS.get("bangumiId") || "";
const IS_EMBEDDED = APP_PARAMS.get("embedded") === "1";
const IS_EXTENSION = location.protocol === "chrome-extension:";
const USE_PROXY = !IS_EXTENSION && location.protocol !== "file:";
const API_BASE = USE_PROXY ? "/api/anitabi" : core.API_BASE;
const SEARCH_INDEX_URL = USE_PROXY ? "/data/search-index.json" : core.SEARCH_INDEX_URL;

const FA_ICONS = {
  arrowsRotate: ["0 0 512 512", "M105.1 202.6c7.7-21.8 20.2-42.3 37.8-59.8 62.5-62.5 163.8-62.5 226.3 0L386.3 160H336c-17.7 0-32 14.3-32 32s14.3 32 32 32h128c17.7 0 32-14.3 32-32V64c0-17.7-14.3-32-32-32s-32 14.3-32 32v51.2l-17.5-17.5c-87.5-87.5-229.3-87.5-316.8 0-24.6 24.6-42.2 53.7-52.8 84.7-5.7 16.7 3.2 34.9 19.9 40.6s34.9-3.2 40.6-19.9zM39 289.4c-16.7-5.7-34.9 3.2-40.6 19.9s3.2 34.9 19.9 40.6c10.6 31 28.2 60.1 52.8 84.7 87.5 87.5 229.3 87.5 316.8 0l17.5-17.5V448c0 17.7 14.3 32 32 32s32-14.3 32-32V320c0-17.7-14.3-32-32-32H309.4c-17.7 0-32 14.3-32 32s14.3 32 32 32h50.3l-17.1 17.1c-62.5 62.5-163.8 62.5-226.3 0-17.6-17.6-30.1-38-37.8-59.8-5.7-16.7-23.9-25.6-40.6-19.9z"],
  circlePlus: ["0 0 512 512", "M256 8C119 8 8 119 8 256s111 248 248 248 248-111 248-248S393 8 256 8zm144 276c0 6.6-5.4 12-12 12h-92v92c0 6.6-5.4 12-12 12h-56c-6.6 0-12-5.4-12-12v-92H124c-6.6 0-12-5.4-12-12v-56c0-6.6 5.4-12 12-12h92v-92c0-6.6 5.4-12 12-12h56c6.6 0 12 5.4 12 12v92h92c6.6 0 12 5.4 12 12v56z"],
  database: ["0 0 448 512", "M448 73.1v45.8C448 159.1 347.7 192 224 192S0 159.1 0 118.9V73.1C0 32.9 100.3 0 224 0s224 32.9 224 73.1zM224 224c123.7 0 224-32.9 224-73.1V256c0 40.2-100.3 73.1-224 73.1S0 296.2 0 256V150.9C0 191.1 100.3 224 224 224zm0 160c123.7 0 224-32.9 224-73.1V416c0 40.2-100.3 73.1-224 73.1S0 456.2 0 416V310.9C0 351.1 100.3 384 224 384z"],
  fileCsv: ["0 0 384 512", "M224 136V0H24C10.7 0 0 10.7 0 24v464c0 13.3 10.7 24 24 24h336c13.3 0 24-10.7 24-24V160H248c-13.2 0-24-10.8-24-24zm-96 252c0 13.3-10.7 24-24 24H88c-22.1 0-40-17.9-40-40v-40c0-22.1 17.9-40 40-40h16c13.3 0 24 10.7 24 24s-10.7 24-24 24H88v24h16c13.3 0 24 10.7 24 24zm84-96h-40c-6.6 0-12 5.4-12 12v12c0 6.6 5.4 12 12 12h16c26.5 0 48 21.5 48 48s-21.5 48-48 48h-40c-13.3 0-24-10.7-24-24s10.7-24 24-24h40c6.6 0 12-5.4 12-12s-5.4-12-12-12h-16c-26.5 0-48-21.5-48-48v-12c0-26.5 21.5-48 48-48h40c13.3 0 24 10.7 24 24s-10.7 24-24 24zm120-68l-31.6 95.1c-3.3 9.9-12.4 16.9-22.8 16.9s-19.5-7-22.8-16.9L223.2 224c-4.2-12.6 2.6-26.2 15.2-30.4s26.2 2.6 30.4 15.2l8.8 26.4 8.8-26.4c4.2-12.6 17.8-19.4 30.4-15.2S336.2 211.4 332 224zM384 121.9v6.1H256V0h6.1c6.4 0 12.5 2.5 17 7l78.9 79c4.5 4.5 7 10.6 7 17z"],
  desktop: ["0 0 576 512", "M64 64C28.7 64 0 92.7 0 128v224c0 35.3 28.7 64 64 64h160l-10.7 32H160c-17.7 0-32 14.3-32 32s14.3 32 32 32h256c17.7 0 32-14.3 32-32s-14.3-32-32-32h-53.3L352 416h160c35.3 0 64-28.7 64-64V128c0-35.3-28.7-64-64-64H64zm448 64v224H64V128h448z"],
  externalLink: ["0 0 512 512", "M320 0c-17.7 0-32 14.3-32 32s14.3 32 32 32h82.7L201.4 265.4c-12.5 12.5-12.5 32.8 0 45.3s32.8 12.5 45.3 0L448 109.3V192c0 17.7 14.3 32 32 32s32-14.3 32-32V32c0-17.7-14.3-32-32-32H320zM80 32C35.8 32 0 67.8 0 112v320c0 44.2 35.8 80 80 80h320c44.2 0 80-35.8 80-80V320c0-17.7-14.3-32-32-32s-32 14.3-32 32v112c0 8.8-7.2 16-16 16H80c-8.8 0-16-7.2-16-16V112c0-8.8 7.2-16 16-16h112c17.7 0 32-14.3 32-32s-14.3-32-32-32H80z"],
  globe: ["0 0 512 512", "M352 256c0 22.2-1.2 43.6-3.3 64H163.3c-2.2-20.4-3.3-41.8-3.3-64s1.2-43.6 3.3-64h185.3c2.2 20.4 3.3 41.8 3.3 64zM503.9 192c5.3 20.5 8.1 41.9 8.1 64s-2.8 43.5-8.1 64H413.5c1.6-20.6 2.5-42 2.5-64s-.9-43.4-2.5-64h90.4zM458.4 128h-56.3c-7.6-38.1-19.9-70.2-35.7-92.9 37 17.8 68.7 50.1 92 92.9zM344.3 128H167.7c6.1-27.4 14.7-50.6 24.8-67.6C210.7 29.8 233.4 16 256 16s45.3 13.8 63.5 44.4c10.1 17 18.7 40.2 24.8 67.6zM145.6 35.1c-15.8 22.7-28.1 54.8-35.7 92.9H53.6c23.3-42.8 55-75.1 92-92.9zM8.1 192h90.4C96.9 212.6 96 234 96 256s.9 43.4 2.5 64H8.1C2.8 299.5 0 278.1 0 256s2.8-43.5 8.1-64zM167.7 384h176.6c-6.1 27.4-14.7 50.6-24.8 67.6C301.3 482.2 278.6 496 256 496s-45.3-13.8-63.5-44.4c-10.1-17-18.7-40.2-24.8-67.6zM109.9 384c7.6 38.1 19.9 70.2 35.7 92.9-37-17.8-68.7-50.1-92-92.9h56.3zm292.2 0h56.3c-23.3 42.8-55 75.1-92 92.9 15.8-22.7 28.1-54.8 35.7-92.9z"],
  locationDot: ["0 0 384 512", "M172.3 501.7C27 291 0 269.4 0 192 0 86 86 0 192 0s192 86 192 192c0 77.4-27 99-172.3 309.7-9.5 13.8-29.9 13.8-39.4 0zM192 272c44.2 0 80-35.8 80-80s-35.8-80-80-80-80 35.8-80 80 35.8 80 80 80z"],
  magnifyingGlass: ["0 0 512 512", "M416 208c0 45.9-14.9 88.3-40 122.7l126.6 126.7c12.5 12.5 12.5 32.8 0 45.3s-32.8 12.5-45.3 0L330.7 376C296.3 401.1 253.9 416 208 416 93.1 416 0 322.9 0 208S93.1 0 208 0s208 93.1 208 208zM208 352a144 144 0 1 0 0-288 144 144 0 1 0 0 288z"],
  map: ["0 0 576 512", "M560 32c-2.7 0-5.4.5-8.1 1.4L384 96 192 32 16 96C6.4 99.5 0 108.6 0 118.8V480c0 11.3 11.5 19 21.9 14.6L192 416l192 64 176-64c9.6-3.5 16-12.6 16-22.8V48c0-8.8-7.2-16-16-16zM224 92.7l128 42.7v326.9l-128-42.7V92.7z"],
  moon: ["0 0 384 512", "M223.5 32C100 32 0 132.3 0 256s100 224 223.5 224c60.6 0 115.5-24.2 155.8-63.4 5-4.9 6.3-12.5 3.1-18.7s-10.1-9.7-17-8.5c-9.8 1.7-19.8 2.6-30 2.6-96.9 0-175.5-78.6-175.5-175.5 0-65.8 36.3-123.1 89.9-153.1 6.1-3.4 9.2-10.5 7.6-17.3S252 34.4 245 33.3c-7.1-.9-14.3-1.3-21.5-1.3z"],
  route: ["0 0 512 512", "M416 320h-96c-17.7 0-32 14.3-32 32v96h-64v-96c0-53 43-96 96-96h96c17.7 0 32-14.3 32-32s-14.3-32-32-32H160C71.6 192 0 120.4 0 32h64c0 53 43 96 96 96h256c53 0 96 43 96 96s-43 96-96 96zM96 384c35.3 0 64 28.7 64 64s-28.7 64-64 64-64-28.7-64-64 28.7-64 64-64zM96 0c35.3 0 64 28.7 64 64s-28.7 64-64 64S32 99.3 32 64 60.7 0 96 0z"],
  spinner: ["0 0 512 512", "M304 48c0 26.5-21.5 48-48 48s-48-21.5-48-48 21.5-48 48-48 48 21.5 48 48zm0 416c0 26.5-21.5 48-48 48s-48-21.5-48-48 21.5-48 48-48 48 21.5 48 48zM48 304c-26.5 0-48-21.5-48-48s21.5-48 48-48 48 21.5 48 48-21.5 48-48 48zm416 0c-26.5 0-48-21.5-48-48s21.5-48 48-48 48 21.5 48 48-21.5 48-48 48zM142.9 437c-18.7 18.7-49.1 18.7-67.9 0s-18.7-49.1 0-67.9 49.1-18.7 67.9 0 18.7 49.1 0 67.9zm294.1-294.1c-18.7 18.7-49.1 18.7-67.9 0s-18.7-49.1 0-67.9 49.1-18.7 67.9 0 18.7 49.1 0 67.9zM75 142.9c-18.7-18.7-18.7-49.1 0-67.9s49.1-18.7 67.9 0 18.7 49.1 0 67.9-49.1 18.7-67.9 0zm294.1 294.1c-18.7-18.7-18.7-49.1 0-67.9s49.1-18.7 67.9 0 18.7 49.1 0 67.9-49.1 18.7-67.9 0z"],
  square: ["0 0 448 512", "M400 32H48C21.5 32 0 53.5 0 80v352c0 26.5 21.5 48 48 48h352c26.5 0 48-21.5 48-48V80c0-26.5-21.5-48-48-48zm-6 400H54V80h340v352z"],
  squareCheck: ["0 0 448 512", "M400 32H48C21.5 32 0 53.5 0 80v352c0 26.5 21.5 48 48 48h352c26.5 0 48-21.5 48-48V80c0-26.5-21.5-48-48-48zM207 352L95 240l45.3-45.3L207 261.5 331.7 136.8 377 182.1 207 352z"],
  star: ["0 0 576 512", "M316.9 18.4l65.7 132.9 146.6 21.3c26.2 3.8 36.7 36.1 17.7 54.6L440.7 330.7l25.1 146c4.5 26.1-23 46-46.4 33.7L288 439.6l-131.4 69.1c-23.4 12.3-50.9-7.6-46.4-33.7l25.1-146L29.1 227.2c-19-18.5-8.5-50.8 17.7-54.6l146.6-21.3 65.7-132.9c11.7-23.6 45.1-23.6 57.8 0z"],
  sun: ["0 0 512 512", "M361.5 1.2c5 2.1 8.5 6.8 9.3 12.2l13.8 102.4 102.4 13.8c5.4.7 10.1 4.3 12.2 9.3s1.4 10.8-1.8 15.2l-62.6 82.2 62.6 82.2c3.3 4.4 4 10.2 1.8 15.2s-6.8 8.5-12.2 9.3l-102.4 13.8-13.8 102.4c-.7 5.4-4.3 10.1-9.3 12.2s-10.8 1.4-15.2-1.8L264 407.1l-82.2 62.6c-4.4 3.3-10.2 4-15.2 1.8s-8.5-6.8-9.3-12.2l-13.8-102.4L41.2 343.1c-5.4-.7-10.1-4.3-12.2-9.3s-1.4-10.8 1.8-15.2l62.6-82.2-62.6-82.2c-3.3-4.4-4-10.2-1.8-15.2s6.8-8.5 12.2-9.3l102.4-13.8 13.8-102.4c.7-5.4 4.3-10.1 9.3-12.2s10.8-1.4 15.2 1.8L264 65.7 346.2 3c4.4-3.3 10.2-4 15.2-1.8zM264 336a100 100 0 1 0 0-200 100 100 0 1 0 0 200z"],
  trashCan: ["0 0 448 512", "M32 464c0 26.5 21.5 48 48 48h288c26.5 0 48-21.5 48-48V128H32v336zM312 24l-9.4-18.7C300 2 295.5 0 290.5 0h-113c-5 0-9.5 2-12.1 5.3L156 24H64c-8.8 0-16 7.2-16 16v32h384V40c0-8.8-7.2-16-16-16h-104z"]
};

type IconName = keyof typeof FA_ICONS;

function Icon({ name }: { name: IconName }) {
  const icon = FA_ICONS[name];
  if (!icon) return null;
  return (
    <svg className={`fa-icon fa-icon-${name}`} aria-hidden="true" focusable="false" viewBox={icon[0]}>
      <path fill="currentColor" d={icon[1]} />
    </svg>
  );
}

function readStoredTheme() {
  try {
    return window.localStorage.getItem(THEME_STORAGE_KEY) || "system";
  } catch {
    return "system";
  }
}

function storeTheme(choice) {
  try {
    if (choice === "system") window.localStorage.removeItem(THEME_STORAGE_KEY);
    else window.localStorage.setItem(THEME_STORAGE_KEY, choice);
  } catch {
    // Ignore storage failures in extension and file contexts.
  }
}

const MESSAGES = {
  zh: {
    appTitle: "Anitabi My Maps Exporter",
    appIntro: "选择巡礼地点，合并多部作品，导出 CSV 或 KML。",
    themeLabel: "主题",
    themeSystem: "跟随系统",
    themeLight: "浅色",
    themeDark: "深色",
    languageLabel: "语言",
    statusReady: "就绪",
    bangumiLabel: "Bangumi ID / Anitabi URL",
    anitabiMapLink: "打开 anitabi.cn/map",
    bangumiPlaceholder: "465493 或 https://www.anitabi.cn/map?bangumiId=465493",
    loadWork: "载入作品",
    loading: "加载中",
    searchWork: "搜索作品",
    searchPlaceholder: "中文名、原名或 bangumiId",
    noSearchMatch: "没有匹配作品。",
    unknownArea: "未知地区",
    pointsShort: "点",
    currentEmpty: "输入作品 ID 或从搜索结果中选择作品。",
    pointCount: "{count} 个地点",
    stableApi: "稳定 API",
    addSelected: "加入选中 {count}",
    selectAll: "全选",
    selectNone: "全不选",
    invertSelection: "反选",
    selectionHint: "默认全选，可取消不需要的地点。",
    cartTitle: "临时清单",
    cartSummary: "{points} 个地点 · {works} 个作品",
    clear: "清空",
    cartEmpty: "还没有加入地点。",
    deleteGroup: "删除整组",
    deletePoint: "删除地点",
    downloadCsv: "下载 CSV",
    downloadKml: "下载 KML",
    workId: "ID {id}",
    origin: "ORIGIN",
    promptBangumi: "请输入 bangumiId 或包含 bangumiId 的 Anitabi URL。",
    loadApi: "正在载入 {id} 的稳定 API 详情。",
    loadedWork: "已载入 {name}，{count} 个含图地点。",
    loadFailed: "载入失败：{message}",
    loadingIndex: "正在加载搜索索引。",
    loadedIndex: "搜索索引已加载：{count} 个作品。",
    searchFailed: "搜索索引加载失败：{message}",
    addedPoints: "已加入 {count} 个新地点；重复地点按作品 ID 和地点 ID 去重。",
    noHostWork: "没有检测到当前作品 ID，无法从页面加入。",
    pointNotFound: "未在稳定 API 详情中找到地点 {id}。",
    cartCleared: "临时清单已清空。",
    downloaded: "已生成下载：{filename}"
  },
  en: {
    appTitle: "Anitabi My Maps Exporter",
    appIntro: "Select pilgrimage points, merge works, and export CSV or KML.",
    themeLabel: "Theme",
    themeSystem: "System",
    themeLight: "Light",
    themeDark: "Dark",
    languageLabel: "Language",
    statusReady: "Ready",
    bangumiLabel: "Bangumi ID / Anitabi URL",
    anitabiMapLink: "Open anitabi.cn/map",
    bangumiPlaceholder: "465493 or https://www.anitabi.cn/map?bangumiId=465493",
    loadWork: "Load work",
    loading: "Loading",
    searchWork: "Search works",
    searchPlaceholder: "Chinese name, original title, or bangumiId",
    noSearchMatch: "No matching works.",
    unknownArea: "Unknown area",
    pointsShort: "pts",
    currentEmpty: "Enter a work ID or choose a work from search results.",
    pointCount: "{count} points",
    stableApi: "Stable API",
    addSelected: "Add selected {count}",
    selectAll: "All",
    selectNone: "None",
    invertSelection: "Invert",
    selectionHint: "All points are selected by default. Uncheck points you do not need.",
    cartTitle: "Temporary List",
    cartSummary: "{points} points · {works} works",
    clear: "Clear",
    cartEmpty: "No points added yet.",
    deleteGroup: "Remove group",
    deletePoint: "Remove point",
    downloadCsv: "Download CSV",
    downloadKml: "Download KML",
    workId: "ID {id}",
    origin: "ORIGIN",
    promptBangumi: "Enter a bangumiId or an Anitabi URL containing bangumiId.",
    loadApi: "Loading stable API details for {id}.",
    loadedWork: "Loaded {name}, {count} image points.",
    loadFailed: "Load failed: {message}",
    loadingIndex: "Loading search index.",
    loadedIndex: "Search index loaded: {count} works.",
    searchFailed: "Search index failed: {message}",
    addedPoints: "Added {count} new points; duplicates are keyed by work ID and point ID.",
    noHostWork: "No current work ID detected on the page.",
    pointNotFound: "Point {id} was not found in stable API details.",
    cartCleared: "Temporary list cleared.",
    downloaded: "Generated download: {filename}"
  },
  ja: {
    appTitle: "Anitabi My Maps Exporter",
    appIntro: "巡礼地点を選び、複数作品をまとめて CSV / KML に書き出します。",
    themeLabel: "テーマ",
    themeSystem: "システム",
    themeLight: "ライト",
    themeDark: "ダーク",
    languageLabel: "言語",
    statusReady: "準備完了",
    bangumiLabel: "Bangumi ID / Anitabi URL",
    anitabiMapLink: "anitabi.cn/map を開く",
    bangumiPlaceholder: "465493 または https://www.anitabi.cn/map?bangumiId=465493",
    loadWork: "作品を読み込む",
    loading: "読み込み中",
    searchWork: "作品検索",
    searchPlaceholder: "中国語名、原題、bangumiId",
    noSearchMatch: "一致する作品がありません。",
    unknownArea: "地域不明",
    pointsShort: "点",
    currentEmpty: "作品 ID を入力するか検索結果から選んでください。",
    pointCount: "{count} 地点",
    stableApi: "安定 API",
    addSelected: "選択 {count} 件を追加",
    selectAll: "全選択",
    selectNone: "解除",
    invertSelection: "反転",
    selectionHint: "初期状態は全選択です。不要な地点は外してください。",
    cartTitle: "一時リスト",
    cartSummary: "{points} 地点 · {works} 作品",
    clear: "クリア",
    cartEmpty: "まだ地点が追加されていません。",
    deleteGroup: "グループ削除",
    deletePoint: "地点削除",
    downloadCsv: "CSV ダウンロード",
    downloadKml: "KML ダウンロード",
    workId: "ID {id}",
    origin: "ORIGIN",
    promptBangumi: "bangumiId または bangumiId を含む Anitabi URL を入力してください。",
    loadApi: "{id} の安定 API 詳細を読み込み中。",
    loadedWork: "{name} を読み込みました。画像付き地点 {count} 件。",
    loadFailed: "読み込み失敗: {message}",
    loadingIndex: "検索インデックスを読み込み中。",
    loadedIndex: "検索インデックスを読み込みました: {count} 作品。",
    searchFailed: "検索インデックスの読み込み失敗: {message}",
    addedPoints: "{count} 件の新規地点を追加しました。重複は作品 ID と地点 ID で判定します。",
    noHostWork: "現在ページの作品 ID を検出できません。",
    pointNotFound: "地点 {id} は安定 API 詳細に見つかりませんでした。",
    cartCleared: "一時リストをクリアしました。",
    downloaded: "ダウンロードを生成しました: {filename}"
  }
} as const;

type Language = keyof typeof MESSAGES;
type MessageKey = keyof typeof MESSAGES.zh;

function normalizeLanguage(value: string | null | undefined): Language {
  const text = core.asText(value).toLowerCase();
  if (text.startsWith("ja")) return "ja";
  if (text.startsWith("en")) return "en";
  return "zh";
}

function readStoredLanguage(): Language {
  try {
    return normalizeLanguage(window.localStorage.getItem(LANGUAGE_STORAGE_KEY) || navigator.language);
  } catch {
    return "zh";
  }
}

function storeLanguage(language: Language) {
  try {
    window.localStorage.setItem(LANGUAGE_STORAGE_KEY, language);
  } catch {
    // Ignore storage failures in extension and file contexts.
  }
}

function translate(language: Language, key: MessageKey, values: Record<string, string | number> = {}) {
  return MESSAGES[language][key].replace(/\{(\w+)\}/g, (_, name) => core.asText(values[name] ?? ""));
}

function extractBangumiId(input) {
  const text = core.asText(input).trim();
  if (!text) return "";
  try {
    const parsed = new URL(text);
    return parsed.searchParams.get("bangumiId") || "";
  } catch {
    const queryMatch = text.match(/[?&]bangumiId=([^&#]+)/);
    if (queryMatch) return decodeURIComponent(queryMatch[1]);
    return text;
  }
}

function hasChromeDownloads() {
  return typeof chrome !== "undefined" && chrome.downloads && typeof chrome.downloads.download === "function";
}

function pointTitle(point) {
  return core.firstText(point.cn, point.name, point.id);
}

function App() {
  const [language, setLanguage] = useState<Language>(() => normalizeLanguage(APP_PARAMS.get("lang") || APP_PARAMS.get("language") || readStoredLanguage()));
  const [theme, setTheme] = useState(APP_PARAMS.get("theme") || readStoredTheme());
  const [status, setStatusText] = useState(() => translate(readStoredLanguage(), "statusReady"));
  const [toastOpen, setToastOpen] = useState(false);
  const [toastText, setToastText] = useState("");
  const [themeMenuOpen, setThemeMenuOpen] = useState(false);
  const [languageMenuOpen, setLanguageMenuOpen] = useState(false);
  const [loadingCount, setLoadingCount] = useState(0);
  const [bangumiInput, setBangumiInput] = useState(INITIAL_BANGUMI_ID);
  const [currentWork, setCurrentWork] = useState(null);
  const [currentPoints, setCurrentPoints] = useState([]);
  const [selectedPointIds, setSelectedPointIds] = useState(new Set());
  const [cart, setCart] = useState(new Map());
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [searchOpen, setSearchOpen] = useState(false);
  const searchIndexRef = useRef(null);
  const loading = loadingCount > 0;
  const t = useCallback((key: MessageKey, values?: Record<string, string | number>) => translate(language, key, values), [language]);

  const announce = useCallback((text) => {
    setStatusText(text);
    if (!IS_EMBEDDED) {
      setToastText(text);
      setToastOpen(false);
      window.requestAnimationFrame(() => setToastOpen(true));
    }
  }, []);

  useEffect(() => {
    storeLanguage(language);
  }, [language]);

  useEffect(() => {
    const normalized = ["system", "light", "dark"].includes(theme) ? theme : "system";
    if (normalized === "system") delete document.documentElement.dataset.theme;
    else document.documentElement.dataset.theme = normalized;
    storeTheme(normalized);
  }, [theme]);

  useEffect(() => {
    document.documentElement.dataset.embedded = IS_EMBEDDED ? "true" : "false";
  }, []);

  const fetchJson = useCallback(async (url) => {
    setLoadingCount((count) => count + 1);
    try {
      const response = await fetch(url, { cache: "no-store" });
      if (!response.ok) throw new Error("HTTP " + response.status + " " + response.statusText);
      return await response.json();
    } finally {
      setLoadingCount((count) => Math.max(0, count - 1));
    }
  }, []);

  const fetchWorkData = useCallback(async (id) => {
    const bangumiId = extractBangumiId(id);
    const [lite, details] = await Promise.all([
      fetchJson(API_BASE + "/bangumi/" + encodeURIComponent(bangumiId) + "/lite"),
      fetchJson(API_BASE + "/bangumi/" + encodeURIComponent(bangumiId) + "/points/detail?haveImage=true")
    ]);
    return {
      work: core.normalizeBangumiLite(lite),
      points: core.normalizeDetailPoints(details)
    };
  }, [fetchJson]);

  const loadWorkById = useCallback(async (id) => {
    const bangumiId = extractBangumiId(id);
    if (!bangumiId) {
      announce(t("promptBangumi"));
      return null;
    }
    announce(t("loadApi", { id: bangumiId }));
    try {
      const data = await fetchWorkData(bangumiId);
      setCurrentWork(data.work);
      setCurrentPoints(data.points);
      setSelectedPointIds(new Set(data.points.map((point) => point.id)));
      setBangumiInput(data.work.id || bangumiId);
      announce(t("loadedWork", { name: core.workDisplayName(data.work), count: data.points.length }));
      return data;
    } catch (error) {
      setCurrentWork(null);
      setCurrentPoints([]);
      setSelectedPointIds(new Set());
      announce(t("loadFailed", { message: error.message }));
      return null;
    }
  }, [announce, fetchWorkData, t]);

  const ensureSearchIndex = useCallback(async () => {
    if (searchIndexRef.current) return searchIndexRef.current;
    announce(t("loadingIndex"));
    const raw = await fetchJson(SEARCH_INDEX_URL);
    searchIndexRef.current = core.parseSearchIndex(raw);
    announce(t("loadedIndex", { count: searchIndexRef.current.length }));
    return searchIndexRef.current;
  }, [announce, fetchJson, t]);

  useEffect(() => {
    const timer = window.setTimeout(async () => {
      const query = searchQuery.trim();
      if (!query) {
        setSearchResults([]);
        return;
      }
      try {
        const index = await ensureSearchIndex();
        setSearchResults(core.searchWorks(index, query, 20));
      } catch (error) {
        announce(t("searchFailed", { message: error.message }));
      }
    }, 250);
    return () => window.clearTimeout(timer);
  }, [announce, ensureSearchIndex, searchQuery, t]);

  const addRowsToCart = useCallback((work, points, ids) => {
    let added = 0;
    setCart((previous) => {
      const next = new Map(previous);
      core.buildRows(work, points).forEach((row) => {
        if (!ids.has(row.point_id)) return;
        if (!next.has(row.key)) added += 1;
        next.set(row.key, row);
      });
      return next;
    });
    announce(t("addedPoints", { count: added }));
  }, [announce, t]);

  const addSelectedPoints = useCallback(() => {
    if (!currentWork) return;
    addRowsToCart(currentWork, currentPoints, selectedPointIds);
  }, [addRowsToCart, currentPoints, currentWork, selectedPointIds]);

  const addFromHostPage = useCallback(async (rawBangumiId, pointId) => {
    const bangumiId = extractBangumiId(rawBangumiId || bangumiInput);
    if (!bangumiId) {
      announce(t("noHostWork"));
      return;
    }
    let work = currentWork;
    let points = currentPoints;
    if (!work || work.id !== bangumiId || !points.length) {
      const data = await loadWorkById(bangumiId);
      if (!data) return;
      work = data.work;
      points = data.points;
    }
    const ids = pointId ? new Set([core.asText(pointId)]) : new Set(points.map((point) => point.id));
    if (pointId && !points.some((point) => point.id === core.asText(pointId))) {
      announce(t("pointNotFound", { id: pointId }));
      return;
    }
    setSelectedPointIds(ids);
    addRowsToCart(work, points, ids);
  }, [addRowsToCart, announce, bangumiInput, currentPoints, currentWork, loadWorkById, t]);

  useEffect(() => {
    if (INITIAL_BANGUMI_ID) {
      loadWorkById(INITIAL_BANGUMI_ID);
    }
  }, [loadWorkById]);

  useEffect(() => {
    const handleMessage = (event) => {
      const message = event.data;
      if (!message || typeof message !== "object") return;
      if (message.type === "anitabi-exporter-add-current-work") addFromHostPage(message.bangumiId, "");
      if (message.type === "anitabi-exporter-add-point") addFromHostPage(message.bangumiId, message.pointId);
      if (message.type === "anitabi-exporter-load-work") loadWorkById(message.bangumiId);
    };
    window.addEventListener("message", handleMessage);
    return () => window.removeEventListener("message", handleMessage);
  }, [addFromHostPage, loadWorkById]);

  const rows = useMemo(() => Array.from(cart.values()), [cart]);
  const workCount = useMemo(() => new Set(rows.map((row) => row.work_id)).size, [rows]);
  const groupedRows = useMemo(() => core.groupRowsByWork(rows), [rows]);

  const downloadText = useCallback((content, mimeType, filename) => {
    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    if (hasChromeDownloads()) {
      chrome.downloads.download({ url, filename, saveAs: true }, () => {
        window.setTimeout(() => URL.revokeObjectURL(url), 2000);
      });
      return;
    }
    const link = document.createElement("a");
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    link.remove();
    announce(t("downloaded", { filename }));
    window.setTimeout(() => URL.revokeObjectURL(url), 2000);
  }, [announce, t]);

  const themeIcon: IconName = theme === "light" ? "sun" : theme === "dark" ? "moon" : "desktop";

  return (
    <Toast.Provider swipeDirection="right">
      <header className="topbar">
        <div>
          <h1>{t("appTitle")}</h1>
          <p>{t("appIntro")}</p>
        </div>
        <div className="topbar-actions">
          <Popover.Root open={themeMenuOpen} onOpenChange={setThemeMenuOpen}>
            <Popover.Trigger className="topbar-picker-trigger" title={t("themeLabel")} aria-label={t("themeLabel")}>
              <Icon name={themeIcon} />
            </Popover.Trigger>
            <Popover.Portal>
              <Popover.Content className="topbar-picker-popover" align="end" sideOffset={8}>
                <ToggleGroup.Root
                  className="theme-switch icon-switch"
                  type="single"
                  value={theme}
                  onValueChange={(value) => {
                    if (!value) return;
                    setTheme(value);
                    setThemeMenuOpen(false);
                  }}
                  aria-label={t("themeLabel")}
                >
                  <ToggleGroup.Item value="system" title={t("themeSystem")} aria-label={t("themeSystem")}><Icon name="desktop" /></ToggleGroup.Item>
                  <ToggleGroup.Item value="light" title={t("themeLight")} aria-label={t("themeLight")}><Icon name="sun" /></ToggleGroup.Item>
                  <ToggleGroup.Item value="dark" title={t("themeDark")} aria-label={t("themeDark")}><Icon name="moon" /></ToggleGroup.Item>
                </ToggleGroup.Root>
              </Popover.Content>
            </Popover.Portal>
          </Popover.Root>
          <Popover.Root open={languageMenuOpen} onOpenChange={setLanguageMenuOpen}>
            <Popover.Trigger className="topbar-picker-trigger" title={t("languageLabel")} aria-label={t("languageLabel")}>
              <Icon name="globe" />
            </Popover.Trigger>
            <Popover.Portal>
              <Popover.Content className="topbar-picker-popover" align="end" sideOffset={8}>
                <ToggleGroup.Root
                  className="language-switch"
                  type="single"
                  value={language}
                  onValueChange={(value) => {
                    if (!value) return;
                    setLanguage(value as Language);
                    setLanguageMenuOpen(false);
                  }}
                  aria-label={t("languageLabel")}
                >
                  <ToggleGroup.Item value="zh">中</ToggleGroup.Item>
                  <ToggleGroup.Item value="en">EN</ToggleGroup.Item>
                  <ToggleGroup.Item value="ja">日</ToggleGroup.Item>
                </ToggleGroup.Root>
              </Popover.Content>
            </Popover.Portal>
          </Popover.Root>
          {IS_EMBEDDED ? <div className="status">{status}</div> : null}
        </div>
      </header>

      <main className="layout">
        <section className="panel source-panel">
          <div className="controls">
            <label>
              <span className="label-row">
                <span>{t("bangumiLabel")}</span>
                <a href="https://www.anitabi.cn/map" target="_blank" rel="noreferrer"><Icon name="externalLink" />{t("anitabiMapLink")}</a>
              </span>
              <input value={bangumiInput} onChange={(event) => setBangumiInput(event.target.value)} onKeyDown={(event) => event.key === "Enter" && loadWorkById(bangumiInput)} placeholder={t("bangumiPlaceholder")} />
            </label>
            <button type="button" className={loading ? "is-loading" : ""} disabled={loading} title={loading ? t("loading") : t("loadWork")} aria-label={loading ? t("loading") : t("loadWork")} onClick={() => loadWorkById(bangumiInput)}>
              {loading ? <><Icon name="spinner" /><span>{t("loading")}</span></> : <><Icon name="magnifyingGlass" /><span>{t("loadWork")}</span></>}
            </button>
          </div>

          <div
            className="search"
            onBlur={(event) => {
              if (!event.currentTarget.contains(event.relatedTarget as Node | null)) setSearchOpen(false);
            }}
          >
            <label>
              <span>{t("searchWork")}</span>
              <div className="search-field">
                <input
                  type="search"
                  value={searchQuery}
                  onFocus={() => setSearchOpen(true)}
                  onChange={(event) => {
                    setSearchQuery(event.target.value);
                    setSearchOpen(true);
                  }}
                  placeholder={t("searchPlaceholder")}
                />
                <SearchResults
                  open={searchOpen}
                  results={searchResults}
                  query={searchQuery}
                  onLoad={(id) => {
                    setSearchOpen(false);
                    loadWorkById(id);
                  }}
                  t={t}
                />
              </div>
            </label>
          </div>

          <CurrentWork
            work={currentWork}
            points={currentPoints}
            selectedPointIds={selectedPointIds}
            setSelectedPointIds={setSelectedPointIds}
            addSelectedPoints={addSelectedPoints}
            t={t}
          />
        </section>

        <CartPanel
          rows={rows}
          workCount={workCount}
          groupedRows={groupedRows}
          clearCart={() => {
            setCart(new Map());
            announce(t("cartCleared"));
          }}
          removeWork={(workId) => setCart((previous) => new Map(Array.from(previous).filter(([key]) => !key.startsWith(workId + ":"))))}
          removeKey={(key) => setCart((previous) => {
            const next = new Map(previous);
            next.delete(key);
            return next;
          })}
          exportCsv={() => downloadText(core.generateCsv(rows), "text/csv;charset=utf-8", core.makeFileName(rows, "csv"))}
          exportKml={() => downloadText(core.generateKml(rows, { language }), "application/vnd.google-earth.kml+xml;charset=utf-8", core.makeFileName(rows, "kml"))}
          t={t}
        />
      </main>

      <Toast.Root className="toast" open={toastOpen} onOpenChange={setToastOpen}>
        <Toast.Description>{toastText}</Toast.Description>
      </Toast.Root>
      <Toast.Viewport className="toast-viewport" />
    </Toast.Provider>
  );
}

function SearchResults({ open, results, query, onLoad, t }) {
  if (!open || !query.trim()) return null;
  if (!results.length) {
    return <div className="search-results-popover search-results-empty">{t("noSearchMatch")}</div>;
  }
  return (
    <div className="search-results-popover">
      <ScrollArea.Root className="search-results-scroll">
        <ScrollArea.Viewport>
          <div className="search-results">
            {results.map((result) => (
              <button key={result.id} type="button" className="search-result" onClick={() => onLoad(result.id)}>
                {result.cover ? <img src={result.cover} alt="" /> : <span className="cover-placeholder"><Icon name="map" /></span>}
                <div>
                  <div className="result-title">{core.firstText(result.cn, result.title, result.id)}</div>
                  <div className="result-meta">{result.title} · {t("workId", { id: result.id })} · {result.city || t("unknownArea")}</div>
                </div>
                <div className="result-meta result-points"><Icon name="locationDot" /><span>{result.pointsLength} {t("pointsShort")}</span></div>
              </button>
            ))}
          </div>
        </ScrollArea.Viewport>
        <ScrollArea.Scrollbar orientation="vertical" />
      </ScrollArea.Root>
    </div>
  );
}

function CurrentWork({ work, points, selectedPointIds, setSelectedPointIds, addSelectedPoints, t }) {
  if (!work) return <div className="current-work empty">{t("currentEmpty")}</div>;
  return (
    <div className="current-work">
      <div className="work-summary">
        {work.cover ? <img className="work-cover" src={work.cover} alt="" /> : <div className="work-cover" />}
        <div>
          <h2>{core.workDisplayName(work)}</h2>
          <p>{work.title} · ID {work.id}</p>
          <div className="work-badges">
            <span className="chip chip-pink"><Icon name="star" />{t("pointCount", { count: points.length })}</span>
            <span className="chip chip-mint"><Icon name="database" />{t("stableApi")}</span>
          </div>
        </div>
        <button type="button" onClick={addSelectedPoints}><Icon name="circlePlus" /><span>{t("addSelected", { count: selectedPointIds.size })}</span></button>
      </div>

      <div className="selection-toolbar">
        <button className="secondary" type="button" onClick={() => setSelectedPointIds(new Set(points.map((point) => point.id)))}><Icon name="squareCheck" /><span>{t("selectAll")}</span></button>
        <button className="secondary" type="button" onClick={() => setSelectedPointIds(new Set())}><Icon name="square" /><span>{t("selectNone")}</span></button>
        <button className="secondary" type="button" onClick={() => setSelectedPointIds(new Set(points.filter((point) => !selectedPointIds.has(point.id)).map((point) => point.id)))}><Icon name="arrowsRotate" /><span>{t("invertSelection")}</span></button>
        <span className="result-meta"><Icon name="map" />{t("selectionHint")}</span>
      </div>

      <ScrollArea.Root className="point-list-scroll">
        <ScrollArea.Viewport>
          <div className="point-list">
            {points.map((point) => (
              <PointItem
                key={point.id}
                point={point}
                checked={selectedPointIds.has(point.id)}
                t={t}
                onChange={(checked) => setSelectedPointIds((previous) => {
                  const next = new Set(previous);
                  if (checked) next.add(point.id);
                  else next.delete(point.id);
                  return next;
                })}
              />
            ))}
          </div>
        </ScrollArea.Viewport>
        <ScrollArea.Scrollbar orientation="vertical" />
      </ScrollArea.Root>
    </div>
  );
}

function PointItem({ point, checked, onChange, t }) {
  return (
    <label className="point-item">
      <input type="checkbox" checked={checked} onChange={(event) => onChange(event.target.checked)} />
      <span className="check-ui" aria-hidden="true" />
      {point.image ? <img className="point-image" src={point.image} alt="" /> : <div className="point-image" />}
      <div className="point-info">
        <div className="point-name"><Icon name="locationDot" />{pointTitle(point)}</div>
        <div className="point-meta">
          <span className="chip chip-sky">ID {point.id}</span>
          <span className="chip chip-pink">EP {point.ep || "-"}</span>
          <span className="chip chip-lemon">TIME {point.s || "-"}</span>
          <span className="chip chip-mint">{point.geo[0]}, {point.geo[1]}</span>
        </div>
        <div className="field-row"><span className="chip chip-wisteria">{t("origin")}</span> {point.origin || "-"}{point.originURL ? " · " + point.originURL : ""}</div>
      </div>
    </label>
  );
}

function CartPanel({ rows, workCount, groupedRows, clearCart, removeWork, removeKey, exportCsv, exportKml, t }) {
  const hasRows = rows.length > 0;
  return (
    <section className="panel cart-panel">
      <div className="cart-header">
        <div>
          <h2>{t("cartTitle")}</h2>
          <p>{t("cartSummary", { points: rows.length, works: workCount })}</p>
        </div>
        <button type="button" disabled={!hasRows} onClick={clearCart}><Icon name="trashCan" /><span>{t("clear")}</span></button>
      </div>

      {!hasRows ? (
        <div className="cart-list empty">{t("cartEmpty")}</div>
      ) : (
        <ScrollArea.Root className="cart-list-scroll">
          <ScrollArea.Viewport>
            <div className="cart-list">
              {Array.from(groupedRows, ([workId, groupRows]) => (
                <WorkGroup key={workId} workId={workId} rows={groupRows} removeWork={removeWork} removeKey={removeKey} t={t} />
              ))}
            </div>
          </ScrollArea.Viewport>
          <ScrollArea.Scrollbar orientation="vertical" />
        </ScrollArea.Root>
      )}

      <div className="export-actions">
        <button id="export-csv" type="button" disabled={!hasRows} onClick={exportCsv}><Icon name="fileCsv" /><span>{t("downloadCsv")}</span></button>
        <button id="export-kml" type="button" disabled={!hasRows} onClick={exportKml}><Icon name="route" /><span>{t("downloadKml")}</span></button>
      </div>
    </section>
  );
}

function WorkGroup({ workId, rows, removeWork, removeKey, t }) {
  const first = rows[0];
  return (
    <section className="work-group">
      <div className="work-group-header">
        {first.work_cover ? <img className="group-cover" src={first.work_cover} alt="" /> : <div className="group-cover"><Icon name="map" /></div>}
        <div>
          <div className="work-group-title"><Icon name="star" />{core.firstText(first.work_cn, first.work_title, workId)}</div>
          <div className="result-meta">{t("workId", { id: workId })}</div>
        </div>
        <span className="badge-count">{rows.length} {t("pointsShort")}</span>
        <button className="icon-button text-button" title={t("deleteGroup")} aria-label={t("deleteGroup")} type="button" onClick={() => removeWork(workId)}><Icon name="trashCan" /></button>
      </div>
      {rows.map((row) => (
        <div className="cart-point" key={row.key}>
          <div>
            <div className="point-name"><Icon name="locationDot" />{core.firstText(row.point_cn, row.point_name, row.point_id)}</div>
            <div className="result-meta"><span className="chip chip-mint">{row.latitude}, {row.longitude}</span> <span className="chip chip-wisteria">{row.origin}</span></div>
          </div>
          <button className="icon-button text-button" title={t("deletePoint")} aria-label={t("deletePoint")} type="button" onClick={() => removeKey(row.key)}><Icon name="trashCan" /></button>
        </div>
      ))}
    </section>
  );
}

createRoot(document.getElementById("root")).render(<App />);
