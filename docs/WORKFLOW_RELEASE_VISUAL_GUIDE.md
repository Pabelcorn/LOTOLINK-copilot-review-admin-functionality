# Workflow Release Creation - Visual Guide

```
┌─────────────────────────────────────────────────────────────────────┐
│                    LOTOLINK RELEASE CREATION                        │
│                        Two Methods Available                         │
└─────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────┐    ┌─────────────────────────────────┐
│   METHOD 1: GIT TAG (Original)  │    │  METHOD 2: MANUAL RUN (NEW)     │
│                                 │    │                                 │
│   Recommended for:              │    │   Recommended for:              │
│   • Official releases           │    │   • Testing builds              │
│   • Production versions         │    │   • Pre-releases                │
│   • Public releases             │    │   • Beta versions               │
└─────────────────────────────────┘    └─────────────────────────────────┘
             │                                      │
             │                                      │
             ▼                                      ▼
    ┌─────────────────┐                  ┌──────────────────────┐
    │ git tag v1.0.7  │                  │ Go to GitHub Actions │
    │ git push origin │                  │ Click "Run workflow" │
    │       v1.0.7    │                  └──────────────────────┘
    └─────────────────┘                             │
             │                                      │
             │                                      ▼
             │                          ┌──────────────────────────┐
             │                          │ Select branch (main)      │
             │                          │ Select platforms          │
             │                          │ ✅ Create release (draft) │
             │                          │ Enter tag: v1.0.7        │
             │                          └──────────────────────────┘
             │                                      │
             └──────────────┬───────────────────────┘
                            │
                            ▼
              ┌─────────────────────────────┐
              │  Workflow Starts Building   │
              │                             │
              │  ┌────────────────────┐    │
              │  │  Build Windows     │    │
              │  │  Build macOS       │    │
              │  │  Build Linux       │    │
              │  └────────────────────┘    │
              │                             │
              │  ┌────────────────────┐    │
              │  │ Upload Artifacts   │    │
              │  │ (Always created)   │    │
              │  └────────────────────┘    │
              └─────────────────────────────┘
                            │
              ┌─────────────┴──────────────┐
              │                            │
              ▼                            ▼
    ┌──────────────────┐        ┌──────────────────────┐
    │  Tag-based run?  │        │  Manual with flag?   │
    │                  │        │                      │
    │  ✅ YES          │        │  ✅ YES              │
    │  github.ref =    │        │  create_release =    │
    │  refs/tags/v*    │        │  true                │
    └──────────────────┘        └──────────────────────┘
              │                            │
              ▼                            ▼
    ┌──────────────────┐        ┌──────────────────────┐
    │ Create RELEASE   │        │ Create DRAFT RELEASE │
    │                  │        │                      │
    │ • Public         │        │ • Draft (private)    │
    │ • Permanent      │        │ • Pre-release flag   │
    │ • Visible        │        │ • Needs publishing   │
    └──────────────────┘        └──────────────────────┘
              │                            │
              └────────────┬───────────────┘
                           │
                           ▼
              ┌─────────────────────────────┐
              │    ARTIFACTS AVAILABLE      │
              │                             │
              │  Location:                  │
              │  Actions → Run → Artifacts  │
              │                             │
              │  Duration: 30 days          │
              │  Visibility: Repo members   │
              └─────────────────────────────┘
                           │
                           │ (if release created)
                           ▼
              ┌─────────────────────────────┐
              │    RELEASE AVAILABLE        │
              │                             │
              │  Location:                  │
              │  Releases section           │
              │                             │
              │  Duration: Permanent        │
              │  Visibility: Public*        │
              │  (*Draft = private)         │
              └─────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────┐
│                    PUBLISH DRAFT RELEASE                            │
│                                                                     │
│  1. Go to: Releases → Find your draft                               │
│  2. Click "Edit"                                                    │
│  3. Review release notes and files                                  │
│  4. Uncheck "Set as pre-release" (if stable)                        │
│  5. Click "Publish release"                                         │
│                                                                     │
│  → Release becomes PUBLIC and PERMANENT                             │
└─────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────┐
│                    COMPARISON TABLE                                 │
├──────────────────────┬──────────────────┬──────────────────────────┤
│ Feature              │ Git Tag Method   │ Manual Method            │
├──────────────────────┼──────────────────┼──────────────────────────┤
│ Initial visibility   │ Public           │ Private (draft)          │
│ Requires git access  │ Yes              │ No                       │
│ Creates artifacts    │ Yes              │ Yes                      │
│ Creates release      │ Yes (public)     │ Yes (draft)              │
│ Pre-release flag     │ No               │ Yes (until published)    │
│ Good for testing     │ No               │ Yes                      │
│ Good for production  │ Yes              │ After publishing         │
│ Can delete easily    │ No*              │ Yes (before publish)     │
├──────────────────────┴──────────────────┴──────────────────────────┤
│ * Deleting a published release doesn't delete the git tag           │
└─────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────┐
│                    TROUBLESHOOTING                                  │
│                                                                     │
│ ❌ "My workflow ran but no release appeared"                        │
│    → Check if you used a tag OR enabled create_release flag        │
│    → Check workflow logs for the "Upload to Release" step          │
│    → Artifacts are always created (check Actions → Run)            │
│                                                                     │
│ ❌ "I see artifacts but no release"                                 │
│    → This is expected for non-tag runs without create_release      │
│    → Re-run with create_release = true to create draft release     │
│                                                                     │
│ ❌ "I can't find my draft release"                                  │
│    → Go to: Releases → You should see "Draft" label                │
│    → Only visible to users with write access to the repo           │
│                                                                     │
│ ❌ "How do I create an official release?"                           │
│    → Use git tag method (recommended)                              │
│    → OR create draft, test, then publish                           │
└─────────────────────────────────────────────────────────────────────┘

For detailed instructions, see:
• Spanish: WORKFLOW_RELEASE_GUIDE.md
• English: WORKFLOW_RELEASE_GUIDE_EN.md
```
