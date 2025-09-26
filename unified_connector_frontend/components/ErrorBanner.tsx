"use client";
import React from "react";

/**
 * PUBLIC_INTERFACE
 * ErrorBanner: shows a dismissible error banner with accessible semantics.
 */
export default function ErrorBanner({
  message,
  onClose,
}: {
  message: string;
  onClose?: () => void;
}) {
  return (
    <div
      role="alert"
      className="card"
      style={{ borderColor: "#FECACA", background: "#FEF2F2" }}
    >
      <div className="row" style={{ justifyContent: "space-between" }}>
        <div style={{ color: "#991B1B", fontWeight: 600 }}>{message}</div>
        {onClose && (
          <button className="btn btnDangerGhost" onClick={onClose} aria-label="Dismiss error">
            Dismiss
          </button>
        )}
      </div>
    </div>
  );
}
