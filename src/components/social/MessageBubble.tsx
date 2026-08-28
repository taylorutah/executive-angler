"use client";

import Image from "next/image";

interface MessageBubbleProps {
  body: string;
  timestamp: string;
  senderName?: string | null;
  senderAvatar?: string | null;
  isOwn: boolean;
  showAvatar?: boolean;
}

function formatTime(dateStr: string): string {
  const d = new Date(dateStr);
  const now = new Date();
  const diffMs = now.getTime() - d.getTime();
  const diffMin = Math.floor(diffMs / 60_000);
  const diffHr = Math.floor(diffMs / 3_600_000);
  const diffDay = Math.floor(diffMs / 86_400_000);

  if (diffMin < 1) return "Now";
  if (diffMin < 60) return `${diffMin}m ago`;
  if (diffHr < 24) return `${diffHr}h ago`;
  if (diffDay === 1) return "Yesterday";
  if (diffDay < 7) return `${diffDay}d ago`;
  return d.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

export function MessageBubble({
  body,
  timestamp,
  senderName,
  senderAvatar,
  isOwn,
  showAvatar = true,
}: MessageBubbleProps) {
  return (
    <div
      className={`flex gap-2 max-w-[80%] ${
        isOwn ? "ml-auto flex-row-reverse" : "mr-auto"
      }`}
    >
      {/* Avatar */}
      {showAvatar && !isOwn && (
        <div className="flex-shrink-0 mt-1">
          {senderAvatar ? (
            <Image
              src={senderAvatar}
              alt={senderName || "User"}
              width={32}
              height={32}
              className="ea-photo rounded-[var(--radius-card)] object-cover"
            />
          ) : (
            <div className="w-8 h-8 rounded-[var(--radius-card)] bg-[var(--accent-soft)] border border-[var(--border)] flex items-center justify-center font-display text-xs font-semibold text-[var(--accent)]">
              {(senderName || "?")[0]?.toUpperCase()}
            </div>
          )}
        </div>
      )}
      {!showAvatar && !isOwn && <div className="w-8 flex-shrink-0" />}

      {/* Bubble */}
      <div className="flex flex-col gap-0.5">
        <div
          className={`px-3 py-2 rounded-[var(--radius-card)] text-sm leading-relaxed break-words ${
            isOwn
              ? "bg-[var(--accent)] text-[var(--on-action)] rounded-br-[var(--radius-sm)]"
              : "bg-[var(--surface)] border border-[var(--border)] text-[var(--text-1)] rounded-bl-[var(--radius-sm)]"
          }`}
        >
          {body}
        </div>
        <span
          className={`text-xs text-[var(--text-3)] ${
            isOwn ? "text-right" : "text-left"
          }`}
        >
          {formatTime(timestamp)}
        </span>
      </div>
    </div>
  );
}
