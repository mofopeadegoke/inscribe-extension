import { describe, it, expect } from "vitest";
import { createRequire } from "node:module";
import { JSDOM } from "jsdom";

const require = createRequire(import.meta.url);
const { htmlToText, buildExport } = require("../shared/download.js");

const parse = (html) => new JSDOM(`<body>${html}</body>`).window.document.body;

describe("htmlToText", () => {
  it("keeps line breaks from <br> and block elements", () => {
    expect(htmlToText("one<div>two</div><div>three</div>", parse)).toBe("one\ntwo\nthree");
    expect(htmlToText("a<br>b", parse)).toBe("a\nb");
  });

  it("drops formatting tags but keeps their text", () => {
    expect(htmlToText("<b>bold</b> and <i>it's</i>", parse)).toBe("bold and it's");
  });

  it("renders list items as bullets", () => {
    expect(htmlToText("<ul><li>a</li><li>b</li></ul>", parse)).toBe("• a\n• b");
  });

  it("reads pre-v3 notes saved with <br> plus a newline", () => {
    expect(htmlToText("line one<br>\nline two", parse)).toBe("line one\nline two");
  });
});

describe("buildExport", () => {
  const note = { title: "My <Note>", html: "<b>hi</b><br>there" };

  it("exports .txt and .js as plain text", () => {
    expect(buildExport("txt", note, parse)).toEqual({
      content: "hi\nthere",
      mime: "text/plain",
      filename: "My <Note>.txt",
    });
    expect(buildExport("js", { ...note, filename: "script" }, parse).filename).toBe("script.js");
  });

  it("exports .html and .doc as an HTML document with an escaped title", () => {
    const html = buildExport("html", note, parse);
    expect(html.mime).toBe("text/html");
    expect(html.filename).toBe("My <Note>.html");
    expect(html.content).toContain("<title>My &#60;Note&#62;</title>");
    expect(html.content).toContain("<body>\n<b>hi</b><br>there\n</body>");
    expect(buildExport("doc", note, parse).mime).toBe("application/msword");
  });

  it("doesn't double an extension the user already typed", () => {
    expect(buildExport("txt", { ...note, filename: "notes.TXT" }, parse).filename).toBe("notes.TXT");
  });

  it("falls back to a default name and to .txt for unknown formats", () => {
    expect(buildExport("ppt", { html: "x" }, parse)).toEqual({
      content: "x",
      mime: "text/plain",
      filename: "inscribe_note.txt",
    });
  });
});
