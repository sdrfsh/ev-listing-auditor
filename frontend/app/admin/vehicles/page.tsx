import type { JSX } from "react";
import { Suspense } from "react";
import Button from "@mui/material/Button";
import AddIcon from "@mui/icons-material/Add";
import { PageHeader } from "@/app/components/pageHeader";
import { VehicleList } from "./vehicleList";


export default function VehiclesPage(): JSX.Element {
  return (
    <div>
      <PageHeader
        title="Vehicles"
        subtitle="All vehicles currently listed."
        action={
          <Button href="/admin/vehicles/new" variant="contained" startIcon={<AddIcon />}>
            Add vehicle
          </Button>
        }
      />
      <Suspense fallback={<p className="text-sm text-[#6b6b66]">Loading vehicles…</p>}>
        <VehicleList/>
      </Suspense>
    </div>
  );
}
