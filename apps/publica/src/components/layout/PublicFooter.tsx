import Link from "next/link";
import { routes } from "@/config/routes";

export function PublicFooter() {
  return (
    <footer className="border-t border-neutral-200">
      <nav aria-label="Información legal" className="mx-auto max-w-5xl px-4 py-4 sm:px-6">
        <ul className="flex flex-wrap gap-x-4 gap-y-2">
          <li><Link href={routes.privacy}>Privacidad</Link></li>
          <li><Link href={routes.terms}>Términos</Link></li>
        </ul>
      </nav>
    </footer>
  );
}
