import { describe, expect, it } from "vitest";
import { Chess } from "chess.js";
import { openingAt, recognizeOpening } from "./openings";
import { fresh, gameAt, play, visit } from "./tree";

describe("bundled opening names", () => {
  it("identifies openings in a variation and its legal candidate replies", () => {
    let session = play(fresh(), "e2", "e4");
    expect(recognizeOpening(session)).toMatchObject({
      name: "King's Pawn Game",
      current: true,
    });
    const e4 = session.current;
    const sicilian = gameAt(session)
      .moves({ verbose: true })
      .find((move) => move.san === "c5")!;
    expect(openingAt(sicilian.after)).toMatchObject({
      name: "Sicilian Defense",
      eco: "B20",
    });
    session = play(session, "c7", "c5");
    expect(recognizeOpening(session)).toMatchObject({
      name: "Sicilian Defense",
    });
    session = visit(session, e4);
    session = play(session, "e7", "e5");
    expect(recognizeOpening(session)).toMatchObject({
      name: "King's Pawn Game",
      eco: "C20",
    });
  });

  it("recognizes a transposition by position, not just move order", () => {
    const game = new Chess();
    for (const san of ["c4", "d5", "d4"]) game.move(san);
    expect(openingAt(game.fen())).toMatchObject({
      name: "Queen's Gambit",
      eco: "D06",
    });
  });

  it("retains the last named position on the current path", () => {
    let session = play(fresh(), "e2", "e4");
    const unknown = gameAt(session)
      .moves({ verbose: true })
      .find((move) => !openingAt(move.after));
    expect(unknown).toBeDefined();
    session = play(session, unknown!.from, unknown!.to, unknown!.promotion);
    expect(recognizeOpening(session)).toMatchObject({
      name: "King's Pawn Game",
      current: false,
    });
  });
});
