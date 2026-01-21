# 🧠 Aggronation - AI Content Aggregator

> **Intelligent AI news and content aggregation platform powered by custom rating & decay algorithms**

[![Next.js](https://img.shields.io/badge/Next.js-15-black)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue)](https://www.typescriptlang.org/)
[![MongoDB](https://img.shields.io/badge/MongoDB-Atlas-green)](https://www.mongodb.com/)
[![Production Ready](https://img.shields.io/badge/Production-Ready-success)](https://vercel.com/)
[![ECHO v1.3.4](https://img.shields.io/badge/ECHO-v1.3.4-orange)](./dev/)

## 📋 Project Overview

Aggronation is a production-ready AI content aggregator that automatically fetches, curates, and displays content from multiple sources including YouTube, RSS feeds, Reddit, and X (Twitter). Built with modern TypeScript, Next.js 15, and HeroUI, featuring automated content fetching via Vercel Cron Jobs and a comprehensive admin dashboard.

**Current Status:** 🚀 **85% Complete** - Production-ready with YouTube integration live

---

## ✨ Features

### ✅ Completed Features

- **🎨 Modern Homepage**
  - Card-based responsive layout (mobile/tablet/desktop)
  - Real-time content display with YouTube embeds
  - 8 videos per section (2 full rows)
  - Optimized hero section with gradient backgrounds
  - Dark mode support via HeroUI

- **⚙️ Production-Ready Automation**
  - Secure cron webhook endpoint with token authentication
  - Vercel Cron Jobs configuration (hourly automated fetching)
  - Local development cron with node-cron
  - Complete deployment guide and documentation

- **▶️ YouTube Integration**
  - Real-time fetching from YouTube Data API v3
  - 50+ videos per channel automatically fetched
  - Channel resolution via handles or IDs
  - Video statistics (views, likes, comments)
  - Hourly automated updates

- **🎛️ Admin Dashboard**
  - Full CRUD operations for content sources
  - Manual fetch capability (on-demand content updates)
  - Edit functionality with modal interface
  - Enable/disable sources dynamically
  - Source statistics and metadata tracking

- **🗄️ Database Integration**
  - MongoDB Atlas cloud database
  - Mongoose ODM with schema validation
  - Content model with source tracking
  - Timestamps and metadata management

### 🚧 Planned Features

- **📰 RSS Feed Integration** (Next Priority)
  - Feed parsing and validation
  - Article extraction and formatting
  - Scheduled fetching

- **🔴 Reddit Integration**
  - Subreddit monitoring
  - Post fetching with metadata
  - Comment tracking (optional)

- **✕ X/Twitter Integration**
  - Timeline fetching
  - Tweet display with media
  - Real-time updates

- **⭐ Rating & Decay Algorithm**
  - Custom content scoring system
  - Time-based decay implementation
  - User engagement metrics
  - Featured content management

---

## 🛠️ Tech Stack

### Core Technologies
- **[Next.js 15](https://nextjs.org/)** - React framework with App Router
- **[TypeScript 5.0](https://www.typescriptlang.org/)** - Type-safe development
- **[HeroUI v2](https://heroui.com/)** - Modern component library
- **[MongoDB Atlas](https://www.mongodb.com/)** - Cloud database
- **[Mongoose](https://mongoosejs.com/)** - ODM for MongoDB

### UI & Styling
- **[Tailwind CSS](https://tailwindcss.com/)** - Utility-first styling
- **[Framer Motion](https://www.framer.com/motion/)** - Animations
- **[next-themes](https://github.com/pacocoursey/next-themes)** - Dark mode

### API & Automation
- **[YouTube Data API v3](https://developers.google.com/youtube/v3)** - Video fetching
- **[Vercel Cron Jobs](https://vercel.com/docs/cron-jobs)** - Scheduled automation
- **[node-cron](https://www.npmjs.com/package/node-cron)** - Local development cron
- **[Axios](https://axios-http.com/)** - HTTP client

### Development Tools
- **[Zod](https://zod.dev/)** - Schema validation
- **[bcryptjs](https://www.npmjs.com/package/bcryptjs)** - Password hashing
- **[ESLint](https://eslint.org/)** - Code linting

---

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ installed
- MongoDB Atlas account (or local MongoDB)
- YouTube Data API key
- npm/yarn/pnpm package manager

### Installation

1. **Clone the repository**
```bash
git clone <repository-url>
cd aggronation
```

2. **Install dependencies**
```bash
npm install
```

3. **Environment setup**

Create `.env.local` file:
```env
# Database
DATABASE_URL=mongodb+srv://username:password@cluster.mongodb.net/?appName=aggronation

# YouTube API
YOUTUBE_API_KEY=your_youtube_api_key_here

# Cron Security
CRON_SECRET=your_secure_random_string
```

4. **Run development server**
```bash
npm run dev
```

5. **Open browser**
```
http://localhost:3000
```

### Admin Dashboard

Access the admin panel to manage content sources:
```
http://localhost:3000/admin
```

**Default credentials:** Set up in your authentication system

---

## 📂 Project Structure

```
aggronation/
├── app/                          # Next.js app directory
│   ├── api/                      # API routes
│   │   ├── content/              # Content fetching endpoints
│   │   ├── cron/                 # Cron webhook endpoints
│   │   └── admin/                # Admin API routes
│   ├── admin/                    # Admin dashboard pages
│   │   └── sources/              # Source management
│   └── page.tsx                  # Homepage
│
├── components/                   # React components
│   ├── home/                     # Homepage components
│   │   ├── HeroSection.tsx       # Hero banner
│   │   ├── DashboardSection.tsx  # Content sections
│   │   └── ContentGrid.tsx       # Video grid display
│   └── navbar.tsx                # Navigation bar
│
├── lib/                          # Core libraries
│   ├── db/                       # Database
│   │   ├── mongodb.ts            # Connection
│   │   └── models/               # Mongoose models
│   │       ├── Content.ts        # Content model
│   │       └── Source.ts         # Source model
│   ├── fetchers/                 # Content fetchers
│   │   └── youtube.ts            # YouTube fetcher
│   └── cron.ts                   # Cron job initialization
│
├── dev/                          # 📊 Development tracking
│   ├── QUICK_START.md            # Session recovery guide
│   ├── progress.md               # Current work tracking
│   ├── planned.md                # Planned features
│   ├── completed.md              # Completed features
│   ├── metrics.md                # Performance metrics
│   └── fids/                     # Feature ID details
│
├── scripts/                      # Utility scripts
│   ├── test-cron.js              # Cron endpoint testing
│   └── test-youtube-api.js       # YouTube API diagnostic
│
├── vercel.json                   # Vercel Cron configuration
└── instrumentation.ts            # Runtime initialization
```

---

## 🔧 Development Tracking

This project uses the **ECHO v1.3.4** development system for comprehensive tracking and quality assurance.

### 📊 Key Tracking Files

- **[QUICK_START.md](./dev/QUICK_START.md)** - Session recovery and current status
- **[progress.md](./dev/progress.md)** - Active work and implementation details
- **[metrics.md](./dev/metrics.md)** - Performance and quality metrics
- **[completed.md](./dev/completed.md)** - Finished features and outcomes

### 🎯 Current Status

| Metric | Value |
|--------|-------|
| **Overall Progress** | 85% |
| **Features In Progress** | 1 (FID-20260120-001) |
| **TypeScript Errors** | 0 ✅ |
| **Production Ready** | Yes ✅ |
| **LOC Generated** | ~2,500+ lines |

**Active Work:** Production-ready content aggregator with YouTube integration

**Next Steps:** RSS fetcher → Reddit → X/Twitter → Rating algorithm

---

## 🌐 Deployment

### Vercel Deployment (Recommended)

1. **Push to GitHub**
```bash
git push origin main
```

2. **Import to Vercel**
- Connect repository at [vercel.com](https://vercel.com/)
- Configure environment variables

3. **Required Environment Variables**
```
DATABASE_URL=<mongodb-connection-string>
YOUTUBE_API_KEY=<your-api-key>
CRON_SECRET=<secure-random-string>
```

4. **Automatic Cron Setup**
- Vercel automatically configures cron from `vercel.json`
- Runs hourly at `:00` minutes
- Calls `/api/cron/fetch` webhook

### Manual Verification

Test the cron endpoint:
```bash
node scripts/test-cron.js https://your-domain.vercel.app
```

**See [PRODUCTION_DEPLOYMENT.md](./PRODUCTION_DEPLOYMENT.md) for complete deployment guide**

---

## 📖 API Documentation

### Content API

**Fetch content by source type:**
```http
GET /api/content?sourceType=youtube&limit=20
```

**Response:**
```json
{
  "content": [
    {
      "_id": "...",
      "sourceType": "youtube",
      "title": "Video Title",
      "url": "https://youtube.com/watch?v=...",
      "metadata": {
        "viewCount": 1000,
        "likeCount": 50,
        "commentCount": 10
      }
    }
  ]
}
```

### Cron Webhook

**Trigger manual fetch:**
```http
GET /api/cron/fetch?secret=<CRON_SECRET>
```

**Admin API** - See [API documentation](./docs/API.md)

---

## 🧪 Testing

### YouTube API Test
```bash
node scripts/test-youtube-api.js
```

### Cron Endpoint Test
```bash
node scripts/test-cron.js http://localhost:3000
```

### TypeScript Verification
```bash
npx tsc --noEmit
```

---

## 🤝 Contributing

This project follows AAA-quality standards with the ECHO v1.3.4 development protocol:

1. **Read ECHO guidelines** in [`dev/`](./dev/) folder
2. **Create FID** for new features (Feature ID tracking)
3. **Follow workflow:** Planning → Approval → Implementation → Verification
4. **Maintain quality:** TypeScript strict mode, complete documentation, zero placeholders
5. **Update tracking:** All work logged in `/dev` tracking files

---

## 📄 License

Licensed under the [MIT license](./LICENSE).

---

## 🙏 Acknowledgments

- **[HeroUI](https://heroui.com/)** - Beautiful component library
- **[Next.js](https://nextjs.org/)** - Amazing React framework
- **[Vercel](https://vercel.com/)** - Seamless deployment platform
- **ECHO v1.3.4** - Development tracking and quality system

---

## 📞 Contact & Support

- **Issues:** [GitHub Issues](../../issues)
- **Documentation:** See [`/dev`](./dev/) folder for complete tracking
- **Session Recovery:** Type "resume" in development chat for instant context restoration

---

**Built with ❤️ using ECHO v1.3.4 AAA-Quality Development System**

*Last Updated: 2026-01-20 | Status: Production Ready 🚀*
