import { Template, TemplateObject, TextObjectProps, TableColumn, makePage } from "../types";
import {
  createText,
  createRect,
  createLine,
  createTable,
  createQrCode,
  createBarcode,
  createCircle,
} from "../objectFactory";

const PAGE_WIDTH = 595;
const MARGIN = 36;
const CONTENT_WIDTH = PAGE_WIDTH - MARGIN * 2;

/** Bank letterhead: logo mark, bank name/address, a rule, then the document title. */
export function bankHeader(title: string, subtitle?: string, accent = "#0f3d68"): TemplateObject[] {
  const objs: TemplateObject[] = [
    createRect({
      name: "Logo mark",
      x: MARGIN,
      y: 26,
      width: 44,
      height: 44,
      fill: accent,
      stroke: accent,
      rx: 8,
      region: "header",
    }),
    createText("{{BankName}}", {
      name: "Bank name",
      x: MARGIN + 56,
      y: 28,
      width: 300,
      height: 22,
      fontSize: 17,
      fontWeight: "bold",
      color: accent,
      region: "header",
    }),
    createText("{{BankAddress}}  ·  {{BankPhone}}", {
      name: "Bank address",
      x: MARGIN + 56,
      y: 52,
      width: 380,
      height: 16,
      fontSize: 8.5,
      color: "#6b7280",
      region: "header",
    }),
    createLine({
      name: "Header rule",
      x: MARGIN,
      y: 82,
      width: CONTENT_WIDTH,
      height: 2,
      stroke: accent,
      strokeWidth: 1.5,
      region: "header",
    }),
    createText(title, {
      name: "Document title",
      x: MARGIN,
      y: 94,
      width: CONTENT_WIDTH,
      height: 22,
      fontSize: 14,
      fontWeight: "bold",
      align: "center",
      color: "#111827",
      region: "body",
    }),
  ];
  if (subtitle) {
    objs.push(
      createText(subtitle, {
        name: "Document subtitle",
        x: MARGIN,
        y: 116,
        width: CONTENT_WIDTH,
        height: 16,
        fontSize: 9.5,
        align: "center",
        color: "#6b7280",
        region: "body",
      })
    );
  }
  return objs;
}

export function footerBlock(note = "This is a system-generated document and does not require a physical signature."): TemplateObject[] {
  return [
    createLine({ name: "Footer rule", x: MARGIN, y: 794, width: CONTENT_WIDTH, height: 1, stroke: "#d1d5db", region: "footer" }),
    createText(note, { name: "Footer note", x: MARGIN, y: 802, width: 400, height: 14, fontSize: 7.5, color: "#9ca3af", region: "footer" }),
    createText("Page {{page}} of {{pages}}", {
      name: "Page number",
      x: PAGE_WIDTH - MARGIN - 140,
      y: 802,
      width: 140,
      height: 14,
      fontSize: 7.5,
      color: "#9ca3af",
      align: "right",
      region: "footer",
    }),
  ];
}

/**
 * Small fluent layout helper so each starter template can be written as a
 * short list of "sections" instead of hand-placed x/y coordinates. Not meant
 * to be a general layout engine — just enough to keep ~25 bank-document
 * templates consistent and quick to write.
 */
export class DocBuilder {
  objects: TemplateObject[] = [];
  x = MARGIN;
  width = CONTENT_WIDTH;
  y: number;

  constructor(title: string, subtitle?: string, accent = "#0f3d68", startY = 142) {
    this.objects.push(...bankHeader(title, subtitle, accent));
    this.objects.push(...footerBlock());
    this.y = startY;
  }

  space(h = 10): this {
    this.y += h;
    return this;
  }

  heading(text: string): this {
    this.objects.push(
      createText(text, { x: this.x, y: this.y, width: this.width, height: 18, fontSize: 11.5, fontWeight: "bold", color: "#111827" })
    );
    this.y += 22;
    return this;
  }

  paragraph(text: string, opts: Partial<TextObjectProps> = {}): this {
    const height = opts.height ?? 32;
    this.objects.push(
      createText(text, { x: this.x, y: this.y, width: this.width, height, fontSize: 10, color: "#374151", align: "left", ...opts })
    );
    this.y += height + 8;
    return this;
  }

  /** A 2-column grid of label/value pairs, e.g. account number, date, etc. */
  kv(pairs: [string, string][], colWidth = 262): this {
    for (let i = 0; i < pairs.length; i += 2) {
      const [l1, v1] = pairs[i];
      this.objects.push(
        createText(l1, { x: this.x, y: this.y, width: 118, height: 16, fontSize: 9, fontWeight: "bold", color: "#6b7280" })
      );
      this.objects.push(
        createText(v1, { x: this.x + 118, y: this.y, width: colWidth - 118, height: 16, fontSize: 10, color: "#111827" })
      );
      const pair2 = pairs[i + 1];
      if (pair2) {
        const [l2, v2] = pair2;
        const x2 = this.x + colWidth + 20;
        this.objects.push(
          createText(l2, { x: x2, y: this.y, width: 110, height: 16, fontSize: 9, fontWeight: "bold", color: "#6b7280" })
        );
        this.objects.push(
          createText(v2, { x: x2 + 110, y: this.y, width: this.width - colWidth - 20 - 110, height: 16, fontSize: 10, color: "#111827" })
        );
      }
      this.y += 20;
    }
    this.y += 8;
    return this;
  }

  divider(): this {
    this.objects.push(createLine({ x: this.x, y: this.y, width: this.width, height: 1, stroke: "#e5e7eb" }));
    this.y += 14;
    return this;
  }

  table(columns: Omit<TableColumn, "id">[], dataSource: string, height = 160, opts: { fontSize?: number; headerBg?: string } = {}): this {
    this.objects.push(
      createTable({
        x: this.x,
        y: this.y,
        width: this.width,
        height,
        dataSource,
        fontSize: opts.fontSize ?? 9.5,
        headerBg: opts.headerBg ?? "#0f3d68",
        columns: columns.map((c) => ({ ...c, id: c.field })),
      })
    );
    this.y += height + 16;
    return this;
  }

  qr(variable: string, size = 84, label?: string): this {
    this.objects.push(createQrCode({ x: this.x, y: this.y, width: size, height: size, variable }));
    if (label) {
      this.objects.push(
        createText(label, { x: this.x + size + 10, y: this.y + size / 2 - 8, width: this.width - size - 10, height: 32, fontSize: 8.5, color: "#6b7280" })
      );
    }
    this.y += size + 14;
    return this;
  }

  barcode(variable: string, format: "CODE128" | "EAN13" | "UPC" = "CODE128", height = 46): this {
    this.objects.push(createBarcode({ x: this.x, y: this.y, width: 200, height, variable, format }));
    this.y += height + 14;
    return this;
  }

  stampCircle(text: string, accent = "#0f3d68"): this {
    this.objects.push(
      createCircle({ x: this.width + this.x - 100, y: this.y - 60, width: 90, height: 90, fill: "transparent", stroke: accent, strokeWidth: 2 })
    );
    this.objects.push(
      createText(text, { x: this.width + this.x - 100, y: this.y - 34, width: 90, height: 40, fontSize: 8, align: "center", color: accent, fontWeight: "bold" })
    );
    return this;
  }

  /** Two side-by-side signature lines near the bottom of the content area. */
  signatures(left = "Authorized Signatory", right = "Customer Signature", y?: number): this {
    const yy = y ?? this.y + 40;
    this.objects.push(createLine({ x: this.x, y: yy, width: 180, height: 1, stroke: "#9ca3af" }));
    this.objects.push(createText(left, { x: this.x, y: yy + 4, width: 180, height: 14, fontSize: 8.5, color: "#6b7280" }));
    this.objects.push(createLine({ x: this.x + this.width - 180, y: yy, width: 180, height: 1, stroke: "#9ca3af" }));
    this.objects.push(
      createText(right, { x: this.x + this.width - 180, y: yy + 4, width: 180, height: 14, fontSize: 8.5, color: "#6b7280", align: "right" })
    );
    this.y = yy + 24;
    return this;
  }

  build(name: string, opts: { watermark?: string; pagination?: boolean } = {}): Template {
    return {
      version: "1.0",
      name,
      page: makePage("A4", "portrait"),
      watermark: opts.watermark
        ? { enabled: true, text: opts.watermark, color: "#9ca3af", opacity: 0.12, fontSize: 80, rotation: -35 }
        : { enabled: false, text: "DRAFT", color: "#cc0000", opacity: 0.15, fontSize: 96, rotation: -35 },
      pagination: { enabled: opts.pagination ?? true, format: "Page {{page}} of {{pages}}", align: "center" },
      objects: this.objects,
    };
  }
}
