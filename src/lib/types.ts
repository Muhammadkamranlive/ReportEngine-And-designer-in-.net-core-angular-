export type PageSizeName = "A4" | "Letter" | "Legal" | "Custom";
export type Orientation = "portrait" | "landscape";

export interface PageMargins {
  top: number;
  right: number;
  bottom: number;
  left: number;
}

export interface PageConfig {
  size: PageSizeName;
  orientation: Orientation;
  width: number; // points (1/72 in)
  height: number; // points
  margins: PageMargins;
}

export type ObjectType =
  | "text"
  | "rect"
  | "circle"
  | "line"
  | "image"
  | "qrcode"
  | "barcode"
  | "table";

export interface BaseObjectProps {
  id: string;
  type: ObjectType;
  name: string;
  x: number;
  y: number;
  width: number;
  height: number;
  rotation: number;
  locked: boolean;
  hidden: boolean;
  region: "header" | "body" | "footer";
}

export interface TextObjectProps extends BaseObjectProps {
  type: "text";
  text: string;
  fontFamily: string;
  fontSize: number;
  fontWeight: "normal" | "bold";
  fontStyle: "normal" | "italic";
  underline: boolean;
  color: string;
  backgroundColor: string | null;
  align: "left" | "center" | "right" | "justify";
  letterSpacing: number;
}

export interface RectObjectProps extends BaseObjectProps {
  type: "rect";
  fill: string;
  stroke: string;
  strokeWidth: number;
  rx: number;
}

export interface CircleObjectProps extends BaseObjectProps {
  type: "circle";
  fill: string;
  stroke: string;
  strokeWidth: number;
}

export interface LineObjectProps extends BaseObjectProps {
  type: "line";
  stroke: string;
  strokeWidth: number;
}

export interface ImageObjectProps extends BaseObjectProps {
  type: "image";
  src: string;
  fit: "contain" | "cover" | "stretch";
}

export interface QrCodeObjectProps extends BaseObjectProps {
  type: "qrcode";
  variable: string;
  foreground: string;
  background: string;
}

export interface BarcodeObjectProps extends BaseObjectProps {
  type: "barcode";
  variable: string;
  format: "CODE128" | "EAN13" | "UPC";
  foreground: string;
  background: string;
}

export interface TableColumn {
  id: string;
  header: string;
  field: string;
  width: number;
  align: "left" | "center" | "right";
}

export interface TableObjectProps extends BaseObjectProps {
  type: "table";
  columns: TableColumn[];
  rowHeight: number;
  headerHeight: number;
  headerBg: string;
  headerColor: string;
  borderColor: string;
  fontSize: number;
  dataSource: string;
}

export type TemplateObject =
  | TextObjectProps
  | RectObjectProps
  | CircleObjectProps
  | LineObjectProps
  | ImageObjectProps
  | QrCodeObjectProps
  | BarcodeObjectProps
  | TableObjectProps;

export interface WatermarkConfig {
  enabled: boolean;
  text: string;
  color: string;
  opacity: number;
  fontSize: number;
  rotation: number;
}

export interface PaginationConfig {
  enabled: boolean;
  format: string; // e.g. "Page {{page}} of {{pages}}"
  align: "left" | "center" | "right";
}

export interface Template {
  version: string;
  name: string;
  page: PageConfig;
  watermark: WatermarkConfig;
  pagination: PaginationConfig;
  objects: TemplateObject[];
}

export const PAGE_SIZES_PT: Record<Exclude<PageSizeName, "Custom">, { width: number; height: number }> = {
  A4: { width: 595, height: 842 },
  Letter: { width: 612, height: 792 },
  Legal: { width: 612, height: 1008 },
};

export function makePage(size: PageSizeName, orientation: Orientation, custom?: { width: number; height: number }): PageConfig {
  const base = size === "Custom" ? (custom ?? { width: 595, height: 842 }) : PAGE_SIZES_PT[size];
  const width = orientation === "portrait" ? base.width : base.height;
  const height = orientation === "portrait" ? base.height : base.width;
  return {
    size,
    orientation,
    width,
    height,
    margins: { top: 36, right: 36, bottom: 36, left: 36 },
  };
}
