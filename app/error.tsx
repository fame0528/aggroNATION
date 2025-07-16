'use client';
import React from 'react';

/**
 * Error boundary page for aggroNATION dashboard.
 */
export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}): React.ReactElement {
  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        background: '#1a1a1a',
        color: '#fff',
      }}
    >
      <h1 style={{ fontSize: '2rem', fontWeight: 'bold' }}>Something went wrong</h1>
      <p style={{ marginTop: 16 }}>
        {error?.message || 'Sorry, an unexpected error occurred. Please try again later.'}
      </p>
      <button
        style={{
          marginTop: 24,
          padding: '8px 24px',
          background: '#fff',
          color: '#1a1a1a',
          border: 'none',
          borderRadius: 4,
          cursor: 'pointer',
          fontWeight: 'bold',
        }}
        onClick={() => reset()}
      >
        Try again
      </button>
    </div>
  );
}
