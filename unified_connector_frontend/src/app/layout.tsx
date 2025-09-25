import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Unified Connector",
  description: "Connect and manage integrations from a single dashboard.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="antialiased" suppressHydrationWarning>
        {children}
      </body>
    </html>
  );
}
