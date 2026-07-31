import {
  ArrowRight,
  CloudOff,
  FileCheck2,
  Gauge,
  KeyRound,
  LayoutTemplate,
  Moon,
  Printer,
  Save,
  Search,
  ShieldCheck,
  TriangleAlert,
  WifiOff,
  type LucideIcon,
} from 'lucide-react'
import { siteConfig } from '@/lib/site'
import { AppPreview } from '@/components/app-preview'
import { SiteFooter, SiteHeader } from '@/components/site-chrome'

const FEATURES: Array<{ icon: LucideIcon; title: string; body: string }> = [
  {
    icon: FileCheck2,
    title: 'Ten guided sections',
    body: 'Overview, goals, audience, structure, pages, functionality, content, technical, risks and approvals. Fill them in any order — the brief is never blocked on a half-finished section.',
  },
  {
    icon: Gauge,
    title: 'A readiness score that means something',
    body: 'Weighted across every section, updating as you type, with the missing answers named. You always know whether a brief is safe to send.',
  },
  {
    icon: LayoutTemplate,
    title: 'Unlimited pages, fully specified',
    body: 'Purpose, audience, CTAs, content requirements, components, dependencies, SEO, accessibility and analytics — per page, with its own completeness bar.',
  },
  {
    icon: Save,
    title: 'No Save button anywhere',
    body: 'Every keystroke is written to local storage a moment after you stop typing, and flushed if you close the tab mid-sentence.',
  },
  {
    icon: Printer,
    title: 'A report you can hand over',
    body: 'A clean preview with a sticky table of contents, collapsible sections and a print stylesheet. Print to PDF and send it.',
  },
  {
    icon: Search,
    title: 'Search, filter, sort',
    body: 'Find a project by client, tag or page name. Filter by status, type and priority. Pin the ones you live in.',
  },
]

const STEPS = [
  {
    title: 'Create a project',
    body: 'Name, client, type, dates, stakeholders. Thirty seconds, and no sign-up stands between you and it.',
  },
  {
    title: 'Work the ten sections',
    body: 'Answer what you know, skip what you do not. The outline tracks completion and tells you what is still required.',
  },
  {
    title: 'Send the brief',
    body: 'Preview the report, print it to PDF, and share it with the readiness score attached so nobody pretends the gaps are not there.',
  },
]

const FAQ = [
  {
    q: 'Is it really free?',
    a: 'Yes. There is no paid tier, no trial and no upsell. There are no servers to pay for, because there are no servers.',
  },
  {
    q: 'Where is my data stored?',
    a: "In your browser's IndexedDB, on the machine you are using. It is never uploaded, because there is nowhere to upload it to.",
  },
  {
    q: 'What happens if I clear my browser data?',
    a: 'Your projects are deleted along with it. That is the honest trade for a tool that never touches a server — print or export anything you cannot afford to lose.',
  },
  {
    q: 'Can I use it on more than one device?',
    a: 'Not yet. Projects live on the device that created them. Cloud sync is designed for but deliberately not built — the architecture already carries the fields it needs.',
  },
  {
    q: 'Does it work offline?',
    a: 'Completely. Nothing about ReqStudio needs a connection once the page has loaded.',
  },
  {
    q: 'Who is it for?',
    a: 'UX and product designers, business analysts, product managers and project managers — anyone who has to write a brief before anything gets built.',
  },
]

export default function HomePage() {
  return (
    <>
      <SiteHeader />

      <main id="main">
        {/* Hero ------------------------------------------------------------ */}
        <section className="relative overflow-hidden">
          <div className="rs-hero-glow absolute inset-0 -z-10" aria-hidden="true" />
          <div className="rs-grid-lines absolute inset-0 -z-10 opacity-40" aria-hidden="true" />

          <div className="mx-auto max-w-6xl px-5 pb-16 pt-16 sm:pb-24 sm:pt-24">
            <div className="mx-auto max-w-3xl text-center">
              <span className="inline-flex items-center gap-2 rounded-full border border-border bg-surface-raised px-3 py-1.5 text-xs font-medium text-muted-foreground shadow-card">
                <ShieldCheck className="size-3.5 text-success" aria-hidden="true" />
                Free · No account · Your data never leaves the device
              </span>

              <h1 className="mt-6 text-balance text-4xl font-bold leading-[1.1] tracking-tight sm:text-6xl">
                Write the brief before
                <br className="hidden sm:block" /> anyone writes the code
              </h1>

              <p className="mx-auto mt-5 max-w-2xl text-pretty text-base leading-relaxed text-muted-foreground sm:text-lg">
                ReqStudio turns a scattered Word document into a structured project brief — ten
                guided sections, unlimited pages, and a readiness score that tells you exactly what
                is still missing. It runs entirely in your browser.
              </p>

              <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
                <a
                  href={siteConfig.appUrl}
                  className="inline-flex h-12 w-full items-center justify-center gap-2 rounded-[8px] bg-primary px-7 text-[15px] font-medium text-primary-foreground shadow-card transition-colors hover:bg-primary-hover sm:w-auto"
                >
                  Start a brief — free
                  <ArrowRight className="size-4" aria-hidden="true" />
                </a>
                <a
                  href="#how-it-works"
                  className="inline-flex h-12 w-full items-center justify-center rounded-[8px] border border-border bg-surface-raised px-7 text-[15px] font-medium transition-colors hover:border-border-strong sm:w-auto"
                >
                  See how it works
                </a>
              </div>

              <p className="mt-4 text-xs text-muted-foreground">
                Opens instantly. Nothing to install, nothing to sign up for.
              </p>
            </div>

            <div className="mx-auto mt-14 max-w-5xl">
              <AppPreview />
            </div>
          </div>
        </section>

        {/* Privacy ---------------------------------------------------------- */}
        <section id="privacy" className="border-y border-border bg-surface">
          <div className="mx-auto max-w-6xl px-5 py-16 sm:py-20">
            <div className="mx-auto max-w-2xl text-center">
              <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
                Client requirements are confidential. Treat them that way.
              </h2>
              <p className="mt-4 text-pretty leading-relaxed text-muted-foreground">
                Most brief tools ask you to upload your client&rsquo;s commercial goals, budgets and
                launch dates to somebody else&rsquo;s server. ReqStudio has no server to upload them
                to.
              </p>
            </div>

            <div className="mx-auto mt-10 grid max-w-4xl grid-cols-1 gap-4 sm:grid-cols-3">
              {[
                {
                  icon: KeyRound,
                  title: 'No account',
                  body: 'No email, no password, no profile. Open the page and start typing.',
                },
                {
                  icon: CloudOff,
                  title: 'No server',
                  body: 'Everything is stored in your browser. There is no database of your clients anywhere.',
                },
                {
                  icon: WifiOff,
                  title: 'Works offline',
                  body: 'On a plane, in a basement, on hotel wifi — it behaves exactly the same.',
                },
              ].map((item) => {
                const Icon = item.icon
                return (
                  <div
                    key={item.title}
                    className="rounded-card border border-border bg-surface-raised p-6 text-center shadow-card"
                  >
                    <span className="mx-auto grid size-10 place-items-center rounded-full bg-primary-soft text-primary-text">
                      <Icon className="size-5" aria-hidden="true" />
                    </span>
                    <h3 className="mt-4 text-sm font-semibold">{item.title}</h3>
                    <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">
                      {item.body}
                    </p>
                  </div>
                )
              })}
            </div>

            <div className="mx-auto mt-6 grid max-w-4xl grid-cols-1 gap-4 md:grid-cols-2">
              <div className="rounded-card border border-success/30 bg-success-soft/60 p-6">
                <h3 className="flex items-center gap-2 text-sm font-semibold text-foreground">
                  <ShieldCheck className="size-4 shrink-0 text-success" aria-hidden="true" />
                  What you get
                </h3>
                <ul className="mt-3 space-y-2 text-sm leading-relaxed text-muted-foreground">
                  <li>
                    Your client&rsquo;s budgets, deadlines and commercial goals never touch a server.
                  </li>
                  <li>Nothing to breach, subpoena or sell — there is no database of your work.</li>
                  <li>No vendor can lock you out, raise a price, or shut the product down on you.</li>
                </ul>
              </div>

              <div className="rounded-card border border-warning/40 bg-warning/5 p-6">
                <h3 className="flex items-center gap-2 text-sm font-semibold text-foreground">
                  <TriangleAlert className="size-4 shrink-0 text-warning" aria-hidden="true" />
                  What that costs you
                </h3>
                <ul className="mt-3 space-y-2 text-sm leading-relaxed text-muted-foreground">
                  <li>
                    <span className="font-medium text-foreground">
                      Clearing your browser data deletes every brief.
                    </span>{' '}
                    There is no backup and no way to recover it.
                  </li>
                  <li>Briefs do not sync — they live on the one browser that created them.</li>
                  <li>Print or export anything you cannot afford to lose.</li>
                </ul>
              </div>
            </div>

            <p className="mx-auto mt-4 max-w-4xl text-center text-xs text-muted-foreground">
              This is the honest trade of a tool with no server. We would rather you knew it up
              front than discovered it later.
            </p>
          </div>
        </section>

        {/* How it works ----------------------------------------------------- */}
        <section id="how-it-works" className="mx-auto max-w-6xl px-5 py-16 sm:py-24">
          <div className="max-w-2xl">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-primary-text">
              How it works
            </p>
            <h2 className="mt-3 text-3xl font-bold tracking-tight sm:text-4xl">
              Three steps, no ceremony
            </h2>
          </div>

          <ol className="mt-10 grid grid-cols-1 gap-6 md:grid-cols-3">
            {STEPS.map((step, index) => (
              <li key={step.title} className="relative rounded-card border border-border bg-surface-raised p-6 shadow-card">
                <span className="grid size-8 place-items-center rounded-[8px] bg-primary text-sm font-bold text-primary-foreground">
                  {index + 1}
                </span>
                <h3 className="mt-4 text-base font-semibold tracking-tight">{step.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{step.body}</p>
              </li>
            ))}
          </ol>
        </section>

        {/* Features --------------------------------------------------------- */}
        <section id="features" className="border-t border-border bg-surface">
          <div className="mx-auto max-w-6xl px-5 py-16 sm:py-24">
            <div className="max-w-2xl">
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-primary-text">
                Features
              </p>
              <h2 className="mt-3 text-3xl font-bold tracking-tight sm:text-4xl">
                Everything a brief needs. Nothing it doesn&rsquo;t.
              </h2>
            </div>

            <div className="mt-10 grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
              {FEATURES.map((feature) => {
                const Icon = feature.icon
                return (
                  <div
                    key={feature.title}
                    className="rounded-card border border-border bg-surface-raised p-6 shadow-card transition-colors hover:border-primary"
                  >
                    <span className="grid size-10 place-items-center rounded-[8px] bg-primary-soft text-primary-text">
                      <Icon className="size-5" aria-hidden="true" />
                    </span>
                    <h3 className="mt-4 text-base font-semibold tracking-tight">{feature.title}</h3>
                    <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                      {feature.body}
                    </p>
                  </div>
                )
              })}
            </div>

            <p className="mt-8 flex items-center gap-2 text-sm text-muted-foreground">
              <Moon className="size-4 shrink-0" aria-hidden="true" />
              Light and dark themes, adjustable text size, full keyboard navigation and a WCAG AA
              colour pass — because you will be living in this thing.
            </p>
          </div>
        </section>

        {/* FAQ -------------------------------------------------------------- */}
        <section id="faq" className="mx-auto max-w-6xl px-5 py-16 sm:py-24">
          <div className="max-w-2xl">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-primary-text">
              FAQ
            </p>
            <h2 className="mt-3 text-3xl font-bold tracking-tight sm:text-4xl">
              The questions worth asking
            </h2>
          </div>

          <dl className="mt-10 grid grid-cols-1 gap-x-10 gap-y-8 md:grid-cols-2">
            {FAQ.map((item) => (
              <div key={item.q}>
                <dt className="text-base font-semibold tracking-tight">{item.q}</dt>
                <dd className="mt-2 text-sm leading-relaxed text-muted-foreground">{item.a}</dd>
              </div>
            ))}
          </dl>
        </section>

        {/* Closing CTA ------------------------------------------------------ */}
        <section className="border-t border-border bg-surface">
          <div className="mx-auto max-w-3xl px-5 py-20 text-center">
            <h2 className="text-balance text-3xl font-bold tracking-tight sm:text-4xl">
              Your next brief is one click away
            </h2>
            <p className="mx-auto mt-4 max-w-xl text-pretty leading-relaxed text-muted-foreground">
              No trial to start, no card to enter, no data to hand over. Open it and write.
            </p>
            <a
              href={siteConfig.appUrl}
              className="mt-8 inline-flex h-12 items-center justify-center gap-2 rounded-[8px] bg-primary px-8 text-[15px] font-medium text-primary-foreground shadow-card transition-colors hover:bg-primary-hover"
            >
              Open ReqStudio
              <ArrowRight className="size-4" aria-hidden="true" />
            </a>
          </div>
        </section>
      </main>

      <SiteFooter />
    </>
  )
}
