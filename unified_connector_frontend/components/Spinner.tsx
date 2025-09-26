"use client";
import React from "react";

/**
 * Simple spinner component.
 */
export default function Spinner({ size = 16 }: { size?: number }) {
  const s = size;
  return (
    <span
      role="status"
      aria-label="Loading"
      style={{
        display: "inline-block",
        width: s,
        height: s,
        borderRadius: "50%",
        border: "2px solid #E5E7EB",
        borderTopColor: "#2563EB",
        animation: "spin 1s linear infinite",
      }}
    />
  );
}
