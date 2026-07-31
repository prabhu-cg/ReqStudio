import {
  ArrowRight,
  CloudOff,
  FileCheck2,
  Gauge,
  KeyRound,
  LayoutTemplate,
  Printer,
  Save,
  Search,
  ShieldCheck,
  Sparkles,
  TriangleAlert,
  WifiOff,
  type LucideIcon,
} from 'lucide-react'
import { siteConfig } from '@/lib/site'
import { AppPreview } from '@/components/app-preview'
import { SiteFooter, SiteHeader } from '@/components/site-chrome'

const STATS = [
  { value: '10', label: 'Guided brief sections' },
  { value: 'Unlimited', label: 'Projects and pages' },
  { value: '0', label: 'Accounts to create' },
  { value: 'Free', label: 'No card, no trial' },
]

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
    body: 'Answer what you know, skip what you do not. The outline tracks completion and names what is still required.',
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
        <section className="relative overflow-hidden pb-20 pt-20 sm:pb-28 sm:pt-28">
          <div aria-hidden="true" className="pointer-events-none absolute inset-0 overflow-hidden">
            <div className="absolute -top-40 left-1/2 h-[600px] w-[600px] -translate-x-1/2 rounded-full bg-secondary opacity-60 blur-3xl" />
            <div className="absolute -top-20 right-0 h-[400px] w-[400px] translate-x-1/3 rounded-full bg-primary opacity-[0.08] blur-3xl" />
          </div>

          <div className="relative mx-auto max-w-4xl px-4 text-center sm:px-6 lg:px-8">
            <div className="mb-6 inline-flex max-w-full items-center gap-2 rounded-full border border-primary/20 bg-secondary px-4 py-1.5">
              <Sparkles className="size-3.5 shrink-0 fill-primary text-primary" aria-hidden="true" />
              <span className="text-xs font-semibold uppercase tracking-wide text-primary-text">
                <span className="sm:hidden">Free · Local-first</span>
                <span className="hidden sm:inline">
                  Free to use · No account · Your data never leaves the device
                </span>
              </span>
            </div>

            <h1 className="text-4xl font-extrabold tracking-tight text-balance sm:text-6xl">
              Write the brief before
              <br />
              <span className="text-primary">anyone writes the code.</span>
            </h1>

            <p className="mx-auto mt-6 max-w-2xl text-lg leading-relaxed text-balance text-muted-foreground">
              ReqStudio turns a scattered Word document into a structured project brief — ten guided
              sections, unlimited pages, and a readiness score that tells you exactly what is still
              missing. It runs entirely in your browser.
            </p>

            <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <a
                href={siteConfig.appUrl}
                className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-lg bg-primary px-8 text-base font-semibold text-primary-foreground transition-all duration-150 hover:bg-primary-hover active:scale-[0.98] sm:w-auto"
              >
                Start a brief — free
                <ArrowRight className="size-4" aria-hidden="true" />
              </a>
              <a
                href="#how-it-works"
                className="inline-flex h-11 w-full items-center justify-center rounded-lg border border-border bg-background px-8 text-base font-semibold transition-all duration-150 hover:border-primary active:scale-[0.98] sm:w-auto"
              >
                See how it works
              </a>
            </div>

            <p className="mt-4 text-sm text-muted-foreground">
              Opens instantly. Nothing to install, nothing to sign up for.
            </p>

            <dl className="mt-14 grid grid-cols-2 gap-8 sm:grid-cols-4">
              {STATS.map((stat) => (
                <div key={stat.label}>
                  <dt className="sr-only">{stat.label}</dt>
                  <dd>
                    <span className="block text-2xl font-extrabold text-primary sm:text-3xl">
                      {stat.value}
                    </span>
                    <span className="mt-1 block text-sm text-muted-foreground">{stat.label}</span>
                  </dd>
                </div>
              ))}
            </dl>
          </div>
        </section>

        {/* Product preview -------------------------------------------------- */}
        <section className="border-y border-border bg-secondary py-20 sm:py-28">
          <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
            <div className="mb-14 text-center">
              <p className="mb-3 text-sm font-semibold uppercase tracking-widest text-primary-text">
                A peek at your brief
              </p>
              <h2 className="text-3xl font-extrabold sm:text-4xl">
                Ten sections. One live readiness score.
              </h2>
              <p className="mx-auto mt-4 max-w-2xl text-balance text-muted-foreground">
                Illustrative preview with sample data — this is the Brief tab as you work through a
                project.
              </p>
            </div>
            <AppPreview />
          </div>
        </section>

        {/* Features --------------------------------------------------------- */}
        <section id="features" className="py-20 sm:py-28">
          <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
            <div className="mb-14 text-center">
              <p className="mb-3 text-sm font-semibold uppercase tracking-widest text-primary-text">
                What ReqStudio does
              </p>
              <h2 className="text-3xl font-extrabold sm:text-4xl">
                Everything a brief needs. Nothing it doesn&rsquo;t.
              </h2>
            </div>

            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {FEATURES.map((feature) => {
                const Icon = feature.icon
                return (
                  <div
                    key={feature.title}
                    className="group rounded-2xl border border-border bg-card p-6 shadow-sm transition-all hover:border-primary hover:shadow-md"
                  >
                    <div className="mb-4 inline-flex size-10 items-center justify-center rounded-xl bg-primary/10 transition-colors group-hover:bg-primary/15">
                      <Icon className="size-5 text-primary-text" aria-hidden="true" />
                    </div>
                    <h3 className="mb-2 text-base font-bold">{feature.title}</h3>
                    <p className="text-sm leading-relaxed text-muted-foreground">{feature.body}</p>
                  </div>
                )
              })}
            </div>
          </div>
        </section>

        {/* How it works ----------------------------------------------------- */}
        <section id="how-it-works" className="border-y border-border bg-secondary py-20 sm:py-28">
          <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
            <div className="mb-14 text-center">
              <p className="mb-3 text-sm font-semibold uppercase tracking-widest text-primary-text">
                How it works
              </p>
              <h2 className="text-3xl font-extrabold sm:text-4xl">
                From a blank page to a signed-off brief
              </h2>
            </div>

            <ol className="grid gap-6 md:grid-cols-3">
              {STEPS.map((step, index) => (
                <li
                  key={step.title}
                  className="rounded-2xl border border-border bg-card p-6 shadow-sm"
                >
                  <span className="inline-flex size-9 items-center justify-center rounded-xl bg-primary text-sm font-extrabold text-primary-foreground">
                    {index + 1}
                  </span>
                  <h3 className="mb-2 mt-4 text-base font-bold">{step.title}</h3>
                  <p className="text-sm leading-relaxed text-muted-foreground">{step.body}</p>
                </li>
              ))}
            </ol>
          </div>
        </section>

        {/* Privacy ---------------------------------------------------------- */}
        <section id="privacy" className="py-20 sm:py-28">
          <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
            <div className="mb-14 text-center">
              <p className="mb-3 text-sm font-semibold uppercase tracking-widest text-primary-text">
                Privacy by architecture
              </p>
              <h2 className="text-3xl font-extrabold text-balance sm:text-4xl">
                Client requirements are confidential.
                <br />
                Treat them that way.
              </h2>
              <p className="mx-auto mt-4 max-w-2xl text-balance text-muted-foreground">
                Most brief tools ask you to upload your client&rsquo;s commercial goals, budgets and
                launch dates to somebody else&rsquo;s server. ReqStudio has no server to upload them
                to.
              </p>
            </div>

            <div className="grid gap-6 sm:grid-cols-3">
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
                    className="rounded-2xl border border-border bg-card p-6 text-center shadow-sm"
                  >
                    <span className="mx-auto inline-flex size-10 items-center justify-center rounded-xl bg-primary/10">
                      <Icon className="size-5 text-primary-text" aria-hidden="true" />
                    </span>
                    <h3 className="mb-2 mt-4 text-base font-bold">{item.title}</h3>
                    <p className="text-sm leading-relaxed text-muted-foreground">{item.body}</p>
                  </div>
                )
              })}
            </div>

            <div className="mt-6 grid gap-6 md:grid-cols-2">
              <div className="rounded-2xl border border-success/30 bg-success/5 p-6">
                <h3 className="flex items-center gap-2 text-base font-bold">
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

              <div className="rounded-2xl border border-warning/40 bg-warning/5 p-6">
                <h3 className="flex items-center gap-2 text-base font-bold">
                  <TriangleAlert className="size-4 shrink-0 text-warning" aria-hidden="true" />
                  What that costs you
                </h3>
                <ul className="mt-3 space-y-2 text-sm leading-relaxed text-muted-foreground">
                  <li>
                    <span className="font-semibold text-foreground">
                      Clearing your browser data deletes every brief.
                    </span>{' '}
                    There is no backup and no way to recover it.
                  </li>
                  <li>Briefs do not sync — they live on the one browser that created them.</li>
                  <li>Print or export anything you cannot afford to lose.</li>
                </ul>
              </div>
            </div>

            <p className="mt-6 text-center text-sm text-muted-foreground">
              This is the honest trade of a tool with no server. We would rather you knew it up front
              than discovered it later.
            </p>
          </div>
        </section>

        {/* FAQ -------------------------------------------------------------- */}
        <section id="faq" className="border-y border-border bg-secondary py-20 sm:py-28">
          <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
            <div className="mb-14 text-center">
              <p className="mb-3 text-sm font-semibold uppercase tracking-widest text-primary-text">
                FAQ
              </p>
              <h2 className="text-3xl font-extrabold sm:text-4xl">Frequently asked questions</h2>
            </div>

            <dl className="mx-auto grid max-w-5xl grid-cols-1 gap-x-10 gap-y-8 md:grid-cols-2">
              {FAQ.map((item) => (
                <div key={item.q}>
                  <dt className="text-base font-bold">{item.q}</dt>
                  <dd className="mt-2 text-sm leading-relaxed text-muted-foreground">{item.a}</dd>
                </div>
              ))}
            </dl>
          </div>
        </section>

        {/* Closing CTA ------------------------------------------------------ */}
        <section className="py-20 sm:py-28">
          <div className="mx-auto max-w-3xl px-4 text-center sm:px-6 lg:px-8">
            <h2 className="text-3xl font-extrabold text-balance sm:text-4xl">
              Ready to write your next brief?
            </h2>
            <p className="mx-auto mt-4 max-w-xl text-balance text-muted-foreground">
              No trial to start, no card to enter, no data to hand over. Open it and write.
            </p>
            <a
              href={siteConfig.appUrl}
              className="mt-8 inline-flex h-11 items-center justify-center gap-2 rounded-lg bg-primary px-8 text-base font-semibold text-primary-foreground transition-all duration-150 hover:bg-primary-hover active:scale-[0.98]"
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
