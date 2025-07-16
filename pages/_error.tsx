import React from "react";

function ErrorPage({ statusCode }: { statusCode?: number }) {
  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: '#1a1a1a', color: '#fff' }}>
      <h1 style={{ fontSize: '2rem', fontWeight: 'bold' }}>Something went wrong</h1>
      <p style={{ marginTop: 16 }}>
        {statusCode
          ? `Error ${statusCode}: Sorry, an unexpected error occurred.`
          : "Sorry, an unexpected error occurred. Please try again later."}
      </p>
    </div>
  );
}

ErrorPage.getInitialProps = ({ res, err }: any) => {
  const statusCode = res?.statusCode || err?.statusCode || 500;
  return { statusCode };
};

export default ErrorPage;
