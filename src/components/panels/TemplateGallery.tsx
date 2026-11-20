"use client";

import { useMemo, useState } from "react";
import { X, Search, FileStack, ArrowRight } from "lucide-react";
import { STARTER_TEMPLATES, STARTER_TEMPLATE_CATEGORIES } from "@/lib/starterTemplates";
import { useDesigner } from "@/lib/store";

export default function TemplateGallery({ open, onClose }: { open: boolean; onClose: () => void }) {
  const loadTemplate = useDesigner((s) => s.loadTemplate);
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState<string>("All");

  const filtered = useMemo(() => {
    return STARTER_TEMPLATES.filter((t) => {
      const matchesCategory = category === "All" || t.category === category;
      const q = query.trim().toLowerCase();
      const matchesQuery = !q || t.name.toLowerCase().includes(q) || t.description.toLowerCase().includes(q) || t.category.toLowerCase().includes(q);
      return matchesCategory && matchesQuery;
    });
  }, [query, category]);

  if (!open) return null;

  const use = (id: string) => {
    const def = STARTER_TEMPLATES.find((t) => t.id === id);
    if (!def) return;
    loadTemplate(def.build());
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center bg-black/40 p-6 pt-14" onClick={onClose}>
      <div
        className="flex max-h-[80vh] w-full max-w-4xl flex-col overflow-hidden rounded-xl bg-white shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-neutral-200 px-5 py-4">
          <div className="flex items-center gap-2">
            <FileStack size={18} className="text-neutral-500" />
            <h2 className="text-sm font-semibold text-neutral-800">Starter templates</h2>
            <span className="rounded-full bg-neutral-100 px-2 py-0.5 text-[11px] text-neutral-500">{STARTER_TEMPLATES.length}</span>
          </div>
          <button onClick={onClose} className="rounded p-1 text-neutral-400 hover:bg-neutral-100 hover:text-neutral-700">
            <X size={18} />
          </button>
        </div>

        <div className="flex items-center gap-2 border-b border-neutral-200 px-5 py-3">
          <div className="relative flex-1">
            <Search size={14} className="pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2 text-neutral-400" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search templates (e.g. loan, clearing, IBFT)…"
              className="w-full rounded-md border border-neutral-200 py-1.5 pl-8 pr-3 text-sm text-neutral-700 focus:border-neutral-400 focus:outline-none"
            />
          </div>
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="rounded-md border border-neutral-200 px-2 py-1.5 text-sm text-neutral-700"
          >
            <option value="All">All categories</option>
            {STARTER_TEMPLATE_CATEGORIES.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </div>

        <div className="grid flex-1 auto-rows-min grid-cols-1 gap-3 overflow-y-auto p-5 sm:grid-cols-2">
          {filtered.length === 0 && (
            <div className="col-span-2 py-10 text-center text-sm text-neutral-400">No templates match &ldquo;{query}&rdquo;.</div>
          )}
          {filtered.map((t) => (
            <button
              key={t.id}
              onClick={() => use(t.id)}
              className="group flex flex-col items-start gap-2 rounded-lg border border-neutral-200 p-3.5 text-left transition-colors hover:border-sky-300 hover:bg-sky-50"
            >
              <span className="rounded-full bg-neutral-100 px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide text-neutral-500 group-hover:bg-sky-100 group-hover:text-sky-700">
                {t.category}
              </span>
              <span className="text-sm font-semibold text-neutral-800">{t.name}</span>
              <span className="text-xs leading-relaxed text-neutral-500">{t.description}</span>
              <span className="mt-1 flex items-center gap-1 text-[11px] font-medium text-sky-600 opacity-0 transition-opacity group-hover:opacity-100">
                Use this template <ArrowRight size={12} />
              </span>
            </button>
          ))}
        </div>

        <div className="border-t border-neutral-200 px-5 py-3 text-[11px] text-neutral-400">
          Loading a template replaces the current canvas. Every field, layout, and color is fully editable afterward — these are starting points, not locked forms.
        </div>
      </div>
    </div>
  );
}
