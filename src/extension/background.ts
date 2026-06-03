chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (!message || message.type !== "open-exporter") return false;

  const reply = (payload) => {
    try {
      sendResponse(payload);
    } catch (_error) {
      // The sender may have closed the popup before the async response returns.
    }
  };
  const targetTabId = sender && sender.tab && sender.tab.id;
  const openPanelInTab = (tabId) => {
    if (!tabId) {
      reply({ ok: false, error: "no-active-tab" });
      return;
    }
    chrome.tabs.sendMessage(tabId, { type: "toggle-exporter-panel", open: true, bangumiId: message.bangumiId }, (response) => {
      if (chrome.runtime.lastError) {
        reply({ ok: false, error: chrome.runtime.lastError.message });
        return;
      }
      reply(response || { ok: true });
    });
  };

  if (targetTabId) {
    openPanelInTab(targetTabId);
    return true;
  }

  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    openPanelInTab(tabs && tabs[0] && tabs[0].id);
  });
  return true;
});
