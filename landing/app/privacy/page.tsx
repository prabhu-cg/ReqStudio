import type { Metadata } from 'next'
import { siteConfig } from '@/lib/site'
import { ContactLine, LegalPage, Section } from '@/components/legal-page'

export const metadata: Metadata = {
  title: 'Privacy Policy',
  description: `How ${siteConfig.name} handles your data: it doesn't collect any.`,
}

/*
 * A plain-language policy written from what ReqStudio actually does, which for a
 * tool with no server, no account and no analytics is unusually little. It is a
 * draft written from the product's behaviour, not legal advice; have it
 * reviewed if anything commercial depends on it.
 */
export default function PrivacyPage() {
  return (
    <LegalPage title="Privacy Policy" description={`Last updated ${siteConfig.legalUpdated}`}>
      <Section title="The short version">
        <p className="text-foreground">
          ReqStudio does not collect, transmit or store your personal data. There is no account, no
          analytics, no cookies and no tracking. Everything you write stays in your browser.
        </p>
      </Section>

      <Section title="What we collect">
        <p>
          Nothing. The application has no backend, no database and no telemetry. It never sends
          your projects, pages, client names or any other content anywhere.
        </p>
      </Section>

      <Section title="Where your data lives">
        <p>
          Projects, pages and activity history are stored in your browser&rsquo;s IndexedDB, on the
          device you are using. Your preferences — theme, text size, autosave settings — are
          stored in localStorage on the same device. Both are readable only by ReqStudio on this
          origin, and only from your own machine.
        </p>
        <p>
          You can delete everything at any time from Settings → Reset local data, or by clearing
          site data in your browser.
        </p>
      </Section>

      <Section title="Cookies and tracking">
        <p>
          We set no cookies. There is no analytics package, no tag manager, no advertising pixel
          and no session recording — on this site or in the app. Fonts are bundled and served from
          the same origin, so no request is made to a third-party font provider while you browse.
        </p>
      </Section>

      <Section title="Hosting">
        <p>
          This site and the app are static files hosted by Vercel Inc. Like any web host, Vercel
          processes the standard technical information present in a request — IP address, user
          agent and timestamp — in order to deliver the files and protect the service. That is
          server infrastructure logging, not ReqStudio collecting data about you, and it never
          includes the contents of your briefs. Vercel&rsquo;s own privacy terms apply to that
          processing.
        </p>
      </Section>

      <Section title="Third parties">
        <p>
          We share nothing, because we hold nothing. Your data is never sold, rented, transferred
          or disclosed. The only outbound links are to this project&rsquo;s public source
          repository and the author&rsquo;s portfolio, which you choose to follow.
        </p>
      </Section>

      <Section title="Children">
        <p>
          ReqStudio is a professional tool and is not directed at children. Since no personal data
          is collected from anyone, none is knowingly collected from children either.
        </p>
      </Section>

      <Section title="Your rights">
        <p>
          Rights such as access, correction, erasure and portability concern data a service holds
          about you. We hold none, so there is nothing for us to disclose, correct or delete. Your
          data is already entirely under your control on your own device.
        </p>
      </Section>

      <Section title="Changes and contact">
        <p>If this policy changes, the date at the top of this page will change with it.</p>
        <ContactLine />
      </Section>
    </LegalPage>
  )
}
