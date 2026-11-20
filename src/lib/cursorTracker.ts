// Tracks the last known pointer position over the design canvas, in page-point
// space (not screen pixels). Used so that inserting an object from the tools
// panel places it near wherever the user's cursor currently is, instead of
// always at a fixed (60, 60). Deliberately kept outside React state since it
// only needs to be read at the moment of an insert, not drive re-renders.

let lastPos: { x: number; y: number } | null = null;
let insertCounter = 0;

export function setCanvasCursor(x: number, y: number) {
  lastPos = { x, y };
}

export function clearCanvasCursor() {
  lastPos = null;
}

/**
 * Returns where the next inserted object should be placed. If we know the
 * cursor's last position over the canvas, center the object on it. Otherwise
 * fall back to a small cascading offset so repeated inserts don't stack
 * exactly on top of each other.
 */
export function nextInsertPosition(width: number, height: number): { x: number; y: number } {
  if (lastPos) {
    return { x: Math.round(lastPos.x - width / 2), y: Math.round(lastPos.y - height / 2) };
  }
  const step = 24;
  const offset = (insertCounter++ % 8) * step;
  return { x: 60 + offset, y: 60 + offset };
}
