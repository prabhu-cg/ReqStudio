import type { Metadata } from 'next'
import { siteConfig } from '@/lib/site'
import { Field, LegalPage, LINK_CLASS, Section } from '@/components/legal-page'

export const metadata: Metadata = {
  title: 'About',
  description: `About ${siteConfig.name}: what it is, how it is built, and who built it.`,
}

const STACK: Array<{ label: string; value: string }> = [
  { label: 'Framework', value: 'React 19, TypeScript (strict), Vite' },
  { label: 'Styling', value: 'Tailwind CSS v4, shadcn-style components on Radix UI primitives' },
  { label: 'Icons & Type', value: 'Lucide, Newsreader and DM Sans (self-hosted)' },
  { label: 'State', value: 'Zustand' },
  { label: 'Forms & Validation', value: 'React Hook Form with Zod schemas' },
  { label: 'Routing', value: 'React Router' },
  { label: 'Storage', value: 'Dexie / IndexedDB, browser-local' },
  { label: 'This site', value: 'Next.js (static export), Tailwind CSS v4' },
  { label: 'Hosting', value: 'Vercel — static assets only, no backend' },
]

export default function AboutPage() {
  return (
    <LegalPage title={`About ${siteConfig.name}`} description={siteConfig.tagline} badge="V1">
      <Section title="What it is">
        <p>
          ReqStudio is a free, local-first studio for project requirements and website briefs. It
          turns the scattered Word document into ten guided sections, unlimited page
          specifications and a weighted readiness score that names exactly what is still missing.
          Every change autosaves; there is no Save button anywhere.
        </p>
        <p>
          It replaces a blank document with guided deliverables — a project overview, business
          goals, audience, site structure, page-by-page requirements, functional and technical
          needs, content, risks and approvals — and a print-ready report in PDF, Word, Markdown or
          HTML when the brief is ready to send.
        </p>
        <p>
          There is no account to create and no server to send your client&rsquo;s commercial
          information to. Your projects are stored locally in your browser, and it works with the
          network switched off. There is no AI in the loop: nothing you write is sent anywhere.
        </p>
      </Section>

      <Section title="How it is built">
        <dl className="grid grid-cols-1 gap-x-6 gap-y-4 sm:grid-cols-2">
          {STACK.map((row) => (
            <Field key={row.label} label={row.label}>
              {row.value}
            </Field>
          ))}
        </dl>
        <p>
          The source is public at{' '}
          <a href={siteConfig.repoUrl} target="_blank" rel="noreferrer" className={LINK_CLASS}>
            github.com/prabhu-cg/ReqStudio
          </a>
          .
        </p>
      </Section>

      <Section title="What is coming">
        <p>
          A Templates library, a sitemap generator, page complexity analysis, a prompt generator
          and optional cloud sync are designed for but deliberately not built. The architecture
          already carries the extension points, so none of them need a rewrite.
        </p>
      </Section>

      <Section title="Who built ReqStudio, and why">
        <p>
          ReqStudio was built by me, Prabhu Raja, a senior designer with 15+ years of experience
          across enterprise and B2B software. I work on enterprise products, design systems and
          digital experiences, with a simple aim: designing clarity from complexity.
        </p>
        <p>
          I built it because most projects don&rsquo;t go wrong from a lack of effort — they go
          wrong because the brief was never complete. The budget, the audience, the content owner
          and the approvals surface after the build has started. ReqStudio puts that discipline
          into ten guided sections, with a readiness score that says plainly whether a brief is
          safe to send.
        </p>
        <p>
          It is an independent project. I scoped, designed and built it myself, with AI in the
          loop, as part of how I now take products from idea to shipped. You can see more of my
          work at{' '}
          <a
            href="https://prabhuraja.vercel.app/"
            target="_blank"
            rel="noreferrer"
            className={LINK_CLASS}
          >
            prabhuraja.vercel.app
          </a>
          .
        </p>
        <p>
          Feedback, feature requests, or just want to say hello:{' '}
          <a href="mailto:prabhu_cg@proton.me" className={LINK_CLASS}>
            prabhu_cg@proton.me
          </a>
          , or open an issue on{' '}
          <a
            href={`${siteConfig.repoUrl}/issues`}
            target="_blank"
            rel="noreferrer"
            className={LINK_CLASS}
          >
            GitHub
          </a>
          .
        </p>
      </Section>
    </LegalPage>
  )
}
