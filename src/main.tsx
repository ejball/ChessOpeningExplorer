import { useEffect, useRef, useState } from "react";
import { createRoot } from "react-dom/client";
import { Chessground } from "chessground";
import type { Api } from "chessground/api";
import type { Key } from "chessground/types";
import type { DrawShape } from "chessground/draw";
import type { Move, Square } from "chess.js";
import { openingAt, recognizeOpening } from "./openings";
import {
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

type Segment = { text: string; shapes?: DrawShape[] };
type Note = { title: string; segments: Segment[] };
const notes: Record<string, Note> = {
  e4: {
    title: "King’s Pawn Opening",
    segments: [
      { text: "White claims " },
      {
        text: "space in the center",
        shapes: [
          { orig: "e4", brush: "green" },
          { orig: "d5", brush: "yellow" },
        ],
      },
      { text: " and " },
      {
        text: "opens a line for the queen",
        shapes: [{ orig: "d1", dest: "h5", brush: "blue" }],
      },
      { text: " and " },
      { text: "bishop", shapes: [{ orig: "f1", dest: "c4", brush: "blue" }] },
      { text: "." },
    ],
  },
  "e4 e5 Nf3": {
    title: "King’s Knight Opening",
    segments: [
      { text: "The " },
      { text: "knight develops", shapes: [{ orig: "f3", brush: "green" }] },
      { text: " and " },
      {
        text: "attacks the pawn on e5",
        shapes: [{ orig: "f3", dest: "e5", brush: "blue" }],
      },
      { text: "." },
    ],
  },
  "e4 e5 Nf3 Nc6 Bc4": {
    title: "Italian Game",
    segments: [
      { text: "The " },
      { text: "bishop develops", shapes: [{ orig: "c4", brush: "green" }] },
      { text: " toward " },
      {
        text: "f7",
        shapes: [
          { orig: "c4", dest: "f7", brush: "blue" },
          { orig: "f7", brush: "yellow" },
        ],
      },
      { text: " and White prepares for " },
      {
        text: "kingside castling",
        shapes: [
          { orig: "e1", dest: "g1", brush: "green" },
          { orig: "h1", dest: "f1", brush: "green" },
        ],
      },
      { text: "." },
    ],
  },
  "e4 c5": {
    title: "Sicilian Defense",
    segments: [
      { text: "Black " },
      {
        text: "challenges the center from the flank",
        shapes: [{ orig: "c5", dest: "d4", brush: "blue" }],
      },
      { text: "." },
    ],
  },
};

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
  const [showMoves, setShowMoves] = useState(false);
  const [promotion, setPromotion] = useState<{
    from: Square;
    to: Square;
  } | null>(null);
  const [saved, setSaved] = useState(true);
  const [theme, setTheme] = useState<Theme>(readTheme);
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
  const opening = recognizeOpening(session);
  const path = [] as (typeof node)[];
  for (
    let current = node;
    current.parent;
    current = session.nodes[current.parent]
  )
    path.unshift(current);
  const forwardMoves = preferredLine(session);
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
    setShowMoves(false);
  }, [session.current, session.side]);
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
  const opponentTurn =
    game.turn() === (session.side === "white" ? "b" : "w") &&
    !game.isGameOver();

  return (
    <main>
      <section className="play" aria-label="Chess board and navigation">
        <div className="controls">
          <strong>
            <i /> {status}
          </strong>
          <div className="control-buttons">
            <button
              disabled={!node.parent}
              onClick={() => node.parent && go(node.parent)}
            >
              ← Back
            </button>
            <div className="forward-group">
              <button
                disabled={!preferred}
                onClick={() => preferred && go(preferred)}
              >
                Forward →
              </button>
              <details className="menu forward-menu">
                <summary
                  aria-label="Choose a forward move"
                  title="Choose a forward move"
                  aria-disabled={!node.children.length}
                >
                  ▾
                </summary>
                <div className="menu-content">
                  {node.children.length ? (
                    node.children.map((id) => (
                      <button
                        key={id}
                        onClick={(event) => {
                          event.currentTarget
                            .closest("details")
                            ?.removeAttribute("open");
                          go(id);
                        }}
                      >
                        {session.nodes[id].san}
                        {id === preferred ? " · most recent" : ""}
                      </button>
                    ))
                  ) : (
                    <span>No forward moves</span>
                  )}
                </div>
              </details>
            </div>
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
              onClick={() => {
                if (
                  window.confirm(
                    "Start a new exploration? This clears the current tree and visits.",
                  )
                )
                  setSession(fresh(session.side));
              }}
            >
              Restart
            </button>
            <details className="menu settings-menu">
              <summary
                aria-label="Appearance settings"
                title="Appearance settings"
              >
                ⚙
              </summary>
              <div className="menu-content">
                <label>
                  Appearance{" "}
                  <select
                    value={theme}
                    onChange={(event) => setTheme(event.target.value as Theme)}
                  >
                    <option value="system">System</option>
                    <option value="light">Light</option>
                    <option value="dark">Dark</option>
                  </select>
                </label>
                <button
                  onClick={(event) => {
                    event.currentTarget
                      .closest("details")
                      ?.removeAttribute("open");
                    about.current?.showModal();
                  }}
                >
                  About
                </button>
              </div>
            </details>
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
        <nav
          ref={moveLine}
          className="move-line"
          aria-label="Current move history"
        >
          <button
            ref={node.id === "root" ? currentMove : undefined}
            onClick={() => go("root")}
            disabled={!node.parent}
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
      </section>
      <aside aria-label="Position details">
        <section className="card explanation" aria-label="Position explanation">
          {opening && (
            <p className="opening-name">
              {opening.current ? "" : "Last recognized: "}
              {opening.name} <span>({opening.eco})</span>
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
                ? "No curated explanation is available for this position yet."
                : "Choose a side and make a move to begin exploring."}
            </p>
          )}
          <p className="muted">
            Move evaluation and ranked suggestions are not available yet.
          </p>
        </section>
        <section className="card reply-card" aria-label="Next moves">
          {!opponentTurn && !game.isGameOver() && (
            <button
              className="show-moves"
              aria-pressed={showMoves}
              onClick={() => {
                setShowMoves((visible) => !visible);
                setReply(null);
              }}
            >
              {showMoves ? "Hide moves" : "Show moves"}
            </button>
          )}
          {game.isGameOver() ? (
            <p className="muted">No legal moves available.</p>
          ) : opponentTurn || showMoves ? (
            <p className="muted">
              Choose a move. Rankings and popularity are unavailable.
            </p>
          ) : (
            <p className="muted">
              Your move. Reveal legal moves when you want them.
            </p>
          )}
          {(opponentTurn || showMoves) && !game.isGameOver() && (
            <div className="replies">
              {game
                .moves({ verbose: true })
                .sort((a, b) => a.san.localeCompare(b.san))
                .map((move) => (
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
                    <strong>{move.san}</strong>
                    {openingAt(move.after) && (
                      <span>{openingAt(move.after)?.name}</span>
                    )}
                  </button>
                ))}
            </div>
          )}
        </section>
        {!saved && (
          <p role="alert">Could not save this session in local storage.</p>
        )}
      </aside>
      <dialog
        ref={about}
        className="about-dialog"
        aria-labelledby="about-title"
      >
        <h2 id="about-title">About Chess Opening Explorer</h2>
        <p>
          Explore chess openings and save variations on this device. Opening
          names are bundled with the app; move quality and popularity are not
          currently evaluated.
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
