// Who gets premium features, and the free allowance for sticky-note saves.
(function (root) {
  const TRIAL_DAYS = 7;
  const DAY_MS = 24 * 60 * 60 * 1000;
  const FREE_STICKY_SAVES_PER_MONTH = 10;

  // Premium = paid, or inside the 7-day trial. trialStartedAt is a Date from
  // ExtPay, or an ISO string when the user object came through messaging.
  function isPremium(user, now = new Date()) {
    if (!user) return false;
    if (user.paid) return true;
    if (!user.trialStartedAt) return false;
    const started = new Date(user.trialStartedAt);
    const elapsed = now - started;
    return elapsed >= 0 && elapsed < TRIAL_DAYS * DAY_MS;
  }

  // chrome.storage key counting this month's free sticky-note saves.
  function freeSavesKey(date = new Date()) {
    const month = String(date.getMonth() + 1).padStart(2, "0");
    return `freeStickySaves:${date.getFullYear()}-${month}`;
  }

  function hasFreeSavesLeft(used) {
    return (used || 0) < FREE_STICKY_SAVES_PER_MONTH;
  }

  const api = { isPremium, freeSavesKey, hasFreeSavesLeft, FREE_STICKY_SAVES_PER_MONTH };
  if (typeof module === "object" && module.exports) {
    module.exports = api;
  } else {
    root.InscribePremium = api;
  }
})(globalThis);
