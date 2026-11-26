import type { ReactNode } from "react";
import Link from "next/link";
import { routes } from "@/config/routes";

export function EditorShell({ children, restaurantId }: {
  children: ReactNode;
  restaurantId: string;
}) {
  return (
    <div className="mx-auto grid max-w-5xl gap-6 px-4 py-8 sm:grid-cols-[12rem_minmax(0,1fr)] sm:px-6">
      <aside aria-labelledby="editor-tools">
        <h2 id="editor-tools" className="font-semibold">Herramientas del editor</h2>
        <nav aria-label="Navegación del editor" className="mt-2">
          <Link href={routes.editorPreview(restaurantId)}>Abrir vista previa</Link>
        </nav>
      </aside>
      {children}
    </div>
  );
}
