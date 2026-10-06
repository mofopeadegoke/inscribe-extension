// Turns a note into a downloadable file. Plain-text formats get the note's
// text with line breaks kept; HTML-based formats keep the formatting (Word
// opens an HTML document saved as .doc).
(function (root) {
  const EXPORT_FORMATS = {
    txt: { mime: "text/plain", ext: ".txt", kind: "text" },
    js: { mime: "text/javascript", ext: ".js", kind: "text" },
    doc: { mime: "application/msword", ext: ".doc", kind: "html" },
    html: { mime: "text/html", ext: ".html", kind: "html" },
  };

  const BLOCK_TAGS = new Set(["DIV", "P", "LI", "OL", "UL", "BLOCKQUOTE"]);

  function defaultParse(html) {
    return new DOMParser().parseFromString(html, "text/html").body;
  }

  // innerText isn't available on detached documents, so walk the tree.
  function htmlToText(html, parse = defaultParse) {
    let out = "";
    const newline = () => {
      if (out && !out.endsWith("\n")) out += "\n";
    };
    const walk = (node) => {
      if (node.nodeType === 3) {
        out += node.nodeValue.replace(/\n/g, "");
        return;
      }
      if (node.nodeType !== 1) return;
      if (node.tagName === "BR") {
        out += "\n";
        return;
      }
      const isBlock = BLOCK_TAGS.has(node.tagName);
      if (isBlock) newline();
      if (node.tagName === "LI") out += "• ";
      node.childNodes.forEach(walk);
      if (isBlock) newline();
    };
    parse(html || "").childNodes.forEach(walk);
    return out.replace(/\n{3,}/g, "\n\n").replace(/\n+$/, "");
  }

  function escapeHtml(text) {
    return String(text).replace(/[&<>"']/g, (c) => `&#${c.charCodeAt(0)};`);
  }

  function withExtension(name, ext) {
    const base = (name || "").trim() || "inscribe_note";
    return base.toLowerCase().endsWith(ext) ? base : base + ext;
  }

  // html must already be sanitized. Returns {content, mime, filename}.
  function buildExport(formatKey, { title, html, filename }, parse) {
    const format = EXPORT_FORMATS[formatKey] || EXPORT_FORMATS.txt;
    const content =
      format.kind === "html"
        ? `<!doctype html>\n<html>\n<head>\n<meta charset="utf-8">\n<title>${escapeHtml(
            title || ""
          )}</title>\n</head>\n<body>\n${html || ""}\n</body>\n</html>\n`
        : htmlToText(html, parse);
    return { content, mime: format.mime, filename: withExtension(filename || title, format.ext) };
  }

  function downloadFile({ content, mime, filename }) {
    const url = URL.createObjectURL(new Blob([content], { type: mime }));
    const link = document.createElement("a");
    link.download = filename;
    link.href = url;
    link.click();
    setTimeout(() => URL.revokeObjectURL(url), 0);
  }

  function exportNote(formatKey, note) {
    downloadFile(buildExport(formatKey, note));
  }

  const api = { EXPORT_FORMATS, htmlToText, buildExport, downloadFile, exportNote };
  if (typeof module === "object" && module.exports) {
    module.exports = api;
  } else {
    root.InscribeDownload = api;
  }
})(globalThis);
