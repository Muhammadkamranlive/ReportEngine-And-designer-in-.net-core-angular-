import { defaultBase, newId } from "./store";
import {
  TemplateObject,
  TextObjectProps,
  RectObjectProps,
  CircleObjectProps,
  LineObjectProps,
  ImageObjectProps,
  QrCodeObjectProps,
  BarcodeObjectProps,
  TableObjectProps,
  PageConfig,
} from "./types";

export function createText(text = "Text", overrides: Partial<TextObjectProps> = {}): TextObjectProps {
  return {
    ...defaultBase("text", { width: 200, height: 30, name: "Text" }),
    type: "text",
    text,
    fontFamily: "Helvetica",
    fontSize: 16,
    fontWeight: "normal",
    fontStyle: "normal",
    underline: false,
    color: "#1a1a1a",
    backgroundColor: null,
    align: "left",
    letterSpacing: 0,
    ...overrides,
  };
}

export function createRect(overrides: Partial<RectObjectProps> = {}): RectObjectProps {
  return {
    ...defaultBase("rect", { width: 160, height: 90, name: "Rectangle" }),
    type: "rect",
    fill: "#e5e7eb",
    stroke: "#9ca3af",
    strokeWidth: 1,
    rx: 0,
    ...overrides,
  };
}

export function createCircle(overrides: Partial<CircleObjectProps> = {}): CircleObjectProps {
  return {
    ...defaultBase("circle", { width: 90, height: 90, name: "Circle" }),
    type: "circle",
    fill: "#e5e7eb",
    stroke: "#9ca3af",
    strokeWidth: 1,
    ...overrides,
  };
}

export function createLine(overrides: Partial<LineObjectProps> = {}): LineObjectProps {
  return {
    ...defaultBase("line", { width: 200, height: 2, name: "Line" }),
    type: "line",
    stroke: "#1a1a1a",
    strokeWidth: 2,
    ...overrides,
  };
}

export function createImage(src: string, overrides: Partial<ImageObjectProps> = {}): ImageObjectProps {
  return {
    ...defaultBase("image", { width: 140, height: 90, name: "Image" }),
    type: "image",
    src,
    fit: "contain",
    ...overrides,
  };
}

export function createQrCode(overrides: Partial<QrCodeObjectProps> = {}): QrCodeObjectProps {
  return {
    ...defaultBase("qrcode", { width: 100, height: 100, name: "QR Code" }),
    type: "qrcode",
    variable: "{{PaymentQR}}",
    foreground: "#000000",
    background: "#ffffff",
    ...overrides,
  };
}

export function createBarcode(overrides: Partial<BarcodeObjectProps> = {}): BarcodeObjectProps {
  return {
    ...defaultBase("barcode", { width: 180, height: 60, name: "Barcode" }),
    type: "barcode",
    variable: "{{ProductCode}}",
    format: "CODE128",
    foreground: "#000000",
    background: "#ffffff",
    ...overrides,
  };
}

export function createTable(overrides: Partial<TableObjectProps> = {}): TableObjectProps {
  return {
    ...defaultBase("table", { width: 460, height: 140, name: "Table" }),
    type: "table",
    columns: [
      { id: newId(), header: "Product", field: "product", width: 220, align: "left" },
      { id: newId(), header: "Qty", field: "qty", width: 60, align: "center" },
      { id: newId(), header: "Price", field: "price", width: 90, align: "right" },
      { id: newId(), header: "Total", field: "total", width: 90, align: "right" },
    ],
    rowHeight: 26,
    headerHeight: 30,
    headerBg: "#111827",
    headerColor: "#ffffff",
    borderColor: "#d1d5db",
    fontSize: 12,
    dataSource: "{{Products}}",
    ...overrides,
  };
}

/**
 * A ready-made set of objects for the header band: a logo placeholder, the
 * company name, and an invoice-number line. Positioned to fit inside
 * page.margins.top and tagged region: "header" so a renderer knows to repeat
 * them on every page.
 */
export function createHeaderTemplate(page: PageConfig): TemplateObject[] {
  const bandHeight = Math.max(page.margins.top, 50);
  const logo = createRect({
    name: "Logo placeholder",
    x: page.margins.left,
    y: 8,
    width: 48,
    height: Math.min(40, bandHeight - 12),
    fill: "#e5e7eb",
    stroke: "#9ca3af",
    rx: 4,
    region: "header",
  });
  const company = createText("{{CompanyName}}", {
    name: "Company name",
    x: page.margins.left + 60,
    y: 10,
    width: 220,
    height: 22,
    fontSize: 16,
    fontWeight: "bold",
    region: "header",
  });
  const invoice = createText("Invoice No: {{InvoiceNo}}   ·   Date: {{Date}}", {
    name: "Invoice meta",
    x: page.margins.left + 60,
    y: 32,
    width: 260,
    height: 18,
    fontSize: 11,
    color: "#4b5563",
    region: "header",
  });
  const divider = createLine({
    name: "Header divider",
    x: page.margins.left,
    y: bandHeight - 4,
    width: page.width - page.margins.left - page.margins.right,
    height: 1,
    stroke: "#d1d5db",
    strokeWidth: 1,
    region: "header",
  });
  return [logo, company, invoice, divider];
}

/**
 * A ready-made footer: a thin divider, page numbering, and a small note —
 * tagged region: "footer" so a renderer knows to repeat them on every page.
 */
export function createFooterTemplate(page: PageConfig): TemplateObject[] {
  const bandTop = page.height - Math.max(page.margins.bottom, 40);
  const divider = createLine({
    name: "Footer divider",
    x: page.margins.left,
    y: bandTop + 6,
    width: page.width - page.margins.left - page.margins.right,
    height: 1,
    stroke: "#d1d5db",
    strokeWidth: 1,
    region: "footer",
  });
  const note = createText("Thank you for your business.", {
    name: "Footer note",
    x: page.margins.left,
    y: bandTop + 14,
    width: 260,
    height: 18,
    fontSize: 10,
    color: "#6b7280",
    region: "footer",
  });
  const pageNum = createText("Page {{page}} of {{pages}}", {
    name: "Page number",
    x: page.width - page.margins.right - 140,
    y: bandTop + 14,
    width: 140,
    height: 18,
    fontSize: 10,
    color: "#6b7280",
    align: "right",
    region: "footer",
  });
  return [divider, note, pageNum];
}

export function createDefault(type: TemplateObject["type"]): TemplateObject {
  switch (type) {
    case "text":
      return createText();
    case "rect":
      return createRect();
    case "circle":
      return createCircle();
    case "line":
      return createLine();
    case "image":
      return createImage("");
    case "qrcode":
      return createQrCode();
    case "barcode":
      return createBarcode();
    case "table":
      return createTable();
  }
}
