/**
 * Single source of truth for anything that changes when the app moves.
 *
 * `appUrl` is the one value you must set before launch. ReqStudio stores
 * projects in IndexedDB, which is scoped per origin — changing this URL after
 * people have started using it strands their existing briefs on the old origin.
 * Pick it once.
 */
export const siteConfig = {
  name: 'ReqStudio',
  tagline: 'Project briefs that stay on your machine',
  description:
    'A free, local-first studio for project requirements and website briefs. Ten guided sections, a live readiness score, and autosave — with no account, no server and no tracking.',
  url: process.env.NEXT_PUBLIC_SITE_URL ?? 'https://getreqstudio.vercel.app',
  appUrl: process.env.NEXT_PUBLIC_APP_URL ?? 'https://reqstudioapp.vercel.app',
  repoUrl: 'https://github.com/prabhu-cg/ReqStudio',
} as const

export type SiteConfig = typeof siteConfig
