# 📂 /dev Folder - ECHO Development Tracking System

**Version:** ECHO v1.3.4 with GUARDIAN PROTOCOL v2.1
**Last Updated:** 2026-01-20

## 🎯 Purpose

This folder contains the **bulletproof auto-audit tracking system** for the Aggronation project. All tracking files are **automatically maintained** by ECHO's AUTO_UPDATE functions - **NO MANUAL EDITING REQUIRED**.

---

## 📁 Folder Structure

```
/dev/
├── README.md                # This file
├── planned.md              # AUTO-UPDATED by AUTO_UPDATE_PLANNED()
├── progress.md             # AUTO-UPDATED by AUTO_UPDATE_PROGRESS()
├── completed.md            # AUTO-UPDATED by AUTO_UPDATE_COMPLETED()
├── QUICK_START.md          # AUTO-GENERATED after every tracking update
├── roadmap.md              # Manual strategic planning
├── metrics.md              # AUTO-UPDATED by AUTO_UPDATE_COMPLETED()
├── architecture.md         # Manual technical decisions
├── issues.md               # Manual bug tracking
├── decisions.md            # Manual important decisions
├── suggestions.md          # Manual improvement recommendations
├── quality-control.md      # Manual compliance tracking
├── lessons-learned.md      # AUTO-UPDATED by AUTO_UPDATE_COMPLETED()
├── archives/               # AUTO-POPULATED by AUTO_ARCHIVE_CHECK()
│   └── YYYY-MM/            # Date-based archives
├── fids/                   # Individual Feature ID files
│   ├── FID-YYYYMMDD-XXX.md # AUTO-CREATED by AUTO_UPDATE_PLANNED()
│   └── archives/           # Archived completed FID files
│       └── YYYY-MM/        # Date-based FID archives
└── examples/               # Code examples and templates
```

---

## 🤖 Auto-Maintained Files (DO NOT EDIT MANUALLY)

### Core Tracking Files
- **planned.md** - Features ready for implementation
- **progress.md** - Currently active work with real-time updates
- **completed.md** - Successfully implemented features with metrics
- **QUICK_START.md** - Auto-generated session resumption guide
- **metrics.md** - Performance tracking and velocity metrics
- **lessons-learned.md** - Automatically captured insights

### FID Files
- **fids/FID-YYYYMMDD-XXX.md** - Individual feature detail files
- **fids/archives/YYYY-MM/** - Completed FID files (auto-archived)

### Archives
- **archives/YYYY-MM/completed_YYYYMMDD.md** - Auto-archived completed entries

---

## 📝 Manual Files (Update As Needed)

- **roadmap.md** - Strategic direction and milestones
- **architecture.md** - Technical decisions and stack
- **issues.md** - Known bugs and problems
- **decisions.md** - Important project decisions
- **suggestions.md** - Improvement recommendations
- **quality-control.md** - Compliance tracking

---

## 🔄 How It Works

### Planning Phase
1. User describes feature
2. ECHO enters PLANNING MODE
3. **AUTO_UPDATE_PLANNED()** executes automatically
4. Feature added to `planned.md` with unique FID
5. FID file created in `fids/`

### Implementation Phase
1. User approves with "proceed"
2. **AUTO_UPDATE_PROGRESS()** executes automatically
3. Feature moved from `planned.md` to `progress.md`
4. Real-time updates during implementation
5. Progress tracked for every file, phase, batch

### Completion Phase
1. Feature implementation finishes
2. **AUTO_UPDATE_COMPLETED()** executes automatically
3. Feature moved from `progress.md` to `completed.md`
4. Metrics calculated and stored
5. Lessons learned captured
6. FID file archived to `fids/archives/`
7. Documentation created in `/docs`

### Archiving
- When `completed.md` exceeds 10 entries
- **AUTO_ARCHIVE_CHECK()** executes automatically
- Oldest entries archived with summary matrix
- Keeps 5 most recent entries in `completed.md`

---

## 🛡️ GUARDIAN PROTOCOL Integration

All tracking files are protected by GUARDIAN PROTOCOL v2.1:
- ✅ Detects missing auto-audit updates
- ✅ Enforces real-time tracking
- ✅ Prevents manual tracking file edits
- ✅ Ensures 100% accuracy and currency

---

## 📊 Session Recovery

Type **"Resume"** in any chat session to:
- Restore complete project context
- Load active work and recent completions
- Get recommended next actions
- Continue seamlessly from where you left off

---

## 🎯 Benefits

✅ **Zero Manual Overhead** - User never touches tracking files
✅ **Always Current** - Real-time updates during development
✅ **Perfect History** - Complete audit trail preserved
✅ **Instant Recovery** - Resume command restores context
✅ **Accurate Metrics** - Automatic time and velocity tracking
✅ **Organized Archives** - Historical data properly preserved

---

**🛡️ Auto-maintained by ECHO v1.3.4 with GUARDIAN PROTOCOL v2.1**
