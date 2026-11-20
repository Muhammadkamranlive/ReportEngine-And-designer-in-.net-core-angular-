"use client";

import { useEffect, useRef, useState, useCallback, DragEvent, MouseEvent } from "react";
import * as fabric from "fabric";
import { useDesigner } from "@/lib/store";
import { buildFabricObject, readGeometry, OBJ_DATA_KEY } from "@/lib/canvasRender";
import { setCanvasCursor, clearCanvasCursor } from "@/lib/cursorTracker";
import {
  createText,
  createRect,
  createCircle,
  createLine,
  createImage,
  createQrCode,
  createBarcode,
  createTable,
} from "@/lib/objectFactory";
import { TemplateObject } from "@/lib/types";
import { DragPayload } from "@/lib/dragPayload";

const PAGE_PADDING = 40;

export default function DesignCanvas() {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasElRef = useRef<HTMLCanvasElement>(null);
  const fabricRef = useRef<fabric.Canvas | null>(null);
  const rebuildTokenRef = useRef(0);
  const suppressSelectRef = useRef(false);

  const template = useDesigner((s) => s.template);
  const zoom = useDesigner((s) => s.zoom);
  const showGrid = useDesigner((s) => s.showGrid);
  const gridSize = useDesigner((s) => s.gridSize);
  const selectedId = useDesigner((s) => s.selectedId);
  const select = useDesigner((s) => s.select);
  const updateObject = useDesigner((s) => s.updateObject);
  const removeObject = useDesigner((s) => s.removeObject);
  const pushHistory = useDesigner((s) => s.pushHistory);
  const undo = useDesigner((s) => s.undo);
  const redo = useDesigner((s) => s.redo);

  const [ready, setReady] = useState(false);
  const pageRef = useRef<HTMLDivElement>(null);
  const addObject = useDesigner((s) => s.addObject);

  const pagePointFromClient = useCallback(
    (clientX: number, clientY: number) => {
      const el = pageRef.current;
      if (!el) return { x: 0, y: 0 };
      const rect = el.getBoundingClientRect();
      const z = useDesigner.getState().zoom;
      const gs = useDesigner.getState().gridSize;
      const snap = useDesigner.getState().snapToGrid;
      let x = (clientX - rect.left) / z;
      let y = (clientY - rect.top) / z;
      if (snap) {
        x = Math.round(x / gs) * gs;
        y = Math.round(y / gs) * gs;
      }
      return { x, y };
    },
    []
  );

  const insertAt = useCallback(
    (payload: DragPayload, x: number, y: number) => {
      if (payload.kind === "variable") {
        const t = createText(payload.value, { x: Math.round(x), y: Math.round(y) });
        addObject(t);
        return;
      }
      const centeredBy = (w: number, h: number) => ({ x: Math.round(x - w / 2), y: Math.round(y - h / 2) });
      let obj: TemplateObject;
      switch (payload.toolType) {
        case "text":
          obj = createText("Text", { ...centeredBy(200, 30) });
          break;
        case "rect":
          obj = createRect({ ...centeredBy(160, 90) });
          break;
        case "circle":
          obj = createCircle({ ...centeredBy(90, 90) });
          break;
        case "line":
          obj = createLine({ ...centeredBy(200, 2) });
          break;
        case "qrcode":
          obj = createQrCode({ ...centeredBy(100, 100) });
          break;
        case "barcode":
          obj = createBarcode({ ...centeredBy(180, 60) });
          break;
        case "table":
          obj = createTable({ ...centeredBy(460, 140) });
          break;
        case "image":
          // No file chosen yet for a dragged Image tool — fall back to the
          // normal upload flow rather than inserting an empty placeholder.
          return;
        default:
          return;
      }
      addObject(obj);
    },
    [addObject]
  );

  const onDragOver = useCallback((e: DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "copy";
  }, []);

  const onDrop = useCallback(
    (e: DragEvent) => {
      e.preventDefault();
      const { x, y } = pagePointFromClient(e.clientX, e.clientY);

      // Dragging an actual image file in from the OS / file explorer.
      if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
        const file = Array.from(e.dataTransfer.files).find((f) => f.type.startsWith("image/"));
        if (file) {
          const reader = new FileReader();
          reader.onload = () => {
            const w = 160;
            const h = 100;
            addObject(createImage(reader.result as string, { x: Math.round(x - w / 2), y: Math.round(y - h / 2), width: w, height: h }));
          };
          reader.readAsDataURL(file);
        }
        return;
      }

      const raw = e.dataTransfer.getData("application/json");
      if (!raw) return;
      try {
        const payload = JSON.parse(raw) as DragPayload;
        insertAt(payload, x, y);
      } catch {
        // ignore malformed payloads
      }
    },
    [pagePointFromClient, insertAt, addObject]
  );

  const onPageMouseMove = useCallback(
    (e: MouseEvent) => {
      const { x, y } = pagePointFromClient(e.clientX, e.clientY);
      setCanvasCursor(x, y);
    },
    [pagePointFromClient]
  );

  // init fabric canvas once
  useEffect(() => {
    if (!canvasElRef.current) return;
    const canvas = new fabric.Canvas(canvasElRef.current, {
      selection: false,
      preserveObjectStacking: true,
      backgroundColor: "transparent",
    });
    fabricRef.current = canvas;
    setReady(true);

    canvas.on("selection:created", (e) => {
      const obj = e.selected?.[0];
      const id = obj ? (obj as unknown as Record<string, unknown>)[OBJ_DATA_KEY] : null;
      if (id && !suppressSelectRef.current) select(id as string);
    });
    canvas.on("selection:updated", (e) => {
      const obj = e.selected?.[0];
      const id = obj ? (obj as unknown as Record<string, unknown>)[OBJ_DATA_KEY] : null;
      if (id && !suppressSelectRef.current) select(id as string);
    });
    canvas.on("selection:cleared", () => {
      if (!suppressSelectRef.current) select(null);
    });

    canvas.on("object:modified", (e) => {
      const target = e.target;
      if (!target) return;
      const id = (target as unknown as Record<string, unknown>)[OBJ_DATA_KEY] as string | undefined;
      if (!id) return;
      const geo = readGeometry(target);
      target.set({ scaleX: 1, scaleY: 1, width: geo.width, height: geo.height });
      target.setCoords();
      updateObject(id, geo);
      pushHistory();
    });

    canvas.on("object:moving", (e) => {
      if (!useDesigner.getState().snapToGrid) return;
      const target = e.target;
      if (!target) return;
      const gs = useDesigner.getState().gridSize;
      target.set({
        left: Math.round((target.left || 0) / gs) * gs,
        top: Math.round((target.top || 0) / gs) * gs,
      });
    });

    return () => {
      canvas.dispose();
      fabricRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // resize canvas to page * zoom
  useEffect(() => {
    const canvas = fabricRef.current;
    if (!canvas) return;
    const w = template.page.width;
    const h = template.page.height;
    canvas.setDimensions({ width: w * zoom, height: h * zoom });
    canvas.setZoom(zoom);
    canvas.requestRenderAll();
  }, [template.page.width, template.page.height, zoom]);

  // rebuild objects when template.objects changes (full diffing render)
  useEffect(() => {
    const canvas = fabricRef.current;
    if (!canvas || !ready) return;
    const token = ++rebuildTokenRef.current;

    (async () => {
      const built = await Promise.all(template.objects.map((o) => buildFabricObject(o)));
      if (rebuildTokenRef.current !== token) return; // stale
      canvas.remove(...canvas.getObjects().filter((o) => (o as unknown as Record<string, unknown>)[OBJ_DATA_KEY]));
      built.forEach((fo) => canvas.add(fo));

      // restore selection
      suppressSelectRef.current = true;
      canvas.discardActiveObject();
      if (selectedId) {
        const match = built.find((fo) => (fo as unknown as Record<string, unknown>)[OBJ_DATA_KEY] === selectedId);
        if (match && !template.objects.find((o) => o.id === selectedId)?.locked) {
          canvas.setActiveObject(match);
        }
      }
      canvas.requestRenderAll();
      suppressSelectRef.current = false;
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [template.objects, ready]);

  // keyboard shortcuts
  const onKeyDown = useCallback(
    (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement)?.tagName;
      if (tag === "INPUT" || tag === "TEXTAREA" || (e.target as HTMLElement)?.isContentEditable) return;

      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "z") {
        e.preventDefault();
        if (e.shiftKey) redo();
        else undo();
        return;
      }
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "y") {
        e.preventDefault();
        redo();
        return;
      }
      if ((e.key === "Delete" || e.key === "Backspace") && selectedId) {
        e.preventDefault();
        removeObject(selectedId);
        return;
      }
      if (selectedId && ["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight"].includes(e.key)) {
        e.preventDefault();
        const step = e.shiftKey ? 10 : 1;
        const obj = useDesigner.getState().template.objects.find((o) => o.id === selectedId);
        if (!obj) return;
        const delta: Record<string, [number, number]> = {
          ArrowUp: [0, -step],
          ArrowDown: [0, step],
          ArrowLeft: [-step, 0],
          ArrowRight: [step, 0],
        };
        const [dx, dy] = delta[e.key];
        updateObject(selectedId, { x: obj.x + dx, y: obj.y + dy });
      }
    },
    [selectedId, undo, redo, removeObject, updateObject]
  );

  useEffect(() => {
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [onKeyDown]);

  // commit arrow-key nudges to history (debounced-ish: on key up)
  useEffect(() => {
    const onKeyUp = (e: KeyboardEvent) => {
      if (["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight"].includes(e.key)) pushHistory();
    };
    window.addEventListener("keyup", onKeyUp);
    return () => window.removeEventListener("keyup", onKeyUp);
  }, [pushHistory]);

  const pageWpx = template.page.width * zoom;
  const pageHpx = template.page.height * zoom;
  const m = template.page.margins;

  return (
    <div className="flex-1 overflow-auto bg-neutral-200/70" ref={containerRef}>
      <div
        className="relative mx-auto my-10"
        style={{ width: pageWpx + PAGE_PADDING * 2, minHeight: pageHpx + PAGE_PADDING * 2 }}
      >
        <div
          ref={pageRef}
          className="absolute bg-white shadow-[0_1px_3px_rgba(0,0,0,0.15),0_10px_30px_rgba(0,0,0,0.12)]"
          style={{ left: PAGE_PADDING, top: PAGE_PADDING, width: pageWpx, height: pageHpx }}
          onDragOver={onDragOver}
          onDrop={onDrop}
          onMouseMove={onPageMouseMove}
          onMouseLeave={() => clearCanvasCursor()}
        >
          {showGrid && (
            <div
              className="pointer-events-none absolute inset-0"
              style={{
                backgroundImage:
                  "linear-gradient(to right, rgba(15,23,42,0.06) 1px, transparent 1px), linear-gradient(to bottom, rgba(15,23,42,0.06) 1px, transparent 1px)",
                backgroundSize: `${gridSize * zoom}px ${gridSize * zoom}px`,
              }}
            />
          )}

          {/* header band */}
          <div
            className="pointer-events-none absolute inset-x-0 top-0 border-b border-dashed border-sky-300 bg-sky-500/[0.05]"
            style={{ height: m.top * zoom }}
          >
            <span className="absolute left-1 top-0.5 text-[9px] font-semibold uppercase tracking-wide text-sky-500/70">
              Header
            </span>
          </div>

          {/* footer band */}
          <div
            className="pointer-events-none absolute inset-x-0 bottom-0 border-t border-dashed border-amber-300 bg-amber-500/[0.05]"
            style={{ height: m.bottom * zoom }}
          >
            <span className="absolute left-1 bottom-0.5 text-[9px] font-semibold uppercase tracking-wide text-amber-600/70">
              Footer
            </span>
          </div>

          {/* body margin guide */}
          <div
            className="pointer-events-none absolute border border-dashed border-neutral-300"
            style={{
              left: m.left * zoom,
              top: m.top * zoom,
              width: (template.page.width - m.left - m.right) * zoom,
              height: (template.page.height - m.top - m.bottom) * zoom,
            }}
          />
          {template.watermark.enabled && (
            <div
              className="pointer-events-none absolute inset-0 flex items-center justify-center select-none"
              style={{
                color: template.watermark.color,
                opacity: template.watermark.opacity,
                fontSize: template.watermark.fontSize * zoom,
                fontWeight: 800,
                transform: `rotate(${template.watermark.rotation}deg)`,
                letterSpacing: 4,
              }}
            >
              {template.watermark.text}
            </div>
          )}
          <canvas ref={canvasElRef} />
          {template.pagination.enabled && (
            <div
              className="pointer-events-none absolute bottom-1 w-full text-[10px] text-neutral-400"
              style={{
                textAlign: template.pagination.align,
                paddingLeft: m.left * zoom,
                paddingRight: m.right * zoom,
              }}
            >
              {template.pagination.format.replace("{{page}}", "1").replace("{{pages}}", "1")}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
