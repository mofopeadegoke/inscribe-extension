// Extension Pay
importScripts("ExtPay.js", "shared/timePhrases.js");

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

// ---------- sticky-note alarms ----------
// Each clock time in a sticky note ("7pm") becomes a one-shot chrome.alarm
// named "sticky-alarm|<origin>|<label>". A time that already passed today is
// scheduled for tomorrow. Once fired it is remembered in stickyAlarmsFired and
// not scheduled again until the time is removed from the note.

const STICKY_PREFIX = "sticky:";
const ALARM_PREFIX = "sticky-alarm|";
const FIRED_KEY = "stickyAlarmsFired";

function alarmName(origin, label) {
  return `${ALARM_PREFIX}${origin}|${label}`;
}

function parseAlarmName(name) {
  const rest = name.slice(ALARM_PREFIX.length);
  const split = rest.lastIndexOf("|");
  return { origin: rest.slice(0, split), label: rest.slice(split + 1) };
}

async function scheduleStickyAlarms(origin, note) {
  const prefix = alarmName(origin, "");
  const wanted = new Map();
  if (note && note.visible) {
    InscribeTimes.extractTimes(note.text).forEach((time) => {
      wanted.set(alarmName(origin, time.label), time);
    });
  }

  const { [FIRED_KEY]: fired = [] } = await chrome.storage.local.get(FIRED_KEY);
  const stillFired = fired.filter((name) => !name.startsWith(prefix) || wanted.has(name));
  if (stillFired.length !== fired.length) {
    await chrome.storage.local.set({ [FIRED_KEY]: stillFired });
  }

  const existing = (await chrome.alarms.getAll()).filter((a) => a.name.startsWith(prefix));
  for (const alarm of existing) {
    if (!wanted.has(alarm.name)) await chrome.alarms.clear(alarm.name);
  }
  for (const [name, time] of wanted) {
    if (stillFired.includes(name) || existing.some((a) => a.name === name)) continue;
    chrome.alarms.create(name, { when: InscribeTimes.nextOccurrence(time).getTime() });
  }
}

chrome.storage.onChanged.addListener((changes, area) => {
  if (area !== "local") return;
  Object.keys(changes)
    .filter((key) => key.startsWith(STICKY_PREFIX))
    .forEach((key) => {
      scheduleStickyAlarms(key.slice(STICKY_PREFIX.length), changes[key].newValue);
    });
});

// Catch up on notes that existed before this version (or before an update).
chrome.runtime.onInstalled.addListener(async () => {
  const all = await chrome.storage.local.get(null);
  Object.keys(all)
    .filter((key) => key.startsWith(STICKY_PREFIX))
    .forEach((key) => scheduleStickyAlarms(key.slice(STICKY_PREFIX.length), all[key]));
});

chrome.alarms.onAlarm.addListener(async (alarm) => {
  if (!alarm.name.startsWith(ALARM_PREFIX)) return;
  const { origin, label } = parseAlarmName(alarm.name);
  const noteKey = `${STICKY_PREFIX}${origin}`;
  const { [noteKey]: note, [FIRED_KEY]: fired = [] } = await chrome.storage.local.get([
    noteKey,
    FIRED_KEY,
  ]);
  if (!note) return;
  const lines = (note.text || "").split("\n");
  const line = lines.find((l) => InscribeTimes.extractTimes(l).some((t) => t.label === label));
  if (!line) return; // the time was edited out of the note

  await chrome.storage.local.set({ [FIRED_KEY]: [...fired, alarm.name] });
  const snippet = line.trim();
  chrome.notifications.create(alarm.name, {
    type: "basic",
    iconUrl: "images/insribeNew128.png",
    title: `Inscribe reminder · ${label}`,
    message: snippet.length > 120 ? `${snippet.slice(0, 117)}...` : snippet,
    contextMessage: new URL(origin).host,
  });
});

chrome.notifications.onClicked.addListener(async (notificationId) => {
  if (!notificationId.startsWith(ALARM_PREFIX)) return;
  const { origin } = parseAlarmName(notificationId);
  chrome.notifications.clear(notificationId);
  const tabs = await chrome.tabs.query({ url: `${origin}/*` }).catch(() => []);
  if (tabs.length > 0) {
    await chrome.tabs.update(tabs[0].id, { active: true });
    await chrome.windows.update(tabs[0].windowId, { focused: true });
  } else {
    await chrome.tabs.create({ url: origin });
  }
});
