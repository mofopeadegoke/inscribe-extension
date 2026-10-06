import { describe, it, expect } from "vitest";
import { createRequire } from "node:module";

const require = createRequire(import.meta.url);
const { extractTimes, splitByTimes, nextOccurrence } = require("../shared/timePhrases.js");

describe("extractTimes", () => {
  it("returns an empty array when there are no times (used to crash)", () => {
    expect(extractTimes("buy milk")).toEqual([]);
    expect(extractTimes("")).toEqual([]);
    expect(extractTimes(null)).toEqual([]);
  });

  it("parses common formats", () => {
    expect(extractTimes("7pm, 8AM, 10:30 pm, 5:45am, 9 a.m.")).toEqual([
      { hour: 19, minute: 0, label: "07:00 PM" },
      { hour: 8, minute: 0, label: "08:00 AM" },
      { hour: 22, minute: 30, label: "10:30 PM" },
      { hour: 5, minute: 45, label: "05:45 AM" },
      { hour: 9, minute: 0, label: "09:00 AM" },
    ]);
  });

  it("handles 12am as midnight and 12pm as noon", () => {
    expect(extractTimes("12am 12pm")).toEqual([
      { hour: 0, minute: 0, label: "12:00 AM" },
      { hour: 12, minute: 0, label: "12:00 PM" },
    ]);
  });

  it("ignores invalid hours and de-duplicates", () => {
    expect(extractTimes("13pm 0am 7pm 7 PM")).toEqual([
      { hour: 19, minute: 0, label: "07:00 PM" },
    ]);
  });
});

describe("splitByTimes", () => {
  it("splits text into time and non-time runs", () => {
    expect(splitByTimes("call at 7pm today")).toEqual([
      { text: "call at ", isTime: false },
      { text: "7pm", isTime: true },
      { text: " today", isTime: false },
    ]);
  });

  it("returns one plain run when there are no times", () => {
    expect(splitByTimes("nothing")).toEqual([{ text: "nothing", isTime: false }]);
  });
});

describe("nextOccurrence", () => {
  const now = new Date(2026, 9, 6, 15, 0); // Oct 6 2026, 3pm local

  it("is later today when the time hasn't passed", () => {
    expect(nextOccurrence({ hour: 19, minute: 0 }, now)).toEqual(new Date(2026, 9, 6, 19, 0));
  });

  it("is tomorrow when the time has passed or is now", () => {
    expect(nextOccurrence({ hour: 9, minute: 0 }, now)).toEqual(new Date(2026, 9, 7, 9, 0));
    expect(nextOccurrence({ hour: 15, minute: 0 }, now)).toEqual(new Date(2026, 9, 7, 15, 0));
  });
});
