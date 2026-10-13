import type { JSX } from "react";
import Chip from "@mui/material/Chip";
import Paper from "@mui/material/Paper";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import { getIssues } from "@/lib/api";
import type { IssueStatus } from "@/lib/types";
import { EmptyState } from "@/app/components/pageHeader";
import { IssueActions } from "./issueActions";

const STATUS_COLOR: Record<IssueStatus, "warning" | "success" | "error"> = {
  pending: "warning",
  confirmed: "success",
  rejected: "error",
};

export async function IssueList(): Promise<JSX.Element> {
  const issues = await getIssues();

  if (issues === null) return <EmptyState>Couldn&apos;t load issues. Please try again later.</EmptyState>;
  if (issues.length === 0) return <EmptyState>No issues have been submitted yet.</EmptyState>;

  return (
    <TableContainer component={Paper}>
      <Table>
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
              <TableCell>{i.newValue}</TableCell>
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