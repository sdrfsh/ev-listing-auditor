import type { JSX } from "react";
import { PageHeader } from "@/app/components/pageHeader";
import { AddVehicleForm } from "../addVehicleForm";

export default function NewVehiclePage(): JSX.Element {
  return (
    <div>
      <PageHeader title="Add vehicle" subtitle="Create a new vehicle." />
      <AddVehicleForm />
    </div>
  );
}
