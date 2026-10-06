# Inscribe Extension

Inscribe is a Chrome extension for quick note-taking with a rich text editor, a drawing canvas, sticky notes on webpages, reminders, and speech-to-text support.

## Table of Contents
- [Overview](#overview)
- [Features](#features)
- [How It Works](#how-it-works)
- [Project Structure](#project-structure)
- [Installation](#installation)
- [Development](#development)
- [Configuration](#configuration)
- [Usage Guide](#usage-guide)
- [Permissions](#permissions)
- [Data Storage](#data-storage)
- [Localization](#localization)
- [Known Limitations](#known-limitations)
- [Troubleshooting](#troubleshooting)
- [Contributing](#contributing)

## Overview
Inscribe provides an in-browser workspace for writing and organizing notes:
- **Home tab (`index.html`)** for rich text writing and drawing.
- **Notes tab (`note.html`)** for listing, editing, copying, deleting, and exporting notes.
- **Accounts tab (`settings.html`)** for theme selection and subscription status.
- **Floating sticky note** added to any website from the right-click menu, with reminders for times written in it.
- **Speech-to-text page (`speech.html`)** used as a dedicated page for speech recognition.

The extension includes free and premium behaviors. Premium means a paid subscription or an active 7-day trial, checked through ExtensionPay.

## Features

### Writing and Formatting
- Content-editable writing area with formatting (bold, italic, underline, strikethrough, sub/superscript, lists, links, alignment, indentation, undo/redo).
- The draft is autosaved, formatting included.
- **Save as Note** keeps the formatting (stored as sanitized HTML).
- Save the text as a file (premium): `.txt` and `.js` as plain text with line breaks kept; `.html` and `.doc` as an HTML document that keeps formatting (Word opens HTML saved as `.doc`).

### Drawing Canvas
- Brush and eraser tools; everyone starts with the brush.
- Shape tools (rectangle, circle, triangle, line), color presets, custom color picker, and fill toggle (premium drawing options).
- Mouse, touch and pen input through Pointer Events.
- Undo/redo of up to 30 steps, including shapes, colors, eraser strokes, and clearing the canvas.
- Save as PNG (premium).

### Notes Management
- Notes render with their formatting and date.
- Edit a note in a rich-text editor (bold, italic, underline, lists, links).
- Copy a note to the clipboard as plain text with line breaks.
- Delete notes.
- Save a note locally in any of the export formats (premium).

### Sticky Notes on Any Site
- Context menu action: **"Add an Inscribe Sticky Note here"**.
- One note per website, kept across page reloads.
- Draggable, editable, with 7 color themes (shared by all sticky notes).
- Rendered inside a Shadow DOM, so the website's CSS and scripts can't affect it.
- Save the note as a `.txt` file: unlimited for premium users, 10 saves per month on the free plan.

### Reminders
- Clock times written in a sticky note (`7pm`, `10:30 pm`, `9 a.m.`) are highlighted and become reminders.
- Each reminder fires once as a system notification, even when the site's tab is closed. A time that has already passed today fires tomorrow.
- Clicking the notification focuses (or opens) the site. Removing the time or deleting the note cancels the reminder.

### Speech to Text
- Dedicated speech page for dictation; new speech is appended to existing text.
- Copy the text to the clipboard.
- Clear messages when offline or when the browser doesn't support speech recognition.

### Themes
- Seven popup themes, chosen on the Accounts tab and applied through CSS variables on every popup page.

## How It Works
1. **Background service worker** (`background.js`) starts ExtensionPay, registers the context menu on install, answers payment-status requests from the content script, and turns sticky-note times into `chrome.alarms` + notifications.
2. **Content script** (`contentOwn.js`) builds the sticky note on demand when the context menu is used or the site already has a note.
3. **Popup pages** handle writing/drawing, notes management, and settings.
4. **`chrome.storage.local`** persists notes, drafts, themes, and sticky notes for both the popup and the content script.
5. **Speech page** runs browser speech recognition in its own tab.

## Project Structure
```text
.
├── manifest.json            # Extension manifest (MV3)
├── background.js            # Service worker: payments, context menu, reminders
├── contentOwn.js            # Sticky note injected into web pages
├── index.html / index.js    # Home: editor + canvas
├── note.html / note.js      # Saved notes management
├── settings.html / settings.js # Theme + subscription view
├── speech.html / speech.js  # Speech-to-text page
├── insert.js                # PDF viewer (work in progress, not loaded yet)
├── shared/                  # Code shared between pages
│   ├── storage.js           #   chrome.storage wrapper + v2 data migration
│   ├── themes.js            #   popup and sticky-note palettes
│   ├── premium.js           #   isPremium + free sticky-note allowance
│   ├── sanitize.js          #   note HTML sanitizer (DOMPurify config)
│   ├── formatting.js        #   rich-text toolbar commands
│   ├── download.js          #   file export formats
│   ├── notes.js             #   note date formatting
│   └── timePhrases.js       #   finds clock times in text
├── vendor/purify.min.js     # DOMPurify (vendored)
├── ExtPay.js                # ExtensionPay SDK
├── tests/                   # Vitest unit tests for shared/ (dev only)
├── css/                     # Page styles
├── images/                  # Icons and UI assets
└── _locales/                # i18n message files
```

## Installation

### Load as an unpacked extension
1. Clone or download this repository.
2. Open Chrome and navigate to `chrome://extensions`.
3. Enable **Developer mode**.
4. Click **Load unpacked**.
5. Select the repository directory.

There is no build step: the repository directory is the extension.

## Development
Unit tests cover the logic in `shared/`:

```bash
npm install
npm test
```

`npm run vendor` refreshes `vendor/purify.min.js` from the installed DOMPurify package.

When packaging for the Chrome Web Store, leave out the development files: `node_modules/`, `tests/`, `package.json`, `package-lock.json`, and `vitest.config.mjs`.

## Configuration

### ExtensionPay ID
Every page and the service worker use `ExtPay("inscribe")`. If you register the extension under a different ExtensionPay ID, change it in `background.js`, `index.js`, `note.js`, and `settings.js`.

## Usage Guide

### Home (`index.html`)
- Write formatted notes in the text area; the draft autosaves.
- Draw on the canvas using tools/colors.
- Save content as a downloadable file.
- Use **Save as Note** to persist notes for the Notes page.

### Notes (`note.html`)
- Browse saved notes.
- Open the note menu: edit, copy, delete, or save locally.

### Accounts (`settings.html`)
- Change theme.
- View current subscription state (premium, trial, or free).
- Open subscription details.

### Sticky Notes (on webpages)
- Right-click on any page.
- Choose **Add an Inscribe Sticky Note here**.
- Hover the `...` icon for themes, delete, and save options.
- Write a time like `3:30pm` to get a reminder.

### Speech to Text (`speech.html`)
- Start speech recognition.
- Copy generated text.
- Paste or save output as needed in Inscribe.

## Permissions
From `manifest.json`, the extension requests:
- `storage`: notes, drafts, themes and sticky notes (`chrome.storage.local`).
- `activeTab`: current-tab interactions.
- `contextMenus`: the "Add an Inscribe Sticky Note here" menu item.
- `alarms`: scheduling sticky-note reminders.
- `notifications`: showing reminders.

It also injects scripts on:
- `https://extensionpay.com/*` (ExtensionPay integration),
- `<all_urls>` (the sticky note; it stays idle unless the site has a note).

## Data Storage
Everything is stored in `chrome.storage.local`:

| Key | Contents |
|---|---|
| `myNotes` | Saved notes: `{ title, text (sanitized HTML), date }[]` |
| `liveNote` | The home editor's autosaved draft (sanitized HTML) |
| `popupTheme` | Selected popup theme |
| `sticky:<origin>` | That site's sticky note: `{ text, visible }` |
| `stickyTheme` | Sticky-note theme |
| `stickyAlarmsFired` | Reminders that already fired (so they aren't re-armed) |
| `freeStickySaves:YYYY-MM` | Free-plan sticky-note saves used this month |
| `migratedV1` | Set once the v2 data migration has run |

### Upgrading from v2
Version 2 kept popup data in the extension's `localStorage` and each sticky note in the visited website's own `localStorage`. On first run, version 3 moves popup data into `chrome.storage.local`. Each website's sticky note is moved the next time that site is visited; only values that look like Inscribe data are moved, and the site's own `theme` key is never removed.

## Localization
The extension name and description in `manifest.json` are localized through `_locales` (`ar`, `en`, `es`, `fr`, `hi`, `ja`, `pt_PT`, `ru`, `zh_CN`). The product name stays "Inscribe" in every language. The rest of the UI is English only for now.

## Known Limitations
- Speech recognition depends on browser support and internet connectivity.
- Rich-text editing uses `document.execCommand`, which is deprecated but still supported by browsers.
- The free sticky-note save limit is enforced on the client, so it is best-effort.
- Sticky notes can't be added to pages where extensions can't run (such as `chrome://` pages and the Chrome Web Store), or to tabs opened before Inscribe was installed until they are reloaded.
- The PDF viewer (`insert.js`) is not finished and isn't loaded yet.

## Troubleshooting
- **Extension does not load:** validate `manifest.json` and reload from `chrome://extensions`.
- **Payment/subscription issues:** verify the ExtensionPay ID and your connection; premium buttons show a connection error when status can't be fetched.
- **Speech not working:** check internet connectivity and browser speech-recognition support.
- **Sticky note not appearing:** reload the target tab and retry via context menu.
- **No reminder notification:** check that Chrome notifications are allowed in your operating system settings.

## Contributing
1. Fork the repository.
2. Create a feature branch.
3. Run `npm test`, then test changes by reloading the unpacked extension.
4. Open a pull request with a clear summary and screenshots for UI changes.
