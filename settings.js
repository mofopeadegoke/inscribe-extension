const extpaySettings = ExtPay("inscribe"),
  themeBtns = document.querySelectorAll(".theme-option");
let subscriptionTextEl = document.querySelector(".subscriptionText"),
  viewSubPlanEl = document.querySelector(".viewSubPlan");

// theme-option class -> stored theme name
const themeByOption = {
  one: "yellowMode",
  two: "blueMode",
  three: "purpleMode",
  four: "greenMode",
  five: "redMode",
  six: "pinkMode",
  seven: "darkMode",
};
themeBtns.forEach((btn) => {
  const option = Object.keys(themeByOption).find((cls) =>
    btn.classList.contains(cls)
  );
  btn.addEventListener("click", () => {
    const current = document.querySelector(".theme-option.selected");
    if (current) current.classList.remove("selected");
    btn.classList.add("selected");
    InscribeStorage.set({ popupTheme: themeByOption[option] });
    InscribeThemes.applyPopupTheme(themeByOption[option]);
  });
});

InscribeStorage.ready()
  .then(() => InscribeStorage.get("popupTheme"))
  .then(({ popupTheme }) => {
    const option = Object.keys(themeByOption).find(
      (cls) => themeByOption[cls] === popupTheme
    );
    const btn = option && document.querySelector(`.theme-option.${option}`);
    if (btn) btn.classList.add("selected");
    InscribeThemes.applyPopupTheme(popupTheme);
  });
extpaySettings
  .getUser()
  .then((user) => {
    if (user.paid) {
      subscriptionTextEl.textContent =
        "You are currently using Inscribe Premium";
    } else if (InscribePremium.isPremium(user)) {
      subscriptionTextEl.textContent =
        "You are currently on the Inscribe Premium free trial";
    } else {
      subscriptionTextEl.textContent =
        " You are currently using the free version of Inscribe";
    }
  })
  .catch((err) => {
    if (subscriptionTextEl) {
      subscriptionTextEl.textContent =
        " An error occured! Check your internet connection";
    }
  });
if (viewSubPlanEl) {
  viewSubPlanEl.addEventListener("click", extpaySettings.openPaymentPage);
}
