import { describe, it, expect } from "vitest";
import { createRequire } from "node:module";
import { JSDOM } from "jsdom";

const require = createRequire(import.meta.url);
const {
  POPUP_THEMES,
  STICKY_THEMES,
  DEFAULT_STICKY_THEME,
  applyPopupTheme,
} = require("../shared/themes.js");

describe("theme maps", () => {
  it("defines accent colours for every popup theme", () => {
    for (const theme of Object.values(POPUP_THEMES)) {
      expect(theme.accent).toBeTruthy();
      expect(theme.onAccent).toBeTruthy();
    }
  });

  it("gives blue mode a blue accent (was yellow on the home page)", () => {
    expect(POPUP_THEMES.blueMode.accent).toBe("#3486eb");
  });

  it("defines body, bar and swatch colours for every sticky theme", () => {
    expect(STICKY_THEMES[DEFAULT_STICKY_THEME]).toBeDefined();
    for (const theme of Object.values(STICKY_THEMES)) {
      expect(theme.swatch).toBeTruthy();
      expect(theme.body).toHaveLength(2);
      expect(theme.bar).toHaveLength(2);
    }
  });
});

describe("applyPopupTheme", () => {
  const root = () => new JSDOM("").window.document.documentElement;

  it("sets the data-theme attribute and CSS variables", () => {
    const el = root();
    expect(applyPopupTheme("purpleMode", el)).toBe("purpleMode");
    expect(el.dataset.theme).toBe("purpleMode");
    expect(el.style.getPropertyValue("--accent")).toBe("purple");
    expect(el.style.getPropertyValue("--on-accent")).toBe("white");
  });

  it("falls back to yellow for unknown or missing themes", () => {
    const el = root();
    expect(applyPopupTheme(undefined, el)).toBe("yellowMode");
    expect(el.style.getPropertyValue("--accent")).toBe("rgb(245, 204, 0)");
  });
});
