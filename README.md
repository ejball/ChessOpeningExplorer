# Chess Opening Explorer

A browser-based chess opening explorer for personal learning. Explore legal moves, preserve variations, and revisit positions on this device. Curated notes illustrate a few opening ideas; engine evaluation and ranked suggestions are not available yet.

## Development

Use Node.js 22 or newer and npm. Run `npm ci`, then `npm run dev`. Run `npm run typecheck`, `npm test`, and `npm run build` to validate changes. The app stores its exploration session in browser localStorage; Restart clears that session's tree and position visits.

The static build uses `/ChessOpeningExplorer/` as its base path for GitHub Pages. In repository Settings → Pages, select GitHub Actions as the deployment source.

Chessground is GPL-3.0 licensed; see its license in the dependency and the source at https://github.com/lichess-org/chessground. This application's source is available at https://github.com/ejball/ChessOpeningExplorer.

See [SPEC.md](SPEC.md), [ARCHITECTURE.md](ARCHITECTURE.md), and [AGENTS.md](AGENTS.md) for product and development guidance.

## Pull request previews

Pull requests from branches in this repository are published at `https://ejball.github.io/ChessOpeningExplorer/preview/pr<number>/` (for example, `preview/pr42/`). The deployment workflow prints the link in its run summary, updates the preview when the PR changes, and removes it when the PR closes. Fork PRs do not deploy previews because they cannot safely publish with repository credentials.

The workflow keeps the production site and preview files together on the `gh-pages` branch, then deploys the combined site with GitHub Actions. Keep Pages configured to use **GitHub Actions**; the branch is storage for the workflow, not the Pages source. Previews are public. They share the production site's browser origin, so they also share its localStorage.

If the `github-pages` environment restricts deployment branches, add the branch rule `refs/pull/*/merge` alongside `main` so PR workflows can deploy. A repository administrator may need to make that change in Settings → Environments → github-pages.
