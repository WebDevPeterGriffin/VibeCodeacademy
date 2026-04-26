# Test Suite — VibeCode Bible Academy

End-to-end tests using [Playwright](https://playwright.dev).

## Setup

### 1. Add test credentials to `.env.local`

```bash
# Regular (non-admin) test account — create one in Supabase Auth
TEST_USER_EMAIL=testuser@example.com
TEST_USER_PASSWORD=yourpassword

# Admin account
TEST_ADMIN_EMAIL=webdevpetergriffin@gmail.com
TEST_ADMIN_PASSWORD=youradminpassword
```

### 2. Run the dev server

```bash
npm run dev
```

### 3. Run tests

```bash
# Run all tests (headless)
npm test

# Run with interactive UI
npm run test:ui

# View HTML report after a run
npm run test:report
```

## Test Projects

| Project | Storage State | Covers |
|---------|--------------|--------|
| `setup` | — | Signs in, saves auth states |
| `public` | none | Auth pages, redirects for logged-out users |
| `user` | `.playwright/user.json` | Dashboard, lessons, nav, scoreboard, profile |
| `admin` | `.playwright/admin.json` | Admin panel, lesson manager |

## Test Files

| File | What it tests |
|------|--------------|
| `auth.setup.ts` | One-time sign-in setup |
| `auth.spec.ts` | Login form, bad creds, redirects for anon users |
| `dashboard.spec.ts` | MY WORKSPACE, Continue Building, auth redirects |
| `lesson.spec.ts` | Lesson render, copy buttons, checkpoints, progress |
| `admin.spec.ts` | Admin dashboard, JSON upload preview, lesson editor |
| `nav.spec.ts` | AppNav links, profile dropdown, sign out |
| `scoreboard.spec.ts` | Scoreboard page, You badge, masked emails |
| `profile.spec.ts` | Profile page, password form validation |
