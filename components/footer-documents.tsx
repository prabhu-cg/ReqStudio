import { siteConfig } from '@/lib/site'
import { DocList, DocSection, InfoModal } from './info-modal'

/*
 * Plain-language Terms and Privacy documents.
 *
 * They describe what ReqStudio actually does, which for a tool with no server,
 * no account and no analytics is unusually little. Two placeholders need your
 * decision before these carry real weight:
 *
 *   1. Governing law — set the jurisdiction in `TermsModal` below.
 *   2. `siteConfig.contactEmail` — blank until you choose to publish one.
 *
 * These are drafts written from the product's actual behaviour, not legal
 * advice. Have them reviewed if anything commercial depends on them.
 */

const STACK: Array<{ group: string; items: string }> = [
  { group: 'Framework', items: 'React 19, TypeScript (strict mode), Vite' },
  { group: 'Styling', items: 'Tailwind CSS v4, shadcn-style components on Radix UI primitives' },
  { group: 'Icons & type', items: 'Lucide, Manrope (self-hosted)' },
  { group: 'State', items: 'Zustand — separate UI, project-view and settings stores' },
  { group: 'Forms & validation', items: 'React Hook Form with Zod schemas generated from field descriptors' },
  { group: 'Routing', items: 'React Router' },
  { group: 'Storage', items: 'IndexedDB via Dexie, behind a repository layer' },
  { group: 'This site', items: 'Next.js App Router, React 19, Tailwind CSS v4' },
  { group: 'Hosting', items: 'Vercel — static assets only, no backend' },
]

export function AboutModal() {
  return (
    <InfoModal label="About" title="About ReqStudio" subtitle="What it is and how it is built">
      <DocSection title="What it is">
        <p>
          ReqStudio is a free, local-first studio for project requirements and website briefs, built
          for UX and product designers, business analysts, product managers and project managers —
          anyone who has to write the brief before anything gets built.
        </p>
        <p className="mt-3">
          It replaces the scattered Word document with ten guided sections, unlimited page
          specifications, and a weighted readiness score that names exactly what is still missing.
          Every change autosaves; there is no Save button anywhere. When the brief is ready, the
          Preview tab renders a print-ready report you can send.
        </p>
        <p className="mt-3">
          It runs entirely in your browser. There is no account to create, no server to send your
          client&rsquo;s commercial information to, and it works with the network switched off.
        </p>
      </DocSection>

      <DocSection title="How it is built">
        <dl className="grid grid-cols-1 gap-x-6 gap-y-2 sm:grid-cols-[minmax(8rem,10rem)_1fr]">
          {STACK.map((row) => (
            <div key={row.group} className="contents">
              <dt className="text-xs font-semibold uppercase tracking-wide text-muted-foreground/80">
                {row.group}
              </dt>
              <dd className="mb-2 text-foreground sm:mb-0">{row.items}</dd>
            </div>
          ))}
        </dl>
        <p className="mt-4">
          The source is public at{' '}
          <a
            href={siteConfig.repoUrl}
            target="_blank"
            rel="noreferrer"
            className="font-medium text-primary-text underline underline-offset-4"
          >
            github.com/prabhu-cg/ReqStudio
          </a>
          .
        </p>
      </DocSection>

      <DocSection title="What is coming">
        <p>
          PDF, Word, Markdown and HTML export, a sitemap generator, page complexity analysis, an AI
          prompt generator and optional cloud sync are designed for but deliberately not built. The
          architecture carries the extension points already, so none of them require a rewrite.
        </p>
      </DocSection>
    </InfoModal>
  )
}

export function TermsModal() {
  return (
    <InfoModal
      label="Terms"
      title="Terms and Conditions"
      subtitle={`Last updated ${siteConfig.legalUpdated}`}
    >
      <DocSection title="1. Acceptance">
        <p>
          By using ReqStudio you agree to these terms. If you do not agree with them, please do not
          use it.
        </p>
      </DocSection>

      <DocSection title="2. The service">
        <p>
          ReqStudio is a free browser-based tool. It requires no account and stores everything you
          write in your own browser. No part of your content is transmitted to us, because there is
          no server component that could receive it.
        </p>
      </DocSection>

      <DocSection title="3. Your content is yours">
        <p>
          You retain all rights to everything you write in ReqStudio. We claim no licence over it and
          never receive a copy of it. You are responsible for ensuring you have the right to record
          any client or third-party information you enter.
        </p>
      </DocSection>

      <DocSection title="4. Data loss">
        <p className="text-foreground">
          This is the most important clause. Your projects exist only in the browser storage of the
          device you created them on.
        </p>
        <div className="mt-2">
          <DocList
            items={[
              'Clearing your browser data, using private browsing, or a browser evicting storage under pressure will delete your projects permanently.',
              'There is no backup, no server-side copy and no recovery process.',
              'Projects do not sync between devices or browsers.',
              'You are solely responsible for retaining anything you cannot afford to lose — print or export it.',
            ]}
          />
        </div>
        <p className="mt-3">
          We accept no liability for lost, corrupted or inaccessible project data under any
          circumstances.
        </p>
      </DocSection>

      <DocSection title="5. Provided as is">
        <p>
          ReqStudio is provided &ldquo;as is&rdquo; and &ldquo;as available&rdquo;, without warranty
          of any kind, express or implied, including fitness for a particular purpose. We do not
          warrant that it will be uninterrupted, error-free, or that a brief produced with it is
          complete, accurate or suitable for any commercial or contractual purpose. The readiness
          score is a guide, not an assurance.
        </p>
      </DocSection>

      <DocSection title="6. Acceptable use">
        <p>You agree not to use ReqStudio to:</p>
        <div className="mt-2">
          <DocList
            items={[
              'Break any applicable law or regulation.',
              'Store information you are not permitted to hold or process.',
              'Attempt to disrupt or misuse the hosting infrastructure that serves the site.',
            ]}
          />
        </div>
      </DocSection>

      <DocSection title="7. Availability and changes">
        <p>
          We may change, suspend or discontinue ReqStudio at any time without notice. Because your
          data lives on your device rather than ours, a shutdown would not delete it — but the tool
          for reading it may no longer be available, which is another reason to export anything
          important.
        </p>
        <p className="mt-3">
          These terms may be updated. The date at the top of this document reflects the current
          version, and continued use after a change constitutes acceptance.
        </p>
      </DocSection>

      <DocSection title="8. Limitation of liability">
        <p>
          To the fullest extent permitted by law, we are not liable for any indirect, incidental or
          consequential loss, or for any loss of data, profit, revenue or business, arising from your
          use of or inability to use ReqStudio. Nothing in these terms excludes liability that
          cannot lawfully be excluded.
        </p>
      </DocSection>

      {/* TODO: replace with the jurisdiction you operate from before relying on this. */}
      <DocSection title="9. Governing law">
        <p>
          These terms are governed by the laws of the jurisdiction in which the operator of
          ReqStudio is established. Any dispute is subject to the exclusive jurisdiction of its
          courts.
        </p>
      </DocSection>

      <DocSection title="10. Contact">
        <ContactLine />
      </DocSection>
    </InfoModal>
  )
}

export function PrivacyModal() {
  return (
    <InfoModal
      label="Privacy"
      title="Privacy Policy"
      subtitle={`Last updated ${siteConfig.legalUpdated}`}
    >
      <DocSection title="The short version">
        <p className="text-foreground">
          ReqStudio does not collect, transmit or store your personal data. There is no account, no
          analytics, no cookies and no tracking. Everything you write stays in your browser.
        </p>
      </DocSection>

      <DocSection title="What we collect">
        <p>
          Nothing. The application has no backend, no database and no telemetry. It never sends your
          projects, pages, client names or any other content anywhere.
        </p>
      </DocSection>

      <DocSection title="Where your data lives">
        <p>
          Projects, pages and activity history are stored in your browser&rsquo;s IndexedDB, on the
          device you are using. Your preferences — theme, text size, autosave settings — are stored
          in localStorage on the same device. Both are readable only by ReqStudio on this origin, and
          only from your own machine.
        </p>
        <p className="mt-3">
          You can delete everything at any time from Settings → Reset local data, or by clearing site
          data in your browser.
        </p>
      </DocSection>

      <DocSection title="Cookies and tracking">
        <p>
          We set no cookies. There is no analytics package, no tag manager, no advertising pixel and
          no session recording — on this site or in the app. Fonts are bundled and served from the
          same origin, so no request is made to a third-party font provider while you browse.
        </p>
      </DocSection>

      <DocSection title="Hosting">
        <p>
          This site and the app are static files hosted by Vercel Inc. Like any web host, Vercel
          processes the standard technical information present in a request — IP address, user agent
          and timestamp — in order to deliver the files and protect the service. That is server
          infrastructure logging, not ReqStudio collecting data about you, and it never includes the
          contents of your briefs. Vercel&rsquo;s own privacy terms apply to that processing.
        </p>
      </DocSection>

      <DocSection title="Third parties">
        <p>
          We share nothing, because we hold nothing. Your data is never sold, rented, transferred or
          disclosed. The only outbound links are to this project&rsquo;s public source repository,
          which you choose to follow.
        </p>
      </DocSection>

      <DocSection title="Children">
        <p>
          ReqStudio is a professional tool and is not directed at children. Since no personal data is
          collected from anyone, none is knowingly collected from children either.
        </p>
      </DocSection>

      <DocSection title="Your rights">
        <p>
          Rights such as access, correction, erasure and portability concern data a service holds
          about you. We hold none, so there is nothing for us to disclose, correct or delete. Your
          data is already entirely under your control on your own device.
        </p>
      </DocSection>

      <DocSection title="Changes and contact">
        <p className="mb-3">
          If this policy changes, the date at the top of this document will change with it.
        </p>
        <ContactLine />
      </DocSection>
    </InfoModal>
  )
}

function ContactLine() {
  return (
    <p>
      Questions are best raised as an issue on{' '}
      <a
        href={`${siteConfig.repoUrl}/issues`}
        target="_blank"
        rel="noreferrer"
        className="font-medium text-primary-text underline underline-offset-4"
      >
        GitHub
      </a>
      {siteConfig.contactEmail ? (
        <>
          , or by email at{' '}
          <a
            href={`mailto:${siteConfig.contactEmail}`}
            className="font-medium text-primary-text underline underline-offset-4"
          >
            {siteConfig.contactEmail}
          </a>
        </>
      ) : null}
      .
    </p>
  )
}
