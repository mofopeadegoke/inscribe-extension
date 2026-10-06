// Cleans note HTML down to the formatting the editor toolbar can produce.
// Uses the vendored DOMPurify (vendor/purify.min.js), loaded before this file.
(function (root) {
  const CONFIG = {
    ALLOWED_TAGS: [
      "b", "strong", "i", "em", "u", "s", "strike", "sub", "sup",
      "ol", "ul", "li", "a", "br", "div", "p", "span", "blockquote", "font",
    ],
    ALLOWED_ATTR: ["href", "style", "size", "target", "rel"],
  };

  function createSanitizer(DOMPurify) {
    // Links in notes always open in a new tab without access to the opener.
    DOMPurify.addHook("afterSanitizeAttributes", (node) => {
      if (node.tagName === "A") {
        node.setAttribute("target", "_blank");
        node.setAttribute("rel", "noopener noreferrer");
      }
    });
    return function sanitizeNoteHtml(html) {
      return DOMPurify.sanitize(html || "", CONFIG);
    };
  }

  if (typeof module === "object" && module.exports) {
    module.exports = { createSanitizer };
  } else {
    root.sanitizeNoteHtml = createSanitizer(root.DOMPurify);
  }
})(globalThis);
