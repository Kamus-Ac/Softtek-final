import type { Metadata } from "next";
import type { ReactNode } from "react";
import { AccountNavigation } from "@/components/layout/AccountNavigation";

export const metadata: Metadata = {
  robots: { index: false, follow: false },
};

export default function AccountLayout({ children }: { children: ReactNode }) {
  return (
    <div className="mx-auto max-w-3xl space-y-6 px-4 py-8 sm:px-6">
      <header><AccountNavigation /></header>
      {children}
    </div>
  );
}
