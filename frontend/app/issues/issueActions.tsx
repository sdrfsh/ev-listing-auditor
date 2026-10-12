"use client";

import { useState, useTransition, type JSX } from "react";
import IconButton from "@mui/material/IconButton";
import Stack from "@mui/material/Stack";
import Tooltip from "@mui/material/Tooltip";
import Typography from "@mui/material/Typography";
import CheckIcon from "@mui/icons-material/Check";
import ClearIcon from "@mui/icons-material/Clear";
import { updateIssueStatus } from "./actions";

export function IssueActions({ id }: { id: number }): JSX.Element {
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function handleClick(status: "confirmed" | "rejected"): void {
    setError(null);
    startTransition(async () => {
      const result = await updateIssueStatus(id, status);
      if (!result.ok) setError(result.message ?? "Something went wrong.");
    });
  }

  return (
    <Stack direction="row" sx={{ alignItems: "center", justifyContent: "flex-end" }}>
      <Tooltip title="Confirm">
        <IconButton
          color="success"
          aria-label="confirm"
          disabled={isPending}
          onClick={() => handleClick("confirmed")}
        >
          <CheckIcon />
        </IconButton>
      </Tooltip>
      <Tooltip title="Reject">
        <IconButton
          color="error"
          aria-label="reject"
          disabled={isPending}
          onClick={() => handleClick("rejected")}
        >
          <ClearIcon />
        </IconButton>
      </Tooltip>
      {error && (
        <Typography variant="caption" color="error">
          {error}
        </Typography>
      )}
    </Stack>
  );
}
