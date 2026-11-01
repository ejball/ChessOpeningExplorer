import type { Plugin } from "vite";

export function explanationPlugin(): Plugin;
export function compileExplanations(
  xml: string,
  sources: { title: string; revisionId: number }[],
): Record<string, unknown>;
