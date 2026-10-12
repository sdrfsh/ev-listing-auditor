"use server";

import { revalidatePath } from "next/cache";
import type { Issue, ReportResult } from "@/lib/types";

const SELLER_ID = 0;

export async function reportIssue(message: string, vin?: string): Promise<ReportResult> {
  try {
    const res = await fetch(`${process.env.API_URL}/issues/report`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ sellerId: SELLER_ID, message, vin }),
    });
    const body = await res.json();

    if (res.ok) {
      return { ok: true, issues: body as Issue[] };
    }

    const text = Array.isArray(body.message)
      ? body.message.join(", ")
      : (body.message ?? "Something went wrong.");

    return {
      ok: false,
      needsVin: res.status === 422 || res.status === 404,
      message: text,
    };
  } catch {
    return { ok: false, needsVin: false, message: "Can't reach the server. Is the backend running?" };
  }
}

export async function updateIssueStatus(
  id: number,
  status: "confirmed" | "rejected",
): Promise<{ ok: boolean; message?: string }> {
  try {
    const res = await fetch(`${process.env.API_URL}/issues/${id}/status`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });

    if (!res.ok) {
      const body = await res.json();
      return { ok: false, message: body.message ?? "Something went wrong." };
    }

    // Re-render the issues page so the row shows its new status
    revalidatePath("/admin/issues");
    return { ok: true };
  } catch {
    return { ok: false, message: "Can't reach the server. Is the backend running?" };
  }
}
