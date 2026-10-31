# Chess Opening Explorer

A browser-based chess opening explorer for personal learning. Explore legal moves, preserve variations, and revisit positions on this device. Curated notes illustrate a few opening ideas; engine evaluation and ranked suggestions are not available yet.

## Development

Use Node.js 22 or newer and npm. Run `npm ci`, then `npm run dev`. Run `npm run typecheck`, `npm test`, and `npm run build` to validate changes. The app stores its exploration session in browser localStorage; Restart clears that session's tree and position visits.

The static build uses `/ChessOpeningExplorer/` as its base path for GitHub Pages. In repository Settings → Pages, select GitHub Actions as the deployment source.

Chessground is GPL-3.0 licensed; see its license in the dependency and the source at https://github.com/lichess-org/chessground. This application's source is available at https://github.com/ejball/ChessOpeningExplorer.

See [SPEC.md](SPEC.md), [ARCHITECTURE.md](ARCHITECTURE.md), and [AGENTS.md](AGENTS.md) for product and development guidance.
