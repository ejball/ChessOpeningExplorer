import { readFile } from "node:fs/promises";
import { resolve } from "node:path";
import { Chess } from "chess.js";
import { XMLParser, XMLValidator } from "fast-xml-parser";

// Compile the author-friendly XML into the app's typed segments at build time.
export function compileExplanations(xml, sources) {
  const valid = XMLValidator.validate(xml);
  if (valid !== true)
    throw new Error(`Invalid explanation XML: ${valid.err.msg}`);
  const parser = new XMLParser({
    ignoreAttributes: false,
    preserveOrder: true,
    trimValues: false,
    parseTagValue: false,
  });
  const document = parser
    .parse(xml)
    .filter((item) => !item["?xml"] && !("#text" in item));
  if (document.length !== 1 || !document[0].explanations)
    throw new Error("Expected one <explanations> root");

  const result = {};
  const sourceByRevision = new Map(
    sources.map((page) => [page.revisionId, page]),
  );
  for (const item of document[0].explanations) {
    if ("#text" in item && !item["#text"].trim()) continue;
    if (!item.explanation)
      throw new Error("Unexpected content in <explanations>");
    const attributes = item[":@"] ?? {};
    const moves = attributes["@_moves"];
    const title = attributes["@_title"];
    const sourceText = attributes["@_source"];
    if (
      Object.keys(attributes).some(
        (key) => !["@_moves", "@_title", "@_source"].includes(key),
      ) ||
      !moves ||
      !title ||
      !/^[1-9]\d*$/.test(sourceText ?? "")
    )
      throw new Error(
        `Invalid explanation attributes for ${moves ?? "unknown position"}`,
      );
    if (Object.hasOwn(result, moves))
      throw new Error(`Duplicate explanation: ${moves}`);
    const sourceRevision = Number(sourceText);
    const source = sourceByRevision.get(sourceRevision);
    const sourceMoves = source?.title
      .split("/")
      .slice(1)
      .map((part) => part.replace(/^\d+\.(?:\.\.)?\s*/, ""))
      .join(" ");
    if (sourceMoves !== moves)
      throw new Error(`Missing or mismatched source for ${moves}`);
    const game = new Chess();
    try {
      for (const move of moves.split(" ")) game.move(move);
    } catch {
      throw new Error(`Illegal move sequence: ${moves}`);
    }
    const segments = [];
    for (const child of item.explanation) {
      if ("#text" in child) {
        if (child["#text"]) segments.push({ text: child["#text"] });
        continue;
      }
      const kind = child.arrow ? "arrow" : child.square ? "square" : null;
      if (!kind) throw new Error(`Unknown annotation in ${moves}`);
      const content = child[kind];
      if (
        content.length !== 1 ||
        !("#text" in content[0]) ||
        !content[0]["#text"].trim()
      )
        throw new Error(`Annotation must contain plain text in ${moves}`);
      const attrs = child[":@"] ?? {};
      const origin = attrs[kind === "arrow" ? "@_from" : "@_at"];
      const destination = attrs["@_to"];
      const allowed = kind === "arrow" ? ["@_from", "@_to"] : ["@_at"];
      if (
        Object.keys(attrs).some((key) => !allowed.includes(key)) ||
        !/^[a-h][1-8]$/.test(origin ?? "") ||
        (kind === "arrow" && !/^[a-h][1-8]$/.test(destination ?? ""))
      )
        throw new Error(`Invalid annotation squares in ${moves}`);
      if (!game.get(origin))
        throw new Error(`No piece on ${origin} in ${moves}`);
      const shape =
        kind === "arrow"
          ? { orig: origin, dest: destination, brush: "blue" }
          : { orig: origin, brush: "green" };
      segments.push({ text: content[0]["#text"], shapes: [shape] });
    }
    if (!segments.some((segment) => segment.shapes))
      throw new Error(`Explanation has no annotation: ${moves}`);
    result[moves] = { title, sourceRevision, segments };
  }
  if (!Object.keys(result).length) throw new Error("No explanations found");
  return result;
}

export function explanationPlugin() {
  const sourceFile = resolve("data/wikibooks/chess-opening-theory.json");
  return {
    name: "compile-explanations",
    enforce: "pre",
    async load(id) {
      if (!id.endsWith("/src/data/explanations.xml")) return;
      this.addWatchFile(sourceFile);
      const [xml, sourceJson] = await Promise.all([
        readFile(id, "utf8"),
        readFile(sourceFile, "utf8"),
      ]);
      const notes = compileExplanations(xml, JSON.parse(sourceJson).pages);
      return `export default ${JSON.stringify(notes)};`;
    },
  };
}
