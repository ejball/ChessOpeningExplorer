import { Chess, type Square } from "chess.js";
import { describe, expect, it } from "vitest";
import snapshotJson from "../data/wikibooks/chess-opening-theory.json?raw";
import { notes } from "./notes";

const snapshot = JSON.parse(snapshotJson) as {
  pages: { title: string; revisionId: number }[];
};

describe("curated explanations", () => {
  it("match legal move sequences to their pinned source pages and occupied annotation origins", () => {
    for (const [moves, note] of Object.entries(notes)) {
      const game = new Chess();
      for (const move of moves.split(" ")) game.move(move);

      const source = snapshot.pages.find(
        (page) => page.revisionId === note.sourceRevision,
      );
      expect(source, `Missing source for ${moves}`).toBeDefined();
      const sourceMoves = source!.title
        .split("/")
        .slice(1)
        .map((part) => part.replace(/^\d+\.(?:\.\.)?\s*/, ""))
        .join(" ");
      expect(sourceMoves).toBe(moves);
      expect(note.segments.some((segment) => segment.shapes?.length)).toBe(
        true,
      );
      for (const segment of note.segments) {
        for (const shape of segment.shapes ?? []) {
          expect(shape.orig).toMatch(/^[a-h][1-8]$/);
          expect(
            game.get(shape.orig as Square),
            `${moves}: no piece at ${shape.orig}`,
          ).toBeDefined();
        }
      }
    }
  });
});
