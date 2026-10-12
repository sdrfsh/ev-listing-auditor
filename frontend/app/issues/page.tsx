import { Suspense, type JSX } from "react";
import { IssueList } from "./issueList";

export default async function IssuesPage(): Promise<JSX.Element> {
  return (
        <div>
          <h1 className="text-2xl font-semibold mb-4">Issues</h1>
          <Suspense fallback={<p>Loading issues</p>}>
            <IssueList/>
          </Suspense>
        </div>
  );
}