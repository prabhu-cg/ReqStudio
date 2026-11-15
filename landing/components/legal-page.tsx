import type { ReactNode } from 'react'
import { siteConfig } from '@/lib/site'
import { SiteFooter, SiteHeader } from './site-chrome'

/**
 * Shared layout for the About, Privacy and Terms pages — the same shape as
 * Solvr's: the site nav and footer, a desk-coloured page, a 3xl column with a
 * title (and optional badge and description), then one 20px card holding the
 * sections.
 */

export const LINK_CLASS =
  'font-medium text-primary-text underline underline-offset-4 hover:no-underline'

export function LegalPage({
  title,
  description,
  badge,
  children,
}: {
  title: string
  description?: string
  badge?: string
  children: ReactNode
}) {
  return (
    <>
      <SiteHeader />
      <main id="main" className="bg-secondary">
        <div className="mx-auto w-full max-w-3xl px-6 py-16 sm:py-20">
          <header>
            {badge ? (
              <span className="mb-3 inline-flex items-center rounded-full bg-primary-soft px-2.5 py-0.5 text-xs font-semibold text-primary-text">
                {badge}
              </span>
            ) : null}
            <h1 className="text-4xl text-foreground sm:text-5xl">{title}</h1>
            {description ? (
              <p className="mt-3 text-base text-muted-foreground">{description}</p>
            ) : null}
          </header>

          <div className="mt-10 flex flex-col gap-8 rounded-2xl border border-border bg-card p-6 text-sm leading-relaxed text-muted-foreground sm:p-8">
            {children}
          </div>
        </div>
      </main>
      <SiteFooter />
    </>
  )
}

/** A section heading: DM Sans, not the display face, so it reads as a label. */
export function H({ children }: { children: ReactNode }) {
  return (
    <h2 className="font-sans! text-base font-semibold! tracking-normal! text-foreground">
      {children}
    </h2>
  )
}

export function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="flex flex-col gap-3">
      <H>{title}</H>
      {children}
    </section>
  )
}

export function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div>
      <dt className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
        {label}
      </dt>
      <dd className="mt-1 text-foreground">{children}</dd>
    </div>
  )
}

export function List({ items }: { items: string[] }) {
  return (
    <ul className="flex list-disc flex-col gap-1.5 pl-5">
      {items.map((item) => (
        <li key={item}>{item}</li>
      ))}
    </ul>
  )
}

export function ContactLine() {
  return (
    <p>
      Questions are best raised as an issue on{' '}
      <a
        href={`${siteConfig.repoUrl}/issues`}
        target="_blank"
        rel="noreferrer"
        className={LINK_CLASS}
      >
        GitHub
      </a>
      {siteConfig.contactEmail ? (
        <>
          , or by email at{' '}
          <a href={`mailto:${siteConfig.contactEmail}`} className={LINK_CLASS}>
            {siteConfig.contactEmail}
          </a>
        </>
      ) : null}
      .
    </p>
  )
}
