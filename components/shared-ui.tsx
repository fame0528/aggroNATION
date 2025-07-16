import React from 'react';

export const Loader: React.FC<{ message?: string }> = ({ message = 'Loading...' }) => (
  <div
    className="flex items-center justify-center py-8 text-gray-400"
    role="status"
    aria-live="polite"
  >
    <span className="animate-spin mr-2" aria-hidden="true">
      ⏳
    </span>
    {message}
  </div>
);

export const ErrorMessage: React.FC<{ error: string; onRetry?: () => void }> = ({
  error,
  onRetry,
}) => (
  <div className="text-center text-red-400 p-8" role="alert" aria-live="assertive">
    <p>{error}</p>
    {onRetry && (
      <button
        onClick={onRetry}
        className="mt-4 px-4 py-2 bg-gray-700 text-white rounded hover:bg-gray-600"
        aria-label="Retry"
      >
        Retry
      </button>
    )}
  </div>
);

export const Skeleton: React.FC<{ count?: number }> = ({ count = 5 }) => (
  <div className="space-y-4">
    {Array.from({ length: count }).map((_, i) => (
      <div key={i} className="animate-pulse h-8 bg-gray-700 rounded w-full" />
    ))}
  </div>
);
