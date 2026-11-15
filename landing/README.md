# ReqStudio — marketing site

The Next.js landing page for [ReqStudio](..). It lives in the `landing/` folder of the ReqStudio
repository; the app itself is at the repository root.

```bash
cd landing
npm install
npm run dev        # http://localhost:3000
```

Design: the Solvr "Butter" system (see the app's `DESIGN.md` conventions) — Newsreader for h1/h2,
DM Sans for everything else, a 1152px content container, light and dark only.

## Mockup captures

`public/mockups/workspace-{light,dark}-v1.png` are 2880×1800 captures of the app's built-in sample
project. Retake them whenever the app chrome changes and bump the `-v1` suffix so caches refresh.

## Deployment

A second Vercel project (`getreqstudio`) built from this repository with **Root Directory =
`landing`**. A push to `main` deploys to production and every branch gets a preview URL.

Set `NEXT_PUBLIC_APP_URL` if the app ever moves origin — but note that ReqStudio stores projects in
IndexedDB, which is scoped per origin, so moving it strands existing users' briefs. Defaults live in
`lib/site.ts`.
