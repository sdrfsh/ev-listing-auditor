"use client";

import { useEffect, useRef, useState, useTransition, type FormEvent, type JSX } from "react";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Paper from "@mui/material/Paper";
import Stack from "@mui/material/Stack";
import TextField from "@mui/material/TextField";
import { reportIssue } from "@/lib/actions";

type ChatMessage = { from: "user" | "bot"; text: string };

const GREETING: ChatMessage = {
  from: "bot",
  text: "Hi! What should we change in your listing? Tip: add the car's VIN to the message.",
};

// 17 characters, no I, O or Q (same rule as the backend)
const VIN_PATTERN = /^[A-HJ-NPR-Z0-9]{17}$/i;

const BUBBLE = { px: 1.5, py: 1, borderRadius: 2, maxWidth: "80%" };
const USER_BUBBLE = {
  ...BUBBLE,
  alignSelf: "flex-end",
  bgcolor: "primary.main",
  color: "primary.contrastText",
};
const BOT_BUBBLE = {
  ...BUBBLE,
  alignSelf: "flex-start",
  bgcolor: "action.hover",
  color: "text.primary",
};

export function ReportChat(): JSX.Element {
  const [messages, setMessages] = useState<ChatMessage[]>([GREETING]);
  const [input, setInput] = useState("");
  const [pendingMessage, setPendingMessage] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const [isDone, setIsDone] = useState(false);

  function addMessage(from: ChatMessage["from"], text: string): void {
    setMessages((prev) => [...prev, { from, text }]);
  }

  const scrollRef = useRef<HTMLDivElement>(null);

  // Keep the newest message in view
  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight });
  }, [messages, isPending]);

  function handleRestart(): void {
    setMessages([GREETING]);
    setInput("");
    setPendingMessage(null);
    setIsDone(false);
  }

  function handleSend(e: FormEvent): void {
    e.preventDefault();
    if (isDone) {
      handleRestart();
      return;
    }
    const text = input.trim();
    if (!text || isPending) return;

    addMessage("user", text);
    setInput("");

    // In VIN mode: check the VIN here first, without bothering the backend
    if (pendingMessage && !VIN_PATTERN.test(text)) {
      addMessage(
        "bot",
        "That doesn't look like a VIN (17 characters, no I, O or Q). Try again?",
      );
      return;
    }

    startTransition(async () => {
      const result = await (pendingMessage
        ? reportIssue(pendingMessage, text)
        : reportIssue(text));

      if (result.ok) {
        const list = result.issues
          .map((i) => `${i.fieldName}: ${i.oldValue ?? "–"} → ${i.newValue}`)
          .join(", ");
        addMessage(
          "bot",
          `Thanks! I created ${result.issues.length} issue(s): ${list}`,
        );
        setIsDone(true);
      } else {
        addMessage("bot", result.message);
      }
      setPendingMessage(
        !result.ok && result.needsVin ? (pendingMessage ?? text) : null,
      );
    });
  }

  return (
    <Paper>
      <Box sx={{ px: 2, py: 1.5, borderBottom: 1, borderColor: "divider", fontWeight: 500 }}>
        Report an issue
      </Box>

      <Stack ref={scrollRef} spacing={1} sx={{ p: 2, height: 360, overflowY: "auto" }}>
        {messages.map((m, index) => (
          <Box
            key={index}
            sx={m.from === "user" ? USER_BUBBLE : BOT_BUBBLE}
          >
            {m.text}
          </Box>
        ))}
        {isPending && <Box sx={{ color: "text.secondary" }}>Thinking…</Box>}
      </Stack>

      <Box
        component="form"
        onSubmit={handleSend}
        sx={{ display: "flex", gap: 1, p: 2, borderTop: 1, borderColor: "divider" }}
      >
        <TextField
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder={
            pendingMessage
              ? "Your 17-character VIN"
              : "e.g. the mileage is 41000 km"
          }
          size="small"
          fullWidth
          autoFocus
          disabled={isPending || isDone}
        />
        <Button type="submit" variant="contained" disabled={isPending}>
          {isDone ? "Restart" : "Send"}
        </Button>
      </Box>
    </Paper>
  );
}
