import { Chess } from "chess.js";
import { describe, expect, it } from "vitest";
import { candidatesFor } from "./candidates";

describe("candidate context", () => {
  it("shows a named opening and curated explanation without changing the position", () => {
    const game = new Chess();
    game.move("e4");
    const fen = game.fen();
    const candidates = candidatesFor(game);
    const sicilian = candidates.find(({ move }) => move.san === "c5");
    expect(sicilian?.opening?.name).toBe("Sicilian Defense");
    expect(sicilian?.explanation).toBe(
      "Black uses the c-pawn to control d4 without mirroring White’s central pawn. A later exchange on d4 can leave Black with an extra central pawn.",
    );
    expect(game.fen()).toBe(fen);
    expect(game.history()).toEqual(["e4"]);
  });

  it("puts moves with context before moves without it", () => {
    const game = new Chess();
    game.move("e4");
    const candidates = candidatesFor(game);
    const contextual = candidates.filter(
      (item) => item.opening || item.explanation,
    );
    const plain = candidates.filter(
      (item) => !item.opening && !item.explanation,
    );
    expect(contextual.length).toBeGreaterThan(0);
    expect(plain.length).toBeGreaterThan(0);
    expect(candidates.slice(0, contextual.length)).toEqual(contextual);
    expect(candidates.slice(contextual.length)).toEqual(plain);
  });

  it("offers the French advance explanation after Black challenges the center", () => {
    const game = new Chess();
    for (const move of ["e4", "e6", "d4", "d5"]) game.move(move);
    const before = game.fen();
    const advance = candidatesFor(game).find(({ move }) => move.san === "e5");
    expect(advance?.explanation).toContain("restricting Black’s kingside knight");
    expect(game.fen()).toBe(before);
  });
});
