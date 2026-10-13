import type { JSX } from "react";
import Box from "@mui/material/Box";
import Chip from "@mui/material/Chip";
import Paper from "@mui/material/Paper";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import { getIssues } from "@/lib/api";
import type { Issue, IssueStatus } from "@/lib/types";
import { EmptyState } from "@/app/components/pageHeader";
import { IssueActions } from "./issueActions";

const STATUS_COLOR: Record<IssueStatus, "warning" | "success" | "error"> = {
  pending: "warning",
  confirmed: "success",
  rejected: "error",
};

// Equipment edits: "-item" means remove (red), "item" means add (green)
function NewValue({ issue }: { issue: Issue }): JSX.Element {
  if (issue.fieldName !== "equipments") return <>{issue.newValue}</>;
  const isRemoval = issue.newValue.startsWith("-");
  return (
    <Box component="span" sx={{ color: isRemoval ? "error.main" : "success.main", fontWeight: 500 }}>
      {isRemoval ? issue.newValue.slice(1) : issue.newValue}
    </Box>
  );
}

function StatusOrActions({ issue }: { issue: Issue }): JSX.Element {
  if (issue.status === "pending") return <IssueActions id={issue.id} />;
  return <Chip label={issue.status} color={STATUS_COLOR[issue.status]} size="small" variant="outlined" />;
}

function formatCreated(createdAt: string): string {
  return new Date(createdAt).toLocaleString(undefined, { dateStyle: "medium", timeStyle: "short" });
}

// Card layout for small screens, where the table would need horizontal scrolling
function IssueCards({ issues }: { issues: Issue[] }): JSX.Element {
  return (
    <Stack spacing={1.5} sx={{ display: { xs: "flex", md: "none" } }}>
      {issues.map((i) => (
        <Paper key={i.id} sx={{ p: 2 }}>
          <Stack direction="row" sx={{ alignItems: "center", justifyContent: "space-between", gap: 1 }}>
            <Typography variant="caption" className="text-[#6b6b66]">{formatCreated(i.createdAt)}</Typography>
            <StatusOrActions issue={i} />
          </Stack>
          <Typography variant="body2" sx={{ mt: 1, wordBreak: "break-word" }}>{i.sellerMessage}</Typography>
          <Box sx={{ mt: 1.5, fontSize: 14, wordBreak: "break-word" }}>
            <span className="font-medium">{i.fieldName}</span>
            {": "}
            <span className="text-[#6b6b66] line-through decoration-[#c8c8c2]">{i.oldValue ?? "–"}</span>
            {" → "}
            <NewValue issue={i} />
          </Box>
        </Paper>
      ))}
    </Stack>
  );
}

export async function IssueList(): Promise<JSX.Element> {
  const issues = await getIssues();

  if (issues === null) return <EmptyState>Couldn&apos;t load issues. Please try again later.</EmptyState>;
  if (issues.length === 0) return <EmptyState>No issues have been submitted yet.</EmptyState>;

  return (
    <>
      <IssueCards issues={issues} />
      <TableContainer component={Paper} sx={{ display: { xs: "none", md: "block" } }}>
        <Table sx={{ minWidth: 760 }}>
          <TableHead>
            <TableRow>
              <TableCell>Created</TableCell>
              <TableCell>Seller message</TableCell>
              <TableCell>Field</TableCell>
              <TableCell>Old value</TableCell>
              <TableCell>New value</TableCell>
              <TableCell align="right">Action</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {issues.map((i) => (
              <TableRow key={i.id} hover>
                <TableCell className="whitespace-nowrap text-[#6b6b66]">
                  {formatCreated(i.createdAt)}
                </TableCell>
                <TableCell>{i.sellerMessage}</TableCell>
                <TableCell className="font-medium">{i.fieldName}</TableCell>
                <TableCell className="text-[#6b6b66] line-through decoration-[#c8c8c2]">{i.oldValue ?? "–"}</TableCell>
                <TableCell><NewValue issue={i} /></TableCell>
                <TableCell align="right">
                  <StatusOrActions issue={i} />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </>
  );
}