import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import { siteConfig } from '@/lib/site'
import { Wordmark } from './logo'
import { ThemeToggle } from './theme-toggle'

// Section anchors are rooted at "/" so they also work from the About, Privacy
// and Terms pages, where a bare "#features" would point at nothing.
const NAV_LINKS = [
  { href: '/#features', label: 'Features' },
  { href: '/#how-it-works', label: 'How it works' },
  { href: '/#privacy', label: 'Privacy' },
  { href: '/#faq', label: 'FAQ' },
]

const FOOTER_LINK =
  'text-muted-foreground transition-colors hover:text-foreground'

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-50 border-b border-border bg-background/85 backdrop-blur-md">
      {/* Three columns with equal 1fr flanks keep the links on the true centre
          whatever the wordmark and the action cluster grow to. */}
      <div className="mx-auto grid max-w-6xl grid-cols-[1fr_auto_1fr] items-center gap-6 px-4 py-3 sm:px-6 lg:px-8">
        <Link href="/" aria-label={`${siteConfig.name} home`} className="justify-self-start">
          <Wordmark />
        </Link>

        <nav aria-label="Primary" className="hidden items-center gap-1 md:flex">
          {NAV_LINKS.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="rounded-full px-3 py-2 text-sm font-semibold text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
            >
              {link.label}
            </a>
          ))}
        </nav>

        <div className="flex items-center gap-2 justify-self-end">
          <ThemeToggle />
          <a
            href={siteConfig.appUrl}
            className="inline-flex h-10 items-center justify-center gap-2 rounded-full bg-primary px-5 text-sm font-semibold text-primary-foreground transition-all duration-150 hover:bg-primary-hover active:scale-[0.98]"
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
    <footer className="border-t border-border bg-background">
      <div className="mx-auto flex max-w-6xl flex-col items-center gap-4 px-4 py-12 sm:flex-row sm:justify-between sm:px-6 lg:px-8">
        <Link href="/" aria-label={`${siteConfig.name} home`}>
          <Wordmark showTagline={false} />
        </Link>

        <p className="text-center text-sm text-muted-foreground">
          © {new Date().getFullYear()} {siteConfig.name}. {siteConfig.tagline}
        </p>

        <nav aria-label="Footer" className="flex items-center gap-5 text-sm">
          <Link href="/about" className={FOOTER_LINK}>
            About
          </Link>
          <Link href="/privacy" className={FOOTER_LINK}>
            Privacy
          </Link>
          <Link href="/terms" className={FOOTER_LINK}>
            Terms
          </Link>
          <a
            href={siteConfig.repoUrl}
            target="_blank"
            rel="noreferrer"
            className={FOOTER_LINK}
          >
            GitHub
          </a>
        </nav>
      </div>
    </footer>
  )
}
