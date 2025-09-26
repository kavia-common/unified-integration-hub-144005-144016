export const metadata = {
  title: "Unified Connector",
  description: "Connect and manage integrations from a single interface."
};

export default function RootLayout({
  children
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head />
      <body style={{
        margin: 0,
        fontFamily: "Inter, Helvetica Neue, Arial, sans-serif",
        background: "var(--bg-canvas, #f9fafb)",
        color: "var(--text-primary, #111827)"
      }}>
        {children}
      </body>
    </html>
  );
}
