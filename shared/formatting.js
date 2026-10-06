// Rich-text commands shared by the home editor and the note editor.
// document.execCommand is deprecated but still supported everywhere, and it
// is what the contenteditable editors are built on.
(function (root) {
  function formatDoc(cmd, value = null) {
    document.execCommand(cmd, false, value);
  }

  function createLink() {
    const url = prompt("Insert URL");
    if (url) formatDoc("createLink", url);
  }

  // Wires every [data-command] button inside the toolbar.
  function bindToolbar(toolbar) {
    // Keep the editor's selection when a toolbar button is pressed.
    toolbar.addEventListener("mousedown", (e) => {
      if (e.target.closest("[data-command]")) e.preventDefault();
    });
    toolbar.addEventListener("click", (e) => {
      const button = e.target.closest("[data-command]");
      if (!button) return;
      e.preventDefault();
      const cmd = button.dataset.command;
      if (cmd === "createLink") createLink();
      else formatDoc(cmd);
    });
  }

  root.InscribeFormatting = { formatDoc, createLink, bindToolbar };
})(globalThis);
