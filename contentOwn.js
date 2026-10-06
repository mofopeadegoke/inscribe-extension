// Inscribe sticky note.
// One note per site, stored in chrome.storage.local under "sticky:<origin>" as
// { text, visible }. The theme is shared by all sticky notes ("stickyTheme").
// The UI lives in a closed shadow root so the page's CSS and scripts can't
// reach it, and it is only built when there is a note to show.
(() => {
  const NOTE_KEY = `sticky:${location.origin}`;
  const THEME_KEY = "stickyTheme";
  const SAVE_DELAY_MS = 400;

  const STICKY_THEMES = {
    christmasMode: { swatch: "#c54245", body: ["#c54245", "#ECECEE"], bar: ["#B12E31", "#ECECEE"] },
    winterMode: { swatch: "#89ABE3FF", body: ["#89ABE3FF", "#FCF6F5FF"], bar: ["#6C8DB7FF", "#FCF6F5FF"] },
    yellowMode: { swatch: "#F2AA4CFF", body: ["#F2AA4CFF", "#101820FF"], bar: ["#D1883AFF", "#101820FF"] },
    islandWhiteMode: { swatch: "#2BAE66FF", body: ["#2BAE66FF", "#FCF6F5FF"], bar: ["#1D8E4DFF", "#FCF6F5FF"] },
    mintMode: { swatch: "#ADEFD1FF", body: ["#222", "#ADEFD1FF"], bar: ["#111", "#ADEFD1FF"] },
    blackMode: { swatch: "#101820FF", body: ["#101820FF", "#ddd"], bar: ["#080C14FF", "#ddd"] },
    whiteMode: { swatch: "#dddccc", body: ["#f5f5f5", "black"], bar: ["#ccc", "black"] },
  };
  const DEFAULT_THEME = "whiteMode";

  const ACCOUNT_ICON = `<svg xmlns="http://www.w3.org/2000/svg" height="16" width="14" viewBox="0 0 448 512"><!--!Font Awesome Free 6.5.1 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license/free Copyright 2023 Fonticons, Inc.--><path fill="currentColor" d="M304 128a80 80 0 1 0 -160 0 80 80 0 1 0 160 0zM96 128a128 128 0 1 1 256 0A128 128 0 1 1 96 128zM49.3 464H398.7c-8.9-63.3-63.3-112-129-112H178.3c-65.7 0-120.1 48.7-129 112zM0 482.3C0 383.8 79.8 304 178.3 304h91.4C368.2 304 448 383.8 448 482.3c0 16.4-13.3 29.7-29.7 29.7H29.7C13.3 512 0 498.7 0 482.3z"/></svg>`;
  const MIC_ICON = `<svg xmlns="http://www.w3.org/2000/svg" height="17.6" width="13.2" viewBox="0 0 384 512"><!--!Font Awesome Free 6.5.1 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license/free Copyright 2023 Fonticons, Inc.--><path fill="#333333" d="M192 0C139 0 96 43 96 96V256c0 53 43 96 96 96s96-43 96-96V96c0-53-43-96-96-96zM64 216c0-13.3-10.7-24-24-24s-24 10.7-24 24v40c0 89.1 66.2 162.7 152 174.4V464H120c-13.3 0-24 10.7-24 24s10.7 24 24 24h72 72c13.3 0 24-10.7 24-24s-10.7-24-24-24H216V430.4c85.8-11.7 152-85.3 152-174.4V216c0-13.3-10.7-24-24-24s-24 10.7-24 24v40c0 70.7-57.3 128-128 128s-128-57.3-128-128V216z"/></svg>`;

  const STYLES = `
    :host { all: initial; }
    .note {
      position: absolute; top: 10px; right: 10px; z-index: 2147483647;
      display: flex; flex-direction: column; width: fit-content;
      color: black; font: 14px sans-serif;
      box-shadow: 0.4px 0.4px 10px 0.01px black;
      transform: scale(0); transform-origin: top left;
      transition: transform 1s ease-out;
    }
    .note.open { transform: scale(1); }
    .bar {
      display: flex; justify-content: space-between; align-items: center;
      min-width: 180px; height: 25px; padding-inline: 5px; cursor: move;
    }
    .more {
      display: inline-block; margin-top: -10px; font-size: 20px; font-weight: bolder;
      letter-spacing: 1.2px; cursor: pointer; user-select: none;
    }
    .date { margin: 0; font-size: 10px; }
    .account { cursor: pointer; display: inline-flex; }
    .bodyWrap { position: relative; }
    .body {
      width: 180px; min-width: 180px; height: 176px; min-height: 100px;
      padding: 5px; overflow: auto; outline: none; resize: both;
      box-sizing: content-box; white-space: pre-wrap;
    }
    .time { background-color: yellow; color: black; }
    .mic {
      display: none; /* hidden until the in-note dictation feature ships */
      position: absolute; bottom: 10px; right: 10px; width: 40px; aspect-ratio: 1;
      border: none; border-radius: 50%; background: #ccc; cursor: pointer;
      box-shadow: 0 2px 5px rgba(0, 0, 0, 0.2);
    }
    .menu {
      position: absolute; top: 0; left: 0; width: 100%; min-width: 180px;
      background: white; transform: scaleY(0); transform-origin: top;
      transition: all 0.1s ease-in;
    }
    .menu.open { transform: scaleY(1); }
    .themes { display: flex; height: 35px; background: black; }
    .themes button { flex: 1; border: none; cursor: pointer; }
    .menu > button {
      display: block; width: 100%; padding: 5px 10px; border: none;
      background: white; color: black; text-align: left; cursor: pointer; font: inherit;
    }
    .menu > .save { border-top: 1px solid #aaa; border-bottom: 1px solid #aaa; }
  `;

  // ---------- storage ----------

  async function loadNote() {
    const { [NOTE_KEY]: note } = await chrome.storage.local.get(NOTE_KEY);
    return note || null;
  }

  async function saveNote(patch) {
    const current = (await loadNote()) || { text: "", visible: false };
    await chrome.storage.local.set({ [NOTE_KEY]: { ...current, ...patch } });
  }

  async function loadTheme() {
    const { [THEME_KEY]: theme } = await chrome.storage.local.get(THEME_KEY);
    return STICKY_THEMES[theme] ? theme : DEFAULT_THEME;
  }

  // Before v3 the note lived in the website's own localStorage. Move it into
  // chrome.storage, but only when the values look like Inscribe's. The site's
  // "theme" key is only read, never removed: it may belong to the website.
  async function migrateFromPageStorage() {
    let page;
    try {
      page = window.localStorage;
    } catch (err) {
      return; // storage blocked (sandboxed frame, privacy settings)
    }
    const rawText = page.getItem("liveNote");
    const rawVisible = page.getItem("isStickyNote");
    const rawTheme = page.getItem("theme");

    let lines = null;
    try {
      const parsed = JSON.parse(rawText);
      if (Array.isArray(parsed) && parsed.every((l) => typeof l === "string")) lines = parsed;
    } catch (err) {
      // not ours
    }
    const visibleIsOurs = rawVisible === "true" || rawVisible === "false";
    if (lines === null && !visibleIsOurs) return;

    if (!(await loadNote())) {
      await saveNote({ text: (lines || []).join("\n"), visible: rawVisible === "true" });
    }
    if (STICKY_THEMES[rawTheme]) {
      const { [THEME_KEY]: existing } = await chrome.storage.local.get(THEME_KEY);
      if (!existing) await chrome.storage.local.set({ [THEME_KEY]: rawTheme });
    }
    // Deleting a note used to leave liveNote as "".
    if (lines !== null || rawText === "") page.removeItem("liveNote");
    if (visibleIsOurs) page.removeItem("isStickyNote");
    Object.keys(page)
      .filter((key) => /^userActions_\d+$/.test(key))
      .forEach((key) => page.removeItem(key));
  }

  // ---------- payment ----------

  // Payment status lives in the background worker; content scripts ask it.
  function getUser() {
    return chrome.runtime.sendMessage({ type: "getUser" }).then((res) => {
      if (!res || res.error) throw new Error(res ? res.error : "No response");
      return res.user;
    });
  }

  function openPaymentPage() {
    chrome.runtime.sendMessage({ type: "openPaymentPage" });
  }

  // ---------- UI ----------

  let ui = null;

  function buildUI() {
    const host = document.createElement("div");
    const shadow = host.attachShadow({ mode: "closed" });
    const now = new Date();
    shadow.innerHTML = `
      <style>${STYLES}</style>
      <div class="note">
        <div class="bar">
          <span class="more" title="Options">...</span>
          <p class="date">${now.getDate()} - ${now.getMonth() + 1} - ${now.getFullYear()}</p>
          <span class="account">${ACCOUNT_ICON}</span>
        </div>
        <div class="bodyWrap">
          <div class="body" contenteditable="true"></div>
          <button class="mic" title="Dictate">${MIC_ICON}</button>
        </div>
        <article class="menu">
          <div class="themes"></div>
          <button class="delete">Delete</button>
          <button class="save">Save note locally</button>
        </article>
      </div>`;

    const $ = (sel) => shadow.querySelector(sel);
    const refs = {
      host,
      note: $(".note"),
      bar: $(".bar"),
      body: $(".body"),
      menu: $(".menu"),
      mic: $(".mic"),
    };

    Object.entries(STICKY_THEMES).forEach(([name, theme]) => {
      const swatch = document.createElement("button");
      swatch.title = name;
      swatch.style.background = theme.swatch;
      swatch.addEventListener("click", () => {
        applyTheme(refs, name);
        chrome.storage.local.set({ [THEME_KEY]: name });
      });
      $(".themes").append(swatch);
    });

    $(".more").addEventListener("mouseover", () => refs.menu.classList.add("open"));
    refs.menu.addEventListener("mouseleave", () => refs.menu.classList.remove("open"));
    $(".delete").addEventListener("click", deleteNote);
    $(".save").addEventListener("click", saveNoteLocally);
    refs.mic.addEventListener("click", dictate);
    enableDragging(refs);

    let saveTimer = null;
    refs.body.addEventListener("input", () => {
      clearTimeout(saveTimer);
      saveTimer = setTimeout(() => saveNote({ text: refs.body.innerText }), SAVE_DELAY_MS);
    });

    document.body.append(host);
    return refs;
  }

  function applyTheme(refs, name) {
    const theme = STICKY_THEMES[name] || STICKY_THEMES[DEFAULT_THEME];
    [refs.body.style.backgroundColor, refs.body.style.color] = theme.body;
    [refs.bar.style.backgroundColor, refs.bar.style.color] = theme.bar;
  }

  function enableDragging(refs) {
    let offsetX = 0;
    let offsetY = 0;
    let dragging = false;
    refs.bar.addEventListener("mousedown", (e) => {
      e.preventDefault();
      const rect = refs.note.getBoundingClientRect();
      offsetX = e.clientX - rect.left;
      offsetY = e.clientY - rect.top;
      dragging = true;
    });
    document.addEventListener("mousemove", (e) => {
      if (!dragging) return;
      e.preventDefault();
      refs.note.style.right = "auto";
      refs.note.style.left = `${e.clientX - offsetX + window.scrollX}px`;
      refs.note.style.top = `${e.clientY - offsetY + window.scrollY}px`;
    });
    document.addEventListener("mouseup", () => {
      dragging = false;
    });
  }

  // Shows the text with clock times highlighted, built as DOM nodes (no HTML strings).
  function renderText(body, text) {
    const fragment = document.createDocumentFragment();
    text.split("\n").forEach((line, i) => {
      if (i > 0) fragment.append(document.createElement("br"));
      InscribeTimes.splitByTimes(line).forEach(({ text: run, isTime }) => {
        if (!isTime) return fragment.append(run);
        const mark = document.createElement("span");
        mark.className = "time";
        mark.textContent = run;
        fragment.append(mark);
      });
    });
    body.replaceChildren(fragment);
  }

  async function showNote(note) {
    if (!document.body) return; // e.g. raw XML or SVG documents
    if (!ui) ui = buildUI();
    if (!ui.host.isConnected) document.body.append(ui.host);
    renderText(ui.body, note.text || "");
    applyTheme(ui, await loadTheme());
    requestAnimationFrame(() => ui.note.classList.add("open"));
  }

  async function deleteNote() {
    if (!confirm("Are you sure you want to delete note?")) return;
    await chrome.storage.local.remove(NOTE_KEY);
    ui.note.classList.remove("open");
    ui.menu.classList.remove("open");
    ui.host.remove();
  }

  function download(text) {
    const url = URL.createObjectURL(new Blob([text], { type: "text/plain" }));
    const link = document.createElement("a");
    link.download = "inscribe_note.txt";
    link.href = url;
    link.click();
    setTimeout(() => URL.revokeObjectURL(url), 0);
  }

  async function saveNoteLocally() {
    let premium = false;
    try {
      premium = InscribePremium.isPremium(await getUser());
    } catch (err) {
      // Offline or ExtPay unreachable: fall back to the free allowance.
    }
    if (premium) return download(ui.body.innerText);

    const key = InscribePremium.freeSavesKey();
    const { [key]: used = 0 } = await chrome.storage.local.get(key);
    if (!InscribePremium.hasFreeSavesLeft(used)) return openPaymentPage();
    download(ui.body.innerText);
    await chrome.storage.local.set({ [key]: used + 1 });
  }

  let recognising = false;
  function dictate() {
    const Recognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!Recognition || recognising) return;
    const recognition = new Recognition();
    recognition.interimResults = false;
    recognition.addEventListener("result", (e) => {
      const transcript = Array.from(e.results)
        .map((result) => result[0].transcript)
        .join("");
      ui.body.append(`${transcript} `);
      saveNote({ text: ui.body.innerText });
    });
    recognition.addEventListener("end", () => {
      recognising = false;
    });
    recognising = true;
    recognition.start();
  }

  // ---------- startup ----------

  chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action !== "runContentScript") return false;
    loadNote()
      .then((note) => {
        const next = { text: note ? note.text : "", visible: true };
        return saveNote(next).then(() => showNote(next));
      })
      .then(() => sendResponse({ msg: "Done" }));
    return true;
  });

  migrateFromPageStorage()
    .catch((err) => console.warn("Inscribe: sticky-note migration failed.", err))
    .then(loadNote)
    .then((note) => {
      if (note && note.visible) showNote(note);
    });
})();
