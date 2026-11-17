"use client";

import { useEffect } from "react";
import { Button } from "@/core/components/ui/button";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error("Application Error:");
  }, [error]);

  return (
    <div className="flex h-screen w-full flex-col items-center justify-center gap-4 bg-stone-50 text-stone-900">
      <div className="flex flex-col items-center gap-2 text-center">
        <h2 className="text-3xl font-bold tracking-tight text-red-600">
          Something went wrong!
        </h2>
        <p className="text-stone-600 max-w-md">
          Don&apos;t worry, our team has been notified. Please try refreshing the page.
        </p>
        {process.env.NODE_ENV === "development" && (
            <div className="mt-4 p-4 bg-red-50 rounded text-left font-mono text-xs max-w-lg overflow-auto border border-red-200">
                {error.message}
            </div>
        )}
      </div>
      <div className="flex gap-2">
        <Button onClick={() => reset()} variant="outline">
            Try again
        </Button>
        <Button onClick={() => window.location.reload()}>
            Reload Page
        </Button>
      </div>
    </div>
  );
}
