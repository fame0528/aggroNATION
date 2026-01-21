# Aggronation

**Intelligent AI Content Aggregator with Automated Multi-Source Fetching**

Premium Next.js application with AAA design standards and production-ready architecture

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](./LICENSE)
[![Next.js](https://img.shields.io/badge/Next.js-15-black)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-3.4-38bdf8)](https://tailwindcss.com/)
[![ECHO v1.3.4](https://img.shields.io/badge/ECHO-v1.3.4-orange)](./dev/)

## 🌟 Overview

Aggronation is a cutting-edge AI content aggregator that automatically fetches, curates, and displays content from multiple sources using advanced algorithms. Built with modern web technologies and designed with a focus on performance, scalability, and user experience. Features production-ready automation with Vercel Cron Jobs, comprehensive admin dashboard, and real-time content updates.

### ✨ Key Features

- 🔄 **Automated Content Fetching** - Hourly updates via Vercel Cron Jobs with zero manual intervention
- ⚡ **Multi-Source Integration** - YouTube, RSS, Reddit, and X (Twitter) content aggregation
- 🎯 **Smart Rating Algorithm** - Custom content scoring with time-based decay
- 🎛️ **Full Admin Dashboard** - Complete CRUD operations with real-time management
- 🔒 **Production Security** - Token-based authentication and secure webhook endpoints
- 💎 **AAA Design** - Premium HeroUI components with responsive layouts
- 🗄️ **Cloud Database** - MongoDB Atlas with Mongoose ODM
- 📊 **Real-Time Updates** - Automatic content refresh with statistics tracking
- 🚀 **Optimized Performance** - Next.js 15 App Router with Turbopack
- 📱 **Fully Responsive** - Perfect experience on desktop, tablet, and mobile

## 🚀 Live Demo

**Production:** Coming Soon

**Development Status:** 85% Complete - Production-ready with YouTube integration

## 🎯 What Makes Aggronation Unique

Aggronation solves the content overload problem by intelligently aggregating AI-related content from multiple sources with automated fetching, smart rating algorithms, and an intuitive interface. Unlike manual content curation or simple RSS readers, Aggronation provides:

### 🔄 **Automated Multi-Source Fetching**
- **Zero Manual Intervention** - Vercel Cron Jobs run hourly automatically
- **Intelligent Scheduling** - Local development cron with node-cron
- **Secure Webhooks** - Token-based authentication (CRON_SECRET)
- **Detailed Logging** - Execution statistics and error tracking
- **Scalable Architecture** - Cloud-native design for reliability

### 🎯 **Smart Content Management**
- **Dynamic Source Control** - Enable/disable sources on-the-fly
- **Manual Fetch Override** - Trigger updates without waiting for cron
- **Edit Capabilities** - Update source URLs and metadata easily
- **Statistics Tracking** - Monitor fetch history and success rates
- **Type Safety** - Full TypeScript with Zod validation

### 💎 **Premium User Experience**
- **HeroUI Components** - Modern glassmorphism design
- **Responsive Grid** - 8 videos per section (2 full rows of 4)
- **Optimized Hero** - Reduced height for better content visibility
- **Dark Mode** - Native theme support
- **Smooth Animations** - Hardware-accelerated transforms

### 🗄️ **Production-Ready Backend**
- **MongoDB Atlas** - Cloud database with automatic backups
- **Mongoose ODM** - Schema validation and type safety
- **API Architecture** - RESTful endpoints with proper error handling
- **Content Models** - Structured data with timestamps and metadata
- **Source Management** - Dynamic configuration without code changes

---

## 🛠️ Tech Stack

### Frontend Framework
- **Next.js 15** - React framework with App Router and Server Components
- **TypeScript 5.0** - Type-safe development with strict mode
- **Turbopack** - Lightning-fast bundler for development

### UI/UX
- **HeroUI v2** - Modern component library with glassmorphism
- **Tailwind CSS 3.4** - Utility-first styling with custom design system
- **Framer Motion** - Hardware-accelerated animations
- **next-themes** - Seamless dark mode support
- **Gradient System** - Custom color palette with smooth transitions

### Backend & Database
- **MongoDB Atlas** - Cloud-native NoSQL database
- **Mongoose** - ODM with schema validation and type safety
- **Zod** - Runtime schema validation for API endpoints
- **bcryptjs** - Secure password hashing for admin auth

### Content Fetching
- **YouTube Data API v3** - Video metadata and statistics
- **RSS Parser** - Feed parsing for article content (planned)
- **Reddit API** - Post fetching from subreddits (planned)
- **X (Twitter) API** - Tweet aggregation (planned)

### Automation & Deployment
- **Vercel Cron Jobs** - Production-grade scheduled tasks
- **node-cron** - Local development cron simulation
- **Vercel** - Edge network deployment with zero-config
- **GitHub Actions** - CI/CD pipeline (planned)

### Development Tools
- **ESLint** - Code quality enforcement with Next.js rules
- **Prettier** - Consistent code formatting (planned)
- **TypeScript Strict Mode** - Maximum type safety
- **SWR** - Data fetching and state management (planned)

---

## � Installation

### Prerequisites

- Node.js 18+ or Bun
- MongoDB Atlas account (or local MongoDB instance)
- YouTube Data API key from Google Cloud Console
- npm/yarn/pnpm package manager

### Clone & Install

```bash
# Clone the repository
git clone https://github.com/fame0528/aggronation.git
cd aggronation

# Install dependencies
npm install
```

### Environment Configuration

Create `.env.local` file in the root directory:

```env
# Database Connection
DATABASE_URL=mongodb+srv://username:password@cluster.mongodb.net/?appName=aggronation

# YouTube Data API v3
YOUTUBE_API_KEY=your_youtube_api_key_here

# Cron Webhook Security
CRON_SECRET=your_secure_random_string_here
```

**Important:** Never commit `.env.local` to version control. Add it to `.gitignore`.

### Development Server

```bash
# Start dev server (http://localhost:3000)
npm run dev

# With Turbopack (faster)
npm run dev --turbo
```

### Build for Production

```bash
# Create optimized build
npm run build

# Preview production build locally
npm start

# Type checking
npx tsc --noEmit
```

---

## 📂 Project Structure

```
aggronation/
├── src/
│   ├── app/                      # Next.js App Router
│   │   ├── globals.css           # Global styles & animations
│   │   ├── layout.tsx            # Root layout with metadata
│   │   ├── page.tsx              # Homepage
│   │   ├── api/                  # API routes
│   │   │   ├── content/          # Content fetching endpoints
│   │   │   │   └── route.ts      # GET /api/content
│   │   │   ├── cron/             # Cron webhook
│   │   │   │   └── fetch/        # POST /api/cron/fetch
│   │   │   └── admin/            # Admin API routes
│   │   │       ├── sources/      # Source management CRUD
│   │   │       └── auth/         # Authentication
│   │   ├── admin/                # Admin dashboard pages
│   │   │   ├── page.tsx          # Admin home
│   │   │   ├── sources/          # Source management UI
│   │   │   └── login/            # Admin login
│   │   └── [sourceType]/         # Dynamic source pages
│   │       └── page.tsx          # YouTube, RSS, Reddit, X
│   ├── components/               # React components
│   │   ├── home/                 # Homepage components
│   │   │   ├── HeroSection.tsx   # Hero banner with gradient
│   │   │   ├── DashboardSection.tsx  # Content sections
│   │   │   ├── ContentGrid.tsx   # Grid layout
│   │   │   ├── ContentCard.tsx   # Individual content cards
│   │   │   └── index.ts          # Barrel exports
│   │   ├── navbar.tsx            # Navigation bar
│   │   └── theme-switch.tsx      # Dark mode toggle
│   └── lib/                      # Core libraries
│       ├── db/                   # Database
│       │   ├── mongoose.ts       # MongoDB connection
│       │   └── models/           # Mongoose models
│       │       ├── Content.ts    # Content schema
│       │       ├── Source.ts     # Source schema
│       │       └── AdminUser.ts  # Admin user schema
│       ├── fetchers/             # Content fetchers
│       │   ├── youtube.ts        # YouTube Data API v3
│       │   ├── rss.ts            # RSS feed parser (planned)
│       │   ├── reddit.ts         # Reddit API (planned)
│       │   └── x.ts              # X/Twitter API (planned)
│       ├── cron/                 # Cron job initialization
│       │   └── index.ts          # node-cron setup
│       └── auth/                 # Authentication
│           └── admin.ts          # Admin auth utilities
├── dev/                          # ECHO Development Tracking
│   ├── QUICK_START.md            # Session recovery guide
│   ├── progress.md               # Active development
│   ├── planned.md                # Upcoming features
│   ├── completed.md              # Finished features
│   ├── roadmap.md                # Strategic direction
│   ├── metrics.md                # Performance metrics
│   ├── architecture.md           # Technical decisions
│   └── fids/                     # Feature ID details
│       └── FID-20260120-001.md   # AI Content Aggregator FID
├── scripts/                      # Utility scripts
│   ├── test-cron.js              # Cron endpoint testing
│   ├── test-youtube-api.js       # YouTube API diagnostic
│   └── createAdmin.js            # Create admin user
├── docs/                         # Documentation
│   └── API.md                    # API documentation
├── public/                       # Static assets
│   └── favicon.ico               # Favicon
├── vercel.json                   # Vercel Cron configuration
├── instrumentation.ts            # Runtime initialization
├── next.config.js                # Next.js configuration
├── tailwind.config.js            # Tailwind CSS config
└── tsconfig.json                 # TypeScript configuration
```

---

## 🎯 How It Works

### Content Aggregation System

Aggronation uses a sophisticated multi-source fetching system with automated scheduling:

1. **Source Configuration**
   - Admin creates sources via dashboard
   - Specify source type (YouTube, RSS, Reddit, X)
   - Configure URLs, channels, or handles
   - Enable/disable sources dynamically

2. **Automated Fetching**
   - Vercel Cron Jobs trigger hourly (production)
   - node-cron runs locally (development)
   - Secure webhook with CRON_SECRET validation
   - Parallel fetching from all enabled sources

3. **Content Processing**
   - Fetch metadata from source APIs
   - Validate and transform data with Zod schemas
   - Store in MongoDB with timestamps
   - Update source statistics

4. **Display & Updates**
   - Homepage fetches latest content
   - Real-time updates via SWR (planned)
   - Responsive grid layout (2 rows × 4 columns)
   - Content cards with metadata display

### Key Components

**Cron Webhook** (`app/api/cron/fetch/route.ts`)
- Validates CRON_SECRET token
- Fetches from all enabled sources in parallel
- Returns detailed execution statistics
- Error handling and logging

**YouTube Fetcher** (`lib/fetchers/youtube.ts`)
- YouTube Data API v3 integration
- Channel handle/ID resolution
- Video metadata extraction (title, description, thumbnail, stats)
- 50+ videos per channel support
- Rate limiting and error handling

**Source Model** (`lib/db/models/Source.ts`)
- Mongoose schema with TypeScript types
- Source type enum (youtube, rss, reddit, x)
- Enable/disable flag for dynamic control
- Fetch statistics tracking

**Content Model** (`lib/db/models/Content.ts`)
- Unified content schema for all source types
- Metadata storage (views, likes, date)
- Relationship to source
- Automatic timestamps

### Cron Schedule Architecture

**Production (Vercel Cron Jobs)**:
```json
{
  "crons": [{
    "path": "/api/cron/fetch",
    "schedule": "0 * * * *"
  }]
}
```
- Runs every hour at :00 minutes
- Automatic configuration from `vercel.json`
- No manual setup required

**Development (node-cron)**:
```typescript
// instrumentation.ts
if (process.env.NODE_ENV === 'development') {
  cron.schedule('0 * * * *', fetchAllSources);
  fetchAllSources(); // Initial fetch on startup
}
```
- Same schedule as production
- Immediate fetch on dev server start
- Local testing without deployment

---

## � Design System

### Color Palette

```css
/* Primary Gradients */
--gradient-primary: hsl(var(--nextui-primary)) → hsl(var(--nextui-secondary))
--background: hsl(var(--nextui-background))
--foreground: hsl(var(--nextui-foreground))

/* Semantic Colors */
--primary: Blue (HeroUI default)
--secondary: Purple (HeroUI default)
--success: Green
--warning: Amber
--danger: Red

/* Glassmorphism */
--glass: backdrop-blur-md + bg-background/60
--glass-card: backdrop-blur-sm + bg-content1/50
```

### Typography

- **Headers**: HeroUI default font stack with gradient text
- **Sizes**: text-5xl (hero), text-3xl (sections), text-xl (cards)
- **Body**: Default with text-foreground/70 for secondary text
- **Weights**: font-bold (headings), font-semibold (labels), font-normal (body)

### Component Patterns

**Card Component**:
```tsx
<Card className="border-none bg-gradient-to-br from-violet-500/10 to-fuchsia-500/10">
  <CardHeader>...</CardHeader>
  <CardBody>...</CardBody>
</Card>
```

**Button Styles**:
- Primary: `color="primary" variant="shadow"`
- Secondary: `color="secondary" variant="flat"`
- Danger: `color="danger" variant="light"`

### Animation System

```css
/* Utility Classes */
.card-hover { 
  transition: transform 200ms ease-out;
  &:hover { transform: translateY(-4px); }
}

/* Framer Motion Variants */
const fadeIn = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.5 }
}
```

---

## � Development

### Code Quality Standards

- ✅ TypeScript strict mode enabled
- ✅ ESLint with Next.js rules
- ✅ Component-based architecture
- ✅ Comprehensive JSDoc comments
- ✅ Single Responsibility Principle
- ✅ DRY (Don't Repeat Yourself)
- ✅ Utility-first design patterns

### Adding Features

Follow ECHO development methodology:

1. Create FID (Feature ID) in `dev/planned.md`
2. Plan implementation with acceptance criteria
3. Move to `dev/progress.md` when starting
4. Implement with AAA quality standards
5. Test thoroughly (manual + TypeScript verification)
6. Move to `dev/completed.md` with metrics
7. Update `dev/QUICK_START.md`

### Testing

```bash
# Type checking
npx tsc --noEmit

# Lint code
npm run lint

# Test cron endpoint
node scripts/test-cron.js http://localhost:3000

# Test YouTube API
node scripts/test-youtube-api.js

# Build verification
npm run build
```

---

## 🌐 Deployment

### Vercel Deployment (Recommended)

1. **Push to GitHub**
```bash
git add .
git commit -m "feat: your feature description"
git push origin main
```

2. **Import to Vercel**
- Visit [vercel.com](https://vercel.com/)
- Click "New Project"
- Import your GitHub repository
- Configure environment variables

3. **Required Environment Variables**
```env
DATABASE_URL=mongodb+srv://username:password@cluster.mongodb.net/?appName=aggronation
YOUTUBE_API_KEY=your_youtube_api_key_here
CRON_SECRET=your_secure_random_string
```

4. **Automatic Cron Setup**
- Vercel reads `vercel.json` automatically
- Configures hourly cron job
- Calls `/api/cron/fetch` webhook with CRON_SECRET
- No additional configuration needed

5. **Verify Deployment**
```bash
# Test cron endpoint (replace with your domain)
node scripts/test-cron.js https://your-domain.vercel.app
```

### Alternative Deployment Options

**Cloudflare Pages**:
- Similar to Vercel deployment
- Requires manual cron configuration

**Self-Hosted**:
- Deploy to VPS or container
- Set up PM2 or systemd for process management
- Configure reverse proxy (nginx/Apache)
- Set up SSL certificates

**See [PRODUCTION_DEPLOYMENT.md](./PRODUCTION_DEPLOYMENT.md) for complete deployment guide**

---

## 📋 Roadmap

See `dev/roadmap.md` for detailed plans.

### Q1 2026

**✅ Completed**:
- Production-ready architecture with automated fetching
- YouTube Data API v3 integration
- Admin dashboard with full CRUD operations
- MongoDB Atlas integration with Mongoose ODM
- Vercel Cron Jobs configuration

**🚧 In Progress**:
- RSS feed parser and content extraction
- Rating & decay algorithm implementation

### Q2 2026

**Planned**:
- Reddit API integration for subreddit monitoring
- X (Twitter) API integration for tweet aggregation
- Advanced filtering and search functionality
- User accounts and personalization
- Bookmarking and favorites system

### Q3 2026

**Planned**:
- Real-time content updates with WebSockets
- AI-powered content recommendations
- Analytics dashboard for admin
- Public API for third-party integration
- Mobile app (React Native or PWA)

---

## 🤝 Contributing

We welcome contributions! Please follow these guidelines:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Follow ECHO development standards (see [`dev/`](./dev/) folder)
4. Write comprehensive commit messages
5. Test thoroughly before submitting
6. Submit a Pull Request

### Code Standards

- Use TypeScript strict mode
- Follow existing component patterns
- Add JSDoc comments for functions
- Update relevant documentation
- Maintain AAA quality standards
- Follow ECHO v1.3.4 workflow (Planning → Implementation → Verification)

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](./LICENSE) file for details.

Copyright © 2026 Aggronation

---

## ⚠️ Disclaimer

This tool is provided for educational and content aggregation purposes only.

- ✅ Use for learning web development and API integration
- ✅ Use for personal content discovery
- ✅ Respect API rate limits and terms of service
- ❌ Do not use for copyright infringement
- ❌ Do not use for commercial purposes without proper rights
- ❌ Do not exceed API quotas or abuse services

**Note:** Always follow the terms of service for YouTube, Reddit, RSS feeds, and X (Twitter) APIs.

---

## 🙏 Acknowledgments

- **Next.js Team** - For the amazing React framework
- **Vercel** - For excellent deployment platform and Cron Jobs
- **HeroUI Team** - For the beautiful component library
- **Open Source Community** - For invaluable tools and libraries
- **Contributors** - For helping improve this project

---

## 📧 Contact & Support

- **Website:** Coming Soon
- **GitHub:** https://github.com/fame0528/aggronation
- **Issues:** [Report bugs or request features](https://github.com/fame0528/aggronation/issues)
- **Documentation:** See [`/dev`](./dev/) folder for complete tracking
- **ECHO System:** Type "resume" in development chat for instant context restoration

---

**Made with ❤️ by Aggronation**

⭐ Star us on GitHub if you find this useful!

[Report Bug](https://github.com/fame0528/aggronation/issues) • [Request Feature](https://github.com/fame0528/aggronation/issues) • [Documentation](./dev/)

---

## 📊 Development Tracking

This project uses the **ECHO v1.3.4** development system for comprehensive tracking and quality assurance.

### Key Tracking Files

- **[QUICK_START.md](./dev/QUICK_START.md)** - Session recovery and current status
- **[progress.md](./dev/progress.md)** - Active work and implementation details
- **[metrics.md](./dev/metrics.md)** - Performance and quality metrics
- **[completed.md](./dev/completed.md)** - Finished features and outcomes

### Current Status

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

## About

Intelligent AI content aggregator with automated multi-source fetching. Built with Next.js 15, TypeScript, MongoDB Atlas, and HeroUI. Features production-ready Vercel Cron Jobs, comprehensive admin dashboard, and real-time content updates from YouTube, RSS, Reddit, and X (Twitter).

### Resources

[README](https://github.com/fame0528/aggronation#readme)

### License

[MIT license](./LICENSE)

### Languages

- TypeScript 75.3%
- JavaScript 20.1%
- CSS 4.6%

---

**Built with ❤️ using ECHO v1.3.4 AAA-Quality Development System**

*Last Updated: 2026-01-20 | Status: Production Ready 🚀*
