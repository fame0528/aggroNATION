# 🚀 Production Deployment Guide

## Overview

This application is designed to run on **Vercel** with production-ready automated content fetching using Vercel Cron Jobs.

---

## 📋 Pre-Deployment Checklist

### 1. Environment Variables

Add these to your Vercel project settings:

```env
# Required
DATABASE_URL="mongodb+srv://username:password@cluster.mongodb.net/dbname"
YOUTUBE_API_KEY="AIzaSy..."
CRON_SECRET="your-random-secret-string-here"

# Optional
NEXT_PUBLIC_BASE_URL="https://yourdomain.com"
```

**Generate CRON_SECRET:**
```bash
# Use any method to generate a secure random string
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
# Or use: https://www.random.org/strings/
```

---

## 🔧 Vercel Configuration

The application includes `vercel.json` which automatically configures cron jobs:

```json
{
  "crons": [
    {
      "path": "/api/cron/fetch",
      "schedule": "0 * * * *"
    }
  ]
}
```

**What this does:**
- Runs every hour at `:00` minutes
- Calls `/api/cron/fetch` endpoint automatically
- Fetches content from all enabled YouTube sources
- No additional setup required!

---

## 🚀 Deployment Steps

### Deploy to Vercel

#### Option 1: Vercel CLI
```bash
# Install Vercel CLI
npm i -g vercel

# Login
vercel login

# Deploy
vercel --prod
```

#### Option 2: GitHub Integration
1. Push code to GitHub
2. Go to [vercel.com](https://vercel.com)
3. Import your GitHub repository
4. Add environment variables in project settings
5. Deploy!

---

## ✅ Post-Deployment Verification

### 1. Test Cron Endpoint

```bash
# Replace with your domain and CRON_SECRET
curl "https://yourdomain.com/api/cron/fetch?secret=YOUR_CRON_SECRET"
```

**Expected Response:**
```json
{
  "success": true,
  "message": "Fetched 15 items from 2 sources",
  "results": [
    {
      "sourceId": "...",
      "sourceName": "intheworldofai",
      "sourceType": "youtube",
      "success": true,
      "count": 15,
      "error": null
    }
  ],
  "summary": {
    "total": 2,
    "successful": 2,
    "failed": 0,
    "itemsFetched": 15
  }
}
```

### 2. Check Vercel Logs

```bash
# View function logs
vercel logs

# Watch real-time
vercel logs --follow
```

Look for:
- `[Cron API] ⏰ Fetch triggered via webhook`
- `[Cron API] ✅ Batch complete: X items from Y sources`

### 3. Verify Cron Schedule

In Vercel Dashboard:
1. Go to your project
2. Settings → Cron Jobs
3. Should see `/api/cron/fetch` scheduled hourly

---

## 🔒 Security

### Cron Endpoint Protection

The `/api/cron/fetch` endpoint is protected by `CRON_SECRET`:

```typescript
// ✅ Authorized (Vercel Cron automatically includes secret)
GET /api/cron/fetch?secret=correct_secret

// ❌ Unauthorized
GET /api/cron/fetch
GET /api/cron/fetch?secret=wrong_secret
```

### Vercel Cron Authentication

Vercel automatically includes the secret when calling cron jobs defined in `vercel.json`. You can also manually add it in the cron configuration.

**Advanced: Use Vercel's x-vercel-signature header**
```typescript
// In your cron route, verify Vercel signature
const signature = request.headers.get('x-vercel-signature');
// Verify against VERCEL_SIGNATURE_SECRET
```

---

## 📊 Monitoring

### Check Cron Execution

**Vercel Dashboard:**
- Project → Functions → Filter by `/api/cron/fetch`
- See execution history, duration, success/failure

**MongoDB:**
- Check `Source.metadata.lastFetched` timestamps
- Check `Source.metadata.totalFetched` counts
- Check `Content` collection growth

### Set Up Alerts

**Option 1: Vercel Log Drains**
- Forward logs to external service (Datadog, Axiom, etc.)
- Set up alerts for errors

**Option 2: Custom Monitoring**
Create `/api/admin/health` endpoint:
```typescript
// Check when sources were last fetched
// Alert if > 2 hours since last successful fetch
```

**Option 3: Uptime Monitoring**
- Use UptimeRobot or Pingdom
- Monitor `/api/health` endpoint
- Get notified if site goes down

---

## 🔄 Alternative Cron Solutions

If you don't want to use Vercel Cron Jobs:

### Option 1: External Cron Service

**Services:**
- [cron-job.org](https://cron-job.org) (Free)
- [EasyCron](https://www.easycron.com) (Free tier)
- [Cronitor](https://cronitor.io)

**Setup:**
1. Create account
2. Add job: `GET https://yourdomain.com/api/cron/fetch?secret=YOUR_SECRET`
3. Schedule: `0 * * * *` (hourly)

### Option 2: GitHub Actions

Create `.github/workflows/cron.yml`:
```yaml
name: Fetch Content
on:
  schedule:
    - cron: '0 * * * *'  # Hourly
  workflow_dispatch:  # Manual trigger

jobs:
  fetch:
    runs-on: ubuntu-latest
    steps:
      - name: Trigger fetch
        run: |
          curl "https://yourdomain.com/api/cron/fetch?secret=${{ secrets.CRON_SECRET }}"
```

Add `CRON_SECRET` to GitHub Secrets.

### Option 3: CloudFlare Workers

Deploy a worker that runs on schedule:
```javascript
export default {
  async scheduled(event, env, ctx) {
    await fetch(`https://yourdomain.com/api/cron/fetch?secret=${env.CRON_SECRET}`);
  }
}
```

---

## 🐛 Troubleshooting

### Cron Jobs Not Running

**Check Vercel Dashboard:**
1. Project → Settings → Cron Jobs
2. Verify schedule is configured
3. Check execution logs

**Common Issues:**
- CRON_SECRET not set in environment variables
- vercel.json not deployed (push to git and redeploy)
- Function timeout (default 10s, upgrade plan for more)

### High API Costs

YouTube API quota: 10,000 units/day (free)

**Each fetch uses approximately:**
- 1 unit: channels.list (get uploads playlist)
- 1 unit: playlistItems.list (get video IDs)
- 1 unit: videos.list (get statistics)
- **Total: ~3 units per source per fetch**

**Daily usage calculation:**
```
3 units × 24 hours × number of sources = daily usage

Example:
3 × 24 × 5 sources = 360 units/day (3.6% of quota)
```

**If you hit quota limits:**
- Reduce fetch frequency (every 2-4 hours instead of hourly)
- Request quota increase from Google
- Implement smart fetching (only fetch if source has new content)

### MongoDB Connection Issues

**In production:**
- Verify MongoDB Atlas IP whitelist includes `0.0.0.0/0` (allow all)
- Or whitelist Vercel IPs (see Vercel docs)
- Check DATABASE_URL is correct in Vercel env vars

---

## 📈 Scaling Considerations

### Function Execution Time

Vercel function limits:
- **Hobby plan:** 10 seconds
- **Pro plan:** 60 seconds
- **Enterprise:** 900 seconds

**If you hit limits:**
- Fetch sources in batches
- Use queue system (Vercel Queue, BullMQ, etc.)
- Implement background jobs

### Database Connection Pooling

MongoDB connection caching is implemented in `lib/db/mongoose.ts`.

**For high traffic:**
- Use MongoDB connection pooling
- Consider MongoDB Data API
- Implement Redis caching layer

### Content Storage

**Current approach:** Store full content in MongoDB

**For large scale:**
- Store only metadata in MongoDB
- Cache full content in Redis
- Use CDN for static assets
- Implement pagination early

---

## 🎯 Best Practices

### 1. Monitor Fetch Success Rate

Create dashboard showing:
- Sources with consecutive errors > 3
- Last successful fetch time per source
- Total content fetched per day

### 2. Implement Retry Logic

Already implemented in `/api/cron/fetch`:
- Errors tracked in `Source.metadata.consecutiveErrors`
- Manual retry via "Fetch Now" button
- Auto-disable sources with 10+ consecutive errors (future)

### 3. Rate Limiting

Add rate limiting to public endpoints:
```typescript
// /api/content should limit requests per IP
import rateLimit from '@/lib/rateLimit';
```

### 4. Logging

Already implemented:
- Console logs with `[Cron API]`, `[YouTube]` prefixes
- Error tracking in source metadata
- Success/failure counts in API responses

**Upgrade to structured logging:**
- Use Pino or Winston
- Send to log aggregation service
- Add request IDs for tracing

---

## ✅ Production Checklist

Before going live:

- [ ] All environment variables set in Vercel
- [ ] CRON_SECRET is strong and secure
- [ ] vercel.json deployed and configured
- [ ] Test cron endpoint manually
- [ ] Verify first cron execution in logs
- [ ] MongoDB connection works from Vercel
- [ ] YouTube API key is valid and has quota
- [ ] Admin panel accessible (add users if needed)
- [ ] At least one source added and enabled
- [ ] Content appears on homepage after fetch
- [ ] Set up monitoring/alerts
- [ ] Document any custom configuration

---

## 🆘 Support

**Issues?**
1. Check Vercel function logs
2. Test cron endpoint manually with curl
3. Verify environment variables
4. Check MongoDB connection
5. Review YouTube API quota usage

**Still stuck?**
- Review `YOUTUBE_SYSTEM_COMPLETE.md`
- Check Next.js documentation
- Review Vercel Cron documentation

---

## 🎉 You're Ready!

Your application is now production-ready with:
- ✅ Automatic hourly content fetching
- ✅ Vercel Cron Jobs configured
- ✅ Secure webhook endpoint
- ✅ Error handling and monitoring
- ✅ Scalable architecture

Deploy and watch your content automatically update! 🚀
