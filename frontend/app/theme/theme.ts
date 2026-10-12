"use client";

import { createTheme } from "@mui/material/styles";

// Light-only, low-contrast palette: warm off-white page, white surfaces, hairline borders
export const theme = createTheme({
  cssVariables: true,
  palette: {
    mode: "light",
    primary: { main: "#1f6f5c" },
    background: { default: "#f7f7f5", paper: "#ffffff" },
    text: { primary: "#1c1c1a", secondary: "#6b6b66" },
    divider: "#e8e8e4",
  },
  shape: { borderRadius: 10 },
  typography: {
    fontFamily: "var(--font-geist-sans), system-ui, sans-serif",
    h1: { fontSize: "1.5rem", fontWeight: 600, letterSpacing: "-0.01em" },
    button: { textTransform: "none", fontWeight: 500 },
  },
  components: {
    MuiPaper: {
      defaultProps: { elevation: 0 },
      styleOverrides: {
        root: ({ theme }) => ({ border: `1px solid ${theme.palette.divider}` }),
      },
    },
    MuiButton: {
      defaultProps: { disableElevation: true },
    },
    MuiTableCell: {
      styleOverrides: {
        root: ({ theme }) => ({
          borderColor: theme.palette.divider,
          padding: "12px 16px",
        }),
        head: ({ theme }) => ({
          color: theme.palette.text.secondary,
          fontSize: "0.75rem",
          fontWeight: 500,
          textTransform: "uppercase",
          letterSpacing: "0.04em",
          backgroundColor: "#fafaf8",
        }),
      },
    },
    MuiTableRow: {
      styleOverrides: {
        root: { "&:last-child td": { borderBottom: 0 } },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: { fontWeight: 500, textTransform: "capitalize" },
      },
    },
    MuiDialog: {
      styleOverrides: {
        paper: { border: "none" },
      },
    },
  },
});
