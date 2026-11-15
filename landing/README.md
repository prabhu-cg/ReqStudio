# ReqStudio — marketing site

The Next.js landing page for ReqStudio. It lives in the `landing/` folder of the ReqStudio repository;
the app itself is at the repository root.

```bash
cd landing
npm install
npm run dev        # http://localhost:3000
```

Design: the Solvr "Butter" system — Newsreader for h1/h2, DM Sans for everything else, a 1152px
content container, light and dark only.

## Mockup captures

`public/mockups/workspace-{light,dark}-v1.png` are 2880×1800 captures of the app's built-in sample
project. Retake them whenever the app chrome changes and bump the `-v1` suffix so caches refresh.

## Deployment

There is no separate landing deployment. `next.config.ts` sets `output: 'export'`, and the repository
root's `npm run build` copies `landing/out` to the root of `dist/`, with the app beside it at `/app/`,
all served from `reqstudioapp.vercel.app`. The "Open the app" links point at `/app/`
(`NEXT_PUBLIC_APP_URL` overrides it). The app's origin must not change: projects live in IndexedDB,
which is scoped per origin.
