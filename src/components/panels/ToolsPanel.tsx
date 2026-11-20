"use client";

import { useRef } from "react";
import {
    Type,
    Square,
    Circle,
    Minus,
    ImagePlus,
    QrCode,
    Barcode as BarcodeIcon,
    Table2,
    Braces,
    PanelTop,
    PanelBottom,
} from "lucide-react";
import { useDesigner } from "@/lib/store";
import {
    createText,
    createRect,
    createCircle,
    createLine,
    createImage,
    createQrCode,
    createBarcode,
    createTable,
    createHeaderTemplate,
    createFooterTemplate,
} from "@/lib/objectFactory";
import { nextInsertPosition } from "@/lib/cursorTracker";
import { DragPayload } from "@/lib/dragPayload";

const VARIABLES = ["{{InvoiceNo}}", "{{CustomerName}}", "{{Total}}", "{{CompanyName}}", "{{Date}}"];

function ToolButton({
  icon,
  label,
  onInsert,
  dragPayload,
}: {
  icon: React.ReactNode;
  label: string;
  onInsert: () => void;
  dragPayload?: DragPayload;
}) {
  return (
    <button
      draggable={!!dragPayload}
      onDragStart={(e) => {
        if (!dragPayload) return;
        e.dataTransfer.setData("application/json", JSON.stringify(dragPayload));
        e.dataTransfer.effectAllowed = "copy";
      }}
      onClick={(event) => {
        if (event.detail > 1) return;
        onInsert();
      }}
      title={dragPayload ? "Click to insert, or drag onto the page" : "Click to insert"}
      className="flex flex-col items-center gap-1.5 rounded-lg border border-neutral-200 bg-white px-2 py-3 text-[11px] text-neutral-600 hover:border-neutral-300 hover:bg-neutral-50 hover:text-neutral-900 transition-colors cursor-grab active:cursor-grabbing"
    >
      {icon}
      {label}
    </button>
  );
}

export default function ToolsPanel() {
  const addObject = useDesigner((s) => s.addObject);
  const addObjects = useDesigner((s) => s.addObjects);
  const updateObject = useDesigner((s) => s.updateObject);
  const selectedId = useDesigner((s) => s.selectedId);
  const objects = useDesigner((s) => s.template.objects);
  const page = useDesigner((s) => s.template.page);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const selected = objects.find((o) => o.id === selectedId);

  return (
    <div className="flex w-56 shrink-0 flex-col gap-4 overflow-y-auto border-r border-neutral-200 bg-neutral-50 p-3">
      <div>
        <div className="mb-2 text-xs font-semibold uppercase tracking-wide text-neutral-400">Insert</div>
        <p className="mb-2 text-[10px] text-neutral-400">Click to drop it on the page, or drag it to an exact spot.</p>
        <div className="grid grid-cols-3 gap-2">
          <ToolButton
            icon={<Type size={18} />}
            label="Text"
            dragPayload={{ kind: "tool", toolType: "text" }}
            onInsert={() => {
              const pos = nextInsertPosition(200, 30);
              addObject(createText("Text", pos));
            }}
          />
          <ToolButton
            icon={<Square size={18} />}
            label="Rect"
            dragPayload={{ kind: "tool", toolType: "rect" }}
            onInsert={() => {
              const pos = nextInsertPosition(160, 90);
              addObject(createRect(pos));
            }}
          />
          <ToolButton
            icon={<Circle size={18} />}
            label="Circle"
            dragPayload={{ kind: "tool", toolType: "circle" }}
            onInsert={() => {
              const pos = nextInsertPosition(90, 90);
              addObject(createCircle(pos));
            }}
          />
          <ToolButton
            icon={<Minus size={18} />}
            label="Line"
            dragPayload={{ kind: "tool", toolType: "line" }}
            onInsert={() => {
              const pos = nextInsertPosition(200, 2);
              addObject(createLine(pos));
            }}
          />
          <ToolButton
            icon={<ImagePlus size={18} />}
            label="Image"
            onInsert={() => fileInputRef.current?.click()}
          />
          <ToolButton
            icon={<QrCode size={18} />}
            label="QR Code"
            dragPayload={{ kind: "tool", toolType: "qrcode" }}
            onInsert={() => {
              const pos = nextInsertPosition(100, 100);
              addObject(createQrCode(pos));
            }}
          />
          <ToolButton
            icon={<BarcodeIcon size={18} />}
            label="Barcode"
            dragPayload={{ kind: "tool", toolType: "barcode" }}
            onInsert={() => {
              const pos = nextInsertPosition(180, 60);
              addObject(createBarcode(pos));
            }}
          />
          <ToolButton
            icon={<Table2 size={18} />}
            label="Table"
            dragPayload={{ kind: "tool", toolType: "table" }}
            onInsert={() => {
              const pos = nextInsertPosition(460, 140);
              addObject(createTable(pos));
            }}
          />
        </div>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (!file) return;
            const reader = new FileReader();
            reader.onload = () => {
              const pos = nextInsertPosition(140, 90);
              addObject(createImage(reader.result as string, pos));
            };
            reader.readAsDataURL(file);
            e.target.value = "";
          }}
        />
      </div>

      <div>
        <div className="mb-2 text-xs font-semibold uppercase tracking-wide text-neutral-400">Header &amp; footer</div>
        <p className="mb-2 text-[10px] text-neutral-400">
          Add editable objects tagged with the report&apos;s header or footer region.
        </p>
        <div className="flex flex-col gap-1.5">
          <button
            onClick={(event) => {
              if (event.detail > 1) return;
              addObjects(createHeaderTemplate(page));
            }}
            className="flex items-center gap-2 rounded border border-sky-200 bg-sky-50 px-2 py-1.5 text-left text-[11px] text-sky-700 hover:border-sky-300 hover:bg-sky-100"
          >
            <PanelTop size={14} /> Add header template
          </button>
          <button
            onClick={(event) => {
              if (event.detail > 1) return;
              addObjects(createFooterTemplate(page));
            }}
            className="flex items-center gap-2 rounded border border-amber-200 bg-amber-50 px-2 py-1.5 text-left text-[11px] text-amber-700 hover:border-amber-300 hover:bg-amber-100"
          >
            <PanelBottom size={14} /> Add footer template
          </button>
        </div>
      </div>

      <div>
        <div className="mb-2 flex items-center gap-1 text-xs font-semibold uppercase tracking-wide text-neutral-400">
          <Braces size={13} /> Variables
        </div>
        <div className="flex flex-col gap-1.5">
          {VARIABLES.map((v) => (
            <button
              key={v}
              draggable
              onDragStart={(e) => {
                const payload: DragPayload = { kind: "variable", value: v };
                e.dataTransfer.setData("application/json", JSON.stringify(payload));
                e.dataTransfer.effectAllowed = "copy";
              }}
              onClick={(event) => {
                if (event.detail > 1) return;
                if (selected && selected.type === "text") {
                  updateObject(selected.id, { text: (selected.text ? selected.text + " " : "") + v });
                } else {
                  const pos = nextInsertPosition(200, 30);
                  addObject(createText(v, pos));
                }
              }}
              className="cursor-grab rounded border border-neutral-200 bg-white px-2 py-1.5 text-left font-mono text-[11px] text-sky-700 hover:border-sky-300 hover:bg-sky-50 active:cursor-grabbing"
            >
              {v}
            </button>
          ))}
        </div>
        <p className="mt-2 text-[11px] leading-relaxed text-neutral-400">
          {selected?.type === "text"
            ? "Inserted into the selected text block."
            : "Adds a new text block with this variable."}
        </p>
      </div>

      <div className="mt-auto rounded-lg border border-neutral-200 bg-white p-3 text-[11px] leading-relaxed text-neutral-400">
        Design once, render anywhere. This tool only produces a JSON layout — plug it into any backend
        rendering engine to generate the final PDF.
      </div>
    </div>
  );
}
