import type { JSX } from "react";
import Link from "next/link";
import { PageHeader } from "./components/pageHeader";
import { ReportChat } from "./components/reportChat";

export default function CustomerView(): JSX.Element {
  return (
    <main className="px-10 py-10">
      <div className="mx-auto max-w-6xl">
        <PageHeader
          title="Customer View"
          subtitle="Tell us what's wrong with your listing and we'll fix it."
          action={
            <Link href="/admin" className="text-sm text-[#6b6b66] hover:text-[#1f6f5c]">
              Go to admin dashboard »
            </Link>
          }
        />
        <div className="max-w-2xl">
          <ReportChat />
        </div>
      </div>
    </main>
  );
}
