"use client";

import { usePathname } from "next/navigation";
import { SidebarNav } from "./sidebar-nav";
import { MobileNav } from "./mobile-nav";

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  if (pathname === "/login") {
    return <>{children}</>;
  }

  return (
    <>
      <SidebarNav />
      <main className="min-h-screen pb-16 md:pb-0 md:pl-60">
        <div className="mx-auto max-w-6xl p-4 md:p-6 lg:p-8">{children}</div>
      </main>
      <MobileNav />
    </>
  );
}
