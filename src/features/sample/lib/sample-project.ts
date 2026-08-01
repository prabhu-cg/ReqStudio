import type { BriefData, Project, ProjectPage } from '@/types/project'
import type { DocumentSettings, ExportFormatId, ExportOptions } from '@/types/document'

/**
 * The built-in sample project.
 *
 * A worked example of a finished brief, shipped so a first-time user can see
 * what ReqStudio produces before writing anything themselves. It is read-only
 * and cannot be deleted — the identity check is the reserved id below, which
 * means a duplicate (a fresh id) is an ordinary editable project.
 */

export const SAMPLE_PROJECT_ID = 'sample-northwind-rebuild'

export function isSampleProject(projectId: string | undefined | null): boolean {
  return projectId === SAMPLE_PROJECT_ID
}

/**
 * Formats offered on the sample.
 *
 * The PDF is the showcase — it is the format that demonstrates pagination,
 * running headers and a linked contents page. The rest are for the reader's own
 * projects, which is what the locked cards say.
 */
export const SAMPLE_EXPORT_FORMATS: readonly ExportFormatId[] = ['pdf']

/** Fixed so re-seeding never produces a different-looking document. */
const CREATED_AT = '2026-01-12T09:00:00.000Z'
const UPDATED_AT = '2026-02-27T16:30:00.000Z'

const brief: BriefData = {
  'project-overview': {
    summary:
      'Northwind Traders is replacing an eleven-year-old marketing estate with a single, fast, self-service website. The current site cannot be updated without a developer, hides pricing behind a sales gate, and loses most qualified visitors before they reach a contact form. This project rebuilds the public estate end to end on a modern stack, with a pricing calculator at its centre.',
    background:
      'The estate has grown by accretion since 2015: three CMS platforms, two design languages and roughly 240 live URLs, of which 61 receive no traffic at all. A 2025 attempt to redesign the home page in isolation improved bounce rate for one quarter and then regressed, because the pages it fed into were unchanged. Stakeholder interviews in December 2025 converged on the same conclusion — the problem is the funnel, not the front door.',
    problemStatement:
      'Prospects cannot establish whether Northwind is affordable or credible without booking a call. Sales spends roughly nine hours a week answering pricing questions that a page could answer, and 68% of pricing-page visitors leave without any further interaction.',
    objectives: [
      'Reduce time-to-quote from five working days to one',
      'Increase qualified demo requests by 150% within two quarters of launch',
      'Cut the sales team’s pre-qualification workload by half',
      'Bring every template to WCAG 2.2 AA before launch',
    ],
    inScope: [
      'Public marketing site — 12 templates, 34 pages',
      'Interactive pricing calculator with emailed estimates',
      'Content migration for the 90 URLs that carry traffic',
      'Redirect map for all retired URLs',
      'Editor training and a two-week hypercare period',
    ],
    outOfScope: [
      'CRM migration or Salesforce reconfiguration',
      'The authenticated customer portal',
      'Brand identity work beyond applying the 2025 refresh',
      'Localisation into languages other than English',
    ],
    successCriteria: [
      'Lighthouse performance ≥ 90 on every template on a throttled 4G profile',
      'Editors publish a new case study without developer involvement',
      'Demo requests ≥ 100 per month by the end of Q4',
      'Zero critical or serious axe violations at launch',
    ],
    budgetNotes:
      'Fixed-price engagement against the agreed scope, invoiced across four milestones. Change requests beyond the scope list are quoted separately under the change-control process in section 10. Purchase order NWT-2026-0141.',
  },

  'business-goals': {
    primaryGoal:
      'Double inbound demo requests within two quarters of launch, without increasing paid acquisition spend.',
    goals: [
      {
        goal: 'Increase qualified demo requests',
        metric: 'Demo requests / month',
        baseline: '40',
        target: '100',
        timeframe: '6-months',
        priority: 'critical',
      },
      {
        goal: 'Reduce abandonment on pricing',
        metric: 'Pricing page bounce rate',
        baseline: '68%',
        target: '35%',
        timeframe: '3-months',
        priority: 'high',
      },
      {
        goal: 'Shorten the sales cycle',
        metric: 'Median days from first visit to signed contract',
        baseline: '54',
        target: '35',
        timeframe: '12-months',
        priority: 'high',
      },
      {
        goal: 'Grow non-branded organic traffic',
        metric: 'Non-branded organic sessions / month',
        baseline: '4,200',
        target: '9,000',
        timeframe: '12-months',
        priority: 'medium',
      },
    ],
    kpis: [
      'Demo requests per month',
      'Pricing calculator completion rate',
      'Non-branded organic sessions',
      'Median time to first response from sales',
      'Core Web Vitals pass rate',
    ],
    competitors: [
      'freightlane.com — transparent pricing, weak technical depth',
      'cargopilot.io — excellent product tour, no self-service estimate',
      'meridianlogistics.com — strong case studies, slow site (LCP 4.8s)',
    ],
    valueProposition:
      'Northwind is the only mid-market logistics platform that publishes its pricing, integrates with existing WMS software in days rather than months, and is supported by a named implementation lead for the first ninety days.',
    businessConstraints:
      'The 2025 brand refresh is fixed and must be applied as supplied. Pricing shown publicly must match the rate card governed by Finance and can only change quarterly. The launch cannot fall inside the pre-peak freeze from 1 November.',
  },

  'target-audience': {
    primaryAudience:
      'Procurement and operations leads at mid-market logistics firms (50–500 employees) who are actively comparing two or three vendors and need to justify a shortlist internally.',
    secondaryAudience:
      'Technical evaluators — IT managers and integration engineers — who arrive later in the process to assess whether Northwind will fit the existing stack. They must be served, but they do not drive the primary design decisions.',
    personas: [
      {
        name: 'Procurement Priya',
        role: 'Head of Procurement',
        context:
          'Evaluates roughly four vendors a quarter alongside a full operational workload. Builds a comparison sheet for the board and needs defensible numbers, not brochure language.',
        goals: [
          'Establish indicative cost within ten minutes',
          'Evidence compliance and security posture',
          'Produce a shortlist she can defend to the board',
        ],
        painPoints: [
          'Pricing hidden behind "contact us"',
          'Sales calls booked before any real information is shared',
          'Case studies that never name an industry or a number',
        ],
        devices: ['desktop', 'mobile'],
        techSavviness: 'medium',
      },
      {
        name: 'Operations Omar',
        role: 'Operations Director',
        context:
          'Owns the day-to-day pain the product solves and usually starts the search. Reads on a phone between site visits and forwards links rather than bookmarking them.',
        goals: [
          'Understand whether this actually fits his workflow',
          'See evidence from a comparable operation',
          'Hand something credible to procurement',
        ],
        painPoints: [
          'Generic content that never mentions his sector',
          'Long-form pages that bury the answer',
          'Anything that requires a desktop to read',
        ],
        devices: ['mobile', 'tablet'],
        techSavviness: 'medium',
      },
      {
        name: 'Integration Ines',
        role: 'IT Manager',
        context:
          'Brought in once a vendor reaches the final two. Wants documentation depth and a clear answer on data residency before she signs anything off.',
        goals: [
          'Confirm the integration surface and effort',
          'Check security and data-handling commitments',
          'Estimate internal implementation cost',
        ],
        painPoints: [
          'No public API documentation',
          'Vague security claims with no certifications named',
          'Having to book a call to see a spec',
        ],
        devices: ['desktop', 'assistive'],
        techSavviness: 'high',
      },
    ],
    userJourneys: [
      'Search "logistics software pricing" → Pricing → calculator → emailed estimate → demo request',
      'Peer referral → Home → Solutions → Case Studies → demo request',
      'Comparison shortlist → Case Studies → Resources (integration guide) → contact sales',
      'Existing customer → Resources → documentation → support',
    ],
    accessibilityAudience:
      'Two enterprise accounts have procurement clauses requiring WCAG 2.2 AA. Warehouse-side users frequently work one-handed on mobile in poor lighting, so contrast and target size matter more than average. Screen-reader use is confirmed among at least one named evaluator.',
    locales: ['en-GB', 'en-US'],
    researchSource:
      '14 stakeholder and customer interviews, December 2025; analytics review of 18 months of GA4 data; competitor teardown of five vendors.',
  },

  'website-structure': {
    navigationModel: 'hub-and-spoke',
    maxDepth: 3,
    primaryNavigation: ['Solutions', 'Pricing', 'Case studies', 'Resources', 'Company'],
    secondaryNavigation: ['Support', 'Documentation', 'Sign in', 'Request a demo'],
    footerGroups: [
      'Product — Solutions, Pricing, Integrations, Changelog',
      'Company — About, Careers, Press, Contact',
      'Resources — Case studies, Guides, Documentation, Webinars',
      'Legal — Privacy, Terms, Security, Accessibility statement',
    ],
    urlStrategy:
      'Lowercase, hyphenated, no trailing slashes and no dates in paths. Hubs sit at the root (/solutions, /pricing); spokes nest one level (/solutions/warehouse-integration). Case studies live at /case-studies/{client}. All 240 legacy URLs get an explicit 301 to the closest equivalent, or to the parent hub where none exists; the map is reviewed by SEO before launch and kept in the repository.',
    sitemapNotes:
      'Card sorting with nine participants settled two contested labels: "Solutions" beat "Products" because the audience buys an outcome, and "Resources" beat "Insights" because nobody outside marketing recognised the latter. The Company hub was deliberately kept shallow — it attracts 3% of traffic and does not warrant a spoke structure.',
    multilingual: false,
    searchRequired: true,
  },

  'page-requirements': {
    pageTemplates: [
      'Home',
      'Solution hub',
      'Solution detail',
      'Pricing with calculator',
      'Case study index',
      'Case study detail',
      'Resource index',
      'Article',
      'Documentation',
      'Contact',
      'Legal',
      'Search results',
    ],
    notes:
      'Every template carries the same header, footer and consent banner, and ends with a single contextual call-to-action band — never two competing ones. All templates are designed mobile-first at 360px and validated at 320px. Long-form pages carry a sticky in-page contents rail from the medium breakpoint upward.',
  },

  'functional-requirements': {
    requirements: [
      {
        reference: 'FR-01',
        title: 'Interactive pricing calculator',
        description:
          'A calculator on the Pricing page that produces an indicative annual cost from three inputs: monthly shipment volume, number of warehouse locations and required integrations.',
        userStory:
          'As a procurement lead I want an indicative price without talking to anyone so that I can decide whether to shortlist Northwind.',
        acceptanceCriteria: [
          'Updates the estimate without a page reload',
          'Produces a figure within ±10% of the rate card for every valid input combination',
          'Emails a PDF summary when an address is supplied',
          'Is fully operable by keyboard and announces changes to assistive technology',
          'Falls back to the static tier table when JavaScript is unavailable',
        ],
        priority: 'must',
        complexity: 'high',
      },
      {
        reference: 'FR-02',
        title: 'Demo request form',
        description:
          'A short form that routes to HubSpot with full campaign attribution and notifies the assigned sales owner.',
        userStory:
          'As an operations director I want to request a demo in under a minute so that I do not lose interest.',
        acceptanceCriteria: [
          'Validates inline, never on submit alone',
          'Completes in four fields or fewer',
          'Passes UTM parameters and the calculator estimate when present',
          'Confirms on-page rather than redirecting away',
        ],
        priority: 'must',
        complexity: 'low',
      },
      {
        reference: 'FR-03',
        title: 'Case study filtering',
        description:
          'Filter the case study index by industry, company size and integration used, with the state reflected in the URL.',
        userStory:
          'As a prospect I want to find a customer like me so that I can trust the evidence.',
        acceptanceCriteria: [
          'Filter state is shareable via the URL',
          'Empty results offer the nearest alternatives rather than a dead end',
          'Works without JavaScript as plain links',
        ],
        priority: 'should',
        complexity: 'medium',
      },
      {
        reference: 'FR-04',
        title: 'Site-wide search',
        description:
          'Typeahead search across pages, case studies, resources and documentation.',
        userStory:
          'As a returning visitor I want to jump straight to a document I have seen before.',
        acceptanceCriteria: [
          'Returns results within 200ms at the 95th percentile',
          'Ranks documentation above marketing pages for technical queries',
          'Is reachable from every page by keyboard shortcut',
        ],
        priority: 'should',
        complexity: 'medium',
      },
      {
        reference: 'FR-05',
        title: 'Editor publishing workflow',
        description:
          'Draft, preview and publish flow in the CMS with role-based approval for pricing-adjacent pages.',
        userStory:
          'As a marketing editor I want to publish a case study myself so that I am not blocked on a developer.',
        acceptanceCriteria: [
          'Preview renders the exact production template',
          'Pricing pages require a second approver',
          'Published changes appear within two minutes',
        ],
        priority: 'must',
        complexity: 'medium',
      },
      {
        reference: 'FR-06',
        title: 'Consent management',
        description:
          'A consent banner that gates analytics and marketing scripts until a choice is recorded.',
        userStory:
          'As a visitor I want control over tracking so that my choice is respected.',
        acceptanceCriteria: [
          'No non-essential script fires before consent',
          'The choice persists across sessions and is revocable from the footer',
          'Rejecting is exactly as easy as accepting',
        ],
        priority: 'must',
        complexity: 'low',
      },
    ],
    userRoles: [
      {
        name: 'Marketing editor',
        permissions:
          'Create, edit and publish case studies, resources and articles. Cannot alter pricing content, navigation or templates.',
      },
      {
        name: 'Marketing approver',
        permissions:
          'Everything an editor can do, plus approving pricing-adjacent pages and editing global navigation.',
      },
      {
        name: 'Administrator',
        permissions:
          'Full CMS access including roles, templates, integrations and redirects. Held by two named people.',
      },
    ],
    integrations: [
      'HubSpot — forms, contacts and campaign attribution',
      'Algolia — site-wide search indexing',
      'Sanity — headless CMS',
      'SendGrid — transactional email for calculator estimates',
    ],
    nonFunctional: [
      'Largest Contentful Paint under 2.5s on a throttled 4G profile',
      'Cumulative Layout Shift under 0.1 on every template',
      'Total page weight under 1 MB excluding video',
      '99.9% monthly availability measured externally',
      'No single third-party script may block first render',
    ],
    notes:
      'Open question: whether the calculator should require an email address before showing a figure. Marketing wants the capture; the research says gating is exactly what visitors resent. Current recommendation is to show the figure freely and offer the emailed PDF as the optional next step.',
  },

  'content-inventory': {
    contentOwner: 'Dana Whitfield, Marketing Director',
    contentReadiness: 'partial',
    items: [
      {
        item: 'Home page copy',
        type: 'copy',
        source: 'new',
        owner: 'Copywriter (contracted)',
        dueDate: '2026-04-17',
        status: 'drafting',
        notes: 'Depends on the value proposition in section 2 being signed off first.',
      },
      {
        item: 'Six case studies',
        type: 'copy',
        source: 'rewrite',
        owner: 'Dana Whitfield',
        dueDate: '2026-05-08',
        status: 'not-started',
        notes: 'Three exist but predate the 2025 brand and name no metrics. Customer approval needed for each.',
      },
      {
        item: 'Pricing tier descriptions',
        type: 'copy',
        source: 'new',
        owner: 'Finance + Marketing',
        dueDate: '2026-04-24',
        status: 'in-review',
        notes: 'Must match the governed rate card exactly. Legal review required.',
      },
      {
        item: 'Team and facility photography',
        type: 'imagery',
        source: 'new',
        owner: 'Dana Whitfield',
        dueDate: '2026-05-15',
        status: 'not-started',
        notes: 'One-day shoot at the Leeds depot. Needs model releases.',
      },
      {
        item: 'Product tour video',
        type: 'video',
        source: 'existing',
        owner: 'Marcus Lee',
        dueDate: '2026-05-01',
        status: 'approved',
        notes: 'Re-cut to 90 seconds and captioned.',
      },
      {
        item: 'Integration documentation',
        type: 'document',
        source: 'migrate',
        owner: 'Ines Kovač',
        dueDate: '2026-05-22',
        status: 'not-started',
        notes: 'Currently in Confluence. Needs restructuring for a public audience.',
      },
      {
        item: 'Privacy, terms and accessibility statement',
        type: 'legal',
        source: 'rewrite',
        owner: 'Legal',
        dueDate: '2026-06-05',
        status: 'not-started',
        notes: 'Accessibility statement must reflect the audited state at launch, not the target.',
      },
    ],
    toneOfVoice:
      'Direct, specific and unembarrassed about detail. Prefer a number to an adjective. Do write: "Integrates with Manhattan and Blue Yonder in under two weeks." Do not write: "Seamlessly integrates with your existing best-of-breed ecosystem." Sentences stay under 25 words where the meaning allows, and no sentence should need a second reading.',
    assetsNeeded: [
      'Photography for six team profiles',
      'Depot photography — three locations',
      'Twelve customer logos, cleared for use',
      'Iconography for the six integration partners',
      'Captioned 90-second product tour',
    ],
    contentSources: [
      'Legacy WordPress export — 240 URLs',
      'Confluence integration documentation',
      '2025 brand portal',
      'Customer success case-study interviews (2024–2025)',
    ],
    migrationNotes:
      'Of 240 legacy URLs, 90 carry meaningful traffic and migrate; the rest redirect to their parent hub. Content freeze on the legacy CMS four weeks before launch. The redirect map is validated against twelve months of Search Console data before go-live, and monitored weekly for the first month afterwards.',
  },

  'technical-requirements': {
    platform: 'Next.js 16 (App Router) deployed on Vercel',
    cms: 'Sanity — headless, with live preview against production templates',
    hosting: 'Vercel — development, staging and production, with preview deployments per pull request',
    domain: 'northwindtraders.com — DNS held by Northwind IT, delegated to the agency for the launch window',
    browsers: ['chrome', 'safari', 'firefox', 'edge', 'samsung'],
    devices: ['desktop', 'tablet', 'mobile'],
    accessibilityStandard: 'wcag-2.2-aa',
    performanceTargets:
      'LCP under 2.5s and CLS under 0.1 at the 75th percentile on a throttled 4G profile. Total page weight under 1 MB excluding video. Lighthouse performance at or above 90 for every template, enforced by a CI budget that fails the build on regression.',
    securityRequirements:
      'A strict Content Security Policy with no unsafe-inline. TLS 1.3 only. All form submissions rate-limited and bot-protected. No personal data stored in the CMS. An annual penetration test, with the launch test booked for the fortnight before go-live. Data residency in the EU or UK only.',
    seoRequirements:
      'Server-rendered HTML for every indexable route. Organisation, Product, FAQ and BreadcrumbList structured data. Canonical tags on all paginated and filtered views. An XML sitemap regenerated on publish. The full 301 map in place at cutover, verified against Search Console.',
    analyticsRequirements:
      'GA4 with server-side tagging, gated behind consent. Events for calculator start, calculator completion, estimate emailed, demo requested and case-study filter use. A quarterly funnel report shared with the board. No session recording without an explicit legal review.',
    integrations: [
      'HubSpot Forms API',
      'Algolia Search API',
      'Sanity Content Lake',
      'SendGrid transactional email',
      'Vercel Analytics and Speed Insights',
    ],
    compliance: [
      'UK GDPR and the Data Protection Act 2018',
      'PECR — consent before any non-essential cookie',
      'WCAG 2.2 AA — contractual for two enterprise accounts',
      'Northwind supplier security policy v4',
    ],
    technicalConstraints:
      'Sanity and HubSpot are mandated by existing contracts and cannot be swapped. The legacy WordPress instance stays live but unindexed for six months after cutover as a content archive. Northwind IT controls DNS and requires 48 hours notice for any record change, which constrains the cutover window.',
  },

  'risks-assumptions': {
    risks: [
      {
        risk: 'Content is not ready for the agreed launch date',
        likelihood: 'high',
        impact: 'critical',
        mitigation:
          'Content freeze four weeks before launch, a contracted copywriter funded from the outset, and a launch-blocking review at the halfway milestone. If six case studies are not ready, launch with three and publish the rest in hypercare.',
        owner: 'Dana Whitfield',
        status: 'open',
      },
      {
        risk: 'Published pricing is blocked by Finance or Legal',
        likelihood: 'medium',
        impact: 'critical',
        mitigation:
          'Finance and Legal are named approvers on the brief and reviewed the tier structure before design began. A fallback "indicative range" treatment is designed alongside the exact-figure version.',
        owner: 'Marcus Lee',
        status: 'monitoring',
      },
      {
        risk: 'Rate-card complexity exceeds what a three-input calculator can model',
        likelihood: 'medium',
        impact: 'high',
        mitigation:
          'A modelling spike in the first sprint tests the calculator against fifty historical quotes. If accuracy falls outside ±10%, the calculator degrades to a banded estimate rather than shipping a misleading figure.',
        owner: 'Prabhu R',
        status: 'open',
      },
      {
        risk: 'Redirect map is incomplete and organic traffic drops at cutover',
        likelihood: 'medium',
        impact: 'high',
        mitigation:
          'The map is generated from twelve months of Search Console data, reviewed by SEO, and tested on staging with an automated crawl. Rankings are monitored daily for the first fortnight.',
        owner: 'Prabhu R',
        status: 'mitigated',
      },
      {
        risk: 'Key stakeholder unavailable during the approval window',
        likelihood: 'low',
        impact: 'medium',
        mitigation:
          'Each approver names a deputy with equivalent authority at kick-off. Approval windows are five working days, after which the deputy may sign.',
        owner: 'Dana Whitfield',
        status: 'accepted',
      },
    ],
    assumptions: [
      'Northwind provides final copy for all twelve templates by 14 June 2026',
      'The 2025 brand refresh is final and will not change during the project',
      'Existing HubSpot and Sanity licences cover the required usage',
      'Two Northwind editors are available for training in the week before launch',
      'Customer approval for all six case studies is obtained by Northwind',
    ],
    dependencies: [
      'Brand refresh signed off before visual design begins',
      'Rate card confirmed by Finance before the calculator is built',
      'DNS delegation agreed with Northwind IT before the cutover window',
      'Penetration test booked for the fortnight before launch',
    ],
    constraints:
      'Fixed budget against the scope in section 1. The launch cannot fall inside the pre-peak freeze beginning 1 November. The agency team is three people — a lead designer, a front-end engineer and a part-time content strategist — and cannot be scaled mid-project.',
    openQuestions:
      'Should the calculator require an email address before revealing a figure? Marketing wants the capture, research says gating causes the abandonment the project exists to fix. Decision needed before sprint three. Secondly, does the documentation section belong in this project or the portal rebuild that follows it?',
  },

  approvals: {
    approvers: [
      {
        name: 'Dana Whitfield',
        role: 'Marketing Director',
        organisation: 'Northwind Traders',
        email: 'd.whitfield@northwindtraders.com',
        status: 'approved',
        approvedOn: '2026-02-24',
      },
      {
        name: 'Marcus Lee',
        role: 'Commercial Director',
        organisation: 'Northwind Traders',
        email: 'm.lee@northwindtraders.com',
        status: 'approved',
        approvedOn: '2026-02-25',
      },
      {
        name: 'Ines Kovač',
        role: 'IT Manager',
        organisation: 'Northwind Traders',
        email: 'i.kovac@northwindtraders.com',
        status: 'reviewing',
        approvedOn: '',
      },
      {
        name: 'Prabhu R',
        role: 'Lead Designer',
        organisation: 'Meridian Studio',
        email: 'prabhu@meridian.studio',
        status: 'approved',
        approvedOn: '2026-02-21',
      },
    ],
    signOffProcess:
      'The brief is circulated as a PDF with a five working-day review window. Comments are collected in a single shared document rather than by email, resolved in one review call, and the revised brief reissued with an incremented version. Approval is recorded by email confirmation against the reissued version, and the approval matrix in this section is the record of truth.',
    reviewCycles: 2,
    targetApprovalDate: '2026-03-06',
    changeControl:
      'Any change to the scope in section 1 after sign-off is raised as a written change request with an impact assessment covering cost, timeline and risk. Changes under half a day are absorbed. Anything larger requires written approval from the Marketing Director and, where cost is affected, the Commercial Director. Approved changes are appended to this brief and the version incremented.',
    documentVersion: 'v1.0',
    notes:
      'This is the sample brief shipped with ReqStudio. The content is fictional and exists to show what a completed brief looks like end to end.',
  },
}

export const SAMPLE_PROJECT: Omit<
  Project,
  'createdAt' | 'updatedAt' | 'deletedAt' | 'revision' | 'syncState'
> = {
  id: SAMPLE_PROJECT_ID,
  name: 'Northwind Rebuild',
  client: 'Northwind Traders',
  type: 'marketing-website',
  description:
    'A full rebuild of the Northwind marketing estate on a modern stack, with self-service pricing at its centre.',
  designer: 'Prabhu R',
  stakeholders: ['Dana Whitfield', 'Marcus Lee', 'Ines Kovač'],
  startDate: '2026-03-16',
  targetDate: '2026-09-04',
  priority: 'high',
  tags: ['sample', 'rebuild', 'b2b'],
  status: 'active',
  pinned: false,
  lastOpenedAt: null,
  brief,
}

type SamplePage = Omit<
  ProjectPage,
  'createdAt' | 'updatedAt' | 'deletedAt' | 'revision' | 'syncState' | 'projectId'
>

export const SAMPLE_PAGES: SamplePage[] = [
  {
    id: `${SAMPLE_PROJECT_ID}-page-home`,
    order: 0,
    name: 'Home',
    purpose:
      'Orient a first-time visitor in under ten seconds and route them to the one of three places that matches their intent: pricing, solutions or evidence.',
    audience: 'All segments, weighted towards Operations Omar arriving from a referral',
    summary:
      'A short hero stating what Northwind does and for whom, immediate social proof, three intent-based routes, a condensed proof section and a single closing call to action.',
    businessGoal: 'Demo requests; onward journeys to Pricing',
    primaryCta: 'Request a demo',
    secondaryCta: 'See pricing',
    contentRequirements: [
      'Hero headline naming the audience and the outcome',
      'Twelve customer logos',
      'Three intent-based route cards',
      'One headline metric per route',
      '90-second captioned product tour',
    ],
    requiredComponents: ['Hero', 'LogoWall', 'RouteCards', 'MetricStrip', 'VideoEmbed', 'CTABand'],
    dependencies: ['Brand refresh signed off', 'Product tour re-cut and captioned'],
    seoNotes:
      'Targets the head term "logistics software" and the brand term. Organisation structured data. The hero heading is the only H1.',
    accessibilityNotes:
      'The tour must not autoplay with sound and needs captions plus a transcript. Route cards are links, not click-handled divs. Logo wall carries a single group label rather than twelve redundant alt strings.',
    analytics: 'Track route-card clicks by position, video play and completion, and CTA clicks by placement.',
    internalNotes: 'The 2025 redesign added a second competing CTA here. Do not repeat that.',
  },
  {
    id: `${SAMPLE_PROJECT_ID}-page-solutions`,
    order: 1,
    name: 'Solutions',
    purpose:
      'Act as the hub for the four solution areas, letting a visitor self-select by the problem they arrived with rather than by product name.',
    audience: 'Operations Omar and Procurement Priya, early in evaluation',
    summary:
      'A brief framing statement, four solution cards written as problems rather than features, and a comparison strip for visitors who are unsure which applies.',
    businessGoal: 'Qualified progression to a solution detail page',
    primaryCta: 'Explore the solution',
    secondaryCta: 'Compare all four',
    contentRequirements: [
      'Framing paragraph, 40 words maximum',
      'Four solution summaries written problem-first',
      'Comparison strip covering all four',
    ],
    requiredComponents: ['PageHeader', 'SolutionCards', 'ComparisonStrip', 'CTABand'],
    dependencies: ['Solution naming confirmed in card sorting'],
    seoNotes:
      'Hub page for the four solution spokes. Internal links to every spoke. BreadcrumbList structured data.',
    accessibilityNotes:
      'Cards must have a consistent heading level and a visible focus state. The comparison strip scrolls horizontally on mobile inside its own region with a labelled scroll container.',
    analytics: 'Track which solution card is chosen, and whether the comparison strip is used first.',
    internalNotes: '',
  },
  {
    id: `${SAMPLE_PROJECT_ID}-page-pricing`,
    order: 2,
    name: 'Pricing',
    purpose:
      'Let a prospect establish indicative cost and self-qualify without contacting sales. This is the single most important page in the project.',
    audience: 'Procurement Priya, mid-evaluation, comparing two or three vendors',
    summary:
      'Three published tiers with real figures, the interactive calculator, an explicit statement of what is not charged for, and an FAQ addressing the questions sales currently answers by phone.',
    businessGoal: 'Calculator completion and emailed estimates; reduced sales pre-qualification load',
    primaryCta: 'Get your estimate',
    secondaryCta: 'Email me a PDF summary',
    contentRequirements: [
      'Three tier descriptions matching the governed rate card',
      'Calculator input labels and help text',
      'What is not charged for — an explicit list',
      'Twelve-question pricing FAQ',
      'Plain-language explanation of how the estimate is produced',
    ],
    requiredComponents: ['PageHeader', 'PricingTable', 'Calculator', 'FAQAccordion', 'CTABand'],
    dependencies: [
      'Rate card confirmed by Finance',
      'Legal review of published pricing',
      'Calculator accuracy spike completed',
    ],
    seoNotes:
      'Targets "logistics software pricing" and comparison long-tail queries. Product and FAQ structured data. Must be server-rendered — the figures need to be indexable.',
    accessibilityNotes:
      'The calculator is fully keyboard operable, announces the updated estimate via a polite live region, and never conveys tier differences by colour alone. The static tier table is the no-JavaScript fallback.',
    analytics:
      'Track calculator start, each input change, completion, estimate emailed and abandonment point. This funnel is the primary measure of the project.',
    internalNotes:
      'Open question on gating the figure behind an email address — see section 9. Build ungated; gating can be added, un-gating loses the trust.',
  },
  {
    id: `${SAMPLE_PROJECT_ID}-page-case-studies`,
    order: 3,
    name: 'Case studies',
    purpose:
      'Let a prospect find evidence from an operation that resembles their own, so the credibility question is answered before sales is involved.',
    audience: 'Procurement Priya building a board-facing shortlist',
    summary:
      'A filterable index of six case studies, each summarised with a named industry, company size and a headline metric.',
    businessGoal: 'Trust; progression to demo request',
    primaryCta: 'Read the case study',
    secondaryCta: 'Request a demo',
    contentRequirements: [
      'Six case study summaries with a named metric each',
      'Industry, company size and integration tags',
      'Customer-approved quotes',
    ],
    requiredComponents: ['PageHeader', 'FilterBar', 'CaseStudyGrid', 'CTABand'],
    dependencies: ['Six case studies written', 'Customer approval for each'],
    seoNotes:
      'Filtered views carry a canonical tag pointing at the unfiltered index. Individual studies live at /case-studies/{client}.',
    accessibilityNotes:
      'Filters are real form controls, and result counts are announced via a live region. Filtered results move focus to the results heading, not to the top of the page.',
    analytics: 'Track filter combinations used and which study is opened from which filter state.',
    internalNotes: 'Three existing studies predate the 2025 brand and name no numbers — treat as rewrites.',
  },
  {
    id: `${SAMPLE_PROJECT_ID}-page-resources`,
    order: 4,
    name: 'Resources',
    purpose:
      'Serve the technical evaluator and the returning customer with guides, integration documentation and webinars, without diluting the marketing funnel.',
    audience: 'Integration Ines, plus existing customers',
    summary:
      'A searchable index grouped by type — guides, documentation, webinars — with the integration documentation given equal prominence to marketing content.',
    businessGoal: 'Technical confidence; reduced pre-sales support load',
    primaryCta: 'Read the guide',
    secondaryCta: 'Browse documentation',
    contentRequirements: [
      'Integration documentation migrated from Confluence',
      'Four how-to guides',
      'Webinar archive with captions',
    ],
    requiredComponents: ['PageHeader', 'SearchInput', 'ResourceList', 'TypeFilter'],
    dependencies: ['Confluence documentation restructured for a public audience'],
    seoNotes:
      'Documentation should rank above marketing pages for technical queries. Article structured data on guides.',
    accessibilityNotes:
      'Search results are announced as they change. Every webinar needs captions and a transcript. Code samples are marked up as code, not as images.',
    analytics: 'Track internal search terms — these are the clearest signal of unmet content need.',
    internalNotes: '',
  },
  {
    id: `${SAMPLE_PROJECT_ID}-page-contact`,
    order: 5,
    name: 'Contact',
    purpose:
      'Give every remaining intent a route — demo, sales question, support, press — without funnelling all of them into one form.',
    audience: 'All segments, late in the journey',
    summary:
      'Four clearly separated routes with the demo request form inline, plus depot addresses and response-time commitments.',
    businessGoal: 'Demo requests; correctly routed enquiries',
    primaryCta: 'Request a demo',
    secondaryCta: 'Contact support',
    contentRequirements: [
      'Four route descriptions',
      'Stated response times per route',
      'Three depot addresses with maps',
    ],
    requiredComponents: ['PageHeader', 'ContactRoutes', 'DemoForm', 'LocationList'],
    dependencies: ['HubSpot routing rules configured'],
    seoNotes: 'LocalBusiness structured data for each depot. Targets the brand contact query.',
    accessibilityNotes:
      'The form validates inline with errors tied to inputs by aria-describedby, never by colour alone. Maps carry a text address alternative.',
    analytics: 'Track which route is chosen and the form abandonment field.',
    internalNotes: '',
  },
]

/** Document identity for the sample, so its exported PDF is fully branded. */
export const SAMPLE_DOCUMENT_SETTINGS: DocumentSettings = {
  documentTitle: 'Northwind Rebuild — Requirements Brief',
  version: '1.0',
  company: 'Meridian Studio',
  preparedBy: 'Prabhu R',
  approvedBy: 'Dana Whitfield, Marketing Director',
  footerText: 'Sample document — Northwind Traders is fictional',
  logoText: 'NT',
  dateFormat: 'd MMM yyyy',
  pageSize: 'a4',
  margins: 'normal',
  theme: 'light',
}

export const SAMPLE_EXPORT_OPTIONS: ExportOptions = {
  includeCover: true,
  includeDocumentInfo: true,
  includeToc: true,
  includeExecutiveSummary: true,
  includeAppendix: true,
  includeApprovals: true,
  includeEmptySections: false,
  pageNumbers: true,
  headers: true,
  footers: true,
}

export const SAMPLE_TIMESTAMPS = { createdAt: CREATED_AT, updatedAt: UPDATED_AT }
