import { Template } from "./types";

const STORAGE_KEY = "pdf-template-designer:templates";

export interface SavedTemplateMeta {
  id: string;
  name: string;
  savedAt: number;
}

interface StoredBundle {
  [id: string]: { meta: SavedTemplateMeta; template: Template };
}

function readBundle(): StoredBundle {
  if (typeof window === "undefined") return {};
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as StoredBundle) : {};
  } catch {
    return {};
  }
}

function writeBundle(bundle: StoredBundle) {
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(bundle));
}

export function listSavedTemplates(): SavedTemplateMeta[] {
  const bundle = readBundle();
  return Object.values(bundle)
    .map((v) => v.meta)
    .sort((a, b) => b.savedAt - a.savedAt);
}

export function saveTemplate(id: string, template: Template) {
  const bundle = readBundle();
  bundle[id] = { meta: { id, name: template.name, savedAt: Date.now() }, template };
  writeBundle(bundle);
}

export function loadSavedTemplate(id: string): Template | null {
  const bundle = readBundle();
  return bundle[id]?.template ?? null;
}

export function deleteSavedTemplate(id: string) {
  const bundle = readBundle();
  delete bundle[id];
  writeBundle(bundle);
}

export function downloadJSON(template: Template) {
  const blob = new Blob([JSON.stringify(template, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  const safe = template.name.trim().replace(/[^a-z0-9\-_]+/gi, "_") || "template";
  a.download = `${safe}.json`;
  a.click();
  URL.revokeObjectURL(url);
}

export function readJSONFile(file: File): Promise<Template> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const parsed = JSON.parse(reader.result as string);
        resolve(parsed as Template);
      } catch (err) {
        reject(err);
      }
    };
    reader.onerror = reject;
    reader.readAsText(file);
  });
}
