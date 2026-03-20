"use client";

import { useState, useRef, useEffect } from "react";
import { ChevronDown } from "lucide-react";

const COLLAPSED_HEIGHT = 140; // ~4 lines of text

export default function CollapsibleOverview({
  children,
}: {
  children: React.ReactNode;
}) {
  const [expanded, setExpanded] = useState(false);
  const [needsTruncation, setNeedsTruncation] = useState(false);
  const contentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (contentRef.current) {
      setNeedsTruncation(contentRef.current.scrollHeight > COLLAPSED_HEIGHT + 40);
    }
  }, []);

  return (
    <div>
      <div className="relative">
        <div
          ref={contentRef}
          className="overflow-hidden transition-[max-height] duration-500 ease-in-out"
          style={{
            maxHeight: expanded || !needsTruncation ? "none" : `${COLLAPSED_HEIGHT}px`,
          }}
        >
          {children}
        </div>

        {/* Gradient fade overlay — inside the relative wrapper so it stays over content */}
        {needsTruncation && !expanded && (
          <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-[#0D1117] to-transparent pointer-events-none" />
        )}
      </div>

      {/* Read more / Read less toggle — OUTSIDE the relative wrapper, always clearly visible */}
      {needsTruncation && (
        <button
          onClick={() => setExpanded(!expanded)}
          className="mt-3 flex items-center gap-1.5 text-sm font-semibold text-[#E8923A] hover:text-[#F0A65A] transition-colors"
        >
          <span>{expanded ? "Show less" : "Read more"}</span>
          <ChevronDown
            className={`h-4 w-4 transition-transform duration-300 ${
              expanded ? "rotate-180" : ""
            }`}
          />
        </button>
      )}
    </div>
  );
}
