import Link from 'next/link';

export default function NotFound() {
  // PUBLIC_INTERFACE
  /** App Router 404 page to satisfy static export without relying on legacy /_document. */
  return (
    <div className="min-h-[60vh] flex items-center justify-center">
      <div className="max-w-md w-full rounded-lg border bg-white p-6 shadow">
        <h1 className="text-2xl font-bold text-gray-900">Page not found</h1>
        <p className="mt-2 text-gray-700">
          The page you are looking for does not exist. Please check the URL or return to the dashboard.
        </p>
        <Link
          href="/"
          className="mt-4 inline-block rounded-md bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
        >
          Go to Home
        </Link>
      </div>
    </div>
  );
}
