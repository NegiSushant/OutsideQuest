"use client";

interface QuestGeneratingViewProps {
  status: string;
  error: string | null;
  onRetry: () => void;
  onClose: () => void;
}

export default function QuestGeneratingView({
  status,
  error,
  onRetry,
  onClose,
}: QuestGeneratingViewProps) {
  return (
    // Backdrop – clicking here closes the modal
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm px-4"
      onClick={onClose}
    >
      {/* Modal card – stop click from bubbling to backdrop */}
      <div
        className="relative w-full max-w-sm rounded-2xl bg-white p-8 shadow-2xl text-center animate-in fade-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close (X) button – top right */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-full text-emerald-600/70 hover:text-emerald-800 hover:bg-emerald-50 transition-colors"
          aria-label="Close"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-5 w-5"
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <path
              fillRule="evenodd"
              d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
              clipRule="evenodd"
            />
          </svg>
        </button>

        {/* Spinner – only while generating */}
        {!error && (
          <div className="relative w-16 h-16 mx-auto mb-6">
            <div className="absolute inset-0 rounded-full border-4 border-emerald-100" />
            <div className="absolute inset-0 rounded-full border-4 border-emerald-600 border-t-transparent animate-spin" />
          </div>
        )}

        <h2 className="text-xl font-bold text-emerald-900 mb-2">
          {error ? "Oops" : "Creating your OutsideQuest"}
        </h2>

        {error ? (
          <div className="space-y-5">
            <p className="text-red-600 text-sm leading-relaxed">{error}</p>
            <button
              onClick={onRetry}
              className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-sm font-medium transition-colors"
            >
              Go back and try again
            </button>
          </div>
        ) : (
          <p className="text-emerald-700/80 text-sm animate-pulse">{status}</p>
        )}

        <p className="mt-8 text-xs text-emerald-600/60">
          Running on local open-weight AI · No data leaves your device
        </p>
      </div>
    </div>
  );
}
