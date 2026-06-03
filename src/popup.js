let currentBangumiId = "";

function parseBangumiId(url) {
  try {
    const parsed = new URL(url);
    return parsed.searchParams.get("bangumiId") || "";
  } catch (error) {
    return "";
  }
}

function setStatus(text) {
  document.getElementById("status").textContent = text;
}

chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
  const tab = tabs && tabs[0];
  currentBangumiId = parseBangumiId(tab && tab.url);
  if (currentBangumiId) {
    setStatus("已检测到当前作品 ID：" + currentBangumiId);
  } else {
    setStatus("当前页没有 bangumiId，打开后可手动输入或搜索作品。");
  }
});

document.getElementById("open-app").addEventListener("click", () => {
  chrome.runtime.sendMessage({ type: "open-exporter", bangumiId: currentBangumiId });
  window.close();
});
