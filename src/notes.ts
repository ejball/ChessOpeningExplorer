import type { DrawShape } from "chessground/draw";
import type { Key } from "chessground/types";

export type Segment = { text: string; shapes?: DrawShape[] };
export type Note = {
  title: string;
  sourceRevision: number;
  segments: Segment[];
};

// Highlights describe ideas in the current position; they never play a move.
const square = (text: string, at: Key): Segment => ({
  text,
  shapes: [{ orig: at, brush: "green" }],
});
const arrow = (text: string, from: Key, to: Key): Segment => ({
  text,
  shapes: [{ orig: from, dest: to, brush: "blue" }],
});

// Written for this app using the pinned Wikibooks revisions in data/wikibooks.
export const notes: Record<string, Note> = {
  e4: {
    title: "King’s Pawn Opening",
    sourceRevision: 4638030,
    segments: [
      { text: "White occupies the center and " },
      arrow("controls d5", "e4", "d5"),
      { text: ". The pawn move also opens diagonals for the " },
      arrow("queen", "d1", "h5"),
      { text: " and " },
      arrow("king’s bishop", "f1", "c4"),
      { text: "." },
    ],
  },
  "e4 e5": {
    title: "Open Game",
    sourceRevision: 4674750,
    segments: [
      { text: "Black matches White’s central presence and " },
      arrow("controls d4", "e5", "d4"),
      {
        text: ". The e5 pawn is undefended for now, so White can develop while attacking it.",
      },
    ],
  },
  "e4 e5 Nf3": {
    title: "King’s Knight Opening",
    sourceRevision: 4606698,
    segments: [
      { text: "White develops a knight, " },
      arrow("attacks the e5 pawn", "f3", "e5"),
      {
        text: ", and supports d4. Moving the knight also clears a square needed for kingside castling.",
      },
    ],
  },
  "e4 e5 Nf3 Nc6": {
    title: "King’s Knight Opening: Normal Variation",
    sourceRevision: 4674749,
    segments: [
      { text: "Black develops the knight to " },
      arrow("defend e5", "c6", "e5"),
      {
        text: " and also controls d4. White can develop a bishop or challenge the center with d4.",
      },
    ],
  },
  "e4 e5 Nf3 Nc6 Bc4": {
    title: "Italian Game",
    sourceRevision: 4664613,
    segments: [
      { text: "White develops the bishop toward " },
      arrow("f7", "c4", "f7"),
      {
        text: ", a pawn defended only by the king. White is ready to castle and may later build a pawn center with c3 and d4.",
      },
    ],
  },
  "e4 e5 Nf3 Nc6 Bb5": {
    title: "Ruy Lopez",
    sourceRevision: 4671585,
    segments: [
      { text: "White’s bishop " },
      arrow("pressures the knight", "b5", "c6"),
      {
        text: " that defends e5. Capturing the knight does not immediately win the pawn, but the pressure can support White’s central plans.",
      },
    ],
  },
  "e4 c5": {
    title: "Sicilian Defense",
    sourceRevision: 4628469,
    segments: [
      { text: "Black uses the c-pawn to " },
      arrow("control d4", "c5", "d4"),
      {
        text: " without mirroring White’s central pawn. A later exchange on d4 can leave Black with an extra central pawn.",
      },
    ],
  },
  "e4 e6": {
    title: "French Defense",
    sourceRevision: 4641070,
    segments: [
      { text: "Black prepares " },
      arrow("...d5", "d7", "d5"),
      {
        text: " with pawn support, challenging White’s center. The trade-off is that the e6 pawn restricts Black’s ",
      },
      square("light-squared bishop", "c8"),
      { text: "." },
    ],
  },
  "e4 c6": {
    title: "Caro-Kann Defense",
    sourceRevision: 4621962,
    segments: [
      { text: "Black prepares " },
      arrow("...d5", "d7", "d5"),
      {
        text: " with support from the c-pawn. Unlike ...e6, this leaves a diagonal open for the c8 bishop, but the c6 pawn occupies the knight’s usual square.",
      },
    ],
  },
  "e4 d5": {
    title: "Scandinavian Defense",
    sourceRevision: 4666105,
    segments: [
      { text: "Black immediately " },
      arrow("attacks the e4 pawn", "d5", "e4"),
      {
        text: ". After the common exd5, an early queen recapture can let White develop a piece while attacking the queen.",
      },
    ],
  },
  "e4 d6": {
    title: "Pirc Defense",
    sourceRevision: 4536738,
    segments: [
      { text: "Black’s d-pawn " },
      arrow("controls e5", "d6", "e5"),
      {
        text: ", preparing ...Nf6. Black often follows with ...g6 and ...Bg7, aiming at the center from a distance.",
      },
    ],
  },
  "e4 Nf6": {
    title: "Alekhine Defense",
    sourceRevision: 4638029,
    segments: [
      { text: "Black develops a knight and immediately " },
      arrow("attacks e4", "f6", "e4"),
      {
        text: ". White can gain space with e5, but Black hopes to challenge an advanced pawn center later.",
      },
    ],
  },
  d4: {
    title: "Queen’s Pawn Opening",
    sourceRevision: 4641101,
    segments: [
      { text: "White occupies the center, " },
      arrow("controls e5", "d4", "e5"),
      {
        text: ", and opens a diagonal for the c1 bishop. The queen already supports the d4 pawn.",
      },
    ],
  },
  "d4 d5": {
    title: "Closed Game",
    sourceRevision: 4624561,
    segments: [
      { text: "Black claims central space and " },
      arrow("controls e4", "d5", "e4"),
      {
        text: ", making it harder for White to establish pawns on both d4 and e4. White can challenge the d5 pawn with c4.",
      },
    ],
  },
  "d4 d5 c4": {
    title: "Queen’s Gambit",
    sourceRevision: 4628332,
    segments: [
      { text: "White offers the " },
      square("c4 pawn", "c4"),
      {
        text: " to draw Black’s d-pawn away from the center. Black can accept with ...dxc4 or support the d5 pawn instead.",
      },
    ],
  },
  "d4 Nf6": {
    title: "Indian Defense",
    sourceRevision: 4611135,
    segments: [
      { text: "Black develops a knight and " },
      arrow("controls e4", "f6", "e4"),
      {
        text: " without committing a central pawn. Black keeps the option of challenging White’s center with pieces or pawns.",
      },
    ],
  },
  "d4 Nf6 c4": {
    title: "Indian Defense: 2. c4",
    sourceRevision: 4659932,
    segments: [
      { text: "White gains queenside space and " },
      arrow("adds control of d5", "c4", "d5"),
      {
        text: ". The c-pawn has moved before the knight develops to c3, leaving both pieces flexible.",
      },
    ],
  },
  c4: {
    title: "English Opening",
    sourceRevision: 4627810,
    segments: [
      { text: "White " },
      arrow("controls d5", "c4", "d5"),
      {
        text: " from the flank and keeps several central pawn formations available. The position can later transpose into a 1. d4 opening.",
      },
    ],
  },
  Nf3: {
    title: "Zukertort Opening",
    sourceRevision: 4631757,
    segments: [
      { text: "White develops a knight and " },
      arrow("controls e5", "f3", "e5"),
      {
        text: " while postponing a central pawn move. This flexible start can lead to several different openings.",
      },
    ],
  },
};
