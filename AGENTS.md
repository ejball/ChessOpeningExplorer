# Agent instructions

Read docs/SPEC.md and docs/ARCHITECTURE.md before coding. Implement incremental, reviewable vertical slices. Prefer the smallest workable change over speculative abstractions.

Use React + TypeScript + Vite, chess.js, Chessground, and Vitest unless requirements change. The static deployment target is GitHub Pages under /ChessOpeningExplorer/. Avoid paid services and server dependencies.

Don't expose move suggestions on the user's turn until the user explicitly enables Show your moves. After move, present reliable feedback; during opponent's turn, show candidate moves. Keep variation branches and position visit metadata. Explanation annotations must not mutate actual game state.

When writing or editing explanations, make concrete pieces, squares, and moves interactive when the board can clarify the idea. Prefer an arrow when showing a move, attack, defense, or newly opened line; use a square highlight to identify a piece or a destination without implying a move. For example, in the Grob, show the bishop's opened diagonal with an arrow. Check each annotation against the current position: arrows start at the relevant piece, sliding pieces' paths are unobstructed, and future or conditional lines must not suggest a move is already played. Keep links useful and readable, preserve hover and click/tap behavior, and never change the game state. Validate the XML and source revision and update the Wikibooks processing manifest when adding explanations.

Run typechecking, tests, and production build where available. Add tests for state/history correctness. If evaluation/opening information is unavailable, state that rather than inventing assessments. Keep documentation updated when decisions change. Observe GPL licensing and source availability.
