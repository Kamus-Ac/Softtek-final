import type { ReactNode } from "react";
import Link from "next/link";
import { routes } from "@/config/routes";

export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <div className="mx-auto max-w-md space-y-6 px-4 py-8 sm:px-6">
      <header><Link href={routes.home}>Volver al inicio</Link></header>
      {children}
    </div>
  );
}
