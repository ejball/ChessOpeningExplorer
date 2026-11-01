import { useEffect, useState } from "react";
import { Iterations, parseInfo, type Analysis } from "./engine";

const SEARCH_MS = 3000;
const LOAD_TIMEOUT_MS = 30000;

export function useEngine(
  position: string,
  history: string[],
  legalMoveCount: number,
  whiteToMove: boolean,
  isGameOver: boolean,
  retry: number,
): Analysis | undefined {
  const [analysis, setAnalysis] = useState<Analysis>();
  const line = history.join(" ");
  useEffect(() => {
    if (isGameOver || legalMoveCount === 0) return;
    let worker: Worker;
    let live = true;
    let phase: "uci" | "ready" | "search" = "uci";
    let bestDepth = 0;
    let hasComplete = false;
    let started = 0;
    const iterations = new Iterations(legalMoveCount);
    setAnalysis({ position, status: "loading", depth: 0, moves: [] });
    try {
      worker = new Worker(
        `${import.meta.env.BASE_URL}engine/stockfish-19-lite-single.js`,
      );
    } catch {
      setAnalysis({ position, status: "error", depth: 0, moves: [] });
      return;
    }
    const timer = window.setTimeout(() => {
      if (!live) return;
      live = false;
      worker.terminate();
      setAnalysis((previous) =>
        previous?.position === position && previous.moves.length
          ? {
              ...previous,
              status: "incomplete",
              elapsedMs: started ? performance.now() - started : undefined,
            }
          : { position, status: "error", depth: 0, moves: [] },
      );
    }, LOAD_TIMEOUT_MS);
    worker.onerror = () => {
      if (!live) return;
      live = false;
      clearTimeout(timer);
      worker.terminate();
      setAnalysis({ position, status: "error", depth: 0, moves: [] });
    };
    worker.onmessage = (event: MessageEvent<unknown>) => {
      if (!live || typeof event.data !== "string") return;
      const message = event.data;
      if (message === "uciok" && phase === "uci") {
        phase = "ready";
        worker.postMessage(`setoption name MultiPV value ${legalMoveCount}`);
        worker.postMessage("setoption name Hash value 16");
        worker.postMessage("isready");
      } else if (message === "readyok" && phase === "ready") {
        phase = "search";
        started = performance.now();
        setAnalysis({ position, status: "analyzing", depth: 0, moves: [] });
        worker.postMessage(`position startpos${line ? ` moves ${line}` : ""}`);
        worker.postMessage(`go movetime ${SEARCH_MS}`);
      } else if (phase === "search" && message.startsWith("info ")) {
        const info = parseInfo(message, whiteToMove);
        if (!info || info.depth < bestDepth) return;
        const complete = iterations.add(info.depth, info.move);
        if (complete && info.depth >= bestDepth) {
          bestDepth = info.depth;
          hasComplete = true;
          setAnalysis({
            position,
            status: "analyzing",
            depth: info.depth,
            moves: complete,
          });
        }
      } else if (phase === "search" && message.startsWith("bestmove ")) {
        live = false;
        clearTimeout(timer);
        worker.terminate();
        setAnalysis((previous) =>
          previous?.position === position && hasComplete
            ? {
                ...previous,
                status: "ready",
                elapsedMs: performance.now() - started,
              }
            : {
                position,
                status: "incomplete",
                depth: 0,
                moves: [],
                elapsedMs: performance.now() - started,
              },
        );
      }
    };
    worker.postMessage("uci");
    return () => {
      live = false;
      clearTimeout(timer);
      worker.terminate();
    };
  }, [position, line, legalMoveCount, whiteToMove, isGameOver, retry]);
  return analysis?.position === position && !isGameOver ? analysis : undefined;
}
