const extpay = ExtPay("inscribe");
const canvas = document.getElementById("canvas1");
let ctx = canvas.getContext("2d");
let toolsBtn = document.querySelectorAll(".tool");
let fillColor = document.querySelector("#fill-color");
let sizeSlider = document.querySelector("#size-slider"),
  colorBtns = document.querySelectorAll(".color-option"),
  selectedColor = "#000",
  colorPicker = document.querySelector("#color-picker"),
  clearCanvas = document.querySelector(".clearCanvas"),
  saveImage = document.querySelector(".save-image"),
  optionsBtn = document.querySelector(".optionsBtn"),
  optionUI = document.querySelector(".options"),
  saveAsFileBtn = document.querySelector(".saveAsFileBtn"),
  textAreaText = document.querySelector("#textAreaText"),
  fileNameInputBox = document.querySelector(".fileName"),
  fileExtensionsInputBox = document.querySelector("#fileExtensions"),
  saveNotesBtn = document.querySelector(".saveNoteBtn");
let isDrawing = false;
let selectedTool = "brush",
  snapshot,
  brushWidth = 5;
// console.log(micImgElement);

InscribeStorage.ready()
  .then(() => InscribeStorage.get("popupTheme"))
  .then(({ popupTheme }) => {
    InscribeThemes.applyPopupTheme(popupTheme);
    if (!popupTheme) {
      InscribeStorage.set({ popupTheme: InscribeThemes.DEFAULT_POPUP_THEME });
    }
  });

const strokeStart = {
  x: undefined,
  y: undefined,
};
function drawRect(event) {
  if (!fillColor.checked) {
    return ctx.strokeRect(
      event.offsetX,
      event.offsetY,
      strokeStart.x - event.offsetX,
      strokeStart.y - event.offsetY
    );
  }
  ctx.fillRect(
    event.offsetX,
    event.offsetY,
    strokeStart.x - event.offsetX,
    strokeStart.y - event.offsetY
  );
}

function setBackgroundColor() {
  ctx.fillStyle = "#fff";
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.fillStyle = selectedColor;
}
window.addEventListener("load", () => {
  canvas.width = canvas.parentElement.offsetWidth;
  canvas.height = canvas.parentElement.offsetHeight;
  setBackgroundColor();
  canvasHistory = [];
  pushHistory();
});

function drawCircle(event) {
  ctx.beginPath();
  let radius = Math.sqrt(
    Math.pow(strokeStart.x - event.offsetX, 2) + Math.pow(strokeStart.y - event.offsetY, 2)
  );
  ctx.arc(strokeStart.x, strokeStart.y, radius, 0, 2 * Math.PI);
  fillColor.checked ? ctx.fill() : ctx.stroke();
}

function drawTriangle(event) {
  ctx.beginPath();
  ctx.moveTo(strokeStart.x, strokeStart.y);
  ctx.lineTo(event.offsetX, event.offsetY);
  ctx.lineTo(strokeStart.x * 2 - event.offsetX, event.offsetY);
  ctx.closePath();
  fillColor.checked ? ctx.fill() : ctx.stroke();
}

function drawLine(event) {
  ctx.beginPath();
  ctx.moveTo(strokeStart.x, strokeStart.y);
  ctx.lineTo(event.offsetX, event.offsetY);
  ctx.stroke();
}
// Undo/redo keeps a snapshot of the whole canvas after each finished stroke,
// so shapes, colours, widths and the eraser all come back exactly.
const MAX_UNDO_STEPS = 30;
let canvasHistory = []; // last entry is the current canvas
let redoStack = [];

function pushHistory() {
  canvasHistory.push(ctx.getImageData(0, 0, canvas.width, canvas.height));
  if (canvasHistory.length > MAX_UNDO_STEPS + 1) canvasHistory.shift();
  redoStack = [];
}

function undo() {
  if (canvasHistory.length < 2) return;
  redoStack.push(canvasHistory.pop());
  ctx.putImageData(canvasHistory[canvasHistory.length - 1], 0, 0);
}

function redo() {
  if (redoStack.length === 0) return;
  const next = redoStack.pop();
  canvasHistory.push(next);
  ctx.putImageData(next, 0, 0);
}

function startDrawing(event) {
  isDrawing = true;
  strokeStart.x = event.offsetX;
  strokeStart.y = event.offsetY;
  ctx.lineWidth = brushWidth;
  ctx.strokeStyle = selectedColor;
  ctx.fillStyle = selectedColor;
  ctx.beginPath();
  ctx.moveTo(strokeStart.x, strokeStart.y);
  snapshot = ctx.getImageData(0, 0, canvas.width, canvas.height);
}

// Pointer Events cover mouse, touch and pen with one code path; offsetX/Y
// are always relative to the canvas, whatever the scroll position.
canvas.style.touchAction = "none"; // don't scroll the page while drawing
canvas.addEventListener("pointermove", (event) => {
  if (!isDrawing) return;

  ctx.putImageData(snapshot, 0, 0);

  if (selectedTool === "brush" || selectedTool === "eraser") {
    ctx.strokeStyle = selectedTool === "eraser" ? "#FFF" : selectedColor;
    ctx.lineWidth = brushWidth;
    ctx.lineTo(event.offsetX, event.offsetY);
    ctx.stroke();
  } else if (selectedTool === "rectangle") {
    drawRect(event);
  } else if (selectedTool === "circle") {
    drawCircle(event);
  } else if (selectedTool === "triangle") {
    drawTriangle(event);
  } else if (selectedTool === "line") {
    drawLine(event);
  }
});

canvas.addEventListener("pointerdown", (event) => {
  canvas.setPointerCapture(event.pointerId); // keep drawing if the pointer leaves the canvas
  startDrawing(event);
});
canvas.addEventListener("pointerup", endDrawing);
canvas.addEventListener("pointercancel", endDrawing);

function endDrawing() {
  if (!isDrawing) return;
  isDrawing = false;
  pushHistory();
}

document.querySelector(".undo-btn").addEventListener("click", undo);
document.querySelector(".redo-btn").addEventListener("click", redo);

toolsBtn.forEach((btn) => {
  btn.addEventListener("click", () => {
    document.querySelector(".active").classList.remove("active");
    btn.classList.add("active");
    selectedTool = btn.id;
  });
});

sizeSlider.addEventListener("change", () => {
  brushWidth = sizeSlider.value;
});

colorBtns.forEach((btn) => {
  btn.addEventListener("click", () => {
    document.querySelector(".selected").classList.remove("selected");
    btn.classList.add("selected");
    selectedColor = window
      .getComputedStyle(btn)
      .getPropertyValue("background-color");
  });
});

colorPicker.addEventListener("change", () => {
  colorPicker.parentElement.style.backgroundColor = colorPicker.value;
  colorPicker.parentElement.click();
});

clearCanvas.addEventListener("click", () => {
  setBackgroundColor(); // paint white rather than clear, so exports aren't transparent
  pushHistory(); // clearing can be undone
});

// saveImage.addEventListener("click", () => {
//   const link = document.createElement("a");
//   link.download = `${Date.now()}.jpg`;
//   link.href = canvas.toDataURL();
//   link.click();
// });

let show = false;

function disappear() {
  if (show === false) {
    optionUI.style.display = "none";
  }
}

// optionsBtn.addEventListener("mouseover", () => {
//   optionUI.style.display = "block";
//   show = true;
// });
// optionsBtn.addEventListener("mouseleave", () => {
//   setTimeout(disappear, 1000);
//   show = false;
// });
optionUI.addEventListener("mouseover", () => {
  optionUI.style.display = "block";
  show = true;
});
optionUI.addEventListener("mouseleave", () => {
  optionUI.style.display = "none";
});

// Saving Note locally as a file
fileExtensionsInputBox.addEventListener("change", () => {
  let selectedOption =
    fileExtensionsInputBox.options[fileExtensionsInputBox.selectedIndex].text;
  saveAsFileBtn.innerText = `Save As ${selectedOption.split(" ")[0]} File`;
  console.log(selectedOption.split(" ")[0]);
});

// Saving Notes in storage (as sanitized HTML, so formatting is kept)
saveNotesBtn.addEventListener("click", async () => {
  if (fileNameInputBox.value) {
    await InscribeStorage.ready();
    const { myNotes = [] } = await InscribeStorage.get("myNotes");
    const note = {
      text: sanitizeNoteHtml(textAreaText.innerHTML),
      title: fileNameInputBox.value,
      date: formatNoteDate(new Date()),
    };
    textAreaText.replaceChildren();
    await InscribeStorage.set({ myNotes: [...myNotes, note], liveNote: "" });
    fileNameInputBox.value = "";
    fileNameInputBox.style.border = "1px solid black";
  } else {
    fileNameInputBox.style.border = "1px solid red";
  }
});

// Clear Textarea Buttonn
const clearAreaBtn = document.querySelector(".clearTextarea");
clearAreaBtn.addEventListener("click", () => {
  textAreaText.replaceChildren();
  InscribeStorage.set({ liveNote: "" });
});

// Extension Pay
const popupBox = document.querySelector(".popup-box"),
  errorBox = document.querySelector(".error-box"),
  closeErrorPopupBtn = document.querySelector(".errorContent header img");
const closePopupBtn = document.querySelector(".Upgradecontent header img"),
  payBtn = document.querySelector(".pay"),
  trialBtn = document.querySelector(".trial");
options = document.querySelectorAll("footer li");
closePopupBtn.addEventListener("click", () => {
  popupBox.classList.remove("see");
});
closeErrorPopupBtn.addEventListener("click", () => {
  errorBox.classList.remove("see");
});

// Premium features: when payment status can't be fetched (offline, ExtPay
// unreachable) the buttons explain that instead of silently doing nothing.
function gateFeatures(popup) {
  [saveImage, optionsBtn, saveAsFileBtn].forEach((btn) =>
    btn.addEventListener("click", () => popup.classList.add("see"))
  );
}

extpay
  .getUser()
  .then((user) => {
    if (InscribePremium.isPremium(user)) {
      saveAsFileBtn.addEventListener("click", () => {
        InscribeDownload.exportNote(fileExtensionsInputBox.value, {
          title: fileNameInputBox.value,
          html: sanitizeNoteHtml(textAreaText.innerHTML),
        });
      });
      saveImage.addEventListener("click", () => {
        const link = document.createElement("a");
        link.download = `${Date.now()}.png`;
        link.href = canvas.toDataURL();
        link.click();
      });
      optionsBtn.addEventListener("mouseover", () => {
        optionUI.style.display = "block";
        show = true;
      });
      optionsBtn.addEventListener("mouseleave", () => {
        setTimeout(disappear, 1000);
        show = false;
      });
      optionsBtn.addEventListener("click", () => {
        optionUI.style.display = "block";
        show = true;
      });
      options.forEach((elem) => {
        elem.style.opacity = "1";
        elem.style.pointerEvents = "all";
      });
    } else {
      gateFeatures(popupBox);
    }
  })
  .catch(() => gateFeatures(errorBox));
payBtn.addEventListener("click", () => {
  if (navigator.onLine) {
    extpay.openPaymentPage();
  } else {
    errorBox.classList.add("see");
  }
});

trialBtn.addEventListener("click", () => {
  extpay.openTrialPage();
});
// window.addEventListener("online", () => {
//   payBtn.addEventListener("click", extpay.openPaymentPage);
// });
// window.addEventListener("offline", () => {
//   payBtn.addEventListener("click", () => {
//     errorBox.classList.add("see");
//   });
// });

// Speech to text
const micBtn = document.querySelector(".micImg");
// var a,
//   iterator = 0,
//   isRecording = false;
// micBtn.addEventListener("click", () => {
//   micBtn.classList.toggle("on");
//   isRecording = !isRecording;
//   if (micBtn.className == "micImg on" && isRecording) {
//     pasteBtn.classList.add("off");
//     chrome.tabs.query({ currentWindow: true, active: true }, (tab) => {
//       chrome.tabs.sendMessage(
//         tab[0].id,
//         {
//           message: "Start Recording",
//         },
//         function (response) {
//           if (response) {
//             a = response.value;
//           }
//           console.log(response);
//         }
//       );
//     });
//   }
//   if (!isRecording) {
//     micBtn.click();
//     micBtn.click();
//     setTimeout(clickable, 1000);
//   }
//   function clickable() {
//     pasteBtn.classList.remove("off");
//   }
// });
// pasteBtn.addEventListener("click", () => {
//   textAreaText.value = "";
//   textAreaText.value += a;
//   console.log(a);
// });
micBtn.addEventListener("click", () => {
  chrome.tabs.create({ url: "speech.html" });
});

// Auto Saving (debounced; keeps formatting)
let autosaveTimer = null;
textAreaText.addEventListener("input", () => {
  clearTimeout(autosaveTimer);
  autosaveTimer = setTimeout(() => {
    InscribeStorage.set({ liveNote: sanitizeNoteHtml(textAreaText.innerHTML) });
  }, 300);
});
// More formatting Options
let moreFormatting = document.querySelector(".more"),
  moreContainer = document.querySelector(".moreContainer");
moreFormatting.addEventListener("click", () => {
  moreContainer.classList.toggle("see");
});

// Rich Formatting Tools
let optionButtons = document.querySelectorAll(".option-button");
let advanvedOptionButtons = document.querySelectorAll(".adv-option-button");
let linkButton = document.getElementById("createLink");
let alignButtons = document.querySelectorAll(".align");
let spacingButtons = document.querySelectorAll(".spacing");
let formatButtons = document.querySelectorAll(".format");
let scriptButtons = document.querySelectorAll(".script");
let fontSizeSelect = document.querySelector(".formatSelects .two");
const initializer = () => {
  highlighter(alignButtons, true);
  highlighter(spacingButtons, true);
  highlighter(formatButtons, false);
  highlighter(scriptButtons, true);
};

const highlighter = (className, needsRemoval) => {
  className.forEach((button) => {
    button.addEventListener("click", () => {
      if (needsRemoval) {
        let alreadyActive = false;
        if (button.classList.contains("chosen")) {
          alreadyActive = true;
        }

        // Remove highlight from other button
        highlighterRemover(className);
        if (!alreadyActive) {
          button.classList.add("chosen");
        }
      } else {
        // if other buttons can be highlighted
        button.classList.toggle("chosen");
      }
    });
  });
};

optionButtons.forEach((elem) => {
  elem.addEventListener("click", () => {
    InscribeFormatting.formatDoc(elem.id);
  });
});
linkButton.addEventListener("click", InscribeFormatting.createLink);
// fontSizeSelect.addEventListener("change", () => {
//   formatDoc("fontSize", this.value);
//   this.selectedIndex = 0;
// });
textAreaText.addEventListener("mouseenter", () => {
  const a = document.querySelectorAll("a");
  a.forEach((item) => {
    item.addEventListener("mouseenter", () => {
      textAreaText.setAttribute("contenteditable", false);
      item.target = "_blank";
    });
    item.addEventListener("mouseleave", () => {
      textAreaText.setAttribute("contenteditable", true);
    });
  });
});
const highlighterRemover = (className) => {
  className.forEach((button) => {
    button.classList.remove("chosen");
  });
};

window.onload = async () => {
  initializer();
  await InscribeStorage.ready();
  const { liveNote } = await InscribeStorage.get("liveNote");
  textAreaText.innerHTML = sanitizeNoteHtml(liveNote);
  if (liveNote) textAreaText.focus();
};
