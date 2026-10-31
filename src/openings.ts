import indexText from "./data/openings.json?raw";
import type { Session } from "./tree";

type OpeningRecord = [eco: string, name: string];
type OpeningIndex = Record<string, OpeningRecord[]>;
const positions = JSON.parse(indexText) as OpeningIndex;

export type Opening = { eco: string; name: string };

// Chess.js produces legal en-passant fields in its FEN. Move counters are not
// part of an opening position, but turn and castling rights are significant.
export function openingAt(fen: string): Opening | undefined {
  const position = fen.split(" ").slice(0, 4).join(" ");
  const match = positions[position]?.[0];
  return match ? { eco: match[0], name: match[1] } : undefined;
}

// Walk back along this variation so an unrecognized continuation retains the
// last name actually reached, without assigning a sibling branch's name.
export function recognizeOpening(
  session: Session,
): (Opening & { current: boolean }) | undefined {
  let node = session.nodes[session.current];
  while (node.parent) {
    const opening = openingAt(node.fen);
    if (opening) return { ...opening, current: node.id === session.current };
    node = session.nodes[node.parent];
  }
  return undefined;
}
