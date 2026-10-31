// Convert the pinned Lichess TSV snapshot into a compact position index.
import { readFileSync, writeFileSync } from "node:fs";
import { Chess } from "chess.js";

const positions = {};
let count = 0;
for (const volume of ["a", "b", "c", "d", "e"]) {
  const rows = readFileSync(`data/openings/${volume}.tsv`, "utf8")
    .trim()
    .split(/\r?\n/)
    .slice(1);
  for (const row of rows) {
    const [eco, name, pgn] = row.split("\t");
    const game = new Chess();
    try {
      game.loadPgn(pgn);
    } catch (error) {
      throw new Error(`Invalid ${eco} opening ${name}: ${error.message}`);
    }
    const position = game.fen().split(" ").slice(0, 4).join(" ");
    (positions[position] ??= []).push([eco, name]);
    count++;
  }
}
writeFileSync("src/data/openings.json", JSON.stringify(positions) + "\n");
console.log(
  `Indexed ${count} opening lines across ${Object.keys(positions).length} positions.`,
);
