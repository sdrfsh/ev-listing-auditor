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
import { IssueActions } from "./issueActions";

const STATUS_COLOR: Record<IssueStatus, "warning" | "success" | "error"> = {
  pending: "warning",
  confirmed: "success",
  rejected: "error",
};

export async function IssueList(): Promise<JSX.Element> {
  const issues = await getIssues();

  if (issues.length === 0) return <p>No issues yet.</p>;

  return (
    <TableContainer component={Paper}>
      <Table size="small">
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
              <TableCell>{new Date(i.createdAt).toLocaleString()}</TableCell>
              <TableCell>{i.sellerMessage}</TableCell>
              <TableCell>{i.fieldName}</TableCell>
              <TableCell>{i.oldValue ?? "–"}</TableCell>
              <TableCell>{i.newValue}</TableCell>
              <TableCell align="right">
                {i.status === "pending" ? (
                  <IssueActions id={i.id} />
                ) : (
                  <Chip
                    label={i.status}
                    color={STATUS_COLOR[i.status]}
                    size="small"
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