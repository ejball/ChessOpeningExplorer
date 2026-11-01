import { useEffect, useRef, useState } from "react";
import { createRoot } from "react-dom/client";
import { Chessground } from "chessground";
import type { Api } from "chessground/api";
import type { Key } from "chessground/types";
import type { DrawShape } from "chessground/draw";
import type { Move, Square } from "chess.js";
import { recognizeOpening } from "./openings";
import { notes } from "./notes";
import { candidatesFor } from "./candidates";
import { boardScore, scoreDescription, scoreSide } from "./engine";
import { useEngine } from "./useEngine";
import { loadMoveVisibility, saveMoveVisibility } from "./moveVisibility";
import {
  exploredMoves,
  fresh,
  gameAt,
  load,
  play,
  preferredLine,
  save,
  visit,
  type Session,
} from "./tree";
import "chessground/assets/chessground.base.css";
import "./style.css";

type Theme = "system" | "light" | "dark";
function readTheme(): Theme {
  try {
    const value = localStorage.getItem("chess-explorer-theme");
    if (value === "light" || value === "dark") return value;
  } catch {
    /* Use the system setting when storage is unavailable. */
  }
  return "system";
}

function App() {
  const [session, setSession] = useState<Session>(load);
  const [pinned, setPinned] = useState<number | null>(null);
  const [hovered, setHovered] = useState<number | null>(null);
  const [reply, setReply] = useState<Move | null>(null);
  const [moveVisibility, setMoveVisibility] = useState(loadMoveVisibility);
  const [engineRetry, setEngineRetry] = useState(0);
  const [promotion, setPromotion] = useState<{
    from: Square;
    to: Square;
  } | null>(null);
  const [saved, setSaved] = useState(true);
  const [theme, setTheme] = useState<Theme>(readTheme);
  const [systemDark, setSystemDark] = useState(
    () => window.matchMedia("(prefers-color-scheme: dark)").matches,
  );
  const about = useRef<HTMLDialogElement>(null);
  const board = useRef<HTMLDivElement>(null);
  const moveLine = useRef<HTMLElement>(null);
  const currentMove = useRef<HTMLButtonElement>(null);
  const api = useRef<Api | null>(null);
  const state = useRef(session);
  state.current = session;

  const node = session.nodes[session.current];
  const game = gameAt(session);
  const note = notes[game.history().join(" ")];
  const legalMoves = game.moves({ verbose: true });
  const history = game.history({ verbose: true }).map((move) => move.lan);
  const analysis = useEngine(
    node.id,
    history,
    legalMoves.length,
    game.turn() === "w",
    game.isGameOver(),
    engineRetry,
  );
  const opening = recognizeOpening(session);
  const path = [] as (typeof node)[];
  for (
    let current = node;
    current.parent;
    current = session.nodes[current.parent]
  )
    path.unshift(current);
  const forwardMoves = preferredLine(session);
  const explored = exploredMoves(session);
  const active = hovered ?? pinned;
  const shapes: DrawShape[] = reply
    ? [
        { orig: reply.from, dest: reply.to, brush: "blue" },
        {
          orig: reply.to,
          piece: {
            color: reply.color === "w" ? "white" : "black",
            role: (
              {
                p: "pawn",
                n: "knight",
                b: "bishop",
                r: "rook",
                q: "queen",
                k: "king",
              } as const
            )[reply.promotion ?? reply.piece],
          },
        },
      ]
    : active === null
      ? []
      : (note?.segments[active]?.shapes ?? []);

  useEffect(() => {
    const preference = window.matchMedia("(prefers-color-scheme: dark)");
    const update = () => setSystemDark(preference.matches);
    preference.addEventListener("change", update);
    return () => preference.removeEventListener("change", update);
  }, []);
  useEffect(() => {
    if (theme === "system")
      document.documentElement.removeAttribute("data-theme");
    else document.documentElement.dataset.theme = theme;
    try {
      if (theme === "system") localStorage.removeItem("chess-explorer-theme");
      else localStorage.setItem("chess-explorer-theme", theme);
    } catch {
      /* The setting still applies for this session. */
    }
  }, [theme]);
  useEffect(() => {
    setSaved(save(session));
  }, [session]);
  useEffect(() => {
    setPinned(null);
    setHovered(null);
    setReply(null);
  }, [session.current, session.side]);
  useEffect(() => {
    saveMoveVisibility(moveVisibility);
  }, [moveVisibility]);
  useEffect(() => {
    const line = moveLine.current;
    const current = currentMove.current;
    if (!line || !current) return;
    const keepCurrentVisible = () => {
      const lineBounds = line.getBoundingClientRect();
      const moveBounds = current.getBoundingClientRect();
      if (moveBounds.right > lineBounds.right)
        line.scrollLeft += moveBounds.right - lineBounds.right;
      if (moveBounds.left < lineBounds.left)
        line.scrollLeft -= lineBounds.left - moveBounds.left;
    };
    keepCurrentVisible();
    const observer = new ResizeObserver(keepCurrentVisible);
    observer.observe(line);
    return () => observer.disconnect();
  }, [session.current, session.nodes]);
  useEffect(() => {
    if (!board.current) return;
    api.current = Chessground(board.current, {
      drawable: { enabled: false, visible: true },
      movable: {
        free: false,
        events: {
          after: (from, to) => {
            const piece = gameAt(state.current).get(from as Square);
            if (piece?.type === "p" && (to[1] === "8" || to[1] === "1"))
              setPromotion({ from: from as Square, to: to as Square });
            else setSession((s) => play(s, from as Square, to as Square));
          },
        },
      },
    });
    return () => {
      api.current?.destroy();
      api.current = null;
    };
  }, []);
  useEffect(() => {
    const dests = new Map<Key, Key[]>();
    for (const move of game.moves({ verbose: true }))
      dests.set(move.from, [...(dests.get(move.from) || []), move.to]);
    api.current?.set({
      fen: node.fen,
      orientation: session.side,
      turnColor: game.turn() === "w" ? "white" : "black",
      check: game.isCheck(),
      lastMove: node.from && node.to ? [node.from, node.to] : undefined,
      movable: { color: game.turn() === "w" ? "white" : "black", dests },
      drawable: { autoShapes: shapes },
    });
  }, [session, hovered, pinned, reply, promotion]);

  function go(id: string) {
    setSession((s) => visit(s, id));
  }
  const status = game.isCheckmate()
    ? "Checkmate"
    : game.isStalemate()
      ? "Stalemate"
      : game.isThreefoldRepetition()
        ? "Draw by repetition"
        : game.isDraw()
          ? "Draw"
          : `${game.turn() === "w" ? "White" : "Black"} to move${game.isCheck() ? " · Check" : ""}`;
  const preferred =
    node.preferred && node.children.includes(node.preferred)
      ? node.preferred
      : node.children[0];
  const isDark = theme === "system" ? systemDark : theme === "dark";
  const engineMoves = new Map(
    analysis?.moves.map((move) => [move.uci, move]) ?? [],
  );
  const candidates = candidatesFor(game);
  if (
    engineMoves.size === legalMoves.length &&
    legalMoves.length > 0 &&
    candidates.every(({ move }) => engineMoves.has(move.lan))
  ) {
    candidates.sort(
      (a, b) =>
        engineMoves.get(a.move.lan)!.rank - engineMoves.get(b.move.lan)!.rank,
    );
  }
  const positionScore = analysis?.moves[0]?.score;
  const engineTooltip = [
    "Stockfish",
    analysis?.status === "error"
      ? "unavailable"
      : analysis?.depth
        ? `depth ${analysis.depth}`
        : "starting",
    analysis?.status === "analyzing" ? "analyzing" : "",
    analysis?.status === "incomplete" ? "incomplete" : "",
    analysis?.status === "ready" && analysis.elapsedMs
      ? `${(analysis.elapsedMs / 1000).toFixed(1)}s`
      : "",
  ]
    .filter(Boolean)
    .join(" · ");
  const opponentTurn =
    game.turn() === (session.side === "white" ? "b" : "w") &&
    !game.isGameOver();
  const movesVisible =
    !game.isGameOver() &&
    (opponentTurn ? moveVisibility.opponent : moveVisibility.own);

  return (
    <main>
      <section className="play" aria-label="Chess board and navigation">
        <div className="controls">
          <strong>
            <i /> {status}
          </strong>
          <div className="control-buttons">
            {!game.isGameOver() && (
              <span
                className={`evaluation-pill engine-evaluation ${positionScore ? `score-${scoreSide(positionScore)}` : "score-pending"}`}
                title={engineTooltip}
                aria-label={`${positionScore ? scoreDescription(positionScore) : analysis?.status === "error" ? "Analysis unavailable" : analysis?.status === "incomplete" ? "Analysis incomplete" : "Analyzing"}. ${engineTooltip}`}
                role="status"
                aria-live="polite"
                tabIndex={0}
              >
                {positionScore
                  ? boardScore(positionScore)
                  : analysis?.status === "error"
                    ? "!"
                    : analysis?.status === "incomplete"
                      ? "!"
                      : "…"}
              </span>
            )}
            <button
              onClick={() =>
                setSession((s) => ({
                  ...s,
                  side: s.side === "white" ? "black" : "white",
                }))
              }
              aria-label={`Play as ${session.side === "white" ? "Black" : "White"} and flip board`}
              title="Swap sides and flip board"
            >
              ⇅
            </button>
            <button
              aria-label="Restart"
              title="Restart"
              onClick={() => {
                if (
                  window.confirm(
                    "Start a new exploration? This clears the current tree and visits.",
                  )
                )
                  setSession(fresh(session.side));
              }}
            >
              ↻
            </button>
            <button
              onClick={() => setTheme(isDark ? "light" : "dark")}
              aria-label={
                isDark ? "Switch to light mode" : "Switch to dark mode"
              }
              title={isDark ? "Switch to light mode" : "Switch to dark mode"}
              className="icon-button"
            >
              {isDark ? (
                <svg aria-hidden="true" viewBox="0 0 24 24">
                  <circle cx="12" cy="12" r="4" />
                  <path d="M12 2v2m0 16v2M4.93 4.93l1.42 1.42m11.3 11.3 1.42 1.42M2 12h2m16 0h2M4.93 19.07l1.42-1.42m11.3-11.3 1.42-1.42" />
                </svg>
              ) : (
                <svg aria-hidden="true" viewBox="0 0 24 24">
                  <path d="M20.5 14A8.5 8.5 0 0 1 10 3.5 8.5 8.5 0 1 0 20.5 14Z" />
                </svg>
              )}
            </button>
            <button
              onClick={() => about.current?.showModal()}
              aria-label="About"
              aria-haspopup="dialog"
              aria-controls="about-dialog"
              title="About"
              className="icon-button"
            >
              <svg aria-hidden="true" viewBox="0 0 24 24">
                <circle cx="12" cy="12" r="9" />
                <path d="M12 10.5v6m0-9h.01" />
              </svg>
            </button>
          </div>
        </div>
        <div className="board-wrap">
          <div
            ref={board}
            className="board"
            aria-label="Interactive chess board"
          />
        </div>
        {promotion && (
          <div
            className="promotion"
            role="dialog"
            aria-label="Choose promotion"
          >
            <strong>Promote pawn to</strong>
            {["q", "r", "b", "n"].map((p) => (
              <button
                key={p}
                onClick={() => {
                  setSession((s) => play(s, promotion.from, promotion.to, p));
                  setPromotion(null);
                }}
              >
                {
                  (
                    {
                      q: "Queen",
                      r: "Rook",
                      b: "Bishop",
                      n: "Knight",
                    } as Record<string, string>
                  )[p]
                }
              </button>
            ))}
          </div>
        )}
        <div className="board-footer">
          <nav
            ref={moveLine}
            className="move-line"
            aria-label="Current move history"
          >
            <button
              ref={node.id === "root" ? currentMove : undefined}
              className={node.id === "root" ? "selected" : ""}
              onClick={() => {
                if (node.id !== "root") go("root");
              }}
            >
              Start
            </button>
            {path.map((move, index) => (
              <button
                key={move.id}
                ref={move.id === node.id ? currentMove : undefined}
                className={move.id === node.id ? "selected" : ""}
                onClick={() => go(move.id)}
              >
                {index % 2 === 0 ? `${Math.floor(index / 2) + 1}. ` : ""}
                {move.san}
              </button>
            ))}
            {forwardMoves.map((move, index) => {
              const ply = path.length + index;
              return (
                <button
                  key={move.id}
                  className="future-move"
                  onClick={() => go(move.id)}
                  aria-label={`Forward to ${move.san}`}
                >
                  {ply % 2 === 0 ? `${Math.floor(ply / 2) + 1}. ` : ""}
                  {move.san}
                </button>
              );
            })}
          </nav>
          <div className="navigation-buttons" aria-label="Move navigation">
            <button
              className="navigation-button"
              aria-label="Back"
              title="Back"
              disabled={!node.parent}
              onClick={() => node.parent && go(node.parent)}
            >
              <svg aria-hidden="true" viewBox="0 0 24 24">
                <path d="m15 5-7 7 7 7" />
              </svg>
            </button>
            <button
              className="navigation-button"
              aria-label="Forward"
              title="Forward"
              disabled={!preferred}
              onClick={() => preferred && go(preferred)}
            >
              <svg aria-hidden="true" viewBox="0 0 24 24">
                <path d="m9 5 7 7-7 7" />
              </svg>
            </button>
          </div>
        </div>
      </section>
      <aside aria-label="Position details">
        <section className="card explanation" aria-label="Position explanation">
          {opening && (
            <p className="opening-name">
              {opening.current ? "" : "Last recognized: "}
              {opening.name}
            </p>
          )}
          {note ? (
            <>
              <p>
                {note.segments.map((segment, i) =>
                  segment.shapes ? (
                    <button
                      key={i}
                      className="annotation"
                      aria-pressed={pinned === i}
                      onPointerEnter={(event) => {
                        if (event.pointerType === "mouse") setHovered(i);
                      }}
                      onPointerLeave={(event) => {
                        if (event.pointerType === "mouse") setHovered(null);
                      }}
                      onFocus={(event) => {
                        if (event.currentTarget.matches(":focus-visible"))
                          setHovered(i);
                      }}
                      onBlur={() => setHovered(null)}
                      onClick={() =>
                        setPinned((previous) => (previous === i ? null : i))
                      }
                    >
                      {segment.text}
                    </button>
                  ) : (
                    <span key={i}>{segment.text}</span>
                  ),
                )}
              </p>
            </>
          ) : (
            <p>
              {path.length
                ? "Explore this position."
                : "Choose a side and make a move to begin exploring."}
            </p>
          )}
        </section>
        <section className="card reply-card" aria-label="Next moves">
          <div className="move-visibility">
            {opponentTurn ? (
              <label>
                <input
                  type="checkbox"
                  checked={moveVisibility.opponent}
                  onChange={(event) => {
                    const checked = event.currentTarget.checked;
                    setMoveVisibility((previous) => ({
                      ...previous,
                      opponent: checked,
                    }));
                    setReply(null);
                  }}
                />{" "}
                Show opponent moves
              </label>
            ) : (
              <label>
                <input
                  type="checkbox"
                  checked={moveVisibility.own}
                  onChange={(event) => {
                    const checked = event.currentTarget.checked;
                    setMoveVisibility((previous) => ({
                      ...previous,
                      own: checked,
                    }));
                    setReply(null);
                  }}
                />{" "}
                Show your moves
              </label>
            )}
          </div>
          {game.isGameOver() && (
            <p className="muted">No legal moves available.</p>
          )}
          {movesVisible && (
            <div className="replies">
              {candidates.map(({ move, opening, explanation }) => (
                <button
                  key={move.lan}
                  onPointerEnter={(event) => {
                    if (event.pointerType === "mouse") setReply(move);
                  }}
                  onPointerLeave={(event) => {
                    if (event.pointerType === "mouse") setReply(null);
                  }}
                  onFocus={(event) => {
                    if (event.currentTarget.matches(":focus-visible"))
                      setReply(move);
                  }}
                  onBlur={() => setReply(null)}
                  onClick={() => {
                    setReply(null);
                    setSession((s) =>
                      play(s, move.from, move.to, move.promotion),
                    );
                  }}
                >
                  <span className="candidate-main">
                    <span className="candidate-heading">
                      <strong>{move.san}</strong>
                      {opening && (
                        <span className="candidate-opening">
                          {opening.name}
                        </span>
                      )}
                      {explored.has(move.lan) && (
                        <span
                          className="explored-marker"
                          title="Previously explored"
                        >
                          <span aria-hidden="true">✓</span>
                          <span className="sr-only">Previously explored</span>
                        </span>
                      )}
                    </span>
                    {explanation && (
                      <span className="candidate-explanation">
                        {explanation}
                      </span>
                    )}
                  </span>
                  {engineMoves.get(move.lan) && (
                    <span
                      className={`evaluation-pill move-score score-${scoreSide(engineMoves.get(move.lan)!.score)}`}
                      role="img"
                      aria-label={scoreDescription(
                        engineMoves.get(move.lan)!.score,
                      )}
                      title={scoreDescription(engineMoves.get(move.lan)!.score)}
                    >
                      {boardScore(engineMoves.get(move.lan)!.score)}
                    </span>
                  )}
                </button>
              ))}
            </div>
          )}
        </section>
        {(analysis?.status === "error" ||
          analysis?.status === "incomplete") && (
          <p role="alert">
            Stockfish analysis did not finish.{" "}
            <button onClick={() => setEngineRetry((value) => value + 1)}>
              Retry
            </button>
          </p>
        )}
        {!saved && (
          <p role="alert">Could not save this session in local storage.</p>
        )}
      </aside>
      <dialog
        ref={about}
        className="about-dialog"
        id="about-dialog"
        aria-labelledby="about-title"
      >
        <h2 id="about-title">About</h2>
        <p>
          Explore chess openings and save variations on this device. Opening
          names are bundled with the app.
        </p>
        <ul>
          <li>
            Opening names:{" "}
            <a
              href="https://github.com/lichess-org/chess-openings"
              target="_blank"
              rel="noreferrer"
            >
              Lichess chess-openings dataset
            </a>
            ,{" "}
            <a
              href="https://creativecommons.org/publicdomain/zero/1.0/"
              target="_blank"
              rel="noreferrer"
            >
              CC0
            </a>
            .
          </li>
          <li>
            Merida pieces: Armando Hernandez Marroquin, GPL-2.0-or-later;{" "}
            <a
              href="https://github.com/lichess-org/lila/tree/4dcff2a4653c092a5e333fd6843e37c5f0277882/public/piece/merida"
              target="_blank"
              rel="noreferrer"
            >
              source
            </a>{" "}
            and{" "}
            <a
              href="https://www.gnu.org/licenses/old-licenses/gpl-2.0.html"
              target="_blank"
              rel="noreferrer"
            >
              license
            </a>
            .
          </li>
          <li>
            Interactive board:{" "}
            <a
              href="https://github.com/lichess-org/chessground"
              target="_blank"
              rel="noreferrer"
            >
              Chessground
            </a>
            , GPL-3.0-or-later.
          </li>
          <li>
            Engine:{" "}
            <a
              href="https://github.com/nmrugg/stockfish.js/tree/v19.0.1"
              target="_blank"
              rel="noreferrer"
            >
              Stockfish.js 19 lite
            </a>{" "}
            (Stockfish, GPL-3.0);{" "}
            <a
              href="https://github.com/official-stockfish/Stockfish"
              target="_blank"
              rel="noreferrer"
            >
              Stockfish source
            </a>{" "}
            and{" "}
            <a
              href={`${import.meta.env.BASE_URL}engine/COPYING.txt`}
              target="_blank"
              rel="noreferrer"
            >
              license
            </a>
            .
          </li>
          <li>
            Chess rules:{" "}
            <a
              href="https://github.com/jhlywa/chess.js"
              target="_blank"
              rel="noreferrer"
            >
              chess.js
            </a>
            , BSD-2-Clause.
          </li>
          <li>
            <a
              href="https://github.com/ejball/ChessOpeningExplorer"
              target="_blank"
              rel="noreferrer"
            >
              Application source code
            </a>
          </li>
        </ul>
        <form method="dialog">
          <button autoFocus>Close</button>
        </form>
      </dialog>
    </main>
  );
}
createRoot(document.getElementById("root")!).render(<App />);
