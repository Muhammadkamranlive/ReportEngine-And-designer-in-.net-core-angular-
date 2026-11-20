# Autobanker Reports Manager

A browser-based, drag-and-drop PDF report **layout designer** built with Next.js, TypeScript, and Fabric.js.

It does **not** generate PDFs. It lets you visually design a report layout — invoices, labels, certificates,
whatever — and exports a single JSON file describing every element on the page (position, size, fonts, colors,
variables, table columns, etc). A separate rendering engine (ASP.NET Core, Node, Python, Java...) then takes that
JSON plus real business data and produces the final PDF.

## Getting started

```bash
npm install
npm run dev
```

Open http://localhost:3000. No backend, database, or API key is required — everything runs client-side and
templates you "Save" are stored in your browser's localStorage.

Use **Templates** to start from 25 editable banking-document layouts. Insert tools can be clicked for a
cursor-aware placement or dragged onto the canvas; image files can also be dropped onto the page.

To preview a rendered PDF, start the API from `../backend` with `dotnet run` and copy `.env.example` to
`.env.local` if the API is not at `http://127.0.0.1:5080`. The API allows the local frontend origins by default.

For a production build:

```bash
npm run build
npm run start
```

## What's implemented

- **Canvas** — drag, resize, rotate, multi-layer stacking (Fabric.js), zoom, grid, snap-to-grid, undo/redo,
  arrow-key nudging, delete.
- **Page setup** — A4 / Letter / Legal, portrait / landscape, margin guides.
- **Objects** — Text, Rectangle, Circle, Line, Image (upload), QR code, Barcode (Code128 / EAN-13 / UPC), Table
  (configurable columns, repeating-row preview).
- **Starter reports** — 25 editable templates for statements, account letters, loans, HR, vouchers, transactions,
  and digital onboarding, with search and category filters.
- **Header and footer presets** — insert prebuilt groups of objects tagged with header/footer regions. The current
  PDF renderer does not yet repeat these regions across multiple pages.
- **Variables** — `{{InvoiceNo}}`, `{{CustomerName}}`, etc. Insertable into any text block, or as the data source
  for QR/barcode/table objects.
- **Header / Body / Footer regions** — assign objects to report regions in the template schema.
- **Watermark & pagination** — toggleable, with live canvas preview.
- **Layers panel** — reorder, lock, hide, duplicate, delete.
- **Properties panel** — full control over every object's fields, plus page-relative alignment tools.
- **Export / Import** — download the template as `.json`, or load one back in. "Save" / "Open" persist templates
  in the browser for quick iteration.
- **PDF preview** — send the current template to the local .NET renderer and preview or download the returned PDF.

## Template JSON shape

```jsonc
{
  "version": "1.0",
  "name": "Invoice Template",
  "page": { "size": "A4", "orientation": "portrait", "width": 595, "height": 842, "margins": { "top": 36, "right": 36, "bottom": 36, "left": 36 } },
  "watermark": { "enabled": false, "text": "DRAFT", "color": "#cc0000", "opacity": 0.15, "fontSize": 96, "rotation": -35 },
  "pagination": { "enabled": true, "format": "Page {{page}} of {{pages}}", "align": "center" },
  "objects": [
    {
      "id": "a1b2c3d4",
      "type": "text",
      "name": "Customer name",
      "x": 120, "y": 80, "width": 200, "height": 30, "rotation": 0,
      "locked": false, "hidden": false, "region": "body",
      "text": "{{CustomerName}}",
      "fontFamily": "Helvetica", "fontSize": 18, "fontWeight": "normal", "fontStyle": "normal",
      "underline": false, "color": "#1a1a1a", "backgroundColor": null, "align": "left", "letterSpacing": 0
    }
  ]
}
```

Every object shares the base fields (`id`, `type`, `name`, `x`, `y`, `width`, `height`, `rotation`, `locked`,
`hidden`, `region`) plus type-specific fields. See `src/lib/types.ts` for the full TypeScript definitions of every
object type (`text`, `rect`, `circle`, `line`, `image`, `qrcode`, `barcode`, `table`) — that file is the source of
truth for whatever rendering engine you build against this format. All coordinates and sizes are in PDF points
(1/72 inch), matching the `page.width` / `page.height` values, so a renderer can map them 1:1 onto a PDF canvas.

## Project structure

```
src/
  app/page.tsx                 Top-level layout (toolbar + panels + canvas)
  components/
    toolbar/Toolbar.tsx         Page setup, zoom, undo/redo, watermark/pagination, export/import, save/load
    panels/ToolsPanel.tsx       Left sidebar — insert objects & variables
    panels/PropertiesPanel.tsx  Right sidebar — edit the selected object
    panels/LayersPanel.tsx      Bottom strip — layer list, visibility/lock/reorder
    canvas/DesignCanvas.tsx     Fabric.js canvas, page rendering, keyboard shortcuts, store sync
  lib/
    types.ts                   Template & object TypeScript schema (source of truth)
    store.ts                   Zustand store (template state, selection, history)
    objectFactory.ts           Default-value factories for each object type
    canvasRender.ts             Converts template objects <-> Fabric.js objects (incl. QR/barcode rendering)
    persistence.ts              JSON export/import + localStorage save/load
```

## Next steps (not built here)

This repo is the **designer** half only. To go from JSON to an actual PDF, build a renderer that:

1. Loads the template JSON.
2. Receives business data (e.g. invoice fields, a product array for tables).
3. Replaces `{{Variable}}` placeholders in text, QR, and barcode objects.
4. Draws the header/body/footer regions, repeating header/footer on every page.
5. Repeats table rows from the bound data source, adding page breaks as needed.
6. Renders watermark and pagination if enabled.
7. Outputs the final PDF (e.g. with PDFKit/QuestPDF/iText/ReportLab, depending on your stack).

## License

MIT
