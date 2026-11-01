export type MoveVisibility = { own: boolean; opponent: boolean };

const STORAGE_KEY = "chess-explorer-move-visibility-v1";
const DEFAULTS: MoveVisibility = { own: false, opponent: true };

export function parseMoveVisibility(raw: string | null): MoveVisibility {
  if (!raw) return { ...DEFAULTS };
  try {
    const value: unknown = JSON.parse(raw);
    if (
      value &&
      typeof value === "object" &&
      "own" in value &&
      "opponent" in value &&
      typeof value.own === "boolean" &&
      typeof value.opponent === "boolean"
    ) {
      return { own: value.own, opponent: value.opponent };
    }
  } catch {
    // Fall back to hiding the user's moves when stored data is invalid.
  }
  return { ...DEFAULTS };
}

export function loadMoveVisibility(): MoveVisibility {
  try {
    return parseMoveVisibility(localStorage.getItem(STORAGE_KEY));
  } catch {
    return { ...DEFAULTS };
  }
}

export function saveMoveVisibility(value: MoveVisibility): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(value));
  } catch {
    /* The selection still applies for this session. */
  }
}
