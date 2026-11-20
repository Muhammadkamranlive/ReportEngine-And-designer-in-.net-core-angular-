"use client";

import { useRef, useState } from "react";
import {
    FileDown,
    FileUp,
    Eye,
    Undo2,
    Redo2,
    ZoomIn,
    ZoomOut,
    Grid3x3,
    Magnet,
    Save,
    FolderOpen,
    FilePlus2,
    Droplets,
    Hash,
    FileStack,
    LoaderCircle,
    X,
} from "lucide-react";
import { useDesigner } from "@/lib/store";
import { PageSizeName, Orientation } from "@/lib/types";
import {
    downloadJSON,
    readJSONFile,
    saveTemplate,
    listSavedTemplates,
    loadSavedTemplate,
    deleteSavedTemplate,
    SavedTemplateMeta,
} from "@/lib/persistence";
import { nanoid } from "nanoid";

export default function Toolbar({ onOpenTemplates }: { onOpenTemplates: () => void }) {
  const template = useDesigner((s) => s.template);
  const setTemplateName = useDesigner((s) => s.setTemplateName);
  const setPage = useDesigner((s) => s.setPage);
  const zoom = useDesigner((s) => s.zoom);
  const setZoom = useDesigner((s) => s.setZoom);
  const showGrid = useDesigner((s) => s.showGrid);
  const toggleGrid = useDesigner((s) => s.toggleGrid);
  const snapToGrid = useDesigner((s) => s.snapToGrid);
  const toggleSnap = useDesigner((s) => s.toggleSnap);
  const undo = useDesigner((s) => s.undo);
  const redo = useDesigner((s) => s.redo);
  const loadTemplate = useDesigner((s) => s.loadTemplate);
  const newTemplate = useDesigner((s) => s.newTemplate);
  const setWatermark = useDesigner((s) => s.setWatermark);
  const setPagination = useDesigner((s) => s.setPagination);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [showLoadMenu, setShowLoadMenu] = useState(false);
  const [showWatermarkMenu, setShowWatermarkMenu] = useState(false);
  const [saved, setSaved] = useState<SavedTemplateMeta[]>([]);
  const [isRendering, setIsRendering] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [previewError, setPreviewError] = useState<string | null>(null);
  const currentIdRef = useRef<string>(nanoid(8));

  const renderPreview = async () => {
    setIsRendering(true);
    setPreviewError(null);

    try {
      const apiUrl = (process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:5080").replace(/\/+$/, "");
      const response = await fetch(`${apiUrl}/api/pdf/generate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ template, data: {} }),
      });

      if (!response.ok) {
        const detail = await response.text();
        throw new Error(detail || `PDF service returned ${response.status}.`);
      }

      if (!response.headers.get("content-type")?.includes("application/pdf"))
        throw new Error("The render service did not return a PDF.");

      if (previewUrl) URL.revokeObjectURL(previewUrl);
      setPreviewUrl(URL.createObjectURL(await response.blob()));
    } catch (error) {
      setPreviewError(error instanceof Error ? error.message : "Could not render this report.");
    } finally {
      setIsRendering(false);
    }
  };

  const closePreview = () => {
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setPreviewUrl(null);
  };

  const openLoadMenu = () => {
    setSaved(listSavedTemplates());
    setShowLoadMenu((v) => !v);
  };

  return (
    <div className="flex h-14 shrink-0 items-center gap-2 border-b border-neutral-200 bg-white px-3 text-sm">
      <div className="flex items-center gap-2 pr-3 border-r border-neutral-200">
        <span className="font-semibold text-neutral-800 whitespace-nowrap">Autobanker Reports Manager</span>
      </div>

      <input
        value={template.name}
        onChange={(e) => setTemplateName(e.target.value)}
        className="w-48 rounded border border-neutral-200 px-2 py-1.5 text-neutral-700 focus:border-neutral-400 focus:outline-none"
        placeholder="Template name"
      />

      <select
        value={template.page.size}
        onChange={(e) => setPage(e.target.value as PageSizeName, template.page.orientation)}
        className="rounded border border-neutral-200 px-2 py-1.5 text-neutral-700"
      >
        <option value="A4">A4</option>
        <option value="Letter">Letter</option>
        <option value="Legal">Legal</option>
      </select>

      <select
        value={template.page.orientation}
        onChange={(e) => setPage(template.page.size, e.target.value as Orientation)}
        className="rounded border border-neutral-200 px-2 py-1.5 text-neutral-700"
      >
        <option value="portrait">Portrait</option>
        <option value="landscape">Landscape</option>
      </select>

      <div className="mx-1 h-6 w-px bg-neutral-200" />

      <button title="Undo (Ctrl+Z)" onClick={undo} className="rounded p-1.5 hover:bg-neutral-100">
        <Undo2 size={17} />
      </button>
      <button title="Redo (Ctrl+Shift+Z)" onClick={redo} className="rounded p-1.5 hover:bg-neutral-100">
        <Redo2 size={17} />
      </button>

      <div className="mx-1 h-6 w-px bg-neutral-200" />

      <button title="Zoom out" onClick={() => setZoom(Math.max(0.25, +(zoom - 0.1).toFixed(2)))} className="rounded p-1.5 hover:bg-neutral-100">
        <ZoomOut size={17} />
      </button>
      <span className="w-10 text-center text-xs text-neutral-500">{Math.round(zoom * 100)}%</span>
      <button title="Zoom in" onClick={() => setZoom(Math.min(3, +(zoom + 0.1).toFixed(2)))} className="rounded p-1.5 hover:bg-neutral-100">
        <ZoomIn size={17} />
      </button>

      <button
        title="Toggle grid"
        onClick={toggleGrid}
        className={`rounded p-1.5 hover:bg-neutral-100 ${showGrid ? "bg-neutral-100 text-neutral-900" : "text-neutral-500"}`}
      >
        <Grid3x3 size={17} />
      </button>
      <button
        title="Snap to grid"
        onClick={toggleSnap}
        className={`rounded p-1.5 hover:bg-neutral-100 ${snapToGrid ? "bg-neutral-100 text-neutral-900" : "text-neutral-500"}`}
      >
        <Magnet size={17} />
      </button>

      <div className="mx-1 h-6 w-px bg-neutral-200" />

      <div className="relative">
        <button
          title="Watermark & pagination"
          onClick={() => setShowWatermarkMenu((v) => !v)}
          className={`rounded p-1.5 hover:bg-neutral-100 ${template.watermark.enabled ? "text-sky-600" : "text-neutral-500"}`}
        >
          <Droplets size={17} />
        </button>
        {showWatermarkMenu && (
          <div className="absolute left-0 top-9 z-30 w-64 rounded-md border border-neutral-200 bg-white p-3 shadow-lg">
            <div className="mb-2 flex items-center justify-between">
              <span className="font-medium text-neutral-700">Watermark</span>
              <input
                type="checkbox"
                checked={template.watermark.enabled}
                onChange={(e) => setWatermark({ enabled: e.target.checked })}
              />
            </div>
            <input
              value={template.watermark.text}
              onChange={(e) => setWatermark({ text: e.target.value })}
              className="mb-2 w-full rounded border border-neutral-200 px-2 py-1 text-xs"
              placeholder="DRAFT / PAID / COPY"
            />
            <div className="mb-3 flex items-center gap-2 text-xs text-neutral-500">
              <label className="flex items-center gap-1">
                Opacity
                <input
                  type="range"
                  min={0.05}
                  max={0.6}
                  step={0.05}
                  value={template.watermark.opacity}
                  onChange={(e) => setWatermark({ opacity: parseFloat(e.target.value) })}
                />
              </label>
            </div>
            <div className="mb-2 flex items-center justify-between border-t border-neutral-100 pt-2">
              <span className="font-medium text-neutral-700 flex items-center gap-1">
                <Hash size={13} /> Pagination
              </span>
              <input
                type="checkbox"
                checked={template.pagination.enabled}
                onChange={(e) => setPagination({ enabled: e.target.checked })}
              />
            </div>
            <input
              value={template.pagination.format}
              onChange={(e) => setPagination({ format: e.target.value })}
              className="w-full rounded border border-neutral-200 px-2 py-1 text-xs"
              placeholder="Page {{page}} of {{pages}}"
            />
          </div>
        )}
      </div>

      <div className="mx-1 h-6 w-px bg-neutral-200" />

      <button title="New template" onClick={() => newTemplate()} className="rounded p-1.5 hover:bg-neutral-100">
        <FilePlus2 size={17} />
      </button>

      <button
        title="Browse starter templates"
        onClick={onOpenTemplates}
        className="flex items-center gap-1 rounded border border-neutral-200 px-2.5 py-1.5 text-neutral-700 hover:bg-neutral-50"
      >
        <FileStack size={15} /> Templates
      </button>

      <button
        title="Save to browser"
        onClick={() => {
          saveTemplate(currentIdRef.current, template);
        }}
        className="flex items-center gap-1 rounded p-1.5 hover:bg-neutral-100"
      >
        <Save size={17} />
      </button>

      <div className="relative">
        <button title="Open saved" onClick={openLoadMenu} className="rounded p-1.5 hover:bg-neutral-100">
          <FolderOpen size={17} />
        </button>
        {showLoadMenu && (
          <div className="absolute right-0 top-9 z-30 w-64 max-h-72 overflow-auto rounded-md border border-neutral-200 bg-white p-2 shadow-lg">
            {saved.length === 0 && <div className="p-2 text-xs text-neutral-400">No saved templates yet.</div>}
            {saved.map((s) => (
              <div key={s.id} className="flex items-center justify-between rounded px-2 py-1.5 hover:bg-neutral-50">
                <button
                  className="flex-1 truncate text-left text-xs text-neutral-700"
                  onClick={() => {
                    const t = loadSavedTemplate(s.id);
                    if (t) {
                      loadTemplate(t);
                      currentIdRef.current = s.id;
                    }
                    setShowLoadMenu(false);
                  }}
                >
                  {s.name}
                  <div className="text-[10px] text-neutral-400">{new Date(s.savedAt).toLocaleString()}</div>
                </button>
                <button
                  className="ml-1 text-[10px] text-red-400 hover:text-red-600"
                  onClick={() => {
                    deleteSavedTemplate(s.id);
                    setSaved(listSavedTemplates());
                  }}
                >
                  Delete
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      <button title="Export JSON" onClick={() => downloadJSON(template)} className="flex items-center gap-1 rounded bg-neutral-900 px-3 py-1.5 text-white hover:bg-neutral-800">
        <FileDown size={15} /> Export
      </button>

      <button
        title="Import JSON"
        onClick={() => fileInputRef.current?.click()}
        className="flex items-center gap-1 rounded border border-neutral-200 px-3 py-1.5 text-neutral-700 hover:bg-neutral-50"
      >
        <FileUp size={15} /> Import
      </button>
      <button
        title="Preview PDF"
        aria-label="Preview PDF"
        onClick={() => void renderPreview()}
        disabled={isRendering}
        className="rounded p-1.5 text-neutral-700 hover:bg-neutral-100 disabled:opacity-50"
      >
        {isRendering ? <LoaderCircle size={17} className="animate-spin" /> : <Eye size={17} />}
      </button>
      <input
        ref={fileInputRef}
        type="file"
        accept="application/json"
        className="hidden"
        onChange={async (e) => {
          const file = e.target.files?.[0];
          if (!file) return;
          try {
            const t = await readJSONFile(file);
            loadTemplate(t);
          } catch {
            alert("Could not read that file as a valid template JSON.");
          }
          e.target.value = "";
        }}
      />
      {previewError && (
        <div role="alert" className="fixed bottom-4 right-4 z-[110] flex max-w-lg items-start gap-3 border border-red-200 bg-white p-3 text-sm text-red-700 shadow-lg">
          <span>{previewError}</span>
          <button title="Dismiss error" onClick={() => setPreviewError(null)} className="shrink-0 rounded p-0.5 hover:bg-red-50">
            <X size={16} />
          </button>
        </div>
      )}
      {previewUrl && (
        <div role="dialog" aria-modal="true" aria-labelledby="pdf-preview-title" className="fixed inset-0 z-[100] flex flex-col bg-black/70 p-4">
          <header className="flex h-12 shrink-0 items-center justify-between bg-white px-4">
            <h2 id="pdf-preview-title" className="text-sm font-semibold text-neutral-800">PDF Preview</h2>
            <div className="flex items-center gap-2">
              <a
                href={previewUrl}
                download={`${template.name.trim().replace(/[^a-z0-9-_]+/gi, "_") || "report"}.pdf`}
                title="Download PDF"
                className="rounded p-2 text-neutral-700 hover:bg-neutral-100"
              >
                <FileDown size={17} />
              </a>
              <button title="Close preview" aria-label="Close preview" onClick={closePreview} className="rounded p-2 text-neutral-700 hover:bg-neutral-100">
                <X size={17} />
              </button>
            </div>
          </header>
          <iframe title="Rendered report PDF" src={previewUrl} className="min-h-0 flex-1 bg-neutral-200" />
        </div>
      )}
    </div>
  );
}
