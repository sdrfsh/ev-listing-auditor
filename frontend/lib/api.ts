import type { Vehicle, Issue, NewVehicle } from "./types";

async function getList<T>(path: string): Promise<T[] | null> {
  try {
    const res = await fetch(`${process.env.API_URL}${path}`);
    if (!res.ok) {
      console.error(`GET ${path} failed: backend returned ${res.status}`);
      return null;
    }
    return await res.json();
  } catch (err) {
    console.error(`GET ${path} failed:`, err);
    return null;
  }
}

export async function getVehicles(): Promise<Vehicle[] | null> {
  return getList<Vehicle>("/vehicles?limit=100");
}

export async function getIssues(): Promise<Issue[] | null> {
  return getList<Issue>("/issues?limit=100");
}

export async function createVehicle(vehicle: NewVehicle): Promise<Vehicle> {
  const res = await fetch(`${process.env.API_URL}/vehicles/create`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(vehicle),
  });
  const body = await res.json();

  if (!res.ok) {
    const text = Array.isArray(body.message)
      ? body.message.join(", ")
      : (body.message ?? `Backend returned ${res.status}`);
    throw new Error(text);
  }

  return body as Vehicle;
}
