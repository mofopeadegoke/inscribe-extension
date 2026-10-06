// Extension Pay
importScripts("ExtPay.js");

const extpay = ExtPay("inscribe");
extpay.startBackground(); // this line is required to use ExtPay in the rest of your extension

const STICKY_MENU_ID = "add-sticky-note";

// Menu items persist across service-worker restarts, so create them only on install/update.
chrome.runtime.onInstalled.addListener(() => {
  chrome.contextMenus.create({
    id: STICKY_MENU_ID,
    title: "Add an Inscribe Sticky Note here",
    contexts: ["all"],
  });
});

chrome.contextMenus.onClicked.addListener((info, tab) => {
  if (info.menuItemId !== STICKY_MENU_ID || !tab || tab.id === undefined) return;
  chrome.tabs
    .sendMessage(tab.id, { action: "runContentScript" })
    .catch((err) => {
      // No content script on this page (chrome:// pages, the Web Store, or a
      // tab opened before Inscribe was installed and not reloaded since).
      console.warn("Inscribe: could not open a sticky note on this page.", err);
    });
});

// Content scripts don't load ExtPay, so they ask here.
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (!message) return false;
  if (message.type === "openPaymentPage") {
    extpay.openPaymentPage();
    return false;
  }
  if (message.type !== "getUser") return false;
  extpay
    .getUser()
    .then((user) => sendResponse({ user }))
    .catch((err) => sendResponse({ error: String(err) }));
  return true; // keep the channel open for the async response
});
