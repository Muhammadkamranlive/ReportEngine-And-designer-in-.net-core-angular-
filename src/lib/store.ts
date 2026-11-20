import { create } from "zustand";
import { nanoid } from "nanoid";
import {
    Template,
    TemplateObject,
    makePage,
    PageSizeName,
    Orientation,
    BaseObjectProps,
} from "./types";

function defaultTemplate(): Template {
  return {
    version: "1.0",
    name: "Untitled Template",
    page: makePage("A4", "portrait"),
    watermark: {
      enabled: false,
      text: "DRAFT",
      color: "#cc0000",
      opacity: 0.15,
      fontSize: 96,
      rotation: -35,
    },
    pagination: {
      enabled: false,
      format: "Page {{page}} of {{pages}}",
      align: "center",
    },
    objects: [],
  };
}

interface HistoryEntry {
  objects: TemplateObject[];
}

interface DesignerState {
  template: Template;
  selectedId: string | null;
  zoom: number;
  showGrid: boolean;
  snapToGrid: boolean;
  gridSize: number;
  history: HistoryEntry[];
  historyIndex: number;

  // actions
  setTemplateName: (name: string) => void;
  setPage: (size: PageSizeName, orientation: Orientation, custom?: { width: number; height: number }) => void;
  setMargins: (margins: Partial<Template["page"]["margins"]>) => void;
  addObject: (obj: TemplateObject) => void;
  addObjects: (objs: TemplateObject[]) => void;
  updateObject: (id: string, patch: Partial<TemplateObject>) => void;
  removeObject: (id: string) => void;
  duplicateObject: (id: string) => void;
  reorderObject: (id: string, direction: "front" | "back" | "forward" | "backward") => void;
  select: (id: string | null) => void;
  setZoom: (zoom: number) => void;
  toggleGrid: () => void;
  toggleSnap: () => void;
  setWatermark: (patch: Partial<Template["watermark"]>) => void;
  setPagination: (patch: Partial<Template["pagination"]>) => void;
  loadTemplate: (t: Template) => void;
  newTemplate: () => void;
  pushHistory: () => void;
  undo: () => void;
  redo: () => void;
}

function cloneObjects(objs: TemplateObject[]): TemplateObject[] {
  return JSON.parse(JSON.stringify(objs));
}

export const useDesigner = create<DesignerState>((set, get) => ({
  template: defaultTemplate(),
  selectedId: null,
  zoom: 1,
  showGrid: true,
  snapToGrid: true,
  gridSize: 10,
  history: [{ objects: [] }],
  historyIndex: 0,

  setTemplateName: (name) =>
    set((s) => ({ template: { ...s.template, name } })),

  setPage: (size, orientation, custom) =>
    set((s) => ({
      template: { ...s.template, page: makePage(size, orientation, custom) },
    })),

  setMargins: (margins) =>
    set((s) => ({
      template: {
        ...s.template,
        page: { ...s.template.page, margins: { ...s.template.page.margins, ...margins } },
      },
    })),

  addObject: (obj) => {
    set((s) => ({
      template: { ...s.template, objects: [...s.template.objects, obj] },
      selectedId: obj.id,
    }));
    get().pushHistory();
  },

  addObjects: (objs) => {
    if (objs.length === 0) return;
    set((s) => ({
      template: { ...s.template, objects: [...s.template.objects, ...objs] },
      selectedId: objs[objs.length - 1]?.id ?? s.selectedId,
    }));
    get().pushHistory();
  },

  updateObject: (id, patch) =>
    set((s) => ({
      template: {
        ...s.template,
        objects: s.template.objects.map((o) =>
          o.id === id ? ({ ...o, ...patch } as TemplateObject) : o
        ),
      },
    })),

  removeObject: (id) => {
    set((s) => ({
      template: {
        ...s.template,
        objects: s.template.objects.filter((o) => o.id !== id),
      },
      selectedId: s.selectedId === id ? null : s.selectedId,
    }));
    get().pushHistory();
  },

  duplicateObject: (id) => {
    const obj = get().template.objects.find((o) => o.id === id);
    if (!obj) return;
    const copy: TemplateObject = {
      ...JSON.parse(JSON.stringify(obj)),
      id: nanoid(8),
      x: obj.x + 12,
      y: obj.y + 12,
      name: obj.name + " copy",
    };
    set((s) => ({
      template: { ...s.template, objects: [...s.template.objects, copy] },
      selectedId: copy.id,
    }));
    get().pushHistory();
  },

  reorderObject: (id, direction) => {
    set((s) => {
      const objs = [...s.template.objects];
      const idx = objs.findIndex((o) => o.id === id);
      if (idx === -1) return {};
      const [item] = objs.splice(idx, 1);
      if (direction === "front") objs.push(item);
      else if (direction === "back") objs.unshift(item);
      else if (direction === "forward") objs.splice(Math.min(idx + 1, objs.length), 0, item);
      else objs.splice(Math.max(idx - 1, 0), 0, item);
      return { template: { ...s.template, objects: objs } };
    });
    get().pushHistory();
  },

  select: (id) => set({ selectedId: id }),
  setZoom: (zoom) => set({ zoom }),
  toggleGrid: () => set((s) => ({ showGrid: !s.showGrid })),
  toggleSnap: () => set((s) => ({ snapToGrid: !s.snapToGrid })),

  setWatermark: (patch) =>
    set((s) => ({ template: { ...s.template, watermark: { ...s.template.watermark, ...patch } } })),

  setPagination: (patch) =>
    set((s) => ({ template: { ...s.template, pagination: { ...s.template.pagination, ...patch } } })),

  loadTemplate: (t) =>
    set({
      template: t,
      selectedId: null,
      history: [{ objects: cloneObjects(t.objects) }],
      historyIndex: 0,
    }),

  newTemplate: () =>
    set({
      template: defaultTemplate(),
      selectedId: null,
      history: [{ objects: [] }],
      historyIndex: 0,
    }),

  pushHistory: () =>
    set((s) => {
      const trimmed = s.history.slice(0, s.historyIndex + 1);
      const next = [...trimmed, { objects: cloneObjects(s.template.objects) }];
      const capped = next.length > 60 ? next.slice(next.length - 60) : next;
      return { history: capped, historyIndex: capped.length - 1 };
    }),

  undo: () => {
    const s = get();
    if (s.historyIndex <= 0) return;
    const newIndex = s.historyIndex - 1;
    set({
      historyIndex: newIndex,
      template: { ...s.template, objects: cloneObjects(s.history[newIndex].objects) },
      selectedId: null,
    });
  },

  redo: () => {
    const s = get();
    if (s.historyIndex >= s.history.length - 1) return;
    const newIndex = s.historyIndex + 1;
    set({
      historyIndex: newIndex,
      template: { ...s.template, objects: cloneObjects(s.history[newIndex].objects) },
      selectedId: null,
    });
  },
}));

export function newId() {
  return nanoid(8);
}

export function defaultBase(type: TemplateObject["type"], overrides: Partial<BaseObjectProps> = {}): BaseObjectProps {
  return {
    id: newId(),
    type,
    name: type[0].toUpperCase() + type.slice(1),
    x: 60,
    y: 60,
    width: 160,
    height: 40,
    rotation: 0,
    locked: false,
    hidden: false,
    region: "body",
    ...overrides,
  };
}
