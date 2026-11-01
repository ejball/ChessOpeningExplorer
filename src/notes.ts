import type { DrawShape } from "chessground/draw";
import compiledNotes from "./data/explanations.xml";

export type Segment = { text: string; shapes?: DrawShape[] };
export type Note = {
  title: string;
  sourceRevision: number;
  segments: Segment[];
};

// Vite validates and compiles the XML while starting or building the app.
export const notes = compiledNotes as Record<string, Note>;
