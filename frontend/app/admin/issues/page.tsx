import { Suspense, type JSX } from "react";
import { PageHeader } from "@/app/components/pageHeader";
import { IssueList } from "./issueList";

export default async function IssuesPage(): Promise<JSX.Element> {
  return (
    <div>
      <PageHeader title="Issues" subtitle="Changes reported by sellers, waiting for review." />
      <Suspense fallback={<p className="text-sm text-[#6b6b66]">Loading issues…</p>}>
        <IssueList/>
      </Suspense>
    </div>
  );
}
