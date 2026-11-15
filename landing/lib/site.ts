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
  tagline: 'Requirements. Planned. Perfected.',
  /** Longer line used for the page <title> and social cards. */
  metaTagline: 'Project briefs that stay on your machine',
  description:
    'A free, local-first studio for project requirements and website briefs. Ten guided sections, a live readiness score, and autosave — with no account, no server and no tracking.',
  url: process.env.NEXT_PUBLIC_SITE_URL ?? 'https://getreqstudio.vercel.app',
  appUrl: process.env.NEXT_PUBLIC_APP_URL ?? 'https://reqstudioapp.vercel.app',
  repoUrl: 'https://github.com/prabhu-cg/ReqStudio',

  /** Shown on the Terms and Privacy documents. Bump when either is edited. */
  legalUpdated: '31 July 2026',
  /**
   * Left blank on purpose — publishing an address is your call. Set it and the
   * documents will offer it as a contact route alongside GitHub issues.
   */
  contactEmail: '',
} as const

export type SiteConfig = typeof siteConfig
