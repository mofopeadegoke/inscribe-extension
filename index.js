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
let selectedTool,
  snapshot,
  brushWidth = 5,
  selectedTheme,
  micImgElement = document.querySelector(".micImgReal");
// console.log(micImgElement);

InscribeStorage.ready()
  .then(() => InscribeStorage.get("popupTheme"))
  .then(({ popupTheme }) => {
    selectedTheme = popupTheme || "yellowMode";
    if (!popupTheme) InscribeStorage.set({ popupTheme: selectedTheme });
    applyTheme();
  });

function applyTheme() {
  if (selectedTheme == "yellowMode") {
    document.querySelectorAll(".btn").forEach((elem) => {
      elem.style.background = "rgb(245, 204, 0)";
    });
    micImgElement.style.fill = "black";
    sizeSlider.style.accentColor = "rgb(245, 204, 0)";
  } else if (selectedTheme == "blueMode") {
    document.querySelectorAll(".btn").forEach((elem) => {
      elem.style.background = "rgb(245, 204, 0)";
    });
    micImgElement.style.fill = "white";
    sizeSlider.style.accentColor = "#3486eb";
  } else if (selectedTheme == "purpleMode") {
    document.querySelectorAll(".btn").forEach((elem) => {
      elem.style.background = "purple";
      elem.style.color = "white";
    });
    micImgElement.style.fill = "white";
    sizeSlider.style.accentColor = "purple";
  } else if (selectedTheme == "greenMode") {
    document.querySelectorAll(".btn").forEach((elem) => {
      elem.style.background = "green";
      elem.style.color = "white";
    });
    micImgElement.style.fill = "white";
    sizeSlider.style.accentColor = "green";
  } else if (selectedTheme == "redMode") {
    document.querySelectorAll(".btn").forEach((elem) => {
      elem.style.background = "darkred";
      elem.style.color = "white";
    });
    micImgElement.style.fill = "white";
    sizeSlider.style.accentColor = "darkRed";
  } else if (selectedTheme == "pinkMode") {
    document.querySelectorAll(".btn").forEach((elem) => {
      elem.style.background = "pink";
      elem.style.color = "black";
    });
    micImgElement.style.fill = "black";
    sizeSlider.style.accentColor = "pink";
  } else if (selectedTheme == "darkMode") {
    document.querySelectorAll(".btn").forEach((elem) => {
      elem.style.background = "#333";
      elem.style.color = "white";
    });
    micImgElement.style.fill = "white";
    sizeSlider.style.accentColor = "#333";
  }
}
extpay
  .getUser()
  .then((user) => {
    const now = new Date();
    const sevenDays = 1000 * 60 * 60 * 24 * 7; // seven days in milliseconds
    if (
      user.paid ||
      (user.trialStartedAt && now - user.trialStartedAt < sevenDays) // Checking if the user's trial still works
    ) {
      selectedTool = "brush";
    } else {
      selectedTool = "eraser";
    }
  })
  .catch((err) => {});

const mouse = {
  x: undefined,
  y: undefined,
};
function drawRect(event) {
  if (!fillColor.checked) {
    return ctx.strokeRect(
      event.offsetX,
      event.offsetY,
      mouse.x - event.offsetX,
      mouse.y - event.offsetY
    );
  }
  ctx.fillRect(
    event.offsetX,
    event.offsetY,
    mouse.x - event.offsetX,
    mouse.y - event.offsetY
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
});

function drawCircle(event) {
  ctx.beginPath();
  let radius = Math.sqrt(
    Math.pow(mouse.x - event.offsetX, 2) + Math.pow(mouse.y - event.offsetY, 2)
  );
  ctx.arc(mouse.x, mouse.y, radius, 0, 2 * Math.PI);
  fillColor.checked ? ctx.fill() : ctx.stroke();
}

function drawTriangle(event) {
  ctx.beginPath();
  ctx.moveTo(mouse.x, mouse.y);
  ctx.lineTo(event.offsetX, event.offsetY);
  ctx.lineTo(mouse.x * 2 - event.offsetX, event.offsetY);
  ctx.closePath();
  fillColor.checked ? ctx.fill() : ctx.stroke();
}

function drawLine(event) {
  ctx.beginPath();
  ctx.moveTo(mouse.x, mouse.y);
  ctx.lineTo(event.offsetX, event.offsetY);
  ctx.stroke();
}
let pathsry = [];
let points = [];
let redoArr = [];
let previous = { x: 0, y: 0 };
let iouse = { x: 0, y: 0 };

// Assuming ctx, canvas, toolsBtn, sizeSlider, colorBtns, colorPicker, and clearCanvas are already defined

function startDrawing(event) {
  isDrawing = true;
  mouse.x = event.offsetX;
  mouse.y = event.offsetY;
  previous = { x: mouse.x, y: mouse.y };
  iouse = oMousePos(canvas, event);
  points = [{ x: iouse.x, y: iouse.y }];
  ctx.lineWidth = brushWidth;
  ctx.strokeStyle = selectedColor;
  ctx.fillStyle = selectedColor;
  ctx.beginPath();
  snapshot = ctx.getImageData(0, 0, canvas.width, canvas.height);
}

function oMousePos(canvas, evt) {
  var ClientRect = canvas.getBoundingClientRect();
  return {
    x: Math.round(evt.clientX - ClientRect.left),
    y: Math.round(evt.clientY - ClientRect.top),
  };
}

canvas.addEventListener("mousemove", (event) => {
  if (!isDrawing) return;

  previous = { x: iouse.x, y: iouse.y };
  iouse = oMousePos(canvas, event);
  points.push({ x: iouse.x, y: iouse.y });
  ctx.putImageData(snapshot, 0, 0);

  if (selectedTool === "brush" || selectedTool === "eraser") {
    ctx.strokeStyle = selectedTool === "eraser" ? "#FFF" : selectedColor;
    ctx.lineWidth = brushWidth;
    ctx.lineTo(iouse.x, iouse.y);
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

canvas.addEventListener("mousedown", startDrawing);
canvas.addEventListener("mouseup", endDrawing);

function endDrawing() {
  if (!isDrawing) return;
  isDrawing = false;
  pathsry.push([...points]);
  redoArr = [];
  allowRedo = false;
}

function drawPaths() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  pathsry.forEach((path) => {
    if (path.length < 1) return;
    ctx.beginPath();
    ctx.moveTo(path[0].x, path[0].y);
    for (let i = 1; i < path.length; i++) {
      ctx.lineTo(path[i].x, path[i].y);
    }
    ctx.stroke();
  });
}

let allowRedo = false;

function Undo() {
  if (pathsry.length > 0) {
    redoArr.push(pathsry.pop());
    allowRedo = true;
    drawPaths();
  }
}

function Redo() {
  if (allowRedo && redoArr.length > 0) {
    pathsry.push(redoArr.pop());
    drawPaths();
    if (redoArr.length === 0) {
      allowRedo = false;
    }
  }
}

let undoBtn = document.querySelector(".undo-btn");
undoBtn.addEventListener("click", Undo);
let redoBtn = document.querySelector(".redo-btn");
redoBtn.addEventListener("click", Redo);

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
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  pathsry = [];
  redoArr = [];
  setBackgroundColor();
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

// Touch Drawing
const rectLeft = canvas.getBoundingClientRect().left;
const rectTop = canvas.getBoundingClientRect().top;
function startTouchDrawing(event) {
  [...event.changedTouches].forEach((touch) => {
    isDrawing = true;
    mouse.x = touch.pageX - rectLeft;
    mouse.y = touch.pageY - rectTop;
    // console.log(touch);
    ctx.lineWidth = brushWidth;
    ctx.strokeStyle = selectedColor;
    ctx.fillStyle = selectedColor;
    ctx.beginPath();
    snapshot = ctx.getImageData(0, 0, canvas.width, canvas.height);
  });
}

canvas.addEventListener("touchmove", (event) => {
  [...event.changedTouches].forEach((touch) => {
    if (!isDrawing) return;
    ctx.putImageData(snapshot, 0, 0);
    // console.log(rectLeft);
    if (selectedTool === "brush" || selectedTool === "eraser") {
      ctx.strokeStyle = selectedTool === "eraser" ? "#FFF" : selectedColor;
      ctx.lineWidth = brushWidth;
      ctx.lineTo(touch.pageX - rectLeft, touch.pageY - rectTop);
      ctx.stroke();
    } else if (selectedTool === "rectangle") {
      drawTouchRect(touch);
    } else if (selectedTool === "circle") {
      drawTouchCircle(touch);
    } else if (selectedTool === "triangle") {
      drawTouchTriangle(touch);
    } else if (selectedTool === "line") {
      drawTouchLine(touch);
    }
  });
});

function drawTouchRect(touch) {
  if (!fillColor.checked) {
    return ctx.strokeRect(
      touch.pageX - rectLeft,
      touch.pageY - rectTop,
      mouse.x - (touch.pageX - rectLeft),
      mouse.y - (touch.pageY - rectTop)
    );
  }
  ctx.fillRect(
    touch.pageX - rectLeft,
    touch.pageY - rectTop,
    mouse.x - (touch.pageX - rectLeft),
    mouse.y - touch.pageY - rectTop
  );
}

function drawTouchCircle(touch) {
  ctx.beginPath();
  let radius = Math.sqrt(
    Math.pow(mouse.x - (touch.pageX - rectLeft), 2) +
      Math.pow(mouse.y - (touch.pageY - rectTop), 2)
  );
  ctx.arc(
    touch.pageX - rectLeft,
    touch.pageY - rectTop,
    radius,
    0,
    2 * Math.PI
  );
  fillColor.checked ? ctx.fill() : ctx.stroke();
}

function drawTouchTriangle(touch) {
  ctx.beginPath();
  ctx.moveTo(mouse.x, mouse.y);
  ctx.lineTo(touch.pageX - rectLeft, touch.pageY - rectTop);
  ctx.lineTo(mouse.x * 2 - (touch.pageX - rectLeft), touch.pageY - rectTop);
  ctx.closePath();
  fillColor.checked ? ctx.fill() : ctx.stroke();
}

function drawTouchLine(touch) {
  ctx.beginPath();
  ctx.moveTo(mouse.x, mouse.y);
  ctx.lineTo(touch.pageX - rectLeft, touch.pageY - rectTop);
  ctx.stroke();
}

canvas.addEventListener("touchstart", startTouchDrawing);
canvas.addEventListener("touchend", endDrawing);

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

// Replace 'sample-extension' with the id of the extension you
// registered on ExtensionPay.com to test payments. You may need to
// uninstall and reinstall the extension to make it work.
// Don't forget to change the ID in background.js too!

// document
//   .querySelector("button")
//   .addEventListener("click", extpay.openPaymentPage);

extpay
  .getUser()
  .then((user) => {
    const now = new Date();
    const sevenDays = 1000 * 60 * 60 * 24 * 7; // seven days in milliseconds
    if (
      user.paid ||
      (user.trialStartedAt && now - user.trialStartedAt < sevenDays)
    ) {
      saveAsFileBtn.addEventListener("click", () => {
        const blob = new Blob([textAreaText.textContent], {
          type: fileExtensionsInputBox.value,
        });
        const fileUrl = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.download = fileNameInputBox.value;
        link.href = fileUrl;
        link.click();
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
      saveImage.addEventListener("click", () => {
        popupBox.classList.add("see");
      });
      optionsBtn.addEventListener("click", () => {
        popupBox.classList.add("see");
      });
      saveAsFileBtn.addEventListener("click", () => {
        popupBox.classList.add("see");
      });
    }
  })
  .catch((err) => {
    // document.querySelector("p").innerHTML =
    //   "Error fetching data :( Check that your ExtensionPay id is correct and you're connected to the internet";
  });
// extpay.onPaid(function() { console.log('popup paid')});
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
