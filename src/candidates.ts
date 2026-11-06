import type { Chess, Move } from "chess.js";
import { notes } from "./notes";
import { openingAt, type Opening } from "./openings";

export type Candidate = {
  move: Move;
  opening?: Opening;
  explanation?: string;
};

// Candidates arrive in display order, whether ranked by the engine or not.
export function nextUnexploredCandidate(
  candidates: Candidate[],
  explored: ReadonlySet<string>,
): Candidate | undefined {
  return candidates.find(({ move }) => !explored.has(move.lan)) ?? candidates[0];
}

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
