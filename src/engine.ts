export type Score = { kind: "cp" | "mate"; value: number };
export type EngineMove = { uci: string; rank: number; score: Score };
export type Analysis = {
  position: string;
  status: "loading" | "analyzing" | "ready" | "incomplete" | "error";
  depth: number;
  moves: EngineMove[];
  elapsedMs?: number;
};

// UCI scores are from the perspective of the side to move at the root.
export function parseInfo(
  line: string,
  whiteToMove: boolean,
): { depth: number; move: EngineMove } | undefined {
  if (!line.startsWith("info ") || /\b(?:lowerbound|upperbound)\b/.test(line))
    return;
  const depth = /\bdepth (\d+)/.exec(line);
  const rank = /\bmultipv (\d+)/.exec(line);
  const score = /\bscore (cp|mate) (-?\d+)/.exec(line);
  const pv = /\bpv ([a-h][1-8][a-h][1-8][qrbn]?)(?:\s|$)/.exec(line);
  if (!depth || !rank || !score || !pv) return;
  return {
    depth: Number(depth[1]),
    move: {
      uci: pv[1],
      rank: Number(rank[1]),
      score: {
        kind: score[1] as Score["kind"],
        value: Number(score[2]) * (whiteToMove ? 1 : -1),
      },
    },
  };
}

export function formatScore(score: Score): string {
  if (score.kind === "mate") {
    if (score.value === 0) return "Mate";
    return `${score.value > 0 ? "White" : "Black"} mates in ${Math.abs(score.value)}`;
  }
  const value = score.value / 100;
  if (value === 0) return "0.00";
  return `${value > 0 ? "+" : ""}${value.toFixed(2)}`;
}

// The pill color identifies the advantaged side; the text is a positive magnitude.
export function boardScore(score: Score): string {
  if (score.kind === "mate")
    return score.value === 0 ? "M" : `M${Math.abs(score.value)}`;
  return score.value === 0
    ? "0.00"
    : `+${(Math.abs(score.value) / 100).toFixed(2)}`;
}

// Color alone is not sufficient for screen readers or tooltip users.
export function scoreDescription(score: Score): string {
  if (score.kind === "mate") return formatScore(score);
  if (score.value === 0) return "Equal evaluation, 0.00";
  return `${score.value > 0 ? "White" : "Black"} ahead by ${(Math.abs(score.value) / 100).toFixed(2)}`;
}

export function scoreSide(score: Score): "white" | "black" | "neutral" {
  return score.value > 0 ? "white" : score.value < 0 ? "black" : "neutral";
}

// Publish only complete MultiPV iterations, so all moves have the same depth.
export class Iterations {
  private depths = new Map<number, Map<number, EngineMove>>();
  constructor(private moveCount: number) {}
  add(depth: number, move: EngineMove): EngineMove[] | undefined {
    if (move.rank < 1 || move.rank > this.moveCount) return;
    let entries = this.depths.get(depth);
    if (!entries) {
      entries = new Map();
      this.depths.set(depth, entries);
    }
    entries.set(move.rank, move);
    if (entries.size !== this.moveCount) return;
    const result = [...entries.values()].sort((a, b) => a.rank - b.rank);
    if (new Set(result.map((entry) => entry.uci)).size !== this.moveCount)
      return;
    for (const previous of this.depths.keys())
      if (previous < depth) this.depths.delete(previous);
    return result;
  }
}
