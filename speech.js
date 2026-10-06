var speechBtn = document.querySelector(".startSpeech");
var textarea = document.querySelector("#textarea");
var copyBtn = document.querySelector(".copyText"),
  errorBoxEl = document.querySelector(".error-box"),
  errorMessageEl = document.querySelector(".errorMessage"),
  closeErrorBtn = document.querySelector(".errorContent header img"),
  alertBox = document.querySelector(".alertMessage");

const Recognition = window.SpeechRecognition || window.webkitSpeechRecognition;
let recognition = null;

function showError(message) {
  errorMessageEl.textContent = message;
  errorBoxEl.classList.add("see");
}

speechBtn.addEventListener("click", () => {
  if (!Recognition) {
    showError("Speech recognition isn't supported in this browser.");
    return;
  }
  if (!navigator.onLine) {
    showError("An error occured! Check your internet connection");
    return;
  }
  if (recognition) return; // already listening

  // Text already in the box is kept; new speech is added after it.
  const before = textarea.value ? `${textarea.value} ` : "";
  recognition = new Recognition();
  recognition.interimResults = true;
  recognition.addEventListener("result", (e) => {
    const transcript = Array.from(e.results)
      .map((result) => result[0].transcript)
      .join("");
    textarea.value = before + transcript;
  });
  recognition.addEventListener("end", () => {
    recognition = null;
  });
  recognition.start();
});
copyBtn.addEventListener("click", () => {
  navigator.clipboard.writeText(textarea.value);
  alertBox.classList.add("show");
  setTimeout(() => alertBox.classList.remove("show"), 4200);
});
closeErrorBtn.addEventListener("click", () => {
  errorBoxEl.classList.remove("see");
});
