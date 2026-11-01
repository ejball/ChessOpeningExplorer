# Bundled data

## Opening names

`openings/a.tsv` through `openings/e.tsv` are a snapshot of the five ECO-volume files from [Lichess chess-openings at commit 712a58be746c143f4ab935b68acc50f4bac813eb](https://github.com/lichess-org/chess-openings/tree/712a58be746c143f4ab935b68acc50f4bac813eb). Each file contains ECO codes, opening names, and example move sequences. `openings/COPYING.txt` is the source project's CC0 1.0 dedication, from the same commit. The upstream project describes this collection as public-domain data under CC0.

The app does not download these files at runtime. Run `npm ci` followed by `npm run generate:openings` from the repository root to rebuild `src/data/openings.json`. The generator replays each source line using chess.js and indexes its final position, keeping turn, castling rights, and legal en-passant availability while excluding move counters. The JSON index is committed so ordinary builds do not need to regenerate it or access the network.

The Merida piece images are separate from this directory, in `src/assets/merida/`. They are by Armando Hernandez Marroquin, obtained from [Lichess at commit 4dcff2a4653c092a5e333fd6843e37c5f0277882](https://github.com/lichess-org/lila/tree/4dcff2a4653c092a5e333fd6843e37c5f0277882/public/piece/merida), and licensed GPL-2.0-or-later. That directory includes the GPL-2.0 license text. See [Lichess's source and license notes](https://github.com/lichess-org/lila/blob/4dcff2a4653c092a5e333fd6843e37c5f0277882/COPYING.md).
