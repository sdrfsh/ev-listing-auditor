import type { JSX } from "react";
import { Suspense } from "react";
import { PageHeader } from "@/app/components/pageHeader";
import { VehicleList } from "./vehicleList";


export default function VehiclesPage(): JSX.Element {
  return (
    <div>
      <PageHeader title="Vehicles" subtitle="All vehicles currently listed." />
      <Suspense fallback={<p className="text-sm text-[#6b6b66]">Loading vehicles…</p>}>
        <VehicleList/>
      </Suspense>
    </div>
  );
}
