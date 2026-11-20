export const DRAG_MIME = "application/x-pdf-template-tool";

export type DragPayload =
  | { kind: "tool"; toolType: "text" | "rect" | "circle" | "line" | "image" | "qrcode" | "barcode" | "table" }
  | { kind: "variable"; value: string };
