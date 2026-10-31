import type { DrawShape } from "chessground/draw";

export type Segment = { text: string; shapes?: DrawShape[] };
export type Note = { title: string; segments: Segment[] };
export const notes: Record<string, Note> = {
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
