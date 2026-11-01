# Agent instructions

Read docs/SPEC.md and docs/ARCHITECTURE.md before coding. Implement incremental, reviewable vertical slices. Prefer the smallest workable change over speculative abstractions.

Use React + TypeScript + Vite, chess.js, Chessground, and Vitest unless requirements change. The static deployment target is GitHub Pages under /ChessOpeningExplorer/. Avoid paid services and server dependencies.

Don't expose move suggestions on the user's turn until the user explicitly selects Show moves. After move, present reliable feedback; during opponent's turn, show candidate moves. Keep variation branches and position visit metadata. Explanation annotations must not mutate actual game state.

Run typechecking, tests, and production build where available. Add tests for state/history correctness. If evaluation/opening information is unavailable, state that rather than inventing assessments. Keep documentation updated when decisions change. Observe GPL licensing and source availability.
