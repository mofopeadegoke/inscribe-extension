import { describe, it, expect } from "vitest";
import { createRequire } from "node:module";
import { JSDOM } from "jsdom";
import createDOMPurify from "dompurify";

const require = createRequire(import.meta.url);
const { createSanitizer } = require("../shared/sanitize.js");
const sanitize = createSanitizer(createDOMPurify(new JSDOM("").window));

describe("sanitizeNoteHtml", () => {
  it("keeps the formatting the toolbar produces", () => {
    const html =
      '<b>bold</b><i>it</i><u>u</u><strike>s</strike><sup>1</sup><sub>2</sub>' +
      '<ol><li>one</li></ol><ul><li>two</li></ul>' +
      '<div style="text-align: center;">centred</div><br><font size="5">big</font>';
    expect(sanitize(html)).toBe(html);
  });

  it("strips scripts, event handlers and javascript: links", () => {
    expect(sanitize('<img src=x onerror="alert(1)">hi')).toBe("hi");
    expect(sanitize("<script>alert(1)</script>ok")).toBe("ok");
    expect(sanitize('<a href="javascript:alert(1)">x</a>')).toBe(
      '<a target="_blank" rel="noopener noreferrer">x</a>'
    );
    expect(sanitize('<b onclick="x()">b</b>')).toBe("<b>b</b>");
  });

  it("forces links to open safely in a new tab", () => {
    expect(sanitize('<a href="https://example.com">e</a>')).toBe(
      '<a href="https://example.com" target="_blank" rel="noopener noreferrer">e</a>'
    );
  });

  it("keeps pre-v3 plain-text notes readable", () => {
    expect(sanitize("line one<br>\nit's line two")).toBe("line one<br>\nit's line two");
  });

  it("handles empty input", () => {
    expect(sanitize(undefined)).toBe("");
  });
});
