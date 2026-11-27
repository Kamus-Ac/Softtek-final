import type { ReactNode } from "react";
import Link from "next/link";
import { routes } from "@/config/routes";

export function EditorShell({ children, restaurantId }: {
  children: ReactNode;
  restaurantId: string;
}) {
  return (
    <div className="space-y-3 px-4 py-4 sm:px-6">
      <nav aria-label="Navegación del editor">
        <Link href={routes.editorPreview(restaurantId)}>Abrir vista previa</Link>
      </nav>
      {children}
    </div>
  );
}
