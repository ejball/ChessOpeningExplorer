# Chess Opening Explorer

A browser-based chess opening explorer for personal learning. Explore legal moves, preserve variations, and revisit positions on this device. Opening names come from the bundled Lichess chess-openings dataset; curated notes illustrate a few opening ideas. A browser-based Stockfish prototype evaluates the position and ranks legal moves.

## Development

Use Node.js 22 or newer and npm. Run `npm ci`, then `npm run dev`. Run `npm run typecheck`, `npm test`, and `npm run build` to validate changes. The app stores its exploration session in browser localStorage; Restart clears that session's tree and position visits.

The move line and chevrons navigate the current path and its most recently selected continuation. A dot in the move list marks a move already explored from the same position. On your turn, use Show moves to reveal legal moves. Hover an underlined explanation to preview its idea, or click or tap it to keep the annotation visible. Hover a reply to preview it on the board. Use the sun/moon button to switch appearance and the information button to view source acknowledgments. The initial appearance follows the system setting.

The engine prototype runs Stockfish.js 19 lite locally in a worker for approximately three seconds per position. It reports a position score and ranks all legal moves after a complete comparison at one search depth. Scores are from White's perspective; a positive number favors White, a negative number favors Black. Early results are provisional and may change while analysis runs. On the user's turn, move rankings remain hidden until Show moves is selected. See [data/README.md](data/README.md) for engine provenance and licensing.

The static build uses `/ChessOpeningExplorer/` as its base path for GitHub Pages. In repository Settings → Pages, select GitHub Actions as the deployment source.

Chessground is GPL-3.0 licensed; see its license in the dependency and the source at https://github.com/lichess-org/chessground. This application's source is available at https://github.com/ejball/ChessOpeningExplorer.

See [SPEC.md](docs/SPEC.md) for product goals and current scope, [ARCHITECTURE.md](docs/ARCHITECTURE.md) for implementation and design notes, [AGENTS.md](AGENTS.md) for coding-agent instructions, and [data/README.md](data/README.md) for data provenance.

## Pull request previews

Pull requests from branches in this repository are published at `https://ejball.github.io/ChessOpeningExplorer/preview/pr<number>/` (for example, `preview/pr42/`). The deployment workflow prints the link in its run summary, updates the preview when the PR changes, and removes it when the PR closes. Fork PRs do not deploy previews because they cannot safely publish with repository credentials.

The workflow keeps the production site and preview files together on the `gh-pages` branch, then deploys the combined site with GitHub Actions. Keep Pages configured to use **GitHub Actions**; the branch is storage for the workflow, not the Pages source. Previews are public. They share the production site's browser origin, so they also share its localStorage.

If the `github-pages` environment restricts deployment branches, add the branch rule `refs/pull/*/merge` alongside `main` so PR workflows can deploy. A repository administrator may need to make that change in Settings → Environments → github-pages.

The Merida chess pieces are by Armando Hernandez Marroquin and are licensed under GPL-2.0-or-later. The SVGs come from [Lichess](https://github.com/lichess-org/lila/tree/4dcff2a4653c092a5e333fd6843e37c5f0277882/public/piece/merida); see [Lichess’s license notes](https://github.com/lichess-org/lila/blob/4dcff2a4653c092a5e333fd6843e37c5f0277882/COPYING.md) and the [GPL-2.0 license text](src/assets/merida/LICENSE.txt).

## Opening data

The bundled [Lichess chess-openings](https://github.com/lichess-org/chess-openings) snapshot is dedicated to the public domain under CC0. The five TSV source files and license in `data/openings/` are pinned to commit `712a58be746c143f4ab935b68acc50f4bac813eb`. Run `npm run generate:openings` to rebuild `src/data/openings.json` from those files. Names are matched by position, then by walking back along the current line when needed; labels on legal moves indicate named resulting positions, not move quality.
