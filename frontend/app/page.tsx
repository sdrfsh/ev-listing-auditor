import type { JSX } from "react";
import { ReportChat } from "./issues/reportChat";

export default async function MainPage(): Promise<JSX.Element> {
  return (
    <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-semibold">Issues</h1>
        <ReportChat />
    </div>
  );
}