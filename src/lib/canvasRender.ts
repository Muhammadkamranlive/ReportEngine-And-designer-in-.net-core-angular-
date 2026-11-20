import * as fabric from "fabric";
import QRCode from "qrcode";
import JsBarcode from "jsbarcode";
import { TemplateObject } from "./types";

export const OBJ_DATA_KEY = "__templateId";

// Guards against NaN/Infinity/zero values (from in-progress typing, empty
// inputs, division by zero, etc.) ever reaching Fabric.js. A single invalid
// number passed into Fabric can throw mid-render, and since the old canvas
// objects are already cleared by that point, the page appears to go blank.
function safeNum(v: number, fallback = 1, min = 0.01): number {
  return Number.isFinite(v) && v >= min ? v : fallback;
}

async function qrDataUrl(text: string, fg: string, bg: string): Promise<string> {
  return QRCode.toDataURL(text || "QR", {
    margin: 1,
    color: { dark: fg, light: bg },
  });
}

function barcodeDataUrl(text: string, format: string, fg: string, bg: string): string {
  const canvas = document.createElement("canvas");
  try {
    JsBarcode(canvas, text || "0000000000", {
      format: format === "CODE128" ? "CODE128" : format === "EAN13" ? "EAN13" : "UPC",
      lineColor: fg,
      background: bg,
      displayValue: true,
      margin: 4,
      height: 50,
    });
  } catch {
    JsBarcode(canvas, "0000000000", { format: "CODE128", lineColor: fg, background: bg, displayValue: true, margin: 4, height: 50 });
  }
  return canvas.toDataURL();
}

export async function buildFabricObject(obj: TemplateObject): Promise<fabric.FabricObject> {
  try {
    return await buildFabricObjectInner(obj);
  } catch (err) {
    console.error(`Failed to render object "${obj.name}" (${obj.type}):`, err);
    const fallback = placeholderRect(safeNum(obj.width, 80), safeNum(obj.height, 40), `⚠ ${obj.type}`);
    fallback.set({ left: obj.x, top: obj.y });
    (fallback as unknown as Record<string, unknown>)[OBJ_DATA_KEY] = obj.id;
    return fallback;
  }
}

async function buildFabricObjectInner(obj: TemplateObject): Promise<fabric.FabricObject> {
  // Sanitize once up front so every branch below works with safe numbers.
  const width = safeNum(obj.width, 20);
  const height = safeNum(obj.height, 20);
  let fo: fabric.FabricObject;

  switch (obj.type) {
    case "text": {
      const tb = new fabric.Textbox(obj.text, {
        width,
        fontFamily: obj.fontFamily,
        fontSize: safeNum(obj.fontSize, 16),
        fontWeight: obj.fontWeight,
        fontStyle: obj.fontStyle,
        underline: obj.underline,
        fill: obj.color,
        backgroundColor: obj.backgroundColor ?? undefined,
        textAlign: obj.align,
        charSpacing: (Number.isFinite(obj.letterSpacing) ? obj.letterSpacing : 0) * 20,
        splitByGrapheme: false,
        editable: false,
      });
      fo = tb;
      break;
    }
    case "rect": {
      fo = new fabric.Rect({
        width,
        height,
        fill: obj.fill,
        stroke: obj.stroke,
        strokeWidth: safeNum(obj.strokeWidth, 1, 0),
        rx: safeNum(obj.rx, 0, 0),
        ry: safeNum(obj.rx, 0, 0),
      });
      break;
    }
    case "circle": {
      fo = new fabric.Ellipse({
        rx: width / 2,
        ry: height / 2,
        fill: obj.fill,
        stroke: obj.stroke,
        strokeWidth: safeNum(obj.strokeWidth, 1, 0),
      });
      break;
    }
    case "line": {
      fo = new fabric.Line([0, 0, width, 0], {
        stroke: obj.stroke,
        strokeWidth: safeNum(obj.strokeWidth, 2, 0.5),
      });
      break;
    }
    case "image": {
      if (obj.src) {
        const img = await fabric.FabricImage.fromURL(obj.src, { crossOrigin: "anonymous" });
        const scaleX = width / (img.width || width);
        const scaleY = height / (img.height || height);
        img.set({ scaleX, scaleY });
        fo = img;
      } else {
        fo = placeholderRect(width, height, "Image");
      }
      break;
    }
    case "qrcode": {
      const url = await qrDataUrl(obj.variable, obj.foreground, obj.background);
      const img = await fabric.FabricImage.fromURL(url);
      img.set({
        scaleX: width / (img.width || width),
        scaleY: height / (img.height || height),
      });
      fo = img;
      break;
    }
    case "barcode": {
      const url = barcodeDataUrl(obj.variable, obj.format, obj.foreground, obj.background);
      const img = await fabric.FabricImage.fromURL(url);
      img.set({
        scaleX: width / (img.width || width),
        scaleY: height / (img.height || height),
      });
      fo = img;
      break;
    }
    case "table": {
      fo = buildTableGroup(obj);
      break;
    }
    default:
      fo = placeholderRect(80, 40, "?");
  }

  fo.set({
    left: obj.x,
    top: obj.y,
    angle: obj.rotation,
    selectable: !obj.locked,
    evented: !obj.locked,
    hasControls: !obj.locked,
    lockMovementX: obj.locked,
    lockMovementY: obj.locked,
    visible: !obj.hidden,
    originX: "left",
    originY: "top",
    hoverCursor: obj.locked ? "default" : "move",
    padding: 0,
  });
  (fo as unknown as Record<string, unknown>)[OBJ_DATA_KEY] = obj.id;

  if (obj.type === "text" || obj.type === "rect") {
    // width already set via constructor for these; nothing extra
  }

  return fo;
}

function placeholderRect(width: number, height: number, label: string): fabric.Group {
  const rect = new fabric.Rect({
    width,
    height,
    fill: "#f3f4f6",
    stroke: "#9ca3af",
    strokeDashArray: [4, 4],
    strokeWidth: 1,
  });
  const text = new fabric.FabricText(label, {
    fontSize: 12,
    fill: "#6b7280",
    left: width / 2,
    top: height / 2,
    originX: "center",
    originY: "center",
  });
  return new fabric.Group([rect, text], { width, height });
}

function buildTableGroup(obj: Extract<TemplateObject, { type: "table" }>): fabric.Group {
  const items: fabric.FabricObject[] = [];
  const tableWidth = safeNum(obj.width, 200);
  const headerHeight = safeNum(obj.headerHeight, 30, 4);
  const fontSize = safeNum(obj.fontSize, 12, 4);
  const columns =
    obj.columns.length > 0
      ? obj.columns.map((c) => ({ ...c, width: safeNum(c.width, 40, 4) }))
      : [{ id: "c", header: "Column", field: "field", width: tableWidth, align: "left" as const }];
  const totalWidth = columns.reduce((s, c) => s + c.width, 0) || tableWidth;
  const scale = tableWidth / totalWidth;

  // header row
  let cx = 0;
  const headerRect = new fabric.Rect({
    left: 0,
    top: 0,
    width: tableWidth,
    height: headerHeight,
    fill: obj.headerBg,
  });
  items.push(headerRect);

  columns.forEach((col) => {
    const w = col.width * scale;
    const label = new fabric.FabricText(col.header, {
      left: cx + (col.align === "left" ? 6 : col.align === "right" ? w - 6 : w / 2),
      top: headerHeight / 2,
      fontSize,
      fill: obj.headerColor,
      originX: col.align === "left" ? "left" : col.align === "right" ? "right" : "center",
      originY: "center",
      fontWeight: "bold",
    });
    items.push(label);
    cx += w;
  });

  // sample rows
  const sampleRows = [
    columns.map((c) => (c.field === "product" ? "Sample Item" : c.field === "qty" ? "1" : "0.00")),
    columns.map((c) => (c.field === "product" ? "Another Item" : c.field === "qty" ? "2" : "0.00")),
  ];
  const bodyHeight = Math.max(safeNum(obj.height, 100) - headerHeight, safeNum(obj.rowHeight, 26, 4) * sampleRows.length);
  const rowH = Math.max(4, Math.min(safeNum(obj.rowHeight, 26, 4), bodyHeight / sampleRows.length));

  sampleRows.forEach((row, rIdx) => {
    const rowTop = headerHeight + rIdx * rowH;
    const rowRect = new fabric.Rect({
      left: 0,
      top: rowTop,
      width: tableWidth,
      height: rowH,
      fill: rIdx % 2 === 0 ? "#ffffff" : "#f9fafb",
      stroke: obj.borderColor,
      strokeWidth: 0.5,
    });
    items.push(rowRect);
    let cx2 = 0;
    columns.forEach((col, cIdx) => {
      const w = col.width * scale;
      const label = new fabric.FabricText(row[cIdx] ?? "", {
        left: cx2 + (col.align === "left" ? 6 : col.align === "right" ? w - 6 : w / 2),
        top: rowTop + rowH / 2,
        fontSize,
        fill: "#1f2937",
        originX: col.align === "left" ? "left" : col.align === "right" ? "right" : "center",
        originY: "center",
      });
      items.push(label);
      cx2 += w;
    });
  });

  const totalHeight = headerHeight + rowH * sampleRows.length;
  const outline = new fabric.Rect({
    left: 0,
    top: 0,
    width: tableWidth,
    height: totalHeight,
    fill: "transparent",
    stroke: obj.borderColor,
    strokeWidth: 1,
  });
  items.push(outline);

  return new fabric.Group(items, { width: tableWidth, height: totalHeight });
}

export function readGeometry(fo: fabric.FabricObject) {
  const width = Math.round((fo.width || 0) * (fo.scaleX || 1));
  const height = Math.round((fo.height || 0) * (fo.scaleY || 1));
  return {
    x: Math.round(fo.left || 0),
    y: Math.round(fo.top || 0),
    width,
    height,
    rotation: Math.round(fo.angle || 0),
  };
}
