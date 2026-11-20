"use client";

import { useDesigner } from "@/lib/store";
import {
  TemplateObject,
  TextObjectProps,
  RectObjectProps,
  CircleObjectProps,
  LineObjectProps,
  QrCodeObjectProps,
  BarcodeObjectProps,
  TableObjectProps,
  ImageObjectProps,
} from "@/lib/types";
import { nanoid } from "nanoid";

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="flex flex-col gap-1 text-[11px] text-neutral-500">
      {label}
      {children}
    </label>
  );
}

const inputCls =
  "w-full rounded border border-neutral-200 px-2 py-1.5 text-xs text-neutral-800 focus:border-neutral-400 focus:outline-none";

export default function PropertiesPanel() {
  const selectedId = useDesigner((s) => s.selectedId);
  const objects = useDesigner((s) => s.template.objects);
  const updateObject = useDesigner((s) => s.updateObject);
  const pushHistory = useDesigner((s) => s.pushHistory);
  const page = useDesigner((s) => s.template.page);

  const obj = objects.find((o) => o.id === selectedId);

  const commit = (patch: Partial<TemplateObject>) => {
    if (!obj) return;
    updateObject(obj.id, patch);
  };
  const commitAndSave = (patch: Partial<TemplateObject>) => {
    commit(patch);
    pushHistory();
  };

  if (!obj) {
    return (
      <div className="w-72 shrink-0 border-l border-neutral-200 bg-neutral-50 p-4 text-xs text-neutral-400">
        Select an object on the canvas to edit its properties.
      </div>
    );
  }

  const align = (mode: "left" | "center" | "right" | "top" | "middle" | "bottom") => {
    const w = page.width;
    const h = page.height;
    if (mode === "left") commitAndSave({ x: page.margins.left });
    if (mode === "right") commitAndSave({ x: w - page.margins.right - obj.width });
    if (mode === "center") commitAndSave({ x: (w - obj.width) / 2 });
    if (mode === "top") commitAndSave({ y: page.margins.top });
    if (mode === "bottom") commitAndSave({ y: h - page.margins.bottom - obj.height });
    if (mode === "middle") commitAndSave({ y: (h - obj.height) / 2 });
  };

  return (
    <div className="flex w-72 shrink-0 flex-col gap-4 overflow-y-auto border-l border-neutral-200 bg-neutral-50 p-3 text-neutral-700">
      <div>
        <div className="mb-2 text-xs font-semibold uppercase tracking-wide text-neutral-400">
          {obj.type} · properties
        </div>
        <Field label="Name">
          <input
            className={inputCls}
            value={obj.name}
            onChange={(e) => commit({ name: e.target.value })}
            onBlur={() => pushHistory()}
          />
        </Field>
      </div>

      <div>
        <div className="mb-2 text-xs font-semibold uppercase tracking-wide text-neutral-400">Position &amp; size</div>
        <div className="grid grid-cols-2 gap-2">
          <Field label="X">
            <input type="number" className={inputCls} value={Math.round(obj.x)} onChange={(e) => commit({ x: +e.target.value })} onBlur={() => pushHistory()} />
          </Field>
          <Field label="Y">
            <input type="number" className={inputCls} value={Math.round(obj.y)} onChange={(e) => commit({ y: +e.target.value })} onBlur={() => pushHistory()} />
          </Field>
          <Field label="Width">
            <input type="number" className={inputCls} value={Math.round(obj.width)} onChange={(e) => commit({ width: +e.target.value })} onBlur={() => pushHistory()} />
          </Field>
          <Field label="Height">
            <input type="number" className={inputCls} value={Math.round(obj.height)} onChange={(e) => commit({ height: +e.target.value })} onBlur={() => pushHistory()} />
          </Field>
          <Field label="Rotation">
            <input type="number" className={inputCls} value={Math.round(obj.rotation)} onChange={(e) => commit({ rotation: +e.target.value })} onBlur={() => pushHistory()} />
          </Field>
          <Field label="Region">
            <select className={inputCls} value={obj.region} onChange={(e) => commitAndSave({ region: e.target.value as TemplateObject["region"] })}>
              <option value="header">Header</option>
              <option value="body">Body</option>
              <option value="footer">Footer</option>
            </select>
          </Field>
        </div>
        <div className="mt-2 grid grid-cols-3 gap-1">
          <button className="rounded border border-neutral-200 bg-white py-1 text-[10px] hover:bg-neutral-100" onClick={() => align("left")}>⟸ Left</button>
          <button className="rounded border border-neutral-200 bg-white py-1 text-[10px] hover:bg-neutral-100" onClick={() => align("center")}>↔ Center</button>
          <button className="rounded border border-neutral-200 bg-white py-1 text-[10px] hover:bg-neutral-100" onClick={() => align("right")}>Right ⟹</button>
          <button className="rounded border border-neutral-200 bg-white py-1 text-[10px] hover:bg-neutral-100" onClick={() => align("top")}>⟰ Top</button>
          <button className="rounded border border-neutral-200 bg-white py-1 text-[10px] hover:bg-neutral-100" onClick={() => align("middle")}>↕ Middle</button>
          <button className="rounded border border-neutral-200 bg-white py-1 text-[10px] hover:bg-neutral-100" onClick={() => align("bottom")}>Bottom ⟱</button>
        </div>
        <div className="mt-2 flex gap-3 text-[11px]">
          <label className="flex items-center gap-1">
            <input type="checkbox" checked={obj.locked} onChange={(e) => commitAndSave({ locked: e.target.checked })} /> Locked
          </label>
          <label className="flex items-center gap-1">
            <input type="checkbox" checked={obj.hidden} onChange={(e) => commitAndSave({ hidden: e.target.checked })} /> Hidden
          </label>
        </div>
      </div>

      <TypeSpecific obj={obj} commit={commit} commitAndSave={commitAndSave} />
    </div>
  );
}

function TypeSpecific({
  obj,
  commit,
  commitAndSave,
}: {
  obj: TemplateObject;
  commit: (p: Partial<TemplateObject>) => void;
  commitAndSave: (p: Partial<TemplateObject>) => void;
}) {
  if (obj.type === "text") {
    const t = obj as TextObjectProps;
    return (
      <div>
        <div className="mb-2 text-xs font-semibold uppercase tracking-wide text-neutral-400">Text</div>
        <Field label="Content">
          <textarea
            className={inputCls + " min-h-16 font-mono"}
            value={t.text}
            onChange={(e) => commit({ text: e.target.value } as Partial<TextObjectProps>)}
            onBlur={() => commitAndSave({})}
          />
        </Field>
        <div className="mt-2 grid grid-cols-2 gap-2">
          <Field label="Font family">
            <select className={inputCls} value={t.fontFamily} onChange={(e) => commitAndSave({ fontFamily: e.target.value } as Partial<TextObjectProps>)}>
              {["Helvetica", "Arial", "Times New Roman", "Georgia", "Courier New"].map((f) => (
                <option key={f} value={f}>{f}</option>
              ))}
            </select>
          </Field>
          <Field label="Font size">
            <input type="number" className={inputCls} value={t.fontSize} onChange={(e) => commitAndSave({ fontSize: +e.target.value } as Partial<TextObjectProps>)} />
          </Field>
          <Field label="Color">
            <input type="color" className={inputCls + " h-8 p-0.5"} value={t.color} onChange={(e) => commitAndSave({ color: e.target.value } as Partial<TextObjectProps>)} />
          </Field>
          <Field label="Background">
            <input
              type="color"
              className={inputCls + " h-8 p-0.5"}
              value={t.backgroundColor ?? "#ffffff"}
              onChange={(e) => commitAndSave({ backgroundColor: e.target.value } as Partial<TextObjectProps>)}
            />
          </Field>
          <Field label="Align">
            <select className={inputCls} value={t.align} onChange={(e) => commitAndSave({ align: e.target.value as TextObjectProps["align"] })}>
              <option value="left">Left</option>
              <option value="center">Center</option>
              <option value="right">Right</option>
              <option value="justify">Justify</option>
            </select>
          </Field>
          <Field label="Letter spacing">
            <input type="number" className={inputCls} value={t.letterSpacing} onChange={(e) => commitAndSave({ letterSpacing: +e.target.value } as Partial<TextObjectProps>)} />
          </Field>
        </div>
        <div className="mt-2 flex gap-3 text-[11px]">
          <label className="flex items-center gap-1">
            <input type="checkbox" checked={t.fontWeight === "bold"} onChange={(e) => commitAndSave({ fontWeight: e.target.checked ? "bold" : "normal" } as Partial<TextObjectProps>)} /> Bold
          </label>
          <label className="flex items-center gap-1">
            <input type="checkbox" checked={t.fontStyle === "italic"} onChange={(e) => commitAndSave({ fontStyle: e.target.checked ? "italic" : "normal" } as Partial<TextObjectProps>)} /> Italic
          </label>
          <label className="flex items-center gap-1">
            <input type="checkbox" checked={t.underline} onChange={(e) => commitAndSave({ underline: e.target.checked } as Partial<TextObjectProps>)} /> Underline
          </label>
        </div>
      </div>
    );
  }

  if (obj.type === "rect") {
    const r = obj as RectObjectProps;
    return (
      <div>
        <div className="mb-2 text-xs font-semibold uppercase tracking-wide text-neutral-400">Rectangle</div>
        <div className="grid grid-cols-2 gap-2">
          <Field label="Fill"><input type="color" className={inputCls + " h-8 p-0.5"} value={r.fill} onChange={(e) => commitAndSave({ fill: e.target.value } as Partial<RectObjectProps>)} /></Field>
          <Field label="Stroke"><input type="color" className={inputCls + " h-8 p-0.5"} value={r.stroke} onChange={(e) => commitAndSave({ stroke: e.target.value } as Partial<RectObjectProps>)} /></Field>
          <Field label="Stroke width"><input type="number" className={inputCls} value={r.strokeWidth} onChange={(e) => commitAndSave({ strokeWidth: +e.target.value } as Partial<RectObjectProps>)} /></Field>
          <Field label="Corner radius"><input type="number" className={inputCls} value={r.rx} onChange={(e) => commitAndSave({ rx: +e.target.value } as Partial<RectObjectProps>)} /></Field>
        </div>
      </div>
    );
  }

  if (obj.type === "circle") {
    const c = obj as CircleObjectProps;
    return (
      <div>
        <div className="mb-2 text-xs font-semibold uppercase tracking-wide text-neutral-400">Circle</div>
        <div className="grid grid-cols-2 gap-2">
          <Field label="Fill"><input type="color" className={inputCls + " h-8 p-0.5"} value={c.fill} onChange={(e) => commitAndSave({ fill: e.target.value } as Partial<CircleObjectProps>)} /></Field>
          <Field label="Stroke"><input type="color" className={inputCls + " h-8 p-0.5"} value={c.stroke} onChange={(e) => commitAndSave({ stroke: e.target.value } as Partial<CircleObjectProps>)} /></Field>
          <Field label="Stroke width"><input type="number" className={inputCls} value={c.strokeWidth} onChange={(e) => commitAndSave({ strokeWidth: +e.target.value } as Partial<CircleObjectProps>)} /></Field>
        </div>
      </div>
    );
  }

  if (obj.type === "line") {
    const l = obj as LineObjectProps;
    return (
      <div>
        <div className="mb-2 text-xs font-semibold uppercase tracking-wide text-neutral-400">Line</div>
        <div className="grid grid-cols-2 gap-2">
          <Field label="Color"><input type="color" className={inputCls + " h-8 p-0.5"} value={l.stroke} onChange={(e) => commitAndSave({ stroke: e.target.value } as Partial<LineObjectProps>)} /></Field>
          <Field label="Thickness"><input type="number" className={inputCls} value={l.strokeWidth} onChange={(e) => commitAndSave({ strokeWidth: +e.target.value } as Partial<LineObjectProps>)} /></Field>
        </div>
      </div>
    );
  }

  if (obj.type === "image") {
    const im = obj as ImageObjectProps;
    return (
      <div>
        <div className="mb-2 text-xs font-semibold uppercase tracking-wide text-neutral-400">Image</div>
        <Field label="Fit">
          <select className={inputCls} value={im.fit} onChange={(e) => commitAndSave({ fit: e.target.value as ImageObjectProps["fit"] })}>
            <option value="contain">Contain</option>
            <option value="cover">Cover</option>
            <option value="stretch">Stretch</option>
          </select>
        </Field>
        <label className="mt-2 block cursor-pointer rounded border border-dashed border-neutral-300 px-2 py-2 text-center text-[11px] text-neutral-500 hover:border-neutral-400">
          Replace image
          <input
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (!file) return;
              const reader = new FileReader();
              reader.onload = () => commitAndSave({ src: reader.result as string } as Partial<ImageObjectProps>);
              reader.readAsDataURL(file);
            }}
          />
        </label>
      </div>
    );
  }

  if (obj.type === "qrcode") {
    const q = obj as QrCodeObjectProps;
    return (
      <div>
        <div className="mb-2 text-xs font-semibold uppercase tracking-wide text-neutral-400">QR Code</div>
        <Field label="Variable / data">
          <input className={inputCls + " font-mono"} value={q.variable} onChange={(e) => commitAndSave({ variable: e.target.value } as Partial<QrCodeObjectProps>)} />
        </Field>
        <div className="mt-2 grid grid-cols-2 gap-2">
          <Field label="Foreground"><input type="color" className={inputCls + " h-8 p-0.5"} value={q.foreground} onChange={(e) => commitAndSave({ foreground: e.target.value } as Partial<QrCodeObjectProps>)} /></Field>
          <Field label="Background"><input type="color" className={inputCls + " h-8 p-0.5"} value={q.background} onChange={(e) => commitAndSave({ background: e.target.value } as Partial<QrCodeObjectProps>)} /></Field>
        </div>
      </div>
    );
  }

  if (obj.type === "barcode") {
    const b = obj as BarcodeObjectProps;
    return (
      <div>
        <div className="mb-2 text-xs font-semibold uppercase tracking-wide text-neutral-400">Barcode</div>
        <Field label="Variable / data">
          <input className={inputCls + " font-mono"} value={b.variable} onChange={(e) => commitAndSave({ variable: e.target.value } as Partial<BarcodeObjectProps>)} />
        </Field>
        <Field label="Format">
          <select className={inputCls} value={b.format} onChange={(e) => commitAndSave({ format: e.target.value as BarcodeObjectProps["format"] })}>
            <option value="CODE128">Code128</option>
            <option value="EAN13">EAN-13</option>
            <option value="UPC">UPC</option>
          </select>
        </Field>
      </div>
    );
  }

  if (obj.type === "table") {
    const tb = obj as TableObjectProps;
    const updateCol = (id: string, patch: Partial<TableObjectProps["columns"][number]>) => {
      commitAndSave({ columns: tb.columns.map((c) => (c.id === id ? { ...c, ...patch } : c)) } as Partial<TableObjectProps>);
    };
    return (
      <div>
        <div className="mb-2 text-xs font-semibold uppercase tracking-wide text-neutral-400">Table</div>
        <Field label="Data source (variable)">
          <input className={inputCls + " font-mono"} value={tb.dataSource} onChange={(e) => commitAndSave({ dataSource: e.target.value } as Partial<TableObjectProps>)} />
        </Field>
        <div className="mt-2 grid grid-cols-2 gap-2">
          <Field label="Header fill"><input type="color" className={inputCls + " h-8 p-0.5"} value={tb.headerBg} onChange={(e) => commitAndSave({ headerBg: e.target.value } as Partial<TableObjectProps>)} /></Field>
          <Field label="Header text"><input type="color" className={inputCls + " h-8 p-0.5"} value={tb.headerColor} onChange={(e) => commitAndSave({ headerColor: e.target.value } as Partial<TableObjectProps>)} /></Field>
          <Field label="Font size"><input type="number" className={inputCls} value={tb.fontSize} onChange={(e) => commitAndSave({ fontSize: +e.target.value } as Partial<TableObjectProps>)} /></Field>
          <Field label="Row height"><input type="number" className={inputCls} value={tb.rowHeight} onChange={(e) => commitAndSave({ rowHeight: +e.target.value } as Partial<TableObjectProps>)} /></Field>
        </div>

        <div className="mt-3 flex items-center justify-between">
          <span className="text-[11px] font-medium text-neutral-500">Columns</span>
          <button
            className="text-[11px] text-sky-600 hover:underline"
            onClick={() =>
              commitAndSave({
                columns: [...tb.columns, { id: nanoid(6), header: "Column", field: "field" + tb.columns.length, width: 80, align: "left" }],
              } as Partial<TableObjectProps>)
            }
          >
            + Add column
          </button>
        </div>
        <div className="mt-1 flex flex-col gap-1.5">
          {tb.columns.map((c) => (
            <div key={c.id} className="flex items-center gap-1 rounded border border-neutral-200 bg-white p-1.5">
              <input
                className="w-16 min-w-0 flex-1 rounded border border-neutral-200 px-1 py-0.5 text-[10px]"
                value={c.header}
                onChange={(e) => updateCol(c.id, { header: e.target.value })}
              />
              <input
                className="w-12 rounded border border-neutral-200 px-1 py-0.5 text-[10px] font-mono"
                value={c.field}
                onChange={(e) => updateCol(c.id, { field: e.target.value })}
              />
              <input
                type="number"
                className="w-12 rounded border border-neutral-200 px-1 py-0.5 text-[10px]"
                value={c.width}
                onChange={(e) => updateCol(c.id, { width: +e.target.value })}
              />
              <button
                className="text-[10px] text-red-400 hover:text-red-600"
                onClick={() => commitAndSave({ columns: tb.columns.filter((x) => x.id !== c.id) } as Partial<TableObjectProps>)}
              >
                ✕
              </button>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return null;
}
