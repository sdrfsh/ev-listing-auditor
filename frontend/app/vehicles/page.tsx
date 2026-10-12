import type { JSX } from "react";
import { Suspense } from "react";
import { VehicleList } from "./vehicleList";


export default function VehiclesPage(): JSX.Element {
  return (
    <div>
      <h1 className="text-2xl font-semibold mb-4">Vehicles</h1>
      <Suspense fallback={<p>Loading vehicles…</p>}>
        <VehicleList/>
      </Suspense>
    </div>
  );
}