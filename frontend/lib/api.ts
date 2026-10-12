import type { Vehicle, Issue } from "./types";

export async function getVehicles(): Promise<Vehicle[]> {
  const res = await fetch(`${process.env.API_URL}/vehicles?limit=100`);
  if (!res.ok) throw new Error(`Backend returned ${res.status}`);
  return res.json();
}

export async function getIssues(): Promise<Issue[]>{
  const res = await fetch(`${process.env.API_URL}/issues?limit=100`);
  if (!res.ok) throw new Error(`Backend returned ${res.status}`);
  return res.json();
}