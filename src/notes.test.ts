import { Chess, type Square } from "chess.js";
import { describe, expect, it } from "vitest";
import snapshotJson from "../data/wikibooks/chess-opening-theory.json?raw";
import completeSnapshotJson from "../data/wikibooks/complete-book.json?raw";
import manifestText from "../data/wikibooks/PROCESSING.md?raw";
import { notes } from "./notes";

const snapshot = JSON.parse(snapshotJson) as {
  pages: { title: string; revisionId: number }[];
};
const completeSnapshot = JSON.parse(completeSnapshotJson) as {
  pages: { title: string; revisionId: number }[];
};

describe("curated explanations", () => {
  it("keeps the processing manifest in sync with explained positions", () => {
    const rows = manifestText
      .split("\n")
      .filter((line) => line.startsWith("| `"))
      .map((line) => {
        const [, sequence, source, revision, status] = line
          .split("|")
          .map((value) => value.trim());
        return { sequence: sequence.slice(1, -1), source, revision, status };
      });
    const explained = rows.filter((row) => row.status === "explained");
    const titles = new Set<string>();
    const currentRevisions = new Map(
      completeSnapshot.pages.map((page) => [page.title, page.revisionId]),
    );
    for (const row of rows) {
      const label = row.source.match(/^\[([^\]]+)\]\(/)?.[1];
      expect(label, `Invalid source link: ${row.source}`).toBeDefined();
      const title =
        label === "Chess Opening Theory"
          ? label
          : `Chess Opening Theory/${label}`;
      expect(currentRevisions.has(title), `Unknown source page: ${title}`).toBe(
        true,
      );
      expect([
        "unprocessed",
        "explained",
        "no-useful-prose",
        "duplicate-position",
        "needs-review",
      ]).toContain(row.status);
      if (row.status === "unprocessed") {
        expect(
          Number(row.revision),
          `Stale unprocessed revision: ${title}`,
        ).toBe(currentRevisions.get(title));
      }
      expect(row.source).toContain(`oldid=${row.revision}`);
      titles.add(title);
    }
    expect(titles.size).toBe(completeSnapshot.pages.length);
    expect(explained).toHaveLength(Object.keys(notes).length);
    const seen = new Set<string>();
    for (const row of explained) {
      expect(
        seen.has(row.sequence),
        `Duplicate entry for ${row.sequence}`,
      ).toBe(false);
      seen.add(row.sequence);
      expect(notes[row.sequence]?.sourceRevision).toBe(Number(row.revision));
      expect(row.source).toContain(`oldid=${row.revision}`);
    }
  });

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
