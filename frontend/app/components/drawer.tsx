"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { JSX } from "react";

const LINKS = [
  { href: "/admin", label: "Dashboard" },
  { href: "/admin/vehicles", label: "Vehicles" },
  { href: "/admin/issues", label: "Issues" },
];

export function Drawer(): JSX.Element {
  const pathname = usePathname();

  return (
    <nav className="w-56 shrink-0 border-r border-[#e8e8e4] bg-white px-4 py-8 flex flex-col gap-1">
      <div className="px-3 mb-8">
        <span className="text-[15px] font-semibold tracking-tight">EV Listing Auditor</span>
      </div>
      {LINKS.map(({ href, label }) => {
        const active = pathname === href;
        return (
          <Link
            key={href}
            href={href}
            className={`rounded-lg px-3 py-2 text-sm transition-colors ${
              active
                ? "bg-[#eef4f1] text-[#1f6f5c] font-medium"
                : "text-[#6b6b66] hover:bg-[#f4f4f1] hover:text-[#1c1c1a]"
            }`}
          >
            {label}
          </Link>
        );
      })}
      <Link
        href="/"
        className="mt-auto rounded-lg px-3 py-2 text-sm text-[#6b6b66] transition-colors hover:bg-[#f4f4f1] hover:text-[#1c1c1a]"
      >
        « Customer view
      </Link>
    </nav>
  );
}
