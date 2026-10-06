// Helpers shared by the pages that save and show notes.
(function (root) {
  // "October 6, 2026" — the format notes have always been stored with.
  function formatNoteDate(date) {
    return date.toLocaleDateString("en-US", {
      month: "long",
      day: "numeric",
      year: "numeric",
    });
  }

  const api = { formatNoteDate };
  if (typeof module === "object" && module.exports) {
    module.exports = api;
  } else {
    Object.assign(root, api);
  }
})(globalThis);
