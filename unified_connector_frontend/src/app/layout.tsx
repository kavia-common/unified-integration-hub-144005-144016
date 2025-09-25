import type { Metadata } from "next";
import "./globals.css";
import { TenantProvider } from "@/utils/TenantContext";

export const metadata: Metadata = {
  title: "Unified Connector",
  description: "Connect and manage integrations from a single dashboard.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="antialiased" suppressHydrationWarning>
        <TenantProvider>{children}</TenantProvider>
      </body>
    </html>
  );
}
