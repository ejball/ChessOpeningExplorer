# Architecture and Design Notes

## Delivery model

A static React + TypeScript web application built with Vite, hosted at GitHub Pages via GitHub Actions. No server-side runtime for MVP. Set Vite `base: '/ChessOpeningExplorer/'` for the project site. Prefer relative asset URLs and avoid client-side deep-link routing that requires server rewrites.

## Current implementation

- `src/main.tsx` coordinates the board, controls, appearance toggle, About modal, explanation pane, and move list.
- `src/tree.ts` manages the variation tree, full FENs, preferred continuations, explored moves, and versioned localStorage session.
- `src/openings.ts` reads the generated position index; `src/candidates.ts` adds available opening names and sample notes to legal moves. The [data README](../data/README.md) records sources and regeneration.
- `src/notes.ts` contains four initial sample explanations and their non-mutating board annotations.
- `src/useEngine.ts` runs the single-threaded Stockfish.js worker and cancels it when the position changes; `src/engine.ts` parses and groups complete UCI analysis iterations.
- `src/style.css` contains the responsive light/dark presentation. Production and PR previews are built by `.github/workflows/deploy.yml`.

The sections below also describe intended future capabilities; they are not all implemented yet.

## Libraries

- `chess.js`: authoritative legal move generation, SAN, full FEN, move history and game-over rules.
- `chessground`: interactive board, highlighting, arrows, move animations. Validate GPL-3.0 license compliance; publish this project's source and appropriate notices.
- React + TypeScript: presentation and state coordination.
- Vitest (plus testing-library as appropriate): unit and UI tests.
- Opening names: bundled CC0 Lichess chess-openings snapshot. Stockfish.js 19 lite runs in a browser worker. Optional live Lichess Opening Explorer statistics remain future work; review service terms, caching and API limits before integration.

## Possible future modules (suggested, not prescriptive)

- `domain/gameTree.ts`: variation tree nodes, parent/child relationships, current cursor, undo/redo/branch selection. Full game state per node; never truncate siblings.
- `domain/positions.ts`: normalized position identities and transposition-aware visit metadata; update on every navigation to a position.
- `domain/openings.ts`: opening recognition and path-specific labels.
- `domain/annotations.ts`: typed explanation spans and visual actions.
- `services/storage.ts`: versioned localStorage schema, validation and migration/fallback handling.
- `services/openingExplorer.ts` (later): caching, rate-limiting, failures and book data.
- `services/analysis.ts` (later): worker lifecycle, engine result caching and cancellation of stale evaluations.
- `components/ChessBoard.tsx`, `ExplanationPanel.tsx`, `MoveTree.tsx`, `CandidateMoves.tsx`.

## Suggested annotation model

Use data, not parsing arbitrary prose at runtime. For example:

```ts
type BoardAnnotation =
  | { type: 'squares'; squares: string[]; emphasis?: 'piece' | 'target' }
  | { type: 'arrows'; arrows: Array<{ from: string; to: string }> }
  | { type: 'preview'; moves: string[] }; // temporary visual overlay only

type ExplanationSegment = {
  text: string;
  annotations?: BoardAnnotation[];
};
```

A single segment may carry multiple visual actions. Hover and focus should activate; mouse-leave and blur should clear. Tap/click should toggle; activate another segment to replace the prior annotation. Render preview moves as overlays/ghost pieces where feasible, not as mutations of the underlying chess.js state.

## Data model cautions

Full FEN is needed for restoring exact game state (including move counters and available rights). Identity for `lastViewedAt` should normalize away irrelevant counters while retaining legal-position distinctions. Transpositions can reach identical positions via different lines; keep both path-specific opening labels and shared position metadata. Respect threefold repetition and draw handling within each actual game path.

## Testing and delivery

- Test legal move validation and state restoration, including castling, en passant and promotions.
- Test branching navigation and persistent storage round-trip.
- Test position identity/transposition tracking and visit updates.
- Test explanation hover/touch activation and deactivation without state mutation.
- Current Pages workflow installs and builds; run `npm test` separately. Adding tests to CI is future work.
- Deploy `dist` with official GitHub Pages Actions upon accepted changes to `main`.
- The Pages deployment job uses `contents:write` for the shared `gh-pages` storage branch, plus `pages:write` and `id-token:write` for deployment.
- Avoid API keys/secrets for initial release.

## Iteration workflow

Discuss and refine requirements in ChatGPT. Track product decisions in SPEC.md. Assign focused Codex Cloud tasks against this repository, review PR changes, test the published site, and iterate from hands-on feedback. Do not require local tooling for normal development.
