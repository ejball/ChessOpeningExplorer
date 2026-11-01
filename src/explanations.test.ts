import { describe, expect, it } from "vitest";
import { compileExplanations } from "../scripts/explanations.mjs";

const sources = [{ title: "Chess Opening Theory/1. e4", revisionId: 123 }];
const wrap = (content: string, moves = "e4", source = "123") =>
  `<explanations><explanation moves="${moves}" title="Test" source="${source}">${content}</explanation></explanations>`;

describe("explanation XML compiler", () => {
  it("preserves prose and compiles square and arrow annotations", () => {
    const compiled = compileExplanations(
      wrap(
        'The <square at="e4">pawn</square> <arrow from="e4" to="d5">controls d5</arrow>.',
      ),
      sources,
    );
    expect(compiled.e4).toEqual({
      title: "Test",
      sourceRevision: 123,
      segments: [
        { text: "The " },
        { text: "pawn", shapes: [{ orig: "e4", brush: "green" }] },
        { text: " " },
        {
          text: "controls d5",
          shapes: [{ orig: "e4", dest: "d5", brush: "blue" }],
        },
        { text: "." },
      ],
    });
  });

  it("can highlight an empty square mentioned in a future plan", () => {
    const compiled = compileExplanations(
      wrap('White may play <square at="d4">d4</square> later.'),
      sources,
    );
    expect(compiled.e4).toMatchObject({
      segments: [
        { text: "White may play " },
        { text: "d4", shapes: [{ orig: "d4", brush: "green" }] },
        { text: " later." },
      ],
    });
  });

  it("rejects malformed XML, unsupported tags, empty origins, and incorrect sources", () => {
    expect(() =>
      compileExplanations("<explanations><bad></explanations>", sources),
    ).toThrow();
    expect(() =>
      compileExplanations(wrap('<link at="e4">pawn</link>'), sources),
    ).toThrow("Unknown annotation");
    expect(() =>
      compileExplanations(
        wrap('<arrow from="e5" to="d4">attack</arrow>'),
        sources,
      ),
    ).toThrow("No piece on e5");
    expect(() =>
      compileExplanations(
        wrap('<square at="e4">pawn</square>', "e4", "999"),
        sources,
      ),
    ).toThrow("source");
    expect(() =>
      compileExplanations(wrap('<square at="e4">pawn</square>', "e5"), [
        { title: "Chess Opening Theory/1. e5", revisionId: 123 },
      ]),
    ).toThrow("Illegal move sequence");
  });
});
