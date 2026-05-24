"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";

type Status = "idle" | "sending" | "sent" | "error";

export default function SendTestButton({
  templateKey,
  defaultRecipient = "taylor.warnick@gmail.com",
}: {
  templateKey: string;
  defaultRecipient?: string;
}) {
  const [to, setTo] = useState(defaultRecipient);
  const [status, setStatus] = useState<Status>("idle");
  const [message, setMessage] = useState<string>("");

  async function handleSend() {
    setStatus("sending");
    setMessage("");
    try {
      const res = await fetch("/api/admin/email-preview/send-test", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ key: templateKey, to }),
      });
      const data = await res.json();
      if (res.ok && data.sent) {
        setStatus("sent");
        setMessage(`Sent to ${data.recipient}`);
        setTimeout(() => {
          setStatus("idle");
          setMessage("");
        }, 4000);
      } else {
        setStatus("error");
        setMessage(data.reason || data.error || `HTTP ${res.status}`);
      }
    } catch (err) {
      setStatus("error");
      setMessage(err instanceof Error ? err.message : "Network error");
    }
  }

  return (
    <div className="flex items-center gap-2">
      <input
        type="email"
        value={to}
        onChange={(e) => setTo(e.target.value)}
        placeholder="recipient@example.com"
        className="text-xs px-2 py-1 rounded border border-[#D4CBB8] bg-white text-[#111827] placeholder:text-[#9CA3AF] w-56"
        disabled={status === "sending"}
      />
      <Button
        type="button"
        onClick={handleSend}
        disabled={status === "sending" || !to.includes("@")}
        variant="brand"
        size="sm"
        loading={status === "sending"}
      >
        {status === "sending" ? "Sending…" : "Send test"}
      </Button>
      {status === "sent" && (
        <span className="text-xs text-[#16A34A] font-medium">✓ {message}</span>
      )}
      {status === "error" && (
        <span className="text-xs text-[#DC2626] font-medium" title={message}>
          ✗ {message.length > 40 ? message.slice(0, 40) + "…" : message}
        </span>
      )}
    </div>
  );
}
