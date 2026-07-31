/**
 * Addresses outside the app.
 *
 * The marketing site is a separate deployment, so this is a real cross-origin
 * link rather than a route — it must not go through React Router.
 */
export const siteLinks = {
  marketingUrl: import.meta.env.VITE_MARKETING_URL ?? 'https://getreqstudio.vercel.app',
} as const
