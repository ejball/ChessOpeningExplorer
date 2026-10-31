# Agent instructions

Read SPEC.md and ARCHITECTURE.md before coding. Implement incremental, reviewable vertical slices. Prefer the smallest workable change over speculative abstractions.

Use React + TypeScript + Vite, chess.js, Chessground, and Vitest unless requirements change. The static deployment target is GitHub Pages under /ChessOpeningExplorer/. Avoid paid services and server dependencies.

Don't expose hints until the user explicitly presses Hint. After move, present reliable feedback; during opponent's turn, show candidate moves. Keep variation branches and position visit metadata. Explanation annotations must not mutate actual game state.

Run typechecking, tests, and production build where available. Add tests for state/history correctness. If evaluation/opening information is unavailable, state that rather than inventing assessments. Keep documentation updated when decisions change. Observe GPL licensing and source availability.
