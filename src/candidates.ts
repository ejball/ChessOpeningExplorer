import type { Chess, Move } from "chess.js";
import { notes } from "./notes";
import { openingAt, type Opening } from "./openings";

export type Candidate = {
  move: Move;
  opening?: Opening;
  explanation?: string;
};

// An opening label or explanation is context, not a ranking of move quality.
export function candidatesFor(game: Chess): Candidate[] {
  const path = game.history();
  return game
    .moves({ verbose: true })
    .map((move) => {
      const note = notes[[...path, move.san].join(" ")];
      return {
        move,
        opening: openingAt(move.after),
        explanation: note?.segments.map((segment) => segment.text).join(""),
      };
    })
    .sort((a, b) => {
      const aHasContext = Boolean(a.opening || a.explanation);
      const bHasContext = Boolean(b.opening || b.explanation);
      return (
        Number(bHasContext) - Number(aHasContext) ||
        a.move.san.localeCompare(b.move.san)
      );
    });
}
