# Chess Opening Explorer

A browser-based chess opening explorer for personal learning. The implementation is not yet scaffolded.

- [Product specification](SPEC.md)
- [Architecture](ARCHITECTURE.md)
- [Instructions for coding agents](AGENTS.md)

## Planned stack

React, TypeScript, Vite, chess.js, Chessground, Vitest, localStorage, and GitHub Pages. No backend or paid APIs initially.

## Deployment

GitHub Pages project URL: https://ejball.github.io/ChessOpeningExplorer/

The Vite configuration must set `base: '/ChessOpeningExplorer/'`. In GitHub repository **Settings → Pages**, choose **GitHub Actions** as the build and deployment source. The workflow in `.github/workflows/deploy.yml` deploys the `dist` folder after a successful build. Deployment will not work until the app has a package.json and a passing build.

## Workflow

Discuss product decisions and review in ChatGPT; implement focused tasks with Codex Cloud as pull requests; test the resulting website; repeat.
