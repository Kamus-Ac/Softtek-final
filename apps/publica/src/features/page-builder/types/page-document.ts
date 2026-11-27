import type { MenuWidgetOptions } from "./menu-widget";
import type { RestaurantWidgetBlock } from "./restaurant-widgets";
import type { pageImageResource, pageThemePreset } from "../theme/page-preset";

export const pageSchemaVersion = 1;

export type PageBreakpoint = "base" | "tablet" | "mobile";
export type PageStyles = Partial<Record<PageBreakpoint, Record<string, string>>>;

export type InlineContent =
  | { type: "text"; value: string }
  | { type: "break" }
  | { type: "bold" | "italic" | "underline" | "strike"; children: InlineContent[] };

interface BlockBase {
  id: string;
  title?: string;
  styles?: PageStyles;
}

export type PageBlock =
  | (BlockBase & { type: "text" | "button"; content: InlineContent[] })
  | (BlockBase & { type: "heading"; level: 1 | 2 | 3 | 4 | 5 | 6; content: InlineContent[] })
  | (BlockBase & { type: "image"; resource: typeof pageImageResource; alt: string })
  | (BlockBase & { type: "section"; variant: "standard" | "intro"; children: PageBlock[] })
  | (BlockBase & { type: "container"; variant: "standard" | "intro"; children: PageBlock[] })
  | (BlockBase & { type: "columns"; count: 2 | 3; children: PageBlock[] })
  | (BlockBase & { type: "column" | "gallery" | "cover"; children: PageBlock[] })
  | (BlockBase & { type: "divider" | "spacer" })
  | (BlockBase & { type: "restaurant-menu"; options: MenuWidgetOptions })
  | (BlockBase & RestaurantWidgetBlock);

export interface PageDocumentIdentity {
  documentId: string;
  restaurantId: string;
}

export interface PageDocumentV1 extends PageDocumentIdentity {
  schemaVersion: typeof pageSchemaVersion;
  theme: { preset: typeof pageThemePreset; styles?: PageStyles };
  blocks: PageBlock[];
}
