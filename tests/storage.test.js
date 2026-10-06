import { describe, it, expect, beforeEach } from "vitest";
import { createRequire } from "node:module";

const require = createRequire(import.meta.url);
const { migratePopupStorage, MIGRATION_FLAG } = require("../shared/storage.js");

function fakeArea(initial = {}) {
  const data = { ...initial };
  return {
    data,
    async get(keys) {
      const list = Array.isArray(keys) ? keys : [keys];
      return Object.fromEntries(list.filter((k) => k in data).map((k) => [k, data[k]]));
    },
    async set(items) {
      Object.assign(data, items);
    },
  };
}

function fakeLocalStorage(initial = {}) {
  const data = { ...initial };
  return {
    data,
    getItem: (k) => (k in data ? data[k] : null),
    removeItem: (k) => delete data[k],
  };
}

describe("migratePopupStorage", () => {
  let area, legacy;
  const notes = [{ title: "a", text: "b", date: "October 6, 2026" }];

  beforeEach(() => {
    area = fakeArea();
    legacy = fakeLocalStorage({
      myNotes: JSON.stringify(notes),
      theme: "blueMode",
      liveNote: "draft",
      unrelated: "keep me",
    });
  });

  it("copies legacy keys, renames theme, and removes the old keys", async () => {
    await migratePopupStorage(area, legacy);
    expect(area.data).toEqual({
      [MIGRATION_FLAG]: true,
      myNotes: notes,
      popupTheme: "blueMode",
      liveNote: "draft",
    });
    expect(legacy.data).toEqual({ unrelated: "keep me" });
  });

  it("runs only once", async () => {
    await migratePopupStorage(area, legacy);
    area.data.myNotes = [];
    legacy.data.myNotes = JSON.stringify(notes);
    await migratePopupStorage(area, legacy);
    expect(area.data.myNotes).toEqual([]);
    expect(legacy.data.myNotes).toBeDefined();
  });

  it("leaves unparseable notes in localStorage instead of deleting them", async () => {
    legacy.data.myNotes = "{not json";
    await migratePopupStorage(area, legacy);
    expect(area.data.myNotes).toBeUndefined();
    expect(legacy.data.myNotes).toBe("{not json");
  });

  it("sets the flag even when there is nothing to migrate", async () => {
    await migratePopupStorage(area, fakeLocalStorage());
    expect(area.data).toEqual({ [MIGRATION_FLAG]: true });
  });
});
