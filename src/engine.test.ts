import { describe, expect, it } from "vitest";
import {
  boardScore,
  formatScore,
  Iterations,
  parseInfo,
  scoreSide,
  scoreDescription,
} from "./engine";

describe("Stockfish analysis", () => {
  it("converts UCI scores to White's perspective and parses promotions", () => {
    const line =
      "info depth 8 seldepth 10 multipv 2 score cp 35 nodes 1200 pv e7e8q a1b2";
    expect(parseInfo(line, true)).toMatchObject({
      depth: 8,
      move: { uci: "e7e8q", rank: 2, score: { kind: "cp", value: 35 } },
    });
    expect(parseInfo(line, false)?.move.score.value).toBe(-35);
    expect(
      parseInfo("info depth 5 multipv 1 score mate -3 pv g1f3", false)?.move
        .score,
    ).toEqual({ kind: "mate", value: 3 });
    expect(formatScore({ kind: "mate", value: -3 })).toBe("Black mates in 3");
    expect(formatScore({ kind: "cp", value: -35 })).toBe("-0.35");
  });

  it("shows a positive magnitude and the advantaged side on the board", () => {
    expect(boardScore({ kind: "cp", value: -125 })).toBe("+1.25");
    expect(scoreDescription({ kind: "cp", value: -125 })).toBe(
      "Black ahead by 1.25",
    );
    expect(scoreSide({ kind: "cp", value: -125 })).toBe("black");
    expect(boardScore({ kind: "cp", value: 35 })).toBe("+0.35");
    expect(scoreSide({ kind: "cp", value: 0 })).toBe("neutral");
    expect(boardScore({ kind: "mate", value: -3 })).toBe("M3");
    expect(scoreDescription({ kind: "mate", value: -3 })).toBe(
      "Black mates in 3",
    );
  });

  it("ignores bounds and incomplete lines", () => {
    expect(
      parseInfo("info depth 9 multipv 1 score cp 35 lowerbound pv e2e4", true),
    ).toBeUndefined();
    expect(parseInfo("info depth 9 nodes 50", true)).toBeUndefined();
  });

  it("publishes a ranking only when every move is present at the same depth", () => {
    const iterations = new Iterations(2);
    const first = {
      uci: "e2e4",
      rank: 1,
      score: { kind: "cp" as const, value: 20 },
    };
    const second = {
      uci: "d2d4",
      rank: 2,
      score: { kind: "cp" as const, value: 10 },
    };
    expect(iterations.add(4, first)).toBeUndefined();
    expect(iterations.add(5, second)).toBeUndefined();
    expect(iterations.add(4, second)).toEqual([first, second]);
    expect(iterations.add(5, first)).toEqual([first, second]);
    expect(new Iterations(2).add(4, { ...first, rank: 3 })).toBeUndefined();
  });
});
