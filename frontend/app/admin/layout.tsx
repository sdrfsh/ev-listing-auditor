import type { JSX, ReactNode } from "react";
import { Drawer } from "@/app/components/drawer";

// Every admin page (dashboard, vehicles, issues) gets the left menu
export default function AdminLayout({ children }: { children: ReactNode }): JSX.Element {
  return (
    <div className="min-h-screen flex flex-col md:flex-row">
      <Drawer />
      <main className="min-w-0 flex-1 px-4 py-6 sm:px-6 sm:py-8 lg:px-10 lg:py-10">
        <div className="mx-auto max-w-6xl">{children}</div>
      </main>
    </div>
  );
}
