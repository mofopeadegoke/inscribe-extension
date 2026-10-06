// Payment status lives in the background worker; content scripts ask it.
function getUser() {
  return chrome.runtime.sendMessage({ type: "getUser" }).then((res) => {
    if (!res || res.error) throw new Error(res ? res.error : "No response");
    return res.user;
  });
}
function openPaymentPage() {
  chrome.runtime.sendMessage({ type: "openPaymentPage" });
}
let noteContainer = document.createElement("div");
noteContainer.classList.add("parentContainer");
let noteRow = document.createElement("div");
let moreIcon = document.createElement("span");
moreIcon.classList.add("noteMoreIcon_");
let dateText = document.createElement("p");
let moreContent = document.createElement("article");
let themeContainer = document.createElement("article");
let redTheme = document.createElement("div");
let blueTheme = document.createElement("div");
let yellowTheme = document.createElement("div");
let greenTheme = document.createElement("div");
let mintTheme = document.createElement("div");
let blackTheme = document.createElement("div");
let whiteTheme = document.createElement("div");
let deleteText = document.createElement("button");
let saveNoteLocallyBtn = document.createElement("button"),
  acctIcon = document.createElement("article"); // Creating the account icon elemnt on the sticky note
acctIcon.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" height="16" width="14" viewBox="0 0 448 512"><!--!Font Awesome Free 6.5.1 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license/free Copyright 2023 Fonticons, Inc.--><path fill="#000000" d="M304 128a80 80 0 1 0 -160 0 80 80 0 1 0 160 0zM96 128a128 128 0 1 1 256 0A128 128 0 1 1 96 128zM49.3 464H398.7c-8.9-63.3-63.3-112-129-112H178.3c-65.7 0-120.1 48.7-129 112zM0 482.3C0 383.8 79.8 304 178.3 304h91.4C368.2 304 448 383.8 448 482.3c0 16.4-13.3 29.7-29.7 29.7H29.7C13.3 512 0 498.7 0 482.3z"/></svg>`; // Putting an svg in the elemnet
acctIcon.classList.add("acctContainer");
acctIcon.style.cursor = "pointer"; // Styling it a bit
// FAB Code
let microphoneFAB = document.createElement("button");
microphoneFAB.classList.add("microphone__");
// End of FAB code
moreContent.classList.add("container_");
themeContainer.classList.add("theme_");
redTheme.classList.add("red_");
blueTheme.classList.add("blue_");
yellowTheme.classList.add("yellow_");
greenTheme.classList.add("green_");
mintTheme.classList.add("mint_");
blackTheme.classList.add("black_");
whiteTheme.classList.add("white_");
deleteText.textContent = "Delete";
saveNoteLocallyBtn.append("Save note locally");
deleteText.classList.add("delTxt");
saveNoteLocallyBtn.classList.add("saveNoteLocallyEl");
let d = new Date();
dateText.textContent = `${d.getDate()} - ${
  d.getMonth() + 1
} - ${d.getFullYear()}`;
moreIcon.textContent = "...";
// FAB Code
microphoneFAB.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" height="17.6" width="13.2" viewBox="0 0 384 512"><!--!Font Awesome Free 6.5.1 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license/free Copyright 2023 Fonticons, Inc.--><path fill="#333333" d="M192 0C139 0 96 43 96 96V256c0 53 43 96 96 96s96-43 96-96V96c0-53-43-96-96-96zM64 216c0-13.3-10.7-24-24-24s-24 10.7-24 24v40c0 89.1 66.2 162.7 152 174.4V464H120c-13.3 0-24 10.7-24 24s10.7 24 24 24h72 72c13.3 0 24-10.7 24-24s-10.7-24-24-24H216V430.4c85.8-11.7 152-85.3 152-174.4V216c0-13.3-10.7-24-24-24s-24 10.7-24 24v40c0 70.7-57.3 128-128 128s-128-57.3-128-128V216z"/></svg>`;
microphoneFAB.style.backgroundColor = "#ccc";
microphoneFAB.style.color = "#fff";
microphoneFAB.style.border = "none";
microphoneFAB.style.borderRadius = "50%";
microphoneFAB.style.fontSize = "30px";
microphoneFAB.style.width = "40px";
microphoneFAB.style.aspectRatio = 1;
microphoneFAB.style.cursor = "pointer";
microphoneFAB.style.position = "absolute";
microphoneFAB.style.bottom = "10px";
microphoneFAB.style.right = "10px";
microphoneFAB.style.boxShadow = "0 2px 5px rgba(0, 0, 0, 0.2)";
microphoneFAB.style.transition = "background-color 0.3s ease";
if (navigator.onLine) {
  microphoneFAB.style.opacity = 1;
} else {
  microphoneFAB.style.pointerEvents = "none";
  microphoneFAB.style.opacity = 0.5;
}
microphoneFAB.style.display = "none";
// End of FAB Code

let noteContent = document.createElement("div");
noteContainer.style.color = "black";
noteContainer.style.position = "absolute";
noteContainer.style.right = "10px";
noteContainer.style.top = "10px";
noteContainer.style.transition = "all 0.0001s ease-out";
noteContainer.style.zIndex = 999999999999999;
noteContainer.style.fontSize = "14px";
noteContainer.style.width = "fit-content";
noteContainer.style.height = "fit-content";
noteContainer.style.display = "flex";
noteContainer.style.flexDirection = "column";
noteContainer.style.boxShadow = "0.4px 0.4px 10px 0.01px black";
noteContainer.style.transform = "scale(0)";
noteContainer.style.transformOrigin = "top left";
noteContainer.style.transition = "transform 1s ease-out";
noteRow.style.minWidth = "180px";
noteRow.style.minHeight = "25px";
noteRow.style.maxWidth = "100%";
noteRow.style.backgroundColor = "#ccc";
noteRow.style.height = "25px";
noteRow.style.cursor = "move";
noteRow.style.display = "flex";
noteRow.style.flexDirection = "row";
noteRow.style.justifyContent = "space-between";
noteRow.style.alignItems = "center";
noteRow.style.paddingInline = "5px";
noteContent.contentEditable = true;
noteContent.style.minWidth = "180px";
noteContent.style.width = "180px";
noteContent.style.minHeight = "100px";
noteContent.style.padding = "5px";
noteContent.style.height = "176px";
noteContent.style.overflow = "auto";
noteContent.style.backgroundColor = "#f5f5f5";
noteContent.style.outline = "none";
noteContent.style.resize = "both";
moreIcon.style.display = "inline-block";
moreIcon.style.fontSize = "20px";
moreIcon.style.fontWeight = "bolder";
moreIcon.style.letterSpacing = "1.2px";
moreIcon.style.padding = "0px";
moreIcon.style.marginTop = "-10px";
moreIcon.style.textAlign = "center";
moreIcon.style.overflow = "hidden";

// moreIcon.style.verticalAlign = "middle";
dateText.style.margin = "0px";
dateText.style.display = "inline-flex";
dateText.style.fontSize = "10px";
themeContainer.append(
  redTheme,
  blueTheme,
  yellowTheme,
  greenTheme,
  mintTheme,
  blackTheme,
  whiteTheme
);
moreContent.append(themeContainer, deleteText, saveNoteLocallyBtn);
noteRow.append(moreIcon, dateText, acctIcon);
noteContent.append(microphoneFAB);
noteContainer.append(noteRow, noteContent, moreContent);
let active = false;
let currentX, currentY, initialX, initialY;
noteRow.addEventListener("mousedown", dragStart);
noteRow.addEventListener("mouseup", dragEnd);
// noteRow.addEventListener("mouseout", dragEnd);
noteRow.addEventListener("mousemove", drag);

function dragStart(e) {
  e.preventDefault();
  let rect = noteContainer.getBoundingClientRect();
  initialX = e.clientX - rect.left;
  initialY = e.clientY - rect.top;
  active = true;
  console.log(rect.height);
  console.log(rect.width);
}

function dragEnd() {
  active = false;
}

function drag(e) {
  if (!active) {
    return;
  }

  // if (
  //   noteContainer.getBoundingClientRect().left < 10 ||
  //   noteContainer.getBoundingClientRect().top < 10
  // ) {
  //   dragEnd();
  //   currentX = e.clientX - initialX;
  //   currentY = e.clientY - initialY;
  //   noteContainer.style.left = currentX + 10 + "px";
  //   noteContainer.style.top = currentY + 10 + "px";
  //   return;
  // }

  e.preventDefault();
  currentX = e.clientX - initialX;
  currentY = e.clientY - initialY;
  noteContainer.style.left = currentX + "px";
  noteContainer.style.top = currentY + "px";
  // updatePosition();
}

// function updatePosition() {}

// Assuming you have event listeners set up elsewhere
noteRow.addEventListener("mousedown", dragStart);
document.addEventListener("mouseup", dragEnd);
document.addEventListener("mousemove", drag);

document.body.append(noteContainer);

let containerEl = document.querySelector(".container_");
let themeContainerEl = document.querySelector(".theme_");
let themeEls = document.querySelectorAll(".container_ div");
let containerButtonEl = document.querySelector(".container_ button");
let saveNoteLocallyBtnEl = document.querySelector(
  ".container_ .saveNoteLocallyEl"
);
let moreIconEl = document.querySelector(".noteMoreIcon_");
containerEl.style.minWidth = "180px";
containerEl.style.width = "100%";
containerEl.style.height = "88px";
containerEl.style.background = "white";
containerEl.style.position = "absolute";
containerEl.style.top = "0px";
containerEl.style.left = "0px";
containerEl.style.transform = "scaleY(0)";
containerEl.style.transformOrigin = "top";
containerEl.style.transition = "all 0.1s ease-in";
themeContainerEl.style.display = "flex";
themeContainerEl.style.width = "100%";
themeContainerEl.style.height = "35px";
themeContainerEl.style.background = "black";
themeContainerEl.style.flexDirection = "row";
themeContainerEl.style.marginBottom = "0px";
moreIconEl.addEventListener("mouseover", () => {
  containerEl.style.transform = "scaleY(1)";
});
containerEl.addEventListener("mouseover", () => {
  containerEl.style.transform = "scaleY(1)";
});
containerEl.addEventListener("mouseleave", () => {
  containerEl.style.transform = "scaleY(0)";
});
let themeArr = ["red", "blue", "yellow", "green", "mint", "black", "white"];
themeEls.forEach((element) => {
  element.style.width = "calc(100% / 7)";
  element.style.height = "35px";
  if (element.className == "red_") {
    element.style.background = "#c54245";
    element.addEventListener("click", () => {
      noteContent.style.backgroundColor = "#c54245";
      noteContent.style.color = "#ECECEE";
      noteRow.style.backgroundColor = "#B12E31";
      noteRow.style.color = "#ECECEE";
      localStorage.setItem("theme", "christmasMode");
    });
  } else if (element.className == "blue_") {
    element.style.background = "#89ABE3FF";
    element.addEventListener("click", () => {
      noteContent.style.backgroundColor = "#89ABE3FF";
      noteContent.style.color = "#FCF6F5FF";
      noteRow.style.backgroundColor = "#6C8DB7FF";
      noteRow.style.color = "#FCF6F5FF";
      localStorage.setItem("theme", "winterMode");
    });
  } else if (element.className == "yellow_") {
    element.style.background = "#F2AA4CFF";
    element.addEventListener("click", () => {
      noteContent.style.backgroundColor = "#F2AA4CFF";
      noteContent.style.color = "#101820FF";
      noteRow.style.backgroundColor = "#D1883AFF";
      noteRow.style.color = "#101820FF";
      localStorage.setItem("theme", "yellowMode");
    });
  } else if (element.className == "green_") {
    element.style.background = "#2BAE66FF";
    element.addEventListener("click", () => {
      noteContent.style.backgroundColor = "#2BAE66FF";
      noteContent.style.color = "#FCF6F5FF";
      noteRow.style.backgroundColor = "#1D8E4DFF";
      noteRow.style.color = "#FCF6F5FF";
      localStorage.setItem("theme", "islandWhiteMode");
    });
  } else if (element.className == "mint_") {
    element.style.background = "#ADEFD1FF";
    element.addEventListener("click", () => {
      noteContent.style.backgroundColor = "#222";
      noteContent.style.color = "#ADEFD1FF";
      noteRow.style.backgroundColor = "#111";
      noteRow.style.color = "#ADEFD1FF";
      localStorage.setItem("theme", "mintMode");
    });
  } else if (element.className == "black_") {
    element.style.background = "#101820FF";
    element.addEventListener("click", () => {
      noteContent.style.backgroundColor = "#101820FF";
      noteContent.style.color = "#ddd";
      noteRow.style.backgroundColor = "#080C14FF";
      noteRow.style.color = "#ddd";
      localStorage.setItem("theme", "blackMode");
    });
  } else if (element.className == "white_") {
    element.style.background = "#dddccc";
    element.addEventListener("click", () => {
      noteContent.style.backgroundColor = "#f5f5f5";
      noteContent.style.color = "black";
      noteRow.style.backgroundColor = "#ccc";
      noteRow.style.color = "black";
      localStorage.setItem("theme", "whiteMode");
    });
  }
});

// Styling Delete button on the sticky note
containerButtonEl.style.padding = "5px 10px";
containerButtonEl.style.marginTop = "0px";
containerButtonEl.style.display = "block";
containerButtonEl.style.border = "none";
containerButtonEl.style.width = "100%";
containerButtonEl.style.textAlign = "left";

// Styling Save note locally button on the sticky note
saveNoteLocallyBtnEl.style.padding = "5px 10px";
saveNoteLocallyBtnEl.style.marginTop = "0px";
saveNoteLocallyBtnEl.style.display = "flex";
saveNoteLocallyBtnEl.style.border = "none";
saveNoteLocallyBtnEl.style.width = "100%";
saveNoteLocallyBtnEl.style.textAlign = "left";
saveNoteLocallyBtnEl.style.cursor = "pointer";
saveNoteLocallyBtnEl.style.flexFlow = "row wrap";
saveNoteLocallyBtnEl.style.columnGap = "5px";
saveNoteLocallyBtnEl.style.alignItems = "center";
saveNoteLocallyBtnEl.style.borderTop = "1px solid #aaa";
saveNoteLocallyBtnEl.style.borderBottom = "1px solid #aaa";

// Function to check if the user has exceeded the limit
function hasExceededLimit() {
  const currentDate = new Date();
  const currentMonth = currentDate.getMonth() + 1; // Months are zero-based, so add 1
  const storageKey = `userActions_${currentMonth}`;

  // Retrieve the count from local storage
  const userActionCount = parseInt(localStorage.getItem(storageKey)) || 0;

  // Check if the user has exceeded the limit
  return userActionCount >= 10;
}

// Function to perform the user action
function saveLocally() {
  if (hasExceededLimit()) {
    openPaymentPage();
    return;
  }

  // Perform the user action
  const blob = new Blob([noteContent.textContent], {
    type: "text/plain",
  });
  const fileUrl = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.download = "inscribe_note";
  link.href = fileUrl;
  link.click();
  // Update the count in local storage
  const currentDate = new Date();
  const currentMonth = currentDate.getMonth() + 1; // Months are zero-based, so add 1
  const storageKey = `userActions_${currentMonth}`;

  // Retrieve the current count or default to 0
  const userActionCount = parseInt(localStorage.getItem(storageKey)) || 0;

  // Increment the count
  localStorage.setItem(storageKey, userActionCount + 1);

  console.log("User action performed successfully.");
}

// Saving notes locally
saveNoteLocallyBtnEl.addEventListener("click", () => {
  getUser()
    .then((user) => {
      if (user.paid) {
        const blob = new Blob([noteContent.textContent], {
          type: "text/plain",
        });
        const fileUrl = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.download = "inscribe_note";
        link.href = fileUrl;
        link.click();
      } else {
        saveLocally();
      }
    })
    .catch((err) => {
      // document.querySelector("p").innerHTML =
      //   "Error fetching data :( Check that your ExtensionPay id is correct and you're connected to the internet";
    });
});

// Auto saving
// var liveSavingNote = "";
// const customEevent = new Event("contentChange");
// const observer = new MutationObserver((mutations) => {
//   mutations.forEach((mutation) => {
//     // console.log("Change detected: ", mutation);
//     liveSavingNote = noteContent.textContent;
//     const lines = liveSavingNote;
//     let storedTextArray = [];
//     storedTextArray = [...storedTextArray, ...lines];
//     var arrayStr = JSON.stringify(storedTextArray);
//     // console.log(arrayStr);
//     localStorage.setItem("liveNote", arrayStr);
//   });
// });
// const config = { attributes: true, childList: true, subtree: true };
// observer.observe(noteContent, config);
// noteContent.addEventListener("change", () => {
//   if (previousValue !== noteContent.textContent) {
//     previousValue = noteContent.textContent;
//     noteContent.dispatchEvent(customEevent);
//   }
// });

// var value, arrLocalStr;
// noteContent.addEventListener("change", (e) => {
//   liveSavingNote = noteContent.innerText;
//   const lines = liveSavingNote.split("\n");
//   let storedTextArray = [];
//   storedTextArray = [...storedTextArray, ...lines];
//   var arrayStr = JSON.stringify(storedTextArray);
//   console.log(arrayStr);
//   localStorage.setItem("liveNote", arrayStr);
// });
let previousValue = noteContent.textContent;

noteContent.addEventListener("input", () => {
  if (previousValue !== noteContent.textContent) {
    previousValue = noteContent.textContent;
    const event = new Event("change");
    noteContent.dispatchEvent(event);
  }
});

var value, arrLocalStr;
var liveSavingNote = "";
noteContent.addEventListener("change", (e) => {
  liveSavingNote = noteContent.innerText;
  const lines = liveSavingNote.split("\n");
  let storedTextArray = [];
  storedTextArray = [...storedTextArray, ...lines];
  var arrayStr = JSON.stringify(storedTextArray);
  // console.log(arrayStr);
  localStorage.setItem("liveNote", arrayStr);
});
value = localStorage.getItem("liveNote");
if (value) {
  arrLocalStr = JSON.parse(value);
  noteContent.innerHTML += arrLocalStr.join("<br>");
}
let themeValue = localStorage.getItem("theme");
if (themeValue === "christmasMode") {
  noteContent.style.backgroundColor = "#c54245";
  noteContent.style.color = "#ECECEE";
  noteRow.style.backgroundColor = "#B12E31";
  noteRow.style.color = "#ECECEE";
} else if (themeValue === "winterMode") {
  noteContent.style.backgroundColor = "#89ABE3FF";
  noteContent.style.color = "#FCF6F5FF";
  noteRow.style.backgroundColor = "#6C8DB7FF";
  noteRow.style.color = "#FCF6F5FF";
} else if (themeValue === "yellowMode") {
  noteContent.style.backgroundColor = "#F2AA4CFF";
  noteContent.style.color = "#101820FF";
  noteRow.style.backgroundColor = "#D1883AFF";
  noteRow.style.color = "#101820FF";
} else if (themeValue === "islandWhiteMode") {
  noteContent.style.backgroundColor = "#2BAE66FF";
  noteContent.style.color = "#FCF6F5FF";
  noteRow.style.backgroundColor = "#1D8E4DFF";
  noteRow.style.color = "#FCF6F5FF";
} else if (themeValue === "mintMode") {
  noteContent.style.backgroundColor = "#222";
  noteContent.style.color = "#ADEFD1FF";
  noteRow.style.backgroundColor = "#111";
  noteRow.style.color = "#ADEFD1FF";
} else if (themeValue === "blackMode") {
  noteContent.style.backgroundColor = "#101820FF";
  noteContent.style.color = "#ddd";
  noteRow.style.backgroundColor = "#080C14FF";
  noteRow.style.color = "#ddd";
} else if (themeValue === "whiteMode") {
  noteContent.style.backgroundColor = "#f5f5f5";
  noteContent.style.color = "#000";
  noteRow.style.backgroundColor = "#ccc";
  noteRow.style.color = "#000";
}

let delTxtEl = document.querySelector(".delTxt");
delTxtEl.style.cursor = "pointer";
delTxtEl.addEventListener("click", () => {
  let confirmDel = confirm("Are you sure you want to delete note?");
  if (!confirmDel) return;
  noteContent.style.backgroundColor = "#f5f5f5";
  noteContent.style.color = "#000";
  noteRow.style.backgroundColor = "#ccc";
  noteRow.style.color = "#000";
  localStorage.setItem("liveNote", "");
  localStorage.setItem("theme", "whiteMode");
  noteContainer.style.transform = "scale(0)";
  localStorage.setItem("isStickyNote", "false");
  noteContainer.remove();
});
if (localStorage.getItem("isStickyNote") == "true") {
  noteContainer.style.transform = "scale(1)";
} else if (localStorage.getItem("isStickyNote") == "false") {
  noteContainer.style.transform = "scale(0)";
} else {
  noteContainer.style.transform = "scale(0)";
}
chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
  if (request.action === "runContentScript") {
    document.body.append(noteContainer);
    noteContainer.style.transform = "scale(1)";
    noteContent.textContent = "";
    localStorage.setItem("isStickyNote", "true");
    sendResponse({ msg: "Done" });
  }
});
// FAB Code
let microphoneEl = document.querySelector(".microphone__");

microphoneEl.addEventListener("click", () => {
  var speech = true;
  window.SpeechRecognition = window.webkitSpeechRecognition;
  const recognition = new SpeechRecognition();
  recognition.interimResults = false;
  recognition.addEventListener("result", (e) => {
    const transcript = Array.from(e.results)
      .map((result) => result[0])
      .map((result) => result.transcript);
    let speechValue = transcript + " ";
    noteContent.textContent += speechValue;
    // noteContent.dispatchEvent(customEevent);
    noteContent.append(microphoneFAB);
  });
  if (speech == true) {
    recognition.start();
  }
  speech = false;
});
// End of FAB Code

noteContent.addEventListener("change", (e) => {
  getTimePhrasesFromNote();
});
// console.log(getTimePhrasesFromNote());

function getTimePhrasesFromNote() {
  const noteText = noteContent.innerText;
  const timePhrases = noteText.match(/(\d{1,2}(:\d{2})?\s?[ap]m)/gi);
  const fTimePhrases = formatTimeStrings(timePhrases);
  return fTimePhrases;
}

function printAlertsWhenTimeIsReachedOrPassed() {
  const timePhrases = getTimePhrasesFromNote();
  if (!timePhrases) {
    return;
  }

  const currentTime = new Date();
  const currentTimeString = currentTime.toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });
  timePhrases.forEach((timePhrase) => {
    if (timePhrase == currentTimeString) {
      alert("Time is up!");
    }
  });
}

function checkTimePhrase() {
  setInterval(printAlertsWhenTimeIsReachedOrPassed, 10000);
}

function highlightTimePhrases() {
  const timePhrases = getTimePhrasesFromNote();
  if (!timePhrases) {
    return;
  }

  const noteText = noteContent.innerText;
  const lines = noteText.split("\n");
  // console.log(lines);
  const highlightedLines = lines.map((line) =>
    line.replace(
      /(\d{1,2}(:\d{2})?\s?[ap]m)/gi,
      "<span style='background-color: yellow'>$1</span>"
    )
  );

  noteContent.innerHTML = highlightedLines.join("<br>");
}
checkTimePhrase();
highlightTimePhrases();
// // // Setting alarm on the sticky note

function formatTimeString(timeString) {
  const match = timeString.match(/(\d{1,2})(:\d{2})?\s?([ap]m)/i);
  if (!match) return timeString;

  let [_, hour, minutes, period] = match;
  hour = parseInt(hour, 10);
  minutes = minutes ? minutes : ":00";
  period = period.toUpperCase();

  if (hour < 10) {
    hour = `0${hour}`;
  }

  return `${hour}${minutes} ${period}`;
}

function formatTimeStrings(timeStrings) {
  return timeStrings.map(formatTimeString);
}

// Example usage:
const times = ["7pm", "8AM", "10:30 pm", "5:45am"];
const formattedTimes = formatTimeStrings(times);
console.log(formattedTimes); // ["07:00 PM", "08:00 AM", "10:30 PM", "05:45 AM"]
