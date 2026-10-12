import type { JSX, ReactNode } from "react";
import { Drawer } from "@/app/components/drawer";

// Every admin page (dashboard, vehicles, issues) gets the left menu
export default function AdminLayout({ children }: { children: ReactNode }): JSX.Element {
  return (
    <div className="min-h-screen flex">
      <Drawer />
      <main className="flex-1 px-10 py-10">
        <div className="mx-auto max-w-6xl">{children}</div>
      </main>
    </div>
  );
}
