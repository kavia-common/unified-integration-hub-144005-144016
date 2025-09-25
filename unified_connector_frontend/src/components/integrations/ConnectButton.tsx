"use client";

import React, { useState } from "react";

export interface ConnectButtonProps {
  connected: boolean;
  onConnect: () => Promise<void> | void;
  onDisconnect: () => Promise<void> | void;
  color?: string;
}

export default function ConnectButton({ connected, onConnect, onDisconnect, color = "#2563EB" }: ConnectButtonProps) {
  const [loading, setLoading] = useState(false);

  const handleClick = async () => {
    try {
      setLoading(true);
      if (connected) {
        await onDisconnect();
      } else {
        await onConnect();
      }
    } finally {
      setLoading(false);
    }
  };

  if (connected) {
    // When connected, allow only disconnect; prevent accidental re-link in primary flow.
    return (
      <button
        type="button"
        onClick={handleClick}
        disabled={loading}
        className="inline-flex items-center rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm font-medium text-red-700 transition hover:bg-red-100 disabled:cursor-not-allowed disabled:opacity-60"
        title="Disconnect this connector"
      >
        {loading ? "Disconnecting..." : "Disconnect"}
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={loading}
      className="inline-flex items-center rounded-md px-3 py-2 text-sm font-medium text-white shadow-sm transition hover:opacity-95 disabled:cursor-not-allowed disabled:opacity-60"
      style={{ backgroundColor: color }}
      title="Connect this connector"
    >
      {loading ? "Connecting..." : "Connect"}
    </button>
  );
}
