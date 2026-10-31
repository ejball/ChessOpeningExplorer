import { describe, it, expect } from "vitest";
import { fresh, gameAt, key, play, preferredLine, visit } from "./tree";
describe("exploration history", () => {
  it("keeps variations and restores their positions", () => {
    let s = fresh();
    s = play(s, "e2", "e4");
    const e4 = s.current;
    s = play(s, "e7", "e5");
    const e5 = s.current;
    s = visit(s, e4);
    s = play(s, "c7", "c5");
    expect(s.nodes[e4].children).toHaveLength(2);
    const c5 = s.current;
    expect(s.nodes[e4].preferred).toBe(c5);
    const revisited = visit(s, e5);
    expect(revisited.nodes[e4].preferred).toBe(e5);
    expect(revisited.nodes[e4].children).toEqual([e5, c5]);
    expect(gameAt(visit(s, e5)).history()).toEqual(["e4", "e5"]);
    expect(gameAt(s).history()).toEqual(["e4", "c5"]);
    expect(s.visits[key(s.nodes[e4].fen)].viewCount).toBe(2);
  });
  it("follows the most recently selected continuation after backtracking", () => {
    let s = play(fresh(), "e2", "e4");
    const e4 = s.current;
    s = play(s, "e7", "e5");
    const e5 = s.current;
    s = play(s, "g1", "f3");
    s = visit(s, e4);
    s = play(s, "c7", "c5");
    s = visit(s, e4);
    expect(preferredLine(s).map((move) => move.san)).toEqual(["c5"]);
    s = visit(s, e5);
    s = visit(s, e4);
    expect(preferredLine(s).map((move) => move.san)).toEqual(["e5", "Nf3"]);
  });
  it("rejects illegal moves and reuses an existing branch", () => {
    let s = fresh();
    expect(play(s, "e2", "e5")).toBe(s);
    s = play(s, "e2", "e4");
    const id = s.current;
    s = visit(s, "root");
    s = play(s, "e2", "e4");
    expect(s.current).toBe(id);
    expect(s.nodes.root.children).toHaveLength(1);
  });
  it("tracks repetition across the full path", () => {
    let s = fresh();
    for (let i = 0; i < 2; i++) {
      s = play(s, "g1", "f3");
      s = play(s, "g8", "f6");
      s = play(s, "f3", "g1");
      s = play(s, "f6", "g8");
    }
    expect(gameAt(s).isThreefoldRepetition()).toBe(true);
    expect(s.visits[key(s.nodes.root.fen)].viewCount).toBe(3);
  });
  it("preserves promotion choice and full game state", () => {
    let s = fresh();
    for (const [a, b] of [
      ["a2", "a4"],
      ["h7", "h5"],
      ["a4", "a5"],
      ["h5", "h4"],
      ["a5", "a6"],
      ["h4", "h3"],
      ["a6", "b7"],
      ["h3", "g2"],
      ["b7", "a8"],
    ] as const)
      s = play(s, a, b, "n");
    expect(gameAt(s).get("a8")?.type).toBe("n");
    expect(s.nodes[s.current].san).toContain("=N");
  });
});
