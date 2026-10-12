import type { JSX } from "react";
import { getVehicles } from "@/lib/api";

export async function VehicleList(): Promise<JSX.Element> {
  const vehicles = await getVehicles();

  if (vehicles.length === 0) return <p>No vehicles yet.</p>;

  return (
    <ul className="flex flex-col gap-2">
      {vehicles.map((v) => (
        <li key={v.id} className="border rounded p-3">
          {v.VIN} · {v.mileage} km · battery {v.batteryHealth}% · €{v.price}
        </li>
      ))}
    </ul>
  );
}