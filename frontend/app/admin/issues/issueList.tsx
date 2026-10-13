import type { JSX } from "react";
import Box from "@mui/material/Box";
import Chip from "@mui/material/Chip";
import Paper from "@mui/material/Paper";
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

export async function IssueList(): Promise<JSX.Element> {
  const issues = await getIssues();

  if (issues === null) return <EmptyState>Couldn&apos;t load issues. Please try again later.</EmptyState>;
  if (issues.length === 0) return <EmptyState>No issues have been submitted yet.</EmptyState>;

  return (
    <TableContainer component={Paper}>
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
                {new Date(i.createdAt).toLocaleString(undefined, { dateStyle: "medium", timeStyle: "short" })}
              </TableCell>
              <TableCell>{i.sellerMessage}</TableCell>
              <TableCell className="font-medium">{i.fieldName}</TableCell>
              <TableCell className="text-[#6b6b66] line-through decoration-[#c8c8c2]">{i.oldValue ?? "–"}</TableCell>
              <TableCell><NewValue issue={i} /></TableCell>
              <TableCell align="right">
                {i.status === "pending" ? (
                  <IssueActions id={i.id} />
                ) : (
                  <Chip
                    label={i.status}
                    color={STATUS_COLOR[i.status]}
                    size="small"
                    variant="outlined"
                  />
                )}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
}