"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { JSX } from "react";

const LINKS = [
  { href: "/admin", label: "Dashboard" },
  { href: "/admin/vehicles", label: "Vehicles" },
  { href: "/admin/issues", label: "Issues" },
];

const LINK_BASE = "shrink-0 whitespace-nowrap rounded-lg px-3 py-2 text-sm transition-colors";
const LINK_IDLE = "text-[#6b6b66] hover:bg-[#f4f4f1] hover:text-[#1c1c1a]";

// Side menu on desktop, top bar with a scrollable link row on small screens
export function Drawer(): JSX.Element {
  const pathname = usePathname();

  return (
    <nav className="flex shrink-0 flex-col gap-1 border-b border-[#e8e8e4] bg-white px-4 py-3 md:sticky md:top-0 md:h-screen md:w-56 md:border-b-0 md:border-r md:py-8">
      <div className="flex items-center justify-between px-3 md:mb-8">
        <span className="text-[15px] font-semibold tracking-tight">EV Listing Auditor</span>
        <Link href="/" className={`${LINK_BASE} ${LINK_IDLE} -mr-3 md:hidden`}>
          « Customer view
        </Link>
      </div>
      <div className="-mx-4 flex gap-1 overflow-x-auto px-4 md:mx-0 md:flex-col md:overflow-visible md:px-0">
        {LINKS.map(({ href, label }) => {
          const active = pathname === href;
          return (
            <Link
              key={href}
              href={href}
              className={`${LINK_BASE} ${
                active ? "bg-[#eef4f1] text-[#1f6f5c] font-medium" : LINK_IDLE
              }`}
            >
              {label}
            </Link>
          );
        })}
      </div>
      <Link href="/" className={`${LINK_BASE} ${LINK_IDLE} mt-auto hidden md:block`}>
        « Customer view
      </Link>
    </nav>
  );
}
