import type { JSX } from "react";
import { getIssues } from "@/lib/api";

export async function IssueList(): Promise<JSX.Element> {
  const issues = await getIssues();

  if (issues.length === 0) return <p>No issues yet.</p>;

  return (
    <ul className="flex flex-col gap-2">
      {issues.map((i) => (
        <li key={i.id} className="border rounded p-3">
          {i.createdAt} · {i.sellerMessage} · {i.fieldName} · {i.oldValue} . {i.newValue} . {i.status==="pending"?"Buttons":"Rejected/Confirmed"}
        </li>
      ))}
    </ul>
  );
}