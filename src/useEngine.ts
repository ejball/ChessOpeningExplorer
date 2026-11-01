import { useEffect, useRef, useState } from "react";
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
): { analysis: Analysis | undefined; thinkMore: () => void } {
  const [analysis, setAnalysis] = useState<Analysis>();
  const continueSearch = useRef<(() => void) | null>(null);
  const line = history.join(" ");

  useEffect(() => {
    if (isGameOver || legalMoveCount === 0) return;
    let worker: Worker;
    let live = true;
    let phase: "uci" | "ready" | "search" | "idle" = "uci";
    let bestDepth = 0;
    let hasComplete = false;
    let started = 0;
    let totalElapsed = 0;
    let iterations = new Iterations(legalMoveCount);
    let timer: number;

    setAnalysis({ position, status: "loading", depth: 0, moves: [] });
    try {
      worker = new Worker(
        `${import.meta.env.BASE_URL}engine/stockfish-19-lite-single.js`,
      );
    } catch {
      setAnalysis({ position, status: "error", depth: 0, moves: [] });
      return;
    }

    function armTimeout() {
      clearTimeout(timer);
      timer = window.setTimeout(() => {
        if (!live) return;
        live = false;
        continueSearch.current = null;
        worker.terminate();
        const elapsedMs =
          totalElapsed + (phase === "search" ? performance.now() - started : 0);
        setAnalysis((previous) =>
          previous?.position === position && previous.moves.length
            ? {
                ...previous,
                status: "incomplete",
                canContinue: false,
                elapsedMs,
              }
            : { position, status: "error", depth: 0, moves: [] },
        );
      }, LOAD_TIMEOUT_MS);
    }

    function startSearch() {
      if (!live || phase !== "idle") return;
      phase = "search";
      iterations = new Iterations(legalMoveCount);
      started = performance.now();
      armTimeout();
      setAnalysis((previous) =>
        previous?.position === position
          ? { ...previous, status: "analyzing", canContinue: false }
          : { position, status: "analyzing", depth: 0, moves: [] },
      );
      worker.postMessage(`position startpos${line ? ` moves ${line}` : ""}`);
      worker.postMessage(`go movetime ${SEARCH_MS}`);
    }
    continueSearch.current = startSearch;
    armTimeout();

    worker.onerror = () => {
      if (!live) return;
      live = false;
      continueSearch.current = null;
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
        phase = "idle";
        startSearch();
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
            elapsedMs: totalElapsed + performance.now() - started,
          });
        }
      } else if (phase === "search" && message.startsWith("bestmove ")) {
        phase = "idle";
        clearTimeout(timer);
        totalElapsed += performance.now() - started;
        // Keep the idle worker and its hash table for an explicitly requested
        // further search. No analysis runs while it is idle.
        setAnalysis((previous) =>
          previous?.position === position && hasComplete
            ? {
                ...previous,
                status: "ready",
                elapsedMs: totalElapsed,
                canContinue: true,
              }
            : {
                position,
                status: "incomplete",
                depth: 0,
                moves: [],
                elapsedMs: totalElapsed,
                canContinue: true,
              },
        );
      }
    };
    worker.postMessage("uci");
    return () => {
      live = false;
      if (continueSearch.current === startSearch) continueSearch.current = null;
      clearTimeout(timer);
      worker.terminate();
    };
  }, [position, line, legalMoveCount, whiteToMove, isGameOver, retry]);

  return {
    analysis:
      analysis?.position === position && !isGameOver ? analysis : undefined,
    thinkMore: () => continueSearch.current?.(),
  };
}
