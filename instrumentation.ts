/**
 * Next.js Instrumentation File
 * 
 * Runs on server startup for both dev and production
 * Used to initialize cron jobs in development
 * 
 * In production (Vercel), use:
 * - vercel.json for scheduled cron jobs
 * - /api/cron/fetch webhook endpoint
 * 
 * @see https://nextjs.org/docs/app/building-your-application/optimizing/instrumentation
 */

export async function register() {
  // Only run on server side
  if (process.env.NEXT_RUNTIME === 'nodejs') {
    // Only start local cron jobs in development
    if (process.env.NODE_ENV === 'development' && !process.env.VERCEL) {
      const { initializeCronJobs } = await import('./lib/cron');
      console.log('[Instrumentation] 🚀 Starting local cron jobs for development...');
      initializeCronJobs();
    } else if (process.env.VERCEL) {
      console.log('[Instrumentation] ✅ Production mode: Using Vercel Cron Jobs');
      console.log('[Instrumentation] → Scheduled: Hourly via vercel.json');
      console.log('[Instrumentation] → Endpoint: /api/cron/fetch');
    }
  }
}
