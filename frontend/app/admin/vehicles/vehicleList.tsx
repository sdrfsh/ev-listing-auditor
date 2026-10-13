import type { JSX, ReactNode } from "react";
import { getVehicles } from "@/lib/api";
import type { Vehicle } from "@/lib/types";
import {
  Box,
  Paper,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Typography,
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

function Detail({ label, children }: { label: string; children: ReactNode }): JSX.Element {
  return (
    <Box>
      <Typography variant="caption" className="uppercase tracking-wide text-[#6b6b66]">{label}</Typography>
      <Box sx={{ fontSize: 14 }}>{children}</Box>
    </Box>
  );
}

// Card layout for small screens, where the table would need horizontal scrolling
function VehicleCards({ vehicles }: { vehicles: Vehicle[] }): JSX.Element {
  return (
    <Stack spacing={1.5} sx={{ display: { xs: "flex", md: "none" } }}>
      {vehicles.map((v) => (
        <Paper key={v.id} sx={{ p: 2 }}>
          <Stack direction="row" sx={{ alignItems: "baseline", justifyContent: "space-between", gap: 1 }}>
            <Typography variant="body2" className="font-medium">{v.model}</Typography>
            <Typography variant="body2" className="font-medium whitespace-nowrap">{v.price.toLocaleString()}</Typography>
          </Stack>
          <Typography variant="caption" className="font-mono text-[#6b6b66]" sx={{ wordBreak: "break-all" }}>
            {v.vin}
          </Typography>
          <Box sx={{ mt: 1.5, display: "grid", gridTemplateColumns: "1fr 1fr", gap: 1.5 }}>
            <Detail label="Mileage">{`${v.mileage.toLocaleString()} km`}</Detail>
            <Detail label="Battery">{`${v.batteryHealth}%`}</Detail>
            <Detail label="Sale ready"><YesNo value={v.isSaleReady} /></Detail>
            <Detail label="Available"><YesNo value={v.isAvailable} /></Detail>
          </Box>
          <Box sx={{ mt: 1.5 }}>
            <Detail label="Equipment">
              <Box component="span" className="text-[#6b6b66]" sx={{ wordBreak: "break-word" }}>{v.equipments ?? "–"}</Box>
            </Detail>
          </Box>
        </Paper>
      ))}
    </Stack>
  );
}

export async function VehicleList(): Promise<JSX.Element> {
  const vehicles = await getVehicles();

  if (vehicles === null) return <EmptyState>Couldn&apos;t load vehicles. Please try again later.</EmptyState>;
  if (vehicles.length === 0) return <EmptyState>No vehicles have been submitted yet.</EmptyState>;

  return (
    <>
      <VehicleCards vehicles={vehicles} />
      <TableContainer component={Paper} sx={{ display: { xs: "none", md: "block" } }}>
        <Table sx={{ minWidth: 900 }}>
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
                <TableCell className="whitespace-nowrap text-xs text-[#6b6b66]">{v.model}</TableCell>
                <TableCell className="font-mono text-xs text-[#6b6b66]">{v.vin}</TableCell>
                <TableCell align="right" className="whitespace-nowrap">{`${v.mileage.toLocaleString()} km`}</TableCell>
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
    </>
  );
}
