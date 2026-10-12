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

export async function VehicleList(): Promise<JSX.Element> {
  const vehicles = await getVehicles();

  if (vehicles.length === 0) return <p>No vehicles yet.</p>;

  return (
    <TableContainer component={Paper}>
      <Table size="small">
        <TableHead>
          <TableRow>
            <TableCell>VIN</TableCell>
            <TableCell>Model</TableCell>
            <TableCell>Mileage</TableCell>
            <TableCell>Battery Health</TableCell>
            <TableCell>Equipments</TableCell>
            <TableCell>Price</TableCell>
            <TableCell>Is Ready for Sale?</TableCell>
            <TableCell>Is Available?</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {vehicles.map((v) => (
            <TableRow key={v.id} hover>
              <TableCell>{v.VIN}</TableCell>
              <TableCell>
                {v.vinSpec
                  ? `${v.vinSpec.make} ${v.vinSpec.model} ${v.vinSpec.trim} (${v.vinSpec.modelYear})`
                  : "-"}
              </TableCell>
              <TableCell>{v.mileage}</TableCell>
              <TableCell>{v.batteryHealth}</TableCell>
              <TableCell>{v.equipments}</TableCell>
              <TableCell>{v.price}</TableCell>
              <TableCell>{v.isSaleReady ? "Y" : "N"}</TableCell>
              <TableCell>{v.isAvailable ? "Y" : "N"}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
}
