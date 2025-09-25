"use client";

import React from "react";
import ConnectButton from "@/components/integrations/ConnectButton";

export interface ConnectorCardProps {
  connector: {
    id: string;
    name: string;
    description: string;
    connected: boolean;
    category: string;
    icon: string;
    color: string;
  };
  onConnect: () => void;
  onDisconnect: () => void;
}

export default function ConnectorCard({ connector, onConnect, onDisconnect }: ConnectorCardProps) {
  const { name, description, connected, icon, color, category } = connector;
  return (
    <div className="group relative overflow-hidden rounded-xl bg-white shadow-sm ring-1 ring-gray-100 transition hover:shadow-md">
      <div className="absolute inset-x-0 top-0 h-1.5" style={{ backgroundColor: color }} />
      <div className="p-5">
        <div className="mb-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div
              className="flex h-10 w-10 items-center justify-center rounded-lg text-xl"
              style={{ backgroundColor: `${color}1A`, color }}
              aria-label={`${name} icon`}
              title={name}
            >
              <span>{icon}</span>
            </div>
            <div>
              <h3 className="text-lg font-medium text-[#111827]">{name}</h3>
              <p className="text-xs text-gray-500">{category}</p>
            </div>
          </div>
          <span
            className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs ${
              connected
                ? "bg-green-50 text-green-700 ring-1 ring-green-200"
                : "bg-gray-50 text-gray-600 ring-1 ring-gray-200"
            }`}
          >
            <span
              className={`h-1.5 w-1.5 rounded-full ${
                connected ? "bg-green-500" : "bg-gray-400"
              }`}
            />
            {connected ? "Connected" : "Not connected"}
          </span>
        </div>

        <p className="mb-4 line-clamp-3 text-sm text-gray-600">{description}</p>

        <div className="flex items-center">
          <ConnectButton
            connected={connected}
            onConnect={onConnect}
            onDisconnect={onDisconnect}
            color={color}
          />
        </div>
      </div>
    </div>
  );
}
