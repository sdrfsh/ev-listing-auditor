import type { JSX } from "react";
import Link from "next/link";
import { PageHeader } from "../components/pageHeader";

const CARDS = [
  { href: "/admin/vehicles", title: "Vehicles", text: "Browse listed vehicles and their specs." },
  { href: "/admin/issues", title: "Issues", text: "Review and resolve reported listing changes." },
];

export default function AdminDashboard(): JSX.Element {
  return (
    <>
      <PageHeader title="Admin Dashboard" subtitle="Manage listings and review reported changes." />
      <div className="grid gap-4 sm:grid-cols-2">
        {CARDS.map((c) => (
          <Link
            key={c.href}
            href={c.href}
            className="group rounded-[10px] border border-[#e8e8e4] bg-white p-6 transition-colors hover:border-[#1f6f5c]"
          >
            <h2 className="font-medium">
              {c.title}
              <span className="ml-1 inline-block text-[#6b6b66] transition-transform group-hover:translate-x-0.5">
                →
              </span>
            </h2>
            <p className="mt-1 text-sm text-[#6b6b66]">{c.text}</p>
          </Link>
        ))}
      </div>
    </>
  );
}
