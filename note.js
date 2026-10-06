const extpay = ExtPay("inscribe");
const notesContainer = document.querySelector(".notes"),
  editPopup = document.querySelector(".editPopup"),
  closeEditPopupBtn = document.querySelector(".Updatecontent header img"),
  titleInputEl = document.querySelector(".Updatecontent .title input"),
  editorEl = document.querySelector(".Updatecontent .noteEditor"),
  updateNoteBtn = document.querySelector(".Updatecontent .updateNoteBtn"),
  saveNoteLocallyPopupBox = document.querySelector(".notePopup-box"),
  saveNoteLocallyTitle = document.querySelector(".notePopup-box .noteTitle"),
  saveNoteLocallyContent = document.querySelector(".notePopup-box .noteContent"),
  saveNoteLocallyFileName = document.querySelector(".notePopup-box .fileName"),
  closeSaveNoteLocallyPopup = document.querySelector(
    ".notePopup-box .notePopup-boxCloseBtn"
  ),
  saveNoteLocallyActionBtn = document.querySelector(".saveNoteLocallyBtnAction"),
  fileExtensionBox = document.querySelector("#fileExtensions"),
  upgradePopup = document.querySelector(".upgrade"),
  closeUpgradePopupBtn = document.querySelector(".upgrade header img"),
  errorPopup = document.querySelector(".errorPopup"),
  closeErrorPopupBtn = document.querySelector(".errorPopup header img"),
  payBtn = document.querySelector(".pay"),
  trialBtn = document.querySelector(".trial");

let totalNotes = [],
  selectedTheme,
  updateId = null;

function saveNotes() {
  return InscribeStorage.set({ myNotes: totalNotes });
}

// Static markup only; note fields are filled in with textContent or
// sanitized HTML so a title or body can never break or inject markup.
const noteTemplate = `
  <h3></h3>
  <span class="noteBody"></span>
  <p class="copiedToClipboardAlert">Copied to clipboard</p>
  <div class="settings">
    <p class="noteDate"></p>
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16" class="showContentBtn">
      <path d="M3 9.5a1.5 1.5 0 1 1 0-3 1.5 1.5 0 0 1 0 3zm5 0a1.5 1.5 0 1 1 0-3 1.5 1.5 0 0 1 0 3zm5 0a1.5 1.5 0 1 1 0-3 1.5 1.5 0 0 1 0 3z"/>
    </svg>
    <ul class="content">
      <li class="updateBtn"><img src="./images/pencil.svg" alt="A pencil Logo"> Edit</li>
      <li class="copyBtn"><img src="./images/clipboard.svg" alt="A clipboard logo"> Copy Content</li>
      <li class="deleteNoteBtn"><img src="./images/trash3.svg" alt="A trash can logo"> Delete</li>
      <li class="saveNoteLocallyBtn"><img src="./images/download.svg" alt="The download logo"> Save this note locally</li>
    </ul>
  </div>`;

const themeColors = {
  yellowMode: ["rgb(245, 204, 0)", "black"],
  blueMode: ["#3486eb", "white"],
  purpleMode: ["purple", "white"],
  greenMode: ["green", "white"],
  redMode: ["darkred", "white"],
  pinkMode: ["pink", "black"],
  darkMode: ["#333", "white"],
};

function applyNoteTheme() {
  const colors = themeColors[selectedTheme];
  if (!colors) return;
  document.querySelectorAll(".noteDiv, button").forEach((elem) => {
    elem.style.background = colors[0];
    elem.style.color = colors[1];
  });
}

function renderNotes() {
  const articles = totalNotes.map((note, index) => {
    const article = document.createElement("article");
    article.className = "noteDiv";
    article.dataset.id = index;
    article.innerHTML = noteTemplate;
    article.querySelector("h3").textContent = note.title;
    article.querySelector(".noteBody").innerHTML = sanitizeNoteHtml(note.text);
    article.querySelector(".noteDate").textContent = note.date;
    return article;
  });
  notesContainer.replaceChildren(...articles);
  applyNoteTheme();
}

function htmlToPlainText(html) {
  const doc = new DOMParser().parseFromString(sanitizeNoteHtml(html), "text/html");
  return doc.body.innerText;
}

// ---------- note actions (one delegated handler for the whole list) ----------

const noteActions = {
  showContentBtn(article, target) {
    target.classList.toggle("show");
  },

  async deleteNoteBtn(article, target, id) {
    if (!confirm("Are you sure you want to delete note?")) return;
    totalNotes.splice(id, 1);
    await saveNotes();
    renderNotes();
  },

  updateBtn(article, target, id) {
    updateId = id;
    titleInputEl.value = totalNotes[id].title;
    editorEl.innerHTML = sanitizeNoteHtml(totalNotes[id].text);
    editPopup.classList.add("see");
    titleInputEl.focus();
  },

  copyBtn(article, target, id) {
    navigator.clipboard.writeText(htmlToPlainText(totalNotes[id].text));
    const copiedAlert = article.querySelector(".copiedToClipboardAlert");
    copiedAlert.classList.add("alertShow");
    setTimeout(() => copiedAlert.classList.remove("alertShow"), 3100);
  },

  saveNoteLocallyBtn(article, target, id) {
    extpay
      .getUser()
      .then((user) => {
        const now = new Date();
        const sevenDays = 1000 * 60 * 60 * 24 * 7; // seven days in milliseconds
        if (
          user.paid ||
          (user.trialStartedAt && now - user.trialStartedAt < sevenDays)
        ) {
          const { title, text } = totalNotes[id];
          saveNoteLocallyTitle.value = title;
          saveNoteLocallyContent.innerHTML = sanitizeNoteHtml(text);
          saveNoteLocallyFileName.value = title;
          saveNoteLocallyPopupBox.classList.add("see");
          saveNoteLocallyFileName.focus();
        } else {
          upgradePopup.classList.add("see");
        }
      })
      .catch(() => {
        errorPopup.classList.add("see");
      });
  },
};

notesContainer.addEventListener("click", (e) => {
  const article = e.target.closest(".noteDiv");
  if (!article) return;
  const id = Number(article.dataset.id);
  for (const [cls, action] of Object.entries(noteActions)) {
    const target = e.target.closest(`.${cls}`);
    if (target && article.contains(target)) {
      action(article, target, id);
      return;
    }
  }
});

// ---------- edit popup ----------

InscribeFormatting.bindToolbar(document.querySelector(".Updatecontent .editorToolbar"));

function closeEditPopup() {
  titleInputEl.value = "";
  editorEl.replaceChildren();
  updateId = null;
  editPopup.classList.remove("see");
}

updateNoteBtn.addEventListener("click", async (e) => {
  e.preventDefault();
  if (updateId === null) return;
  totalNotes[updateId] = {
    text: sanitizeNoteHtml(editorEl.innerHTML),
    title: titleInputEl.value,
    date: formatNoteDate(new Date()),
  };
  closeEditPopup();
  await saveNotes();
  renderNotes();
});
closeEditPopupBtn.addEventListener("click", closeEditPopup);

// ---------- save-locally popup ----------

closeSaveNoteLocallyPopup.addEventListener("click", () => {
  saveNoteLocallyTitle.value = "";
  saveNoteLocallyContent.replaceChildren();
  saveNoteLocallyFileName.value = "";
  saveNoteLocallyPopupBox.classList.remove("see");
});

fileExtensionBox.addEventListener("change", () => {
  const selectedOption = fileExtensionBox.options[fileExtensionBox.selectedIndex].text;
  saveNoteLocallyActionBtn.innerText = `Save locally as ${selectedOption.split(" ")[0]} File`;
});

saveNoteLocallyActionBtn.addEventListener("click", (e) => {
  e.preventDefault();
  const blob = new Blob([saveNoteLocallyContent.innerText], {
    type: fileExtensionBox.value,
  });
  const fileUrl = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.download = saveNoteLocallyFileName.value;
  link.href = fileUrl;
  link.click();
});

// ---------- payment popups ----------

closeUpgradePopupBtn.addEventListener("click", () => {
  upgradePopup.classList.remove("see");
});
closeErrorPopupBtn.addEventListener("click", () => {
  errorPopup.classList.remove("see");
});
payBtn.addEventListener("click", () => {
  if (navigator.onLine) {
    extpay.openPaymentPage();
  } else {
    errorPopup.classList.add("see");
  }
});
trialBtn.addEventListener("click", () => {
  extpay.openTrialPage();
});

// ---------- startup ----------

(async () => {
  await InscribeStorage.ready();
  const { myNotes, popupTheme } = await InscribeStorage.get(["myNotes", "popupTheme"]);
  totalNotes = myNotes || [];
  selectedTheme = popupTheme || "yellowMode";
  renderNotes();
})();
