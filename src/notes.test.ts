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
  it("shows the bishop's open diagonal in the Grob", () => {
    const explanation = notes.g4;
    const segment = explanation.segments.find((item) =>
      item.text.includes("opens a diagonal for the f1 bishop"),
    );
    expect(segment?.shapes).toEqual([
      { orig: "f1", dest: "h3", brush: "blue" },
    ]);
    const game = new Chess();
    game.move("g4");
    expect(game.get("f1")?.type).toBe("b");
    expect(game.get("g2")).toBeUndefined();
    expect(game.get("h3")).toBeUndefined();
  });

  it("covers every legal first move and every reply to 1. e4 and 1. d4", () => {
    const game = new Chess();
    for (const move of game.moves()) {
      expect(notes[move], `Missing explanation for 1. ${move}`).toBeDefined();
    }
    for (const firstMove of ["e4", "d4"]) {
      game.move(firstMove);
      for (const move of game.moves()) {
        expect(
          notes[`${firstMove} ${move}`],
          `Missing explanation for 1. ${firstMove} ${move}`,
        ).toBeDefined();
      }
      game.undo();
    }
  });

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

  it("matches legal move sequences to their pinned sources and validates annotation squares", () => {
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
          if (shape.dest) {
            expect(shape.dest).toMatch(/^[a-h][1-8]$/);
            expect(
              game.get(shape.orig as Square),
              `${moves}: no piece at ${shape.orig}`,
            ).toBeDefined();
          }
        }
      }
    }
  });
});
