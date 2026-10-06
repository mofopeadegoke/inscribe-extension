// Finds 12-hour clock times ("7pm", "10:30 pm", "9 a.m.") in note text.
(function (root) {
  const TIME_PATTERN = /\b(\d{1,2})(?::([0-5]\d))?\s?([ap])\.?m\b/gi;

  function pad(n) {
    return String(n).padStart(2, "0");
  }

  // Returns every valid time in the text, in order, with its position.
  function findTimes(text) {
    const found = [];
    if (!text) return found;
    for (const match of String(text).matchAll(TIME_PATTERN)) {
      const hour12 = parseInt(match[1], 10);
      if (hour12 < 1 || hour12 > 12) continue;
      const minute = match[2] ? parseInt(match[2], 10) : 0;
      const isPm = match[3].toLowerCase() === "p";
      const hour = (hour12 % 12) + (isPm ? 12 : 0);
      found.push({
        index: match.index,
        length: match[0].length,
        hour,
        minute,
        label: `${pad(hour12)}:${pad(minute)} ${isPm ? "PM" : "AM"}`,
      });
    }
    return found;
  }

  // Distinct times in the text as {hour (0-23), minute, label}.
  function extractTimes(text) {
    const seen = new Set();
    const times = [];
    for (const { hour, minute, label } of findTimes(text)) {
      if (seen.has(label)) continue;
      seen.add(label);
      times.push({ hour, minute, label });
    }
    return times;
  }

  // Splits text into [{text, isTime}] runs so callers can highlight times
  // without building HTML strings.
  function splitByTimes(text) {
    const parts = [];
    let last = 0;
    for (const { index, length } of findTimes(text)) {
      if (index > last) parts.push({ text: text.slice(last, index), isTime: false });
      parts.push({ text: text.slice(index, index + length), isTime: true });
      last = index + length;
    }
    if (last < (text || "").length) parts.push({ text: text.slice(last), isTime: false });
    return parts;
  }

  // The next moment the time occurs: later today, or tomorrow if it has passed.
  function nextOccurrence({ hour, minute }, now = new Date()) {
    const when = new Date(now);
    when.setHours(hour, minute, 0, 0);
    if (when <= now) when.setDate(when.getDate() + 1);
    return when;
  }

  const api = { findTimes, extractTimes, splitByTimes, nextOccurrence };
  if (typeof module === "object" && module.exports) {
    module.exports = api;
  } else {
    root.InscribeTimes = api;
  }
})(globalThis);
