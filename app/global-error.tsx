"use client";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-white text-black flex items-center justify-center px-4">
        <div className="text-center max-w-md space-y-4">
          <h1 className="text-2xl font-bold">Critical Error</h1>
          <p className="text-sm text-gray-500">
            A critical error occurred. Please refresh the page.
          </p>
          <button
            onClick={reset}
            className="px-4 py-2 bg-black text-white rounded-lg text-sm"
          >
            Refresh
          </button>
        </div>
      </body>
    </html>
  );
}
