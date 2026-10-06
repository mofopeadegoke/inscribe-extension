import { describe, it, expect } from "vitest";
import { createRequire } from "node:module";

const require = createRequire(import.meta.url);
const { isPremium, freeSavesKey, hasFreeSavesLeft } = require("../shared/premium.js");

const now = new Date("2026-10-06T12:00:00Z");
const daysAgo = (d) => new Date(now.getTime() - d * 24 * 60 * 60 * 1000);

describe("isPremium", () => {
  it("is true for paid users", () => {
    expect(isPremium({ paid: true }, now)).toBe(true);
  });

  it("is true during the 7-day trial and false after", () => {
    expect(isPremium({ paid: false, trialStartedAt: daysAgo(3) }, now)).toBe(true);
    expect(isPremium({ paid: false, trialStartedAt: daysAgo(7) }, now)).toBe(false);
  });

  it("accepts trialStartedAt as an ISO string (from runtime messaging)", () => {
    expect(isPremium({ paid: false, trialStartedAt: daysAgo(1).toISOString() }, now)).toBe(true);
  });

  it("is false for free users and missing users", () => {
    expect(isPremium({ paid: false, trialStartedAt: null }, now)).toBe(false);
    expect(isPremium(undefined, now)).toBe(false);
  });
});

describe("free sticky-note saves", () => {
  it("keys the counter by year and month", () => {
    expect(freeSavesKey(new Date(2026, 9, 6))).toBe("freeStickySaves:2026-10");
    expect(freeSavesKey(new Date(2027, 0, 1))).toBe("freeStickySaves:2027-01");
  });

  it("allows 10 saves a month", () => {
    expect(hasFreeSavesLeft(undefined)).toBe(true);
    expect(hasFreeSavesLeft(9)).toBe(true);
    expect(hasFreeSavesLeft(10)).toBe(false);
  });
});
