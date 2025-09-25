import Link from "next/link";

export default function Home() {
  return (
    <main className="min-h-screen bg-[#f9fafb]">
      <div className="mx-auto max-w-4xl px-6 py-16">
        <h1 className="text-3xl font-semibold text-[#111827]">Unified Integration Hub</h1>
        <p className="mt-2 text-gray-600">
          Manage your integrations with a modern, unified interface.
        </p>
        <div className="mt-6">
          <Link
            href="/connectors"
            className="inline-flex rounded-md bg-blue-600 px-4 py-2 text-white shadow-sm transition hover:bg-blue-700"
          >
            Go to Integrations
          </Link>
        </div>
      </div>
    </main>
  );
}
