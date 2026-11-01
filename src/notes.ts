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
  "e4 c5 Nf3": {
    title: "Sicilian Defense: 2. Nf3",
    sourceRevision: 4623530,
    segments: [
      { text: "White develops the knight and " },
      arrow("supports d4", "f3", "d4"),
      {
        text: ". A common plan is d4, meeting ...cxd4 with Nxd4 to open the center.",
      },
    ],
  },
  "e4 c5 Nf3 d6": {
    title: "Sicilian Defense: 2...d6",
    sourceRevision: 4623533,
    segments: [
      { text: "Black supports the " },
      square("c5 pawn", "c5"),
      {
        text: " and controls e5. This prepares ...Nf6 while leaving several Sicilian systems available.",
      },
    ],
  },
  "e4 c5 Nf3 Nc6": {
    title: "Sicilian Defense: 2...Nc6",
    sourceRevision: 4607814,
    segments: [
      { text: "Black develops the knight and " },
      arrow("adds pressure on d4", "c6", "d4"),
      {
        text: ". Black keeps the option of playing ...d5 in one move rather than committing the d-pawn now.",
      },
    ],
  },
  "e4 c5 Nf3 e6": {
    title: "Sicilian Defense: 2...e6",
    sourceRevision: 4657065,
    segments: [
      { text: "Black opens a diagonal for the " },
      square("dark-squared bishop", "f8"),
      {
        text: " and prepares ...d5. White can still pursue the open Sicilian with d4.",
      },
    ],
  },
  "e4 c5 c3": {
    title: "Sicilian Defense: Alapin Variation",
    sourceRevision: 4621235,
    segments: [
      { text: "White uses the c-pawn to " },
      arrow("support d4", "c3", "d4"),
      {
        text: ". If Black exchanges on d4, White may be able to recapture with the c-pawn and establish a broad center.",
      },
    ],
  },
  "e4 e6 d4": {
    title: "French Defense: 2. d4",
    sourceRevision: 4611132,
    segments: [
      { text: "White builds a " },
      square("two-pawn center", "d4"),
      {
        text: " and opens lines for development. Black has prepared ...d5 to challenge it.",
      },
    ],
  },
  "e4 e6 d4 d5": {
    title: "French Defense: 2...d5",
    sourceRevision: 4621121,
    segments: [
      { text: "Black " },
      arrow("attacks the e4 pawn", "d5", "e4"),
      {
        text: ". White can advance it, exchange on d5, or develop a piece to support the center.",
      },
    ],
  },
  "e4 e6 d4 d5 e5": {
    title: "French Defense: Advance Variation",
    sourceRevision: 4607358,
    segments: [
      { text: "White gains space and " },
      arrow("controls f6", "e5", "f6"),
      {
        text: ", restricting Black’s kingside knight. Black commonly challenges the base of the pawn chain with ...c5.",
      },
    ],
  },
  "e4 c6 d4": {
    title: "Caro-Kann Defense: 2. d4",
    sourceRevision: 4529821,
    segments: [
      { text: "White establishes " },
      square("a second central pawn", "d4"),
      {
        text: ". Black usually follows through with ...d5, supported by the c6 pawn.",
      },
    ],
  },
  "e4 c6 d4 d5": {
    title: "Caro-Kann Defense: 2...d5",
    sourceRevision: 4631963,
    segments: [
      { text: "Black " },
      arrow("attacks e4", "d5", "e4"),
      {
        text: " with the c6 pawn supporting d5. White can advance, exchange, or develop a defender.",
      },
    ],
  },
  "e4 c6 d4 d5 e5": {
    title: "Caro-Kann Defense: Advance Variation",
    sourceRevision: 4655309,
    segments: [
      { text: "White advances the " },
      square("e-pawn", "e5"),
      {
        text: " to gain space. Black often develops the c8 bishop before playing ...e6, or immediately challenges the center with ...c5.",
      },
    ],
  },
  "e4 d5 exd5": {
    title: "Scandinavian Defense: 2. exd5",
    sourceRevision: 4641008,
    segments: [
      { text: "White captures in the center. Black can recover the " },
      square("pawn on d5", "d5"),
      {
        text: " immediately with the queen or delay the recapture while developing a knight.",
      },
    ],
  },
  "e4 d5 exd5 Qxd5": {
    title: "Scandinavian Defense: 2...Qxd5",
    sourceRevision: 4659435,
    segments: [
      { text: "Black recovers the pawn with the " },
      square("queen", "d5"),
      {
        text: ". White can develop Nc3 with an attack on the queen, gaining time as it moves away.",
      },
    ],
  },
  "e4 d5 exd5 Qxd5 Nc3": {
    title: "Scandinavian Defense: 3. Nc3",
    sourceRevision: 4659402,
    segments: [
      { text: "White develops a knight while " },
      arrow("attacking the queen", "c3", "d5"),
      {
        text: ". Black must choose a safe square for the queen, commonly a5, d6, or d8.",
      },
    ],
  },
  "e4 e5 Nf3 Nc6 Bc4 Bc5": {
    title: "Italian Game: Giuoco Piano",
    sourceRevision: 4604454,
    segments: [
      { text: "Black develops the " },
      square("bishop to c5", "c5"),
      {
        text: " and keeps the knight free to develop later. White can prepare a central d4 advance or choose a quieter setup with d3.",
      },
    ],
  },
  "e4 e5 Nf3 Nc6 Bc4 Nf6": {
    title: "Italian Game: Two Knights Defense",
    sourceRevision: 4678820,
    segments: [
      { text: "Black develops a knight and " },
      arrow("attacks e4", "f6", "e4"),
      {
        text: ". White can defend the pawn or counterattack, for example by directing a knight toward f7.",
      },
    ],
  },
  "e4 e5 Nf3 Nc6 Bb5 a6": {
    title: "Ruy Lopez: Morphy Defense",
    sourceRevision: 4612044,
    segments: [
      { text: "Black’s a-pawn " },
      arrow("attacks the bishop", "a6", "b5"),
      {
        text: ". White must decide whether to exchange on c6 or retreat and preserve the bishop.",
      },
    ],
  },
  "e4 e5 Nf3 Nc6 Bb5 a6 Ba4": {
    title: "Ruy Lopez: 4. Ba4",
    sourceRevision: 4604055,
    segments: [
      { text: "White preserves the bishop and keeps " },
      arrow("pressure on the c6 knight", "a4", "c6"),
      {
        text: ", a defender of e5. Black can develop the kingside or later challenge the bishop with ...b5.",
      },
    ],
  },
  "e4 e5 Nf3 Nc6 Bb5 a6 Ba4 Nf6": {
    title: "Ruy Lopez: 4...Nf6",
    sourceRevision: 4637921,
    segments: [
      { text: "Black develops and " },
      arrow("attacks e4", "f6", "e4"),
      {
        text: ". White can defend the pawn or continue developing; castling is a common choice.",
      },
    ],
  },
  "e4 e5 Nf3 Nc6 d4": {
    title: "Scotch Game",
    sourceRevision: 4670398,
    segments: [
      { text: "White immediately " },
      arrow("challenges e5", "d4", "e5"),
      { text: " and aims to open the center. Black commonly exchanges on d4." },
    ],
  },
  "e4 e5 Nf3 Nf6": {
    title: "Petrov Defense",
    sourceRevision: 4669874,
    segments: [
      { text: "Instead of defending e5, Black develops and " },
      arrow("counterattacks e4", "f6", "e4"),
      {
        text: ". Both central pawns are under attack, and White can capture on e5 or defend their own pawn.",
      },
    ],
  },
  "e4 e5 Nf3 d6": {
    title: "Philidor Defense",
    sourceRevision: 4637098,
    segments: [
      { text: "Black " },
      arrow("defends e5", "d6", "e5"),
      {
        text: " with a pawn. The structure is solid, though the d6 pawn limits the f8 bishop and Black has yet to develop a piece.",
      },
    ],
  },
  "e4 e5 Nc3": {
    title: "Vienna Game",
    sourceRevision: 4595952,
    segments: [
      { text: "White develops a knight and " },
      arrow("supports e4", "c3", "e4"),
      {
        text: ". Unlike Nf3, this leaves the f-pawn free to advance in some Vienna lines.",
      },
    ],
  },
  "d4 d5 c4 e6": {
    title: "Queen’s Gambit Declined",
    sourceRevision: 4654559,
    segments: [
      { text: "Black " },
      arrow("supports d5", "e6", "d5"),
      {
        text: " and opens a diagonal for the f8 bishop. The e6 pawn also blocks the c8 bishop, which Black will need to develop later.",
      },
    ],
  },
  "d4 d5 c4 c6": {
    title: "Slav Defense",
    sourceRevision: 4613572,
    segments: [
      { text: "Black uses the c-pawn to " },
      arrow("support d5", "c6", "d5"),
      {
        text: ". This leaves the c8 bishop’s diagonal open, though the pawn occupies the knight’s usual c6 square.",
      },
    ],
  },
  "d4 d5 c4 dxc4": {
    title: "Queen’s Gambit Accepted",
    sourceRevision: 4611045,
    segments: [
      { text: "Black accepts the offered " },
      square("c4 pawn", "c4"),
      {
        text: ". White can work to recover it while building a center; trying to hold the pawn can cost Black time.",
      },
    ],
  },
  "d4 Nf6 c4 e6": {
    title: "Indian Defense: 2...e6",
    sourceRevision: 4520642,
    segments: [
      { text: "Black opens the " },
      square("f8 bishop’s", "f8"),
      {
        text: " diagonal and strengthens control of d5. The pawn also restricts the c8 bishop, so its development remains a question.",
      },
    ],
  },
  "d4 Nf6 c4 e6 Nc3": {
    title: "Indian Defense: 3. Nc3",
    sourceRevision: 4610156,
    segments: [
      { text: "White develops the knight and " },
      arrow("supports e4", "c3", "e4"),
      {
        text: ". Black can pin the knight with ...Bb4 or choose a different way to contest the center.",
      },
    ],
  },
  "d4 Nf6 c4 e6 Nc3 Bb4": {
    title: "Nimzo-Indian Defense",
    sourceRevision: 4637909,
    segments: [
      { text: "Black " },
      arrow("pins the c3 knight", "b4", "c3"),
      {
        text: " to the king. This makes it harder for White to rely on that knight when contesting e4.",
      },
    ],
  },
  "d4 Nf6 c4 g6": {
    title: "King’s Indian Setup: 2...g6",
    sourceRevision: 4659986,
    segments: [
      { text: "Black prepares to develop the " },
      square("bishop on f8", "f8"),
      {
        text: " to g7, where it can influence the long diagonal and support the king after castling.",
      },
    ],
  },
  "d4 Nf6 c4 g6 Nc3": {
    title: "King’s Indian Setup: 3. Nc3",
    sourceRevision: 4659994,
    segments: [
      { text: "White develops and " },
      arrow("prepares e4", "c3", "e4"),
      {
        text: ", keeping several central setups available. Black can complete the bishop’s fianchetto with ...Bg7.",
      },
    ],
  },
  "d4 Nf6 Nf3": {
    title: "Indian Defense: 2. Nf3",
    sourceRevision: 4603608,
    segments: [
      { text: "White develops the " },
      square("kingside knight", "f3"),
      {
        text: " without committing the c-pawn. White can choose a central setup after seeing Black’s next move.",
      },
    ],
  },
  "c4 e5": {
    title: "English Opening: 1...e5",
    sourceRevision: 4337145,
    segments: [
      { text: "Black claims central space and " },
      arrow("controls d4", "e5", "d4"),
      {
        text: ". The pawn arrangement resembles a Sicilian with colors reversed, though White has the next move.",
      },
    ],
  },
};
