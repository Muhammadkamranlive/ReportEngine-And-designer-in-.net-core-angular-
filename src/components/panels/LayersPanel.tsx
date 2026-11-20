"use client";

import {
  Type,
  Square,
  Circle,
  Minus,
  Image as ImageIcon,
  QrCode,
  Barcode as BarcodeIcon,
  Table2,
  Eye,
  EyeOff,
  Lock,
  Unlock,
  Copy,
  Trash2,
  ChevronUp,
  ChevronDown,
} from "lucide-react";
import { useDesigner } from "@/lib/store";
import { TemplateObject } from "@/lib/types";

const ICONS: Record<TemplateObject["type"], React.ReactNode> = {
  text: <Type size={14} />,
  rect: <Square size={14} />,
  circle: <Circle size={14} />,
  line: <Minus size={14} />,
  image: <ImageIcon size={14} />,
  qrcode: <QrCode size={14} />,
  barcode: <BarcodeIcon size={14} />,
  table: <Table2 size={14} />,
};

export default function LayersPanel() {
  const objects = useDesigner((s) => s.template.objects);
  const selectedId = useDesigner((s) => s.selectedId);
  const select = useDesigner((s) => s.select);
  const updateObject = useDesigner((s) => s.updateObject);
  const removeObject = useDesigner((s) => s.removeObject);
  const duplicateObject = useDesigner((s) => s.duplicateObject);
  const reorderObject = useDesigner((s) => s.reorderObject);
  const pushHistory = useDesigner((s) => s.pushHistory);

  const reversed = [...objects].reverse();

  return (
    <div className="flex h-56 shrink-0 flex-col border-t border-neutral-200 bg-neutral-50">
      <div className="px-3 py-2 text-xs font-semibold uppercase tracking-wide text-neutral-400">
        Layers ({objects.length})
      </div>
      <div className="flex-1 overflow-y-auto px-2 pb-2">
        {reversed.length === 0 && (
          <div className="px-2 py-3 text-[11px] text-neutral-400">No objects yet — add something from the left panel.</div>
        )}
        {reversed.map((o) => (
          <div
            key={o.id}
            onClick={() => select(o.id)}
            className={`group mb-1 flex items-center gap-1.5 rounded-md border px-2 py-1.5 text-xs cursor-pointer ${
              selectedId === o.id ? "border-sky-300 bg-sky-50" : "border-transparent hover:bg-neutral-100"
            }`}
          >
            <span className="text-neutral-400">{ICONS[o.type]}</span>
            <span className="flex-1 truncate text-neutral-700">{o.name}</span>
            <button
              title="Move up"
              onClick={(e) => {
                e.stopPropagation();
                reorderObject(o.id, "forward");
              }}
              className="hidden group-hover:block text-neutral-400 hover:text-neutral-700"
            >
              <ChevronUp size={13} />
            </button>
            <button
              title="Move down"
              onClick={(e) => {
                e.stopPropagation();
                reorderObject(o.id, "backward");
              }}
              className="hidden group-hover:block text-neutral-400 hover:text-neutral-700"
            >
              <ChevronDown size={13} />
            </button>
            <button
              title={o.hidden ? "Show" : "Hide"}
              onClick={(e) => {
                e.stopPropagation();
                updateObject(o.id, { hidden: !o.hidden });
                pushHistory();
              }}
              className="text-neutral-400 hover:text-neutral-700"
            >
              {o.hidden ? <EyeOff size={13} /> : <Eye size={13} />}
            </button>
            <button
              title={o.locked ? "Unlock" : "Lock"}
              onClick={(e) => {
                e.stopPropagation();
                updateObject(o.id, { locked: !o.locked });
                pushHistory();
              }}
              className="text-neutral-400 hover:text-neutral-700"
            >
              {o.locked ? <Lock size={13} /> : <Unlock size={13} />}
            </button>
            <button
              title="Duplicate"
              onClick={(e) => {
                e.stopPropagation();
                duplicateObject(o.id);
              }}
              className="hidden group-hover:block text-neutral-400 hover:text-neutral-700"
            >
              <Copy size={13} />
            </button>
            <button
              title="Delete"
              onClick={(e) => {
                e.stopPropagation();
                removeObject(o.id);
              }}
              className="hidden group-hover:block text-red-400 hover:text-red-600"
            >
              <Trash2 size={13} />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
