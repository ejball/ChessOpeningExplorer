# Bundled data

## Opening names

`openings/a.tsv` through `openings/e.tsv` are a snapshot of the five ECO-volume files from [Lichess chess-openings at commit 712a58be746c143f4ab935b68acc50f4bac813eb](https://github.com/lichess-org/chess-openings/tree/712a58be746c143f4ab935b68acc50f4bac813eb). Each file contains ECO codes, opening names, and example move sequences. `openings/COPYING.txt` is the source project's CC0 1.0 dedication, from the same commit. The upstream project describes this collection as public-domain data under CC0.

The app does not download these files at runtime. Run `npm ci` followed by `npm run generate:openings` from the repository root to rebuild `src/data/openings.json`. The generator replays each source line using chess.js and indexes its final position, keeping turn, castling rights, and legal en-passant availability while excluding move counters. The JSON index is committed so ordinary builds do not need to regenerate it or access the network.

The Merida piece images are separate from this directory, in `src/assets/merida/`. They are by Armando Hernandez Marroquin, obtained from [Lichess at commit 4dcff2a4653c092a5e333fd6843e37c5f0277882](https://github.com/lichess-org/lila/tree/4dcff2a4653c092a5e333fd6843e37c5f0277882/public/piece/merida), and licensed GPL-2.0-or-later. That directory includes the GPL-2.0 license text. See [Lichess's source and license notes](https://github.com/lichess-org/lila/blob/4dcff2a4653c092a5e333fd6843e37c5f0277882/COPYING.md).

## Chess engine

`public/engine/` contains the unmodified Stockfish.js 19.0.1 lite, single-threaded JavaScript and WebAssembly release files, plus the GPL-3.0 license text. They are from the [Stockfish.js v19.0.1 release](https://github.com/nmrugg/stockfish.js/releases/tag/v19.0.1), maintained by Nathan Rugg and contributors, based on [Stockfish](https://github.com/official-stockfish/Stockfish). The corresponding Stockfish.js and engine source and build scripts are available at [the v19.0.1 source tag](https://github.com/nmrugg/stockfish.js/tree/v19.0.1).

The release assets have SHA-256 hashes `ccb130d7ff29408531c47d859a49f91d59d4f482d05a53eb1a3231a4f624c91a` (JavaScript) and `ee4f115bdb2d32cadf96cada104a05b5ec257d7ad6f57582190b49bc71f096de` (WebAssembly). The application serves them locally and uses a browser worker; it does not send positions to a remote engine.

## Explanation source material

`wikibooks/chess-opening-theory.json` is a local snapshot of 19 selected pages from [Chess Opening Theory on Wikibooks](https://en.wikibooks.org/wiki/Chess_Opening_Theory), retrieved on 2026-11-01 using the MediaWiki API (`action=query`, `prop=revisions|info`, `rvprop=ids|timestamp|content`, `rvslots=main`). Each record includes the page title, page ID, URL, revision ID, revision timestamp, and unmodified source wikitext. The source material belongs to its Wikibooks contributors; each page's history identifies them. A revision can be viewed at `https://en.wikibooks.org/w/index.php?oldid=REVISION_ID`. The snapshot is limited to pages used for the current explanations, and can be extended as those explanations grow.

Wikibooks reports its text license as [Creative Commons Attribution-ShareAlike 4.0](https://creativecommons.org/licenses/by-sa/4.0/); the license text is in `wikibooks/CC-BY-SA-4.0.txt`. Source pages can contain separately attributed quotations and other material; these have not been reused in the explanations. The app's explanations in `src/notes.ts` are newly written adaptations based on the indicated Wikibooks revisions, licensed CC BY-SA 4.0, with interactive board highlights added for this project. The app links each explanation to its source revision and credits Wikibooks contributors in About. The snapshot is source material for maintainers, is not bundled into the app, and is not fetched or summarized at runtime.
