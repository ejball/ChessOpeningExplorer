# Chess Opening Explorer — Product Specification

## Product intent

A personal, cloud-hosted chess opening learning tool focused on the *first key moves*. Favor exploration, discovery, and understanding over memorization drills. Avoid unnecessary complexity and ongoing costs.

## Current state and planned features

The app currently supports legal play, local branching history, a few sample explanations, offline opening names, light/dark appearance, and explicit move-visibility controls. A three-second Stockfish prototype displays evaluations and ranks legal moves; move-quality classifications and game popularity statistics are not yet implemented. The richer feedback and popularity features below are product goals, not descriptions of existing behavior.

## Primary interaction

1. The user chooses a side (White or Black) and plays legal moves.
2. **On the user's turn**, display no automatic move recommendations or hints. The user can move any legal piece.
3. **After the user's move**, display its algebraic notation, opening/variation name when known, a concise explanation, an engine-based move-quality classification, and the number of *meaningfully* better alternatives. Distinguish unknown evaluations from bad moves.
4. **On the opponent's turn**, display a selectable list of candidate responses, strongest first, with opening names when applicable, practical popularity/frequency separately, and common mistakes or inaccurate moves when educational. Selecting a response plays that move.
5. An explicit **Show your moves** checkbox on the user's turn reveals the same ranked candidate-move information, with relevant names, quality, and frequency. Never trigger it automatically.
6. The user may freely undo, redo, select previous branches, and explore alternatives. Preserve the variation tree when diverging, rather than deleting the abandoned line.

## Board and explanation UI

- Use a traditional tan/brown chessboard, with White at the bottom by default, clear pieces, and restrained square highlights.
- Support flipping the board when learning as Black.
- Make meaningful phrases in move explanations interactive. Hover on desktop, tap/click on touch devices.
- The explanation data should explicitly associate each phrase with visualization annotations: highlight square(s), emphasize piece(s), show arrow(s), and/or preview move sequence(s).
- Example: “Develops **the bishop** to an **active square**, putting pressure on **f7** and preparing **kingside castling**.”
  - “the bishop”: highlight bishop on c4
  - “active square”: highlight c4 and show f1→c4 development
  - “f7”: highlight f7 and show c4→f7 attacking line
  - “kingside castling”: preview king e1→g1 and rook h1→f1, without changing game state
- Annotations must never actually make a move, corrupt game history, or introduce illegal game states.
- Hover or keyboard focus provides a transient annotation preview; clicking or tapping toggles a persistent annotation.
- Provide accessible keyboard interaction and readable alternative explanations.

## Opening names and feedback

- Opening names may depend on the path of moves as well as the current board. Prefer the deepest recognized opening in the played line; recognize transpositions where possible.
- Do not imply that deviating from a named opening means a move is weak.
- Move quality comes from chess evaluation, not merely opening-book frequency. Clearly label unavailable/uncertain evaluations.
- Define “better moves” using a meaningful evaluation tolerance, with a documented analysis depth/precision policy; do not count tiny engine differences as objectively better.
- Distinguish **strength** from **frequency** in candidate move rankings.
- Show important opening ideas in short, carefully curated descriptions where available; do not fabricate confident explanations for unknown positions.
- Rank opponent candidates by engine assessment, while retaining interesting popular alternatives and instructive common mistakes. Label the reason they appear.

## History, persistence, and state

- The interface does not display last-viewed timestamps. Existing session data still retains position visit metadata.
- Use a normalized position key that captures board, side to move, castling rights and legal en-passant availability. Exclude move counters from opening-position identity, but preserve full FEN/game state within each history node.
- Transposed positions share visit metadata but the app preserves distinct move paths and opening context.
- Persist the exploration tree, active branch, side preference, and position visit data in browser localStorage for the MVP.
- Restore the latest exploration session after reloading. No cloud synchronization in version one.
- Support promotions, castling, en passant, checkmate, stalemate and draw rules through chess.js.

## MVP milestones

1. **Explorer foundation:** working board, legal play, choose side, variation-tree navigation, move list, restart, persistent resume.
2. **Explanations:** contextual panel and structured interactive annotation behavior, initially using curated examples.
3. **Opening explorer:** live or cached opening names and opponent move popularity; display independently from engine quality.
4. **Evaluation:** browser-side Stockfish (or suitably cached eval data), accurate post-move feedback, explicit hints, and opponent move ranking.
5. **Polish:** responsive layout, accessibility, tests and dependable deployment.

## Out of scope initially

- Accounts, backend/database, paid APIs, subscriptions
- Repetition schedules, drills, achievements, training statistics
- Multiplayer, computer opponent gameplay, PGN import/export
- Deep opening encyclopedia, dynamically generated prose for every move

## Acceptance examples

- Starting as White: make 1.e4 unaided, then choose Black's reply from an annotated candidate list.
- After 1.e4 e5 2.Nf3, show an appropriate recognized opening and coherent feedback; don't call it bad merely because another opening path is more popular.
- In an Italian Game explanation, hovering/tapping “f7” highlights that square, while “kingside castling” shows a reversible visual preview.
- Backtrack from 1.e4 e5 to 1.e4, choose 1...c5, explore the Sicilian, and then return to the original 1...e5 branch.
- Refresh the browser and return to the active line, retaining prior branches.

## Principles

- The user controls learning; no unsolicited hints.
- Explanations and evaluations should be honest about what is known.
- Keep the interface compact, pleasant and responsive.
- Keep costs at zero beyond existing ChatGPT subscription and within usage limits.
