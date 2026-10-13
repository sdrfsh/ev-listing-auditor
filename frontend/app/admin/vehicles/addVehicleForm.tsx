"use client";

import { useState, useTransition, type FormEvent, type JSX } from "react";
import { useRouter } from "next/navigation";
import Alert from "@mui/material/Alert";
import Button from "@mui/material/Button";
import FormControlLabel from "@mui/material/FormControlLabel";
import Paper from "@mui/material/Paper";
import Stack from "@mui/material/Stack";
import Switch from "@mui/material/Switch";
import TextField from "@mui/material/TextField";
import { addVehicle } from "@/lib/actions";

export function AddVehicleForm(): JSX.Element {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function handleSubmit(e: FormEvent<HTMLFormElement>): void {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    const equipments = String(form.get("equipments") ?? "").trim();

    setError(null);
    startTransition(async () => {
      const result = await addVehicle({
        sellerId: Number(form.get("sellerId")),
        vin: String(form.get("vin")).trim(),
        model: String(form.get("model")).trim(),
        mileage: Number(form.get("mileage")),
        batteryHealth: Number(form.get("batteryHealth")),
        price: Number(form.get("price")),
        isSaleReady: form.get("isSaleReady") === "on",
        isAvailable: form.get("isAvailable") === "on",
        equipments: equipments || undefined,
      });
      if (!result.ok) {
        setError(result.message);
        return;
      }
      router.push("/admin/vehicles");
    });
  }

  return (
    <Paper component="form" onSubmit={handleSubmit} sx={{ p: 3, maxWidth: 640 }}>
      <Stack spacing={2.5}>
        <Stack direction="row" spacing={2}>
          <TextField name="model" label="Model" required fullWidth />
          <TextField
            name="sellerId"
            label="Seller ID"
            type="number"
            required
            defaultValue={0}
            slotProps={{ htmlInput: { min: 0, step: 1 } }}
            sx={{ width: 160 }}
          />
        </Stack>
        <TextField
          name="vin"
          label="VIN"
          required
          fullWidth
          slotProps={{ htmlInput: { style: { fontFamily: "monospace" } } }}
        />
        <Stack direction="row" spacing={2}>
          <TextField
            name="mileage"
            label="Mileage (km)"
            type="number"
            required
            fullWidth
            slotProps={{ htmlInput: { min: 0, step: 1 } }}
          />
          <TextField
            name="batteryHealth"
            label="Battery health (%)"
            type="number"
            required
            fullWidth
            slotProps={{ htmlInput: { min: 0, max: 100, step: 1 } }}
          />
          <TextField
            name="price"
            label="Price"
            type="number"
            required
            fullWidth
            slotProps={{ htmlInput: { min: 0, step: 1 } }}
          />
        </Stack>
        <TextField name="equipments" label="Equipment" multiline minRows={2} fullWidth />
        <Stack direction="row" spacing={3}>
          <FormControlLabel control={<Switch name="isSaleReady" />} label="Sale ready" />
          <FormControlLabel control={<Switch name="isAvailable" defaultChecked />} label="Available" />
        </Stack>

        {error && <Alert severity="error">{error}</Alert>}

        <Stack direction="row" spacing={1.5} sx={{ justifyContent: "flex-end" }}>
          <Button disabled={isPending} onClick={() => router.push("/admin/vehicles")}>
            Cancel
          </Button>
          <Button type="submit" variant="contained" disabled={isPending}>
            {isPending ? "Saving…" : "Add vehicle"}
          </Button>
        </Stack>
      </Stack>
    </Paper>
  );
}
