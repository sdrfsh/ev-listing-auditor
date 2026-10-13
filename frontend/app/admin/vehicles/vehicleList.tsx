import type { JSX } from "react";
import { getVehicles } from "@/lib/api";
import {
  Paper,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
} from "@mui/material";
import TableContainer from "@mui/material/TableContainer";
import { EmptyState } from "@/app/components/pageHeader";

function YesNo({ value }: { value: boolean }): JSX.Element {
  return (
    <span className="inline-flex items-center gap-1.5 text-sm">
      <span className={`h-1.5 w-1.5 rounded-full ${value ? "bg-[#1f6f5c]" : "bg-[#c8c8c2]"}`} />
      {value ? "Yes" : "No"}
    </span>
  );
}

export async function VehicleList(): Promise<JSX.Element> {
  const vehicles = await getVehicles();

  if (vehicles === null) return <EmptyState>Couldn&apos;t load vehicles. Please try again later.</EmptyState>;
  if (vehicles.length === 0) return <EmptyState>No vehicles have been submitted yet.</EmptyState>;

  return (
    <TableContainer component={Paper}>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>Model</TableCell>
            <TableCell>VIN</TableCell>
            <TableCell align="right">Mileage</TableCell>
            <TableCell align="right">Battery</TableCell>
            <TableCell>Equipment</TableCell>
            <TableCell align="right">Price</TableCell>
            <TableCell>Sale ready</TableCell>
            <TableCell>Available</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {vehicles.map((v) => (
            <TableRow key={v.id} hover>
              <TableCell className="text-xs text-[#6b6b66]">{v.model}</TableCell>
              <TableCell className="font-mono text-xs text-[#6b6b66]">{v.VIN}</TableCell>
              <TableCell align="right">{`${v.mileage.toLocaleString()} km`}</TableCell>
              <TableCell align="right">{`${v.batteryHealth}%`}</TableCell>
              <TableCell className="text-[#6b6b66]">{v.equipments ?? "–"}</TableCell>
              <TableCell align="right" className="font-medium">{v.price.toLocaleString()}</TableCell>
              <TableCell><YesNo value={v.isSaleReady} /></TableCell>
              <TableCell><YesNo value={v.isAvailable} /></TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
}
