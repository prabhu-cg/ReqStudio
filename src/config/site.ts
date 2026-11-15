/**
 * Addresses outside the app.
 *
 * In production the marketing site is served from the root of the same origin
 * and the app from /app/, so "/" is the landing page. It is still a plain link
 * rather than a router route: React Router's basename would resolve it inside
 * the app. In development the two run on separate ports, so point at the
 * landing dev server (override with VITE_MARKETING_URL).
 */
export const siteLinks = {
  marketingUrl:
    import.meta.env.VITE_MARKETING_URL ??
    (import.meta.env.PROD ? '/' : 'http://localhost:3000'),
} as const
