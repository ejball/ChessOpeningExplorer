import { describe, expect, it } from "vitest";
import { parseMoveVisibility } from "./moveVisibility";

describe("move visibility preferences", () => {
  it("hides the user's moves and shows opponent moves by default", () => {
    expect(parseMoveVisibility(null)).toEqual({ own: false, opponent: true });
  });
  it("restores both independent choices", () => {
    expect(parseMoveVisibility('{"own":true,"opponent":false}')).toEqual({
      own: true,
      opponent: false,
    });
    expect(parseMoveVisibility('{"own":false,"opponent":false}')).toEqual({
      own: false,
      opponent: false,
    });
  });
  it("uses safe defaults for corrupted or incomplete data", () => {
    for (const value of [
      "{",
      "null",
      "{}",
      '{"own":"true","opponent":true}',
      '{"own":true}',
    ]) {
      expect(parseMoveVisibility(value)).toEqual({
        own: false,
        opponent: true,
      });
    }
  });
});
