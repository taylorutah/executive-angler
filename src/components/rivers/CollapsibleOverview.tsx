"use client";

import { useState, useRef, useEffect } from "react";
import { ChevronDown } from "lucide-react";

const COLLAPSED_HEIGHT = 120; // ~3 lines of text

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

      {/* Gradient fade overlay */}
      {needsTruncation && !expanded && (
        <div className="absolute bottom-0 left-0 right-0 h-20 bg-gradient-to-t from-[#0D1117] to-transparent pointer-events-none" />
      )}

      {/* Read more / Read less toggle */}
      {needsTruncation && (
        <button
          onClick={() => setExpanded(!expanded)}
          className="mt-2 flex items-center gap-1 text-sm font-medium text-[#E8923A] hover:text-[#F0A65A] transition-colors group"
        >
          <span>{expanded ? "Show less" : "Read more"}</span>
          <ChevronDown
            className={`h-3.5 w-3.5 transition-transform duration-300 ${
              expanded ? "rotate-180" : ""
            }`}
          />
        </button>
      )}
    </div>
  );
}
