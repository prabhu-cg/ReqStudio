import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import { siteConfig } from '@/lib/site'
import { Wordmark } from './logo'
import { AboutModal, PrivacyModal, TermsModal } from './footer-documents'

/** lucide-react dropped brand marks in v1, so the GitHub logo is inlined. */
function GithubMark({ className = 'size-4' }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="currentColor" aria-hidden="true">
      <path d="M12 .5C5.73.5.5 5.73.5 12a11.5 11.5 0 0 0 7.86 10.92c.58.1.79-.25.79-.56v-2c-3.2.7-3.88-1.54-3.88-1.54-.53-1.34-1.29-1.7-1.29-1.7-1.05-.72.08-.7.08-.7 1.16.08 1.77 1.19 1.77 1.19 1.03 1.77 2.7 1.26 3.36.96.1-.75.4-1.26.73-1.55-2.55-.29-5.24-1.28-5.24-5.68 0-1.26.45-2.29 1.19-3.09-.12-.29-.52-1.46.11-3.05 0 0 .97-.31 3.18 1.18a11 11 0 0 1 5.79 0c2.2-1.49 3.17-1.18 3.17-1.18.63 1.59.23 2.76.12 3.05.74.8 1.18 1.83 1.18 3.09 0 4.41-2.69 5.38-5.25 5.67.41.36.78 1.06.78 2.14v3.17c0 .31.21.67.8.56A11.5 11.5 0 0 0 23.5 12C23.5 5.73 18.27.5 12 .5Z" />
    </svg>
  )
}

const NAV_LINKS = [
  { href: '#how-it-works', label: 'How it works' },
  { href: '#features', label: 'Features' },
  { href: '#privacy', label: 'Privacy' },
  { href: '#faq', label: 'FAQ' },
]

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-50 border-b border-border bg-background/80 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-6xl items-center gap-6 px-5">
        <Link href="/" aria-label={`${siteConfig.name} home`}>
          <Wordmark />
        </Link>

        <nav aria-label="Primary" className="hidden flex-1 items-center gap-1 md:flex">
          {NAV_LINKS.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="rounded-[8px] px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
            >
              {link.label}
            </a>
          ))}
        </nav>

        <div className="ml-auto flex items-center gap-2 md:ml-0">
          <a
            href={siteConfig.repoUrl}
            target="_blank"
            rel="noreferrer"
            className="hidden size-9 place-items-center rounded-[8px] text-muted-foreground transition-colors hover:bg-muted hover:text-foreground sm:grid"
            aria-label="ReqStudio on GitHub"
          >
            <GithubMark />
          </a>
          <a
            href={siteConfig.appUrl}
            className="inline-flex h-9 items-center gap-2 rounded-[8px] bg-primary px-4 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary-hover"
          >
            Open the app
            <ArrowRight className="size-4" aria-hidden="true" />
          </a>
        </div>
      </div>
    </header>
  )
}

export function SiteFooter() {
  return (
    <footer className="border-t border-border bg-surface">
      <div className="mx-auto flex max-w-6xl flex-col gap-6 px-5 py-10 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <Wordmark />
          <p className="mt-2 max-w-sm text-sm leading-relaxed text-muted-foreground">
            Free, local-first project briefs. No account, no server, no tracking.
          </p>
        </div>

        <nav aria-label="Footer" className="flex flex-wrap items-center gap-x-6 gap-y-2 text-sm">
          <a
            href={siteConfig.appUrl}
            className="font-medium text-primary-text underline-offset-4 hover:underline"
          >
            Open the app
          </a>
          <AboutModal />
          <TermsModal />
          <PrivacyModal />
          <a
            href={siteConfig.repoUrl}
            target="_blank"
            rel="noreferrer"
            className="text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
          >
            Source on GitHub
          </a>
        </nav>
      </div>
      <div className="border-t border-border">
        <p className="mx-auto max-w-6xl px-5 py-4 text-xs text-muted-foreground">
          © {new Date().getFullYear()} {siteConfig.name}. Built for people who write the brief before
          the build.
        </p>
      </div>
    </footer>
  )
}
