import type { Metadata } from "next";
import { EditorShell } from "@/components/layout/EditorShell";

export const metadata: Metadata = {
  robots: { index: false, follow: false },
};

export default async function EditorLayout({
  children,
  params,
}: LayoutProps<"/editor/[restaurantId]">) {
  const { restaurantId: segment } = await params;
  const restaurantId = decodeURIComponent(segment);

  return <EditorShell restaurantId={restaurantId}>{children}</EditorShell>;
}
