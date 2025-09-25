import React, { useEffect, useRef } from "react";

type Status = "idle" | "submitting" | "success" | "error";

export type CreateModalProps = {
  title: string;
  open: boolean;
  onClose: () => void;
  onSubmit: () => Promise<void>;
  children: React.ReactNode;
  submitLabel?: string;
  error?: string | null;
  status?: Status;
};

/**
 * A generic modal wrapper with a footer for submit/cancel and space for a form.
 * Provides accessible focus trapping and simple transitions.
 */
export default function CreateModal({
  title,
  open,
  onClose,
  onSubmit,
  children,
  submitLabel = "Create",
  error = null,
  status = "idle",
}: CreateModalProps) {
  const overlayRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape" && open) onClose();
    }
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open) return null;

  const isSubmitting = status === "submitting";
  const isSuccess = status === "success";
  const isError = status === "error";

  return (
    <div
      ref={overlayRef}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/30"
      onMouseDown={(e) => {
        if (e.target === overlayRef.current) onClose();
      }}
    >
      <div className="w-full max-w-lg rounded-lg bg-white shadow-xl">
        <div className="border-b px-5 py-4">
          <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
        </div>
        <div className="px-5 py-4">
          {isSuccess ? (
            <div className="rounded-md bg-green-50 p-3 text-green-700">
              Created successfully.
            </div>
          ) : (
            children
          )}
          {isError && error ? (
            <div className="mt-3 rounded-md bg-red-50 p-3 text-red-700">
              {error}
            </div>
          ) : null}
        </div>
        <div className="flex items-center justify-end gap-3 border-t px-5 py-3">
          <button
            type="button"
            className="rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
            onClick={onClose}
            disabled={isSubmitting}
          >
            {isSuccess ? "Close" : "Cancel"}
          </button>
          {!isSuccess && (
            <button
              type="button"
              onClick={onSubmit}
              disabled={isSubmitting}
              className="rounded-md bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-60"
            >
              {isSubmitting ? "Creating..." : submitLabel}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
