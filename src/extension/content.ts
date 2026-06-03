(function injectAnitabiExporterPanel() {
  const ROOT_ID = "anitabi-mymaps-export-root";
  const POINT_BUTTON_CLASS = "anitabi-mymaps-point-add";
  const params = new URLSearchParams(window.location.search);
  const bangumiId = params.get("bangumiId");
  if (!bangumiId || document.getElementById(ROOT_ID)) return;

  const appUrl = chrome.runtime.getURL("dist/index.html?embedded=1&bangumiId=" + encodeURIComponent(bangumiId));
  let panelOpen = false;
  let frameLoaded = false;
  const pendingMessages = [];

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
    "#" + ROOT_ID + " { all: initial; font-family: Inter, system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; }",
    "#" + ROOT_ID + " * { box-sizing: border-box; }",
    "#anitabi-mymaps-fab { position: fixed; z-index: 2147483647; top: 82px; right: 18px; display: inline-flex; align-items: center; gap: 7px; height: 40px; border: 0; border-radius: 999px; padding: 0 14px; background: #ff6fae; color: #fff; font-size: 14px; font-weight: 800; box-shadow: 0 10px 24px rgba(255,111,174,.32); cursor: pointer; }",
    "#anitabi-mymaps-fab:hover { background: #ff4f9d; }",
    "#anitabi-mymaps-panel { position: fixed; z-index: 2147483646; top: 0; right: 0; width: min(500px, 100vw); height: 100vh; display: grid; grid-template-rows: 48px 1fr; background: #fff7ec; border-left: 1px solid rgba(77,183,255,.32); box-shadow: -18px 0 40px rgba(16,26,52,.22); transform: translateX(104%); transition: transform 180ms ease-out; }",
    "#" + ROOT_ID + ".is-open #anitabi-mymaps-panel { transform: translateX(0); }",
    "#anitabi-mymaps-panel-bar { display: flex; align-items: center; gap: 8px; padding: 8px 10px; color: #253044; background: linear-gradient(90deg, #fff7ec, #eaf8ff); border-bottom: 1px solid rgba(77,183,255,.28); }",
    "#anitabi-mymaps-panel-bar strong { flex: 1; font-size: 14px; }",
    "#anitabi-mymaps-panel-bar button { border: 0; border-radius: 999px; min-height: 30px; padding: 0 10px; background: #fff; color: #253044; font-size: 12px; font-weight: 800; cursor: pointer; box-shadow: inset 0 0 0 1px rgba(77,183,255,.32); }",
    "#anitabi-mymaps-close { width: 30px; padding: 0 !important; font-size: 18px !important; }",
    "#anitabi-mymaps-frame { width: 100%; height: 100%; border: 0; background: #fff7ec; }",
    "." + POINT_BUTTON_CLASS + " { display: inline-grid !important; place-items: center !important; width: 28px !important; height: 28px !important; margin-left: 6px !important; border: 0 !important; border-radius: 999px !important; padding: 0 !important; background: #ff6fae !important; color: #fff !important; font-size: 15px !important; font-weight: 800 !important; line-height: 1 !important; box-shadow: 0 4px 12px rgba(255,111,174,.24) !important; cursor: pointer !important; vertical-align: middle !important; }",
    "." + POINT_BUTTON_CLASS + " svg { width: 13px !important; height: 13px !important; display: block !important; }"
  ].join("\n");

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
    target.postMessage(Object.assign({ bangumiId }, message), "*");
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
    if (panelOpen && frameLoaded) postToApp({ type: "anitabi-exporter-load-work" });
  }

  function isPointId(value) {
    return /^[a-z0-9_-]{2,80}$/i.test(String(value || ""));
  }

  function readPointIdFromUrl(url) {
    try {
      const parsed = new URL(url, location.href);
      const value = parsed.searchParams.get("pointId") || parsed.searchParams.get("point_id") || parsed.searchParams.get("point") || parsed.searchParams.get("id");
      return isPointId(value) ? String(value) : "";
    } catch (_error) {
      return "";
    }
  }

  function currentUrlPointId() {
    return readPointIdFromUrl(location.href);
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
    return "";
  }

  function createPointButton(pointId) {
    const button = document.createElement("button");
    button.type = "button";
    button.className = POINT_BUTTON_CLASS;
    button.title = "加入导出清单";
    button.setAttribute("aria-label", "加入导出清单");
    button.innerHTML = '<svg aria-hidden="true" focusable="false" viewBox="0 0 512 512"><path fill="currentColor" d="M256 48C141.1 48 48 141.1 48 256s93.1 208 208 208 208-93.1 208-208S370.9 48 256 48zm96 232h-72v72c0 13.3-10.7 24-24 24s-24-10.7-24-24v-72h-72c-13.3 0-24-10.7-24-24s10.7-24 24-24h72v-72c0-13.3 10.7-24 24-24s24 10.7 24 24v72h72c13.3 0 24 10.7 24 24s-10.7 24-24 24z"></path></svg>';
    button.addEventListener("click", (event) => {
      event.preventDefault();
      event.stopPropagation();
      setOpen(true);
      postToApp({ type: "anitabi-exporter-add-point", pointId });
    });
    return button;
  }

  function decorateContainer(container, pointId) {
    if (!container || container.querySelector("." + POINT_BUTTON_CLASS)) return;
    if (!isPointId(pointId)) return;
    container.appendChild(createPointButton(pointId));
  }

  function decoratePointNodes() {
    const candidates = document.querySelectorAll([
      "[data-point-id]",
      "[data-pointid]",
      "[data-poi-id]",
      "[data-id]",
      "a[href*='pointId=']",
      "a[href*='point_id=']",
      "a[href*='point=']"
    ].join(","));
    candidates.forEach((candidate) => {
      const container = candidate.closest("li, article, section, div") || candidate;
      const pointId = findPointId(candidate);
      decorateContainer(container, pointId);
    });
    const urlPointId = currentUrlPointId();
    if (urlPointId) {
      document.querySelectorAll(".leaflet-popup, .maplibregl-popup, [role='dialog']").forEach((container) => {
        decorateContainer(container, urlPointId);
      });
    }
  }

  document.body.appendChild(style);
  document.body.appendChild(root);

  document.getElementById("anitabi-mymaps-fab").addEventListener("click", () => setOpen(!panelOpen));
  document.getElementById("anitabi-mymaps-close").addEventListener("click", () => setOpen(false));
  document.getElementById("anitabi-mymaps-add-work").addEventListener("click", () => {
    setOpen(true);
    postToApp({ type: "anitabi-exporter-add-current-work" });
  });
  document.getElementById("anitabi-mymaps-frame").addEventListener("load", () => {
    frameLoaded = true;
    flushMessages();
    if (panelOpen) postToApp({ type: "anitabi-exporter-load-work" });
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
  document.addEventListener("click", () => window.setTimeout(decoratePointNodes, 120), true);
})();
