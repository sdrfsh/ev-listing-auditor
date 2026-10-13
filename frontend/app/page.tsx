import type { JSX } from "react";
import Link from "next/link";
import { PageHeader } from "./components/pageHeader";
import { ReportChat } from "./components/reportChat";

export default function CustomerView(): JSX.Element {
  return (
    <main className="px-4 py-6 sm:px-6 sm:py-8 lg:px-10 lg:py-10">
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
