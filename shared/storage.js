// Promise wrapper over chrome.storage.local, plus the one-time migration of
// the popup pages' old window.localStorage keys into chrome.storage.
(function (root) {
  const MIGRATION_FLAG = "migratedV1";

  // old localStorage key -> new chrome.storage.local key
  const POPUP_KEYS = {
    myNotes: "myNotes",
    theme: "popupTheme",
    liveNote: "liveNote",
  };

  function get(keys) {
    return chrome.storage.local.get(keys);
  }

  function set(items) {
    return chrome.storage.local.set(items);
  }

  function remove(keys) {
    return chrome.storage.local.remove(keys);
  }

  function parseLegacy(oldKey, raw) {
    if (oldKey !== "myNotes") return raw;
    try {
      const notes = JSON.parse(raw);
      return Array.isArray(notes) ? notes : undefined;
    } catch (err) {
      return undefined;
    }
  }

  // area: async {get, set} (chrome.storage.local); legacy: a Storage (localStorage).
  // Runs once. A legacy value that can't be parsed is left in place, not deleted.
  async function migratePopupStorage(area, legacy) {
    const { [MIGRATION_FLAG]: done } = await area.get(MIGRATION_FLAG);
    if (done) return;

    const items = { [MIGRATION_FLAG]: true };
    const migratedKeys = [];
    for (const [oldKey, newKey] of Object.entries(POPUP_KEYS)) {
      const raw = legacy.getItem(oldKey);
      if (raw === null) continue;
      const value = parseLegacy(oldKey, raw);
      if (value === undefined) continue;
      items[newKey] = value;
      migratedKeys.push(oldKey);
    }

    await area.set(items);
    migratedKeys.forEach((key) => legacy.removeItem(key));
  }

  let readyPromise = null;

  // Every popup page awaits this before reading storage.
  function ready() {
    if (!readyPromise) {
      readyPromise = migratePopupStorage(chrome.storage.local, root.localStorage);
    }
    return readyPromise;
  }

  const api = { get, set, remove, ready, migratePopupStorage, MIGRATION_FLAG };
  if (typeof module === "object" && module.exports) {
    module.exports = api;
  } else {
    root.InscribeStorage = api;
  }
})(globalThis);
