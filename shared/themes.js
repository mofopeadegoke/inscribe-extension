// Theme palettes. Popup pages store their choice under "popupTheme" and are
// styled through CSS variables (--accent, --on-accent) set on <html>; the
// sticky note stores its own choice under "stickyTheme".
(function (root) {
  const POPUP_THEMES = {
    yellowMode: { accent: "rgb(245, 204, 0)", onAccent: "black" },
    blueMode: { accent: "#3486eb", onAccent: "white" },
    purpleMode: { accent: "purple", onAccent: "white" },
    greenMode: { accent: "green", onAccent: "white" },
    redMode: { accent: "darkred", onAccent: "white" },
    pinkMode: { accent: "pink", onAccent: "black" },
    darkMode: { accent: "#333", onAccent: "white" },
  };
  const DEFAULT_POPUP_THEME = "yellowMode";

  // body/bar are [background, text] pairs; swatch is the picker colour.
  const STICKY_THEMES = {
    christmasMode: { swatch: "#c54245", body: ["#c54245", "#ECECEE"], bar: ["#B12E31", "#ECECEE"] },
    winterMode: { swatch: "#89ABE3FF", body: ["#89ABE3FF", "#FCF6F5FF"], bar: ["#6C8DB7FF", "#FCF6F5FF"] },
    yellowMode: { swatch: "#F2AA4CFF", body: ["#F2AA4CFF", "#101820FF"], bar: ["#D1883AFF", "#101820FF"] },
    islandWhiteMode: { swatch: "#2BAE66FF", body: ["#2BAE66FF", "#FCF6F5FF"], bar: ["#1D8E4DFF", "#FCF6F5FF"] },
    mintMode: { swatch: "#ADEFD1FF", body: ["#222", "#ADEFD1FF"], bar: ["#111", "#ADEFD1FF"] },
    blackMode: { swatch: "#101820FF", body: ["#101820FF", "#ddd"], bar: ["#080C14FF", "#ddd"] },
    whiteMode: { swatch: "#dddccc", body: ["#f5f5f5", "black"], bar: ["#ccc", "black"] },
  };
  const DEFAULT_STICKY_THEME = "whiteMode";

  function popupThemeName(name) {
    return POPUP_THEMES[name] ? name : DEFAULT_POPUP_THEME;
  }

  function applyPopupTheme(name, rootEl = document.documentElement) {
    const themeName = popupThemeName(name);
    const theme = POPUP_THEMES[themeName];
    rootEl.dataset.theme = themeName;
    rootEl.style.setProperty("--accent", theme.accent);
    rootEl.style.setProperty("--on-accent", theme.onAccent);
    return themeName;
  }

  const api = {
    POPUP_THEMES,
    DEFAULT_POPUP_THEME,
    STICKY_THEMES,
    DEFAULT_STICKY_THEME,
    popupThemeName,
    applyPopupTheme,
  };
  if (typeof module === "object" && module.exports) {
    module.exports = api;
  } else {
    root.InscribeThemes = api;
  }
})(globalThis);
