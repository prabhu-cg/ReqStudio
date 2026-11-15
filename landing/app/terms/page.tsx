import type { Metadata } from 'next'
import { siteConfig } from '@/lib/site'
import { ContactLine, LegalPage, List, Section } from '@/components/legal-page'

export const metadata: Metadata = {
  title: 'Terms and Conditions',
  description: `The terms for using ${siteConfig.name}.`,
}

/*
 * A draft written from the product's actual behaviour, not legal advice.
 * Before relying on it, set the governing-law jurisdiction in section 9.
 */
export default function TermsPage() {
  return (
    <LegalPage
      title="Terms and Conditions"
      description={`Last updated ${siteConfig.legalUpdated}`}
    >
      <Section title="1. Acceptance">
        <p>
          By using ReqStudio you agree to these terms. If you do not agree with them, please do not
          use it.
        </p>
      </Section>

      <Section title="2. The service">
        <p>
          ReqStudio is a free browser-based tool. It requires no account and stores everything you
          write in your own browser. No part of your content is transmitted to us, because there is
          no server component that could receive it.
        </p>
      </Section>

      <Section title="3. Your content is yours">
        <p>
          You retain all rights to everything you write in ReqStudio. We claim no licence over it
          and never receive a copy of it. You are responsible for ensuring you have the right to
          record any client or third-party information you enter.
        </p>
      </Section>

      <Section title="4. Data loss">
        <p className="font-semibold text-foreground">
          This is the most important clause. Your projects exist only in the browser storage of the
          device you created them on.
        </p>
        <List
          items={[
            'Clearing your browser data, using private browsing, or a browser evicting storage under pressure will delete your projects permanently.',
            'There is no backup, no server-side copy and no recovery process.',
            'Projects do not sync between devices or browsers.',
            'You are solely responsible for retaining anything you cannot afford to lose — print or export it.',
          ]}
        />
        <p>
          We accept no liability for lost, corrupted or inaccessible project data under any
          circumstances.
        </p>
      </Section>

      <Section title="5. Provided as is">
        <p>
          ReqStudio is provided &ldquo;as is&rdquo; and &ldquo;as available&rdquo;, without
          warranty of any kind, express or implied, including fitness for a particular purpose. We
          do not warrant that it will be uninterrupted, error-free, or that a brief produced with it
          is complete, accurate or suitable for any commercial or contractual purpose. The
          readiness score is a guide, not an assurance.
        </p>
      </Section>

      <Section title="6. Acceptable use">
        <p>You agree not to use ReqStudio to:</p>
        <List
          items={[
            'Break any applicable law or regulation.',
            'Store information you are not permitted to hold or process.',
            'Attempt to disrupt or misuse the hosting infrastructure that serves the site.',
          ]}
        />
      </Section>

      <Section title="7. Availability and changes">
        <p>
          We may change, suspend or discontinue ReqStudio at any time without notice. Because your
          data lives on your device rather than ours, a shutdown would not delete it — but the tool
          for reading it may no longer be available, which is another reason to export anything
          important.
        </p>
        <p>
          These terms may be updated. The date at the top of this page reflects the current
          version, and continued use after a change constitutes acceptance.
        </p>
      </Section>

      <Section title="8. Limitation of liability">
        <p>
          To the fullest extent permitted by law, we are not liable for any indirect, incidental or
          consequential loss, or for any loss of data, profit, revenue or business, arising from
          your use of or inability to use ReqStudio. Nothing in these terms excludes liability that
          cannot lawfully be excluded.
        </p>
      </Section>

      {/* TODO: replace with the jurisdiction you operate from before relying on this. */}
      <Section title="9. Governing law">
        <p>
          These terms are governed by the laws of the jurisdiction in which the operator of
          ReqStudio is established. Any dispute is subject to the exclusive jurisdiction of its
          courts.
        </p>
      </Section>

      <Section title="10. Contact">
        <ContactLine />
      </Section>
    </LegalPage>
  )
}
