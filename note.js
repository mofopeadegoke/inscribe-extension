const extpay = ExtPay("inscribe");
let notesContainer = document.querySelector(".notes"),
  closePopupBtn = document.querySelector(".Updatecontent header img"),
  saveNoteLocallyPopupBox = document.querySelector(".notePopup-box"),
  saveNoteLocallyTitle = document.querySelector(".notePopup-box .noteTitle"),
  saveNoteLocallyNoteContentEl = document.querySelector(
    ".notePopup-box .noteContent"
  ),
  deleteNoteBtns,
  saveNoteLocallyFileName = document.querySelector(".notePopup-box .fileName"),
  showContentBtns,
  updateBtns,
  titleInputEl = document.querySelector(".title input"),
  descriptionInputEl = document.querySelector(".description textarea"),
  isUpdate = false,
  updateId,
  updateNoteBtn = document.querySelector(".Updatecontent button"),
  copyBtns,
  alertBox,
  copyId,
  saveNoteLocallyBtns,
  closeSaveNoteLocallyPopup = document.querySelector(
    ".notePopup-box .notePopup-boxCloseBtn"
  ),
  saveNoteLocallyActionBtn = document.querySelector(
    ".saveNoteLocallyBtnAction"
  );
let closeUpgradePopupBtn = document.querySelector(".Upgradecontent header img");
const popupBox = document.querySelector(".popup-box"),
  popupBoxUpgrade = document.querySelector(".upgrade"),
  errorBox = document.querySelector(".error-box"),
  closeErrorPopupBtn = document.querySelector(".errorContent header img"),
  payBtn = document.querySelector(".pay");
const trialBtn = document.querySelector(".trial");
var totalNotes = [],
  selectedTheme;
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

function renderNotes() {
  const articles = totalNotes.map((note, index) => {
    const article = document.createElement("article");
    article.className = "noteDiv";
    article.innerHTML = noteTemplate;
    article.querySelector("h3").textContent = note.title;
    article.querySelector(".noteBody").innerHTML = sanitizeNoteHtml(note.text);
    article.querySelector(".noteDate").textContent = note.date;
    article
      .querySelectorAll(".copiedToClipboardAlert, .showContentBtn, li")
      .forEach((el) => el.setAttribute("data-id", index));
    return article;
  });
  if (notesContainer) {
    notesContainer.replaceChildren(...articles);
  }
  if (selectedTheme == "yellowMode") {
    if (document.querySelectorAll(".noteDiv")) {
      document.querySelectorAll(".noteDiv").forEach((elem) => {
        elem.style.background = "rgb(245, 204, 0)";
        elem.style.color = "black";
      });
      document.querySelectorAll("button").forEach((elem) => {
        elem.style.background = "rgb(245, 204, 0)";
        elem.style.color = "black";
      });
    }
  } else if (selectedTheme == "blueMode") {
    if (document.querySelectorAll(".noteDiv")) {
      document.querySelectorAll(".noteDiv").forEach((elem) => {
        elem.style.background = "#3486eb";
        elem.style.color = "white";
      });
      document.querySelectorAll("button").forEach((elem) => {
        elem.style.background = "#3486eb";
        elem.style.color = "white";
      });
    }
  } else if (selectedTheme == "purpleMode") {
    if (document.querySelectorAll(".noteDiv")) {
      document.querySelectorAll(".noteDiv").forEach((elem) => {
        elem.style.background = "purple";
        elem.style.color = "white";
      });
      document.querySelectorAll("button").forEach((elem) => {
        elem.style.background = "purple";
        elem.style.color = "white";
      });
    }
  } else if (selectedTheme == "greenMode") {
    if (document.querySelectorAll(".noteDiv")) {
      document.querySelectorAll(".noteDiv").forEach((elem) => {
        elem.style.background = "green";
        elem.style.color = "white";
      });
      document.querySelectorAll("button").forEach((elem) => {
        elem.style.background = "green";
        elem.style.color = "white";
      });
    }
  } else if (selectedTheme == "redMode") {
    if (document.querySelectorAll(".noteDiv")) {
      document.querySelectorAll(".noteDiv").forEach((elem) => {
        elem.style.background = "darkred";
        elem.style.color = "white";
      });
      document.querySelectorAll("button").forEach((elem) => {
        elem.style.background = "darkred";
        elem.style.color = "white";
      });
    }
  } else if (selectedTheme == "pinkMode") {
    if (document.querySelectorAll(".noteDiv")) {
      document.querySelectorAll(".noteDiv").forEach((elem) => {
        elem.style.background = "pink";
        elem.style.color = "black";
      });
      document.querySelectorAll("button").forEach((elem) => {
        elem.style.background = "pink";
        elem.style.color = "black";
      });
    }
  } else if (selectedTheme == "darkMode") {
    if (document.querySelectorAll(".noteDiv")) {
      document.querySelectorAll(".noteDiv").forEach((elem) => {
        elem.style.background = "#333";
        elem.style.color = "white";
      });
      document.querySelectorAll("button").forEach((elem) => {
        elem.style.background = "#333";
        elem.style.color = "white";
      });
    }
  }
}
window.onload = async () => {
  await InscribeStorage.ready();
  const { myNotes, popupTheme } = await InscribeStorage.get([
    "myNotes",
    "popupTheme",
  ]);
  totalNotes = myNotes || [];
  selectedTheme = popupTheme || "yellowMode";
  renderNotes();

  deleteNoteBtns = document.querySelectorAll(".deleteNoteBtn");
  showContentBtns = document.querySelectorAll(".showContentBtn");
  updateBtns = document.querySelectorAll(".updateBtn");
  copyBtns = document.querySelectorAll(".copyBtn");
  saveNoteLocallyBtns = document.querySelectorAll(".saveNoteLocallyBtn");
  alertBox = document.querySelectorAll(".copiedToClipboardAlert");
  deleteNoteBtns.forEach((elem) => {
    elem.addEventListener("click", async () => {
      let confirmDel = confirm("Are you sure you want to delete note?");
      if (!confirmDel) return;
      noteId = elem.getAttribute("data-id");
      totalNotes.splice(noteId, 1);
      await saveNotes();
      window.location.reload();
    });
  });
  showContentBtns.forEach((elem) => {
    elem.addEventListener("click", () => {
      elem.classList.toggle("show");
    });
  });
  updateBtns.forEach((elem) => {
    elem.addEventListener("click", () => {
      updateId = elem.getAttribute("data-id");
      const { title, text: desc } = totalNotes[updateId];
      popupBox.classList.add("see");
      let textModified = desc;
      textModified = textModified.replace(/\t/g, "  ");
      textModified = textModified.replace(/<br>/g, "\n");
      titleInputEl.value = title;
      descriptionInputEl.value = textModified;
      titleInputEl.focus();
      // console.log(id, title, textModified);
    });
  });
  closePopupBtn.addEventListener("click", () => {
    popupBox.classList.remove("see");
  });
  saveNoteLocallyBtns.forEach((elem) => {
    elem.addEventListener("click", () => {
      extpay
        .getUser()
        .then((user) => {
          const now = new Date();
          const sevenDays = 1000 * 60 * 60 * 24 * 7; // seven days in milliseconds
          if (
            user.paid ||
            (user.trialStartedAt && now - user.trialStartedAt < sevenDays)
          ) {
            const { title, text: desc } = totalNotes[elem.getAttribute("data-id")];
            saveNoteLocallyPopupBox.classList.add("see");
            saveNoteLocallyTitle.value = title;
            saveNoteLocallyNoteContentEl.value = desc;
            saveNoteLocallyFileName.value = title;
            saveNoteLocallyFileName.focus();
          } else {
            popupBoxUpgrade.classList.add("see");
          }
        })
        .catch((err) => {
          errorBox.classList.add("see");
        });
    });
  });
  closeUpgradePopupBtn.addEventListener("click", () => {
    // console.log("Hello");
    // console.log(popupBoxUpgrade);
    popupBoxUpgrade.classList.remove("see");
  });
  copyBtns.forEach((elem) => {
    elem.addEventListener("click", () => {
      copyId = elem.getAttribute("data-id");
      const parser = new DOMParser();
      const parserhtml = parser.parseFromString(
        sanitizeNoteHtml(totalNotes[copyId].text),
        "text/html"
      );
      const textContent = parserhtml.body.innerText;
      navigator.clipboard.writeText(textContent);
      // elem.parentElement.previousElementSibling.click();
      alertBox.forEach((elem) => {
        if (elem.getAttribute("data-id") == copyId) {
          elem.classList.add("alertShow");
        }
      });
      function hideNow() {
        alertBox.forEach((elem) => {
          if (elem.getAttribute("data-id") == copyId) {
            elem.classList.remove("alertShow");
          }
        });
      }
      setTimeout(hideNow, 3100);
    });
  });
  // console.log(deleteNoteBtns);
};
// notesContainer.addEventListener("click", (e) => {
//   if (e.target.matches(".deleteNoteBtn")) {
//     ID = e.target.getAttribute("data-id");
//     for (let i = 0; i < totalNotes.length; i++) {
//       if (ID == totalNotes[i].id) totalNotes.splice(i, 1);
//     }
//   }
//   // console.log(totalNotes);
//   localStorage.setItem("myNotes", JSON.stringify(totalNotes));
//   renderNotes();
// });

// function showMenu(elem) {
//   elem.classList.toggle("show");
// }
// function deleteNote(noteId) {
//   // console.log();
//
// }

updateNoteBtn.addEventListener("click", (e) => {
  e.preventDefault();
  const months = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];
  let dateObj = new Date();
  let month = months[dateObj.getMonth()],
    day = dateObj.getDate(),
    year = dateObj.getFullYear();
  let textModified = descriptionInputEl.value;
  textModified = textModified.replace(/  /g, "\t");
  textModified = textModified.replace(/\n/g, "<br>\n");
  let note = {
    text: textModified,
    title: titleInputEl.value,
    date: `${month} ${day}, ${year}`,
  };
  totalNotes[updateId] = note;
  closePopupBtn.click();
  saveNotes().then(() => window.onload());
});
closePopupBtn.addEventListener("click", (e) => {
  titleInputEl.value = "";
  descriptionInputEl.value = "";
  popupBox.classList.remove("see");
});
closeSaveNoteLocallyPopup.addEventListener("click", () => {
  saveNoteLocallyTitle.value = "";
  saveNoteLocallyNoteContentEl.value = "";
  saveNoteLocallyFileName.value = "";
  saveNoteLocallyPopupBox.classList.remove("see");
});
const noteContentElement = document.querySelector(".noteContent"),
  fileExtensionBox = document.querySelector("#fileExtensions");

fileExtensionBox.addEventListener("click", () => {
  let selectedOption =
    fileExtensionBox.options[fileExtensionBox.selectedIndex].text;
  saveNoteLocallyActionBtn.innerText = `Save locally as ${
    selectedOption.split(" ")[0]
  } File`;
  // console.log(selectedOption.split(" ")[0]);
});
saveNoteLocallyActionBtn.addEventListener("click", () => {
  const blob = new Blob([noteContentElement.value], {
    type: fileExtensionBox.value,
  });
  const fileUrl = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.download = saveNoteLocallyFileName.value;
  link.href = fileUrl;
  link.click();
});
payBtn.addEventListener("click", () => {
  if (navigator.onLine) {
    extpay.openPaymentPage();
  } else {
    errorBox.classList.add("see");
  }
});

// Inscribe being worked on
