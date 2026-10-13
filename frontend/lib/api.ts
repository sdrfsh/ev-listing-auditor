import type { Vehicle, Issue, NewVehicle } from "./types";

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
