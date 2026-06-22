(function injectAnitabiExporterPanel() {
  const ROOT_ID = "anitabi-mymaps-export-root";
  const POINT_BUTTON_CLASS = "anitabi-mymaps-point-add";
  const ANITABI_DB_NAME = "anitabi";
  const ANITABI_DB_STORE = "data";
  const ANITABI_GEO_CACHE_KEY = "geo2025";
  const API_BASE = "https://api.anitabi.cn";
  if (document.getElementById(ROOT_ID)) return;

  const appUrl = chrome.runtime.getURL("dist/index.html?embedded=1&bangumiId=" + encodeURIComponent(currentBangumiId()));
  const fontBaseUrl = chrome.runtime.getURL("dist/fonts/gensen-rounded/");
  const FONT_STACK = "\"GenSen Rounded\", \"Hiragino Maru Gothic ProN\", \"Yu Gothic UI\", \"Meiryo\", \"Microsoft YaHei UI\", system-ui, sans-serif";
  let panelOpen = false;
  let frameLoaded = false;
  let decorateTimer = 0;
  const pendingMessages: Record<string, unknown>[] = [];
  const pointCache = new Map<string, Promise<HostPoint[]>>();
  let geoCachePromise: Promise<AnitabiGeoCache | null> | null = null;
  let usersPromise: Promise<Map<string, string>> | null = null;

  interface HostPoint {
    id: string;
    cn: string;
    name: string;
    image: string;
    ep: string;
    s: string;
    mark: string;
    geo: unknown;
    origin: string;
    originLink: string;
    originURL: string;
    folder: string;
    fid: string;
    mid: string;
    uid: string;
    isFolder: unknown;
    density: unknown;
  }

  interface HostWork {
    id: string;
    cn: string;
    title: string;
    city: string;
    cover: string;
    color: string;
    geo: unknown;
    zoom: unknown;
    modified: unknown;
    pointsLength: number;
    imagesLength: number;
    litePoints: HostPoint[];
    points: HostPoint[];
  }

  interface HostWorkData {
    source: "indexeddb";
    modified: unknown;
    work: HostWork;
    points: HostPoint[];
  }

  interface AnitabiGeoCache {
    bangumis?: unknown[];
    modified?: unknown;
  }

  const root = document.createElement("div");
  root.id = ROOT_ID;
  root.innerHTML = [
    '<button id="anitabi-mymaps-fab" type="button" aria-expanded="false" aria-label="打开 Anitabi My Maps 导出面板">',
    '  <span aria-hidden="true">📍</span><strong>导出</strong>',
    '</button>',
    '<aside id="anitabi-mymaps-panel" aria-label="Anitabi My Maps 导出面板">',
    '  <div id="anitabi-mymaps-panel-bar">',
    '    <strong>My Maps 导出</strong>',
    '    <button id="anitabi-mymaps-add-work" type="button">加入当前作品</button>',
    '    <button id="anitabi-mymaps-close" type="button" aria-label="关闭导出面板">×</button>',
    '  </div>',
    '  <iframe id="anitabi-mymaps-frame" title="Anitabi My Maps Exporter" src="' + appUrl + '"></iframe>',
    '</aside>'
  ].join("");

  const style = document.createElement("style");
  style.textContent = [
    "@font-face { font-family: 'GenSen Rounded'; src: url('" + fontBaseUrl + "GenSenRounded2TW-R.woff2') format('woff2'); font-display: swap; font-style: normal; font-weight: 400; }",
    "@font-face { font-family: 'GenSen Rounded'; src: url('" + fontBaseUrl + "GenSenRounded2TW-B.woff2') format('woff2'); font-display: swap; font-style: normal; font-weight: 700; }",
    "#" + ROOT_ID + " { all: initial; font-family: " + FONT_STACK + "; }",
    "#" + ROOT_ID + " * { box-sizing: border-box; }",
    "#" + ROOT_ID + " button { font-family: inherit; }",
    "#anitabi-mymaps-fab { position: fixed; z-index: 2147483647; top: 82px; right: 18px; display: inline-flex; align-items: center; gap: 7px; height: 40px; border: 0; border-radius: 999px; padding: 0 14px; background: #ff6fae; color: #fff; font-size: 14px; font-weight: 800; box-shadow: 0 10px 24px rgba(255,111,174,.32); cursor: pointer; }",
    "#anitabi-mymaps-fab:hover { background: #ff4f9d; }",
    "#anitabi-mymaps-panel { position: fixed; z-index: 2147483646; top: 0; right: 0; width: min(500px, 100vw); height: 100vh; display: grid; grid-template-rows: 48px 1fr; background: #fff7ec; border-left: 1px solid rgba(77,183,255,.32); box-shadow: -18px 0 40px rgba(16,26,52,.22); transform: translateX(104%); transition: transform 180ms ease-out; }",
    "#" + ROOT_ID + ".is-open #anitabi-mymaps-panel { transform: translateX(0); }",
    "#anitabi-mymaps-panel-bar { display: flex; align-items: center; gap: 8px; padding: 8px 10px; color: #253044; background: linear-gradient(90deg, #fff7ec, #eaf8ff); border-bottom: 1px solid rgba(77,183,255,.28); }",
    "#anitabi-mymaps-panel-bar strong { flex: 1; font-size: 14px; }",
    "#anitabi-mymaps-panel-bar button { border: 0; border-radius: 999px; min-height: 30px; padding: 0 10px; background: #fff; color: #253044; font-size: 12px; font-weight: 800; cursor: pointer; box-shadow: inset 0 0 0 1px rgba(77,183,255,.32); }",
    "#anitabi-mymaps-close { width: 30px; padding: 0 !important; font-size: 18px !important; }",
    "#anitabi-mymaps-frame { width: 100%; height: 100%; border: 0; background: #fff7ec; }",
    "." + POINT_BUTTON_CLASS + " { display: inline-grid !important; place-items: center !important; width: 28px !important; height: 28px !important; margin-left: 6px !important; border: 0 !important; border-radius: 999px !important; padding: 0 !important; background: #ff6fae !important; color: #fff !important; font-family: " + FONT_STACK + " !important; font-size: 12px !important; font-weight: 800 !important; line-height: 1 !important; box-shadow: 0 4px 12px rgba(255,111,174,.24) !important; cursor: pointer !important; vertical-align: middle !important; pointer-events: auto !important; }",
    "." + POINT_BUTTON_CLASS + ":hover { background: #ff4f9d !important; }",
    "." + POINT_BUTTON_CLASS + ".is-added { background: #35d6a4 !important; }",
    "." + POINT_BUTTON_CLASS + " svg { width: 12px !important; height: 12px !important; display: block !important; flex: 0 0 auto !important; }",
    ".feature-item .anicodex-anchor, .point-item-no-image .anicodex-anchor { position: absolute !important; top: 8px !important; right: 8px !important; z-index: 3 !important; margin-left: 0 !important; }",
    ".feature-item.point-item h4 { padding-right: 36px !important; }",
    ".feature-item.point-item-no-image h4 { padding-right: 36px !important; }",
    ".point-popup-inset-box .anicodex-anchor { width: 26px !important; height: 26px !important; }",
    ".point-popup-inset-box .info-foot { align-items: center !important; gap: 6px !important; }"
  ].join("\n");

  function asText(value: unknown) {
    return value == null ? "" : String(value);
  }

  function asDataText(value: unknown) {
    if (value === 0) return "";
    return asText(value);
  }

  function parseUsersCsv(text: string) {
    const users = new Map<string, string>();
    text.split(/\r?\n/).forEach((line) => {
      if (!line) return;
      const commaIndex = line.indexOf(",");
      if (commaIndex <= 0) return;
      const id = line.slice(0, commaIndex).trim();
      const nickname = line.slice(commaIndex + 1).trim();
      if (id && nickname) users.set(id, nickname);
    });
    return users;
  }

  function readAnitabiUsers(): Promise<Map<string, string>> {
    if (usersPromise) return usersPromise;
    usersPromise = fetch("/d/users.csv?d=" + Date.now().toString(36), { cache: "force-cache" })
      .then((response) => response.ok ? response.text() : "")
      .then(parseUsersCsv)
      .catch(() => new Map());
    return usersPromise;
  }

  function sourceText(raw: Record<string, unknown>, users: Map<string, string> = new Map()) {
    const origin = asDataText(raw.origin);
    if (origin) return origin;
    const uid = asDataText(raw.uid);
    if (uid) return "@" + (users.get(uid) || uid);
    if (asDataText(raw.mid)) return "Google My Maps";
    return "";
  }

  function sourceLink(raw: Record<string, unknown>) {
    const explicit = asDataText(raw.originURL || raw.originLink);
    if (explicit) return explicit;
    const mid = asDataText(raw.mid);
    const geo = raw.geo;
    if (mid && Array.isArray(geo) && geo.length >= 2) {
      return "https://www.google.com/maps/d/viewer?mid=" + encodeURIComponent(mid) + "&ll=" + encodeURIComponent(asText(geo[0])) + "%2C" + encodeURIComponent(asText(geo[1]));
    }
    return "";
  }

  function currentBangumiId() {
    try {
      const params = new URLSearchParams(window.location.search);
      return params.get("bangumiId") || "";
    } catch (_error) {
      return "";
    }
  }

  function frameWindow() {
    const frame = document.getElementById("anitabi-mymaps-frame") as HTMLIFrameElement | null;
    return frame && frame.contentWindow;
  }

  function postToApp(message) {
    const target = frameWindow();
    if (!target) return;
    if (!frameLoaded) {
      pendingMessages.push(message);
      return;
    }
    target.postMessage(Object.assign({ bangumiId: currentBangumiId() }, message), "*");
  }

  async function postWorkMessage(message) {
    const bangumiId = currentBangumiId();
    const hostWorkData = bangumiId ? await readCachedWorkData(bangumiId) : null;
    postToApp(Object.assign({}, message, hostWorkData ? { hostWorkData } : null));
  }

  async function handleAppMessage(event) {
    if (event.source !== frameWindow()) return;
    const message = event.data;
    if (!message || typeof message !== "object") return;
    if (message.type !== "anitabi-exporter-request-work") return;
    const bangumiId = asText(message.bangumiId);
    const hostWorkData = bangumiId ? await readCachedWorkData(bangumiId) : null;
    postToApp({
      type: "anitabi-exporter-work-response",
      requestId: message.requestId,
      requestedBangumiId: bangumiId,
      hostWorkData
    });
  }

  function flushMessages() {
    while (pendingMessages.length) {
      const message = pendingMessages.shift();
      postToApp(message);
    }
  }

  function setOpen(nextOpen) {
    panelOpen = nextOpen;
    root.classList.toggle("is-open", panelOpen);
    document.getElementById("anitabi-mymaps-fab").setAttribute("aria-expanded", panelOpen ? "true" : "false");
    if (panelOpen && frameLoaded && currentBangumiId()) postWorkMessage({ type: "anitabi-exporter-load-work" });
  }

  function isPointId(value) {
    return /^[a-z0-9_-]{2,80}$/i.test(String(value || ""));
  }

  function readPointIdFromUrl(url) {
    try {
      const parsed = new URL(url, location.href);
      const value = parsed.searchParams.get("pid") || parsed.searchParams.get("pointId") || parsed.searchParams.get("point_id") || parsed.searchParams.get("point") || parsed.searchParams.get("id");
      return isPointId(value) ? String(value) : "";
    } catch (_error) {
      return "";
    }
  }

  function currentUrlPointId() {
    return readPointIdFromUrl(location.href);
  }

  function normalizeMatchText(value) {
    return asText(value).replace(/\u200b/g, "").replace(/\s+/g, "").trim().toLowerCase();
  }

  function normalizeHostPoint(raw: Record<string, unknown>, users: Map<string, string> = new Map()): HostPoint | null {
    if (!raw || !isPointId(raw.id)) return null;
    return {
      id: asText(raw.id),
      cn: asDataText(raw.cn),
      name: asDataText(raw.name),
      image: asDataText(raw.image),
      ep: asDataText(raw.ep),
      s: asDataText(raw.s),
      mark: asDataText(raw.mark),
      geo: raw.geo,
      origin: sourceText(raw, users),
      originLink: sourceLink(raw),
      originURL: sourceLink(raw),
      folder: asDataText(raw.folder),
      fid: asDataText(raw.fid),
      mid: asDataText(raw.mid),
      uid: asDataText(raw.uid),
      isFolder: raw.isFolder,
      density: raw.density
    };
  }

  function normalizeHostWork(raw: Record<string, unknown>, users: Map<string, string> = new Map()): HostWork | null {
    const id = asText(raw && raw.id);
    if (!id) return null;
    const points = Array.isArray(raw.points) ? raw.points.map((point) => normalizeHostPoint(point, users)).filter(Boolean) as HostPoint[] : [];
    return {
      id,
      cn: asDataText(raw.cn),
      title: asDataText(raw.title),
      city: asDataText(raw.city),
      cover: asDataText(raw.cover),
      color: asDataText(raw.color),
      geo: raw.geo,
      zoom: raw.zoom,
      modified: raw.modified,
      pointsLength: points.length || Number(raw.pointsLength) || 0,
      imagesLength: points.filter((point) => point.image).length,
      litePoints: points,
      points
    };
  }

  function readAnitabiGeoCache(): Promise<AnitabiGeoCache | null> {
    if (geoCachePromise) return geoCachePromise;
    geoCachePromise = new Promise((resolve) => {
      if (!window.indexedDB) {
        resolve(null);
        return;
      }
      const request = indexedDB.open(ANITABI_DB_NAME);
      request.onerror = () => resolve(null);
      request.onsuccess = () => {
        const db = request.result;
        try {
          if (!db.objectStoreNames.contains(ANITABI_DB_STORE)) {
            db.close();
            resolve(null);
            return;
          }
          const tx = db.transaction(ANITABI_DB_STORE, "readonly");
          const getRequest = tx.objectStore(ANITABI_DB_STORE).get(ANITABI_GEO_CACHE_KEY);
          getRequest.onerror = () => resolve(null);
          getRequest.onsuccess = () => {
            const record = getRequest.result;
            resolve(record && record.data && Array.isArray(record.data.bangumis) ? record.data : null);
          };
          tx.oncomplete = () => db.close();
          tx.onerror = () => {
            db.close();
            resolve(null);
          };
        } catch (_error) {
          db.close();
          resolve(null);
        }
      };
    }).then((cache) => {
      if (!cache) geoCachePromise = null;
      return cache;
    });
    return geoCachePromise;
  }

  async function readCachedWorkData(workId): Promise<HostWorkData | null> {
    const [cache, users] = await Promise.all([readAnitabiGeoCache(), readAnitabiUsers()]);
    const bangumis = cache && Array.isArray(cache.bangumis) ? cache.bangumis : [];
    const rawWork = bangumis.find((work) => asText((work as Record<string, unknown>).id) === asText(workId)) as Record<string, unknown> | undefined;
    const work = rawWork ? normalizeHostWork(rawWork, users) : null;
    if (!work || !work.points.length) return null;
    return {
      source: "indexeddb",
      modified: cache && cache.modified,
      work,
      points: work.points
    };
  }

  function fetchHostPoints(workId): Promise<HostPoint[]> {
    if (!workId) return Promise.resolve([]);
    if (!pointCache.has(workId)) {
      const url = API_BASE + "/bangumi/" + encodeURIComponent(workId) + "/points";
      pointCache.set(workId, Promise.all([
        fetch(url, { cache: "no-store" }).then((response) => response.ok ? response.json() : []).catch(() => []),
        readAnitabiUsers()
      ])
        .then(([raw, users]) => {
          const source = Array.isArray(raw) ? raw : Array.isArray(raw && raw.points) ? raw.points : [];
          return source.map((point) => normalizeHostPoint(point, users)).filter(Boolean) as HostPoint[];
        })
        .catch(() => []));
    }
    return pointCache.get(workId);
  }

  async function loadHostPoints(workId) {
    const cached = await readCachedWorkData(workId);
    if (cached) return cached.points;
    return fetchHostPoints(workId);
  }

  function readPointIdFromImageUrl(url, points: HostPoint[] = []) {
    const text = asText(url);
    if (!text) return "";
    let filename;
    try {
      filename = new URL(text, location.href).pathname.split("/").pop() || "";
    } catch (_error) {
      filename = text.split(/[/?#]/).filter(Boolean).pop() || "";
    }
    const directMatch = filename.match(/^([a-z0-9]{2,80})(?:[-_.]|$)/i);
    const candidate = directMatch && directMatch[1];
    if (candidate && (!points.length || points.some((point) => point.id === candidate))) return candidate;
    const matchingPoint = points.find((point) => point.image && text.includes(point.id));
    return matchingPoint ? matchingPoint.id : "";
  }

  function readPointIdFromImages(container, points: HostPoint[] = []) {
    const images = Array.from(container.querySelectorAll("img")) as HTMLImageElement[];
    for (const image of images) {
      const value = readPointIdFromImageUrl(image.currentSrc || image.src, points);
      if (value) return value;
    }
    return "";
  }

  function pointNameCandidates(point: HostPoint) {
    return [point.cn, point.name].map(normalizeMatchText).filter(Boolean);
  }

  function geoMatches(text, geo) {
    if (!Array.isArray(geo) || geo.length < 2) return false;
    const numbers = asText(text).match(/-?\d+(?:\.\d+)?/g);
    if (!numbers || numbers.length < 2) return false;
    return Math.abs(Number(numbers[0]) - Number(geo[0])) < 0.00001 && Math.abs(Number(numbers[1]) - Number(geo[1])) < 0.00001;
  }

  function findPointInCacheForItem(container, points: HostPoint[], usedIds: Set<string> = new Set()) {
    const imageId = readPointIdFromImages(container, points);
    if (imageId) return imageId;

    const activeId = container.getAttribute("data-active") === "true" ? currentUrlPointId() : "";
    if (activeId && points.some((point) => point.id === activeId)) return activeId;

    const title = normalizeMatchText(container.querySelector("h4")?.textContent || container.textContent || "");
    const mark = normalizeMatchText(container.querySelector(".mark-text")?.textContent || "");
    const geoText = container.querySelector(".gps")?.textContent || "";
    const matches = points.filter((point) => {
      const names = pointNameCandidates(point);
      if (!names.includes(title)) return false;
      if (geoText && geoMatches(geoText, point.geo)) return true;
      if (mark && normalizeMatchText(point.mark) === mark) return true;
      return true;
    });
    if (matches.length === 1) return matches[0].id;
    const unusedMatch = matches.find((point) => !usedIds.has(point.id));
    return unusedMatch ? unusedMatch.id : "";
  }

  function findPointId(element) {
    let current = element;
    while (current && current !== document.body) {
      if (current.dataset) {
        const value = current.dataset.pointId || current.dataset.pointid || current.dataset.poiId || current.dataset.id;
        if (isPointId(value)) return String(value);
      }
      current = current.parentElement;
    }
    const link = element.closest && element.closest('a[href*="point"]');
    if (link) {
      const value = readPointIdFromUrl(link.href);
      if (value) return value;
    }
    const imageValue = readPointIdFromImages(element);
    if (imageValue) return imageValue;
    return "";
  }

  function createPointButton(pointId) {
    const button = document.createElement("button");
    button.type = "button";
    button.className = POINT_BUTTON_CLASS;
    button.classList.add("anicodex-anchor");
    button.title = "加入导出清单";
    button.setAttribute("aria-label", "加入导出清单");
    button.dataset.pointId = pointId;
    button.innerHTML = '<svg aria-hidden="true" focusable="false" viewBox="0 0 512 512"><path fill="currentColor" d="M256 48C141.1 48 48 141.1 48 256s93.1 208 208 208 208-93.1 208-208S370.9 48 256 48zm96 232h-72v72c0 13.3-10.7 24-24 24s-24-10.7-24-24v-72h-72c-13.3 0-24-10.7-24-24s10.7-24 24-24h72v-72c0-13.3 10.7-24 24-24s24 10.7 24 24v72h72c13.3 0 24 10.7 24 24s-10.7 24-24 24z"></path></svg>';
    button.addEventListener("click", (event) => {
      event.preventDefault();
      event.stopPropagation();
      setOpen(true);
      postWorkMessage({ type: "anitabi-exporter-add-point", pointId });
      button.classList.add("is-added");
      window.setTimeout(() => {
        button.classList.remove("is-added");
      }, 1200);
    });
    return button;
  }

  function decorateContainer(container, pointId) {
    if (!container) return;
    if (!isPointId(pointId)) return;
    const existing = container.querySelector("." + POINT_BUTTON_CLASS) as HTMLButtonElement | null;
    if (existing) {
      if (existing.dataset.pointId === pointId) return;
      existing.remove();
    }
    container.appendChild(createPointButton(pointId));
  }

  async function decorateAnitabiMapItems() {
    const workId = currentBangumiId();
    if (!workId) return;
    const items = Array.from(document.querySelectorAll(".side-bangumi-box .feature-item.point-item, .side-bangumi-box .feature-item.point-item-no-image")) as HTMLElement[];
    if (!items.length) return;
    const points = await loadHostPoints(workId);
    const usedIds = new Set<string>();
    items.forEach((item) => {
      const pointId = findPointId(item) || findPointInCacheForItem(item, points, usedIds);
      if (pointId) usedIds.add(pointId);
      decorateContainer(item, pointId);
    });
  }

  async function decorateAnitabiPopups() {
    const workId = currentBangumiId();
    const points = workId ? await loadHostPoints(workId) : [];
    const popupRoots = Array.from(document.querySelectorAll([
      ".mapbox-point-popup-box[data-type='popup']",
      ".leaflet-popup .map-popup-box",
      ".maplibregl-popup .map-popup-box"
    ].join(","))) as HTMLElement[];
    popupRoots.forEach((popupRoot) => {
      const container = popupRoot.querySelector(".point-popup-inset-box .info-foot")
        || popupRoot.querySelector(".point-popup-inset-box .info-box")
        || popupRoot;
      const pointId = currentUrlPointId() || findPointId(popupRoot) || findPointInCacheForItem(popupRoot, points);
      decorateContainer(container, pointId);
    });
  }

  async function decorateGenericPointNodes() {
    const candidates = Array.from(document.querySelectorAll([
      "[data-point-id]",
      "[data-pointid]",
      "[data-poi-id]",
      "[data-id]",
      "[data-pid]",
      "a[href*='pointId=']",
      "a[href*='point_id=']",
      "a[href*='point=']",
      "a[href*='pid=']"
    ].join(","))) as HTMLElement[];
    candidates.forEach((candidate) => {
      const container = candidate.closest("li, article, section, div") || candidate;
      const pointId = findPointId(candidate);
      decorateContainer(container, pointId);
    });
  }

  function decoratePointNodes() {
    if (decorateTimer) return;
    decorateTimer = window.setTimeout(() => {
      decorateTimer = 0;
      decorateGenericPointNodes();
      decorateAnitabiMapItems();
      decorateAnitabiPopups();
    }, 80);
  }

  document.body.appendChild(style);
  document.body.appendChild(root);

  document.getElementById("anitabi-mymaps-fab").addEventListener("click", () => setOpen(!panelOpen));
  document.getElementById("anitabi-mymaps-close").addEventListener("click", () => setOpen(false));
  document.getElementById("anitabi-mymaps-add-work").addEventListener("click", () => {
    setOpen(true);
    postWorkMessage({ type: "anitabi-exporter-add-current-work" });
  });
  document.getElementById("anitabi-mymaps-frame").addEventListener("load", () => {
    frameLoaded = true;
    flushMessages();
    if (panelOpen && currentBangumiId()) postWorkMessage({ type: "anitabi-exporter-load-work" });
  });

  chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (!message || message.type !== "toggle-exporter-panel") return false;
    setOpen(typeof message.open === "boolean" ? message.open : !panelOpen);
    sendResponse({ ok: true });
    return true;
  });

  decoratePointNodes();
  const observer = new MutationObserver(() => decoratePointNodes());
  observer.observe(document.body, { childList: true, subtree: true });
  window.addEventListener("popstate", decoratePointNodes);
  window.addEventListener("hashchange", decoratePointNodes);
  window.addEventListener("message", handleAppMessage);
  document.addEventListener("click", () => window.setTimeout(decoratePointNodes, 120), true);
  window.setInterval(decoratePointNodes, 1000);
})();
