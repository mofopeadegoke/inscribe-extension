import { describe, it, expect } from "vitest";
import { createRequire } from "node:module";

const require = createRequire(import.meta.url);
const { formatNoteDate } = require("../shared/notes.js");

describe("formatNoteDate", () => {
  it("matches the format existing notes were saved with", () => {
    expect(formatNoteDate(new Date(2026, 9, 6))).toBe("October 6, 2026");
  });
});
