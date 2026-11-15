# Product: ReqStudio

**Tagline:** Requirements. Planned. Perfected.

ReqStudio is a free, local-first studio for project requirements and website briefs. It turns a scattered Word document into a structured brief: ten guided sections, unlimited pages, a live readiness score that names what is still missing, and a report you can hand over. It runs entirely in the browser. There is no account, no server and no AI.

## Who it is for

- UX and product designers who have to write a brief before anything gets built.
- Business analysts, product managers and project managers who own the requirements.
- Anyone handing a website or product build to a team and needing the gaps visible before they do.

No process knowledge is required. The ten sections ask the questions a brief normally has to answer. It does not replace a discovery conversation; it makes sure the answers are written down.

## The problem

Briefs fail quietly. They live in documents that nobody can tell are complete, and the missing answers (budget, audience, content owner, approvals) surface after the build has started. ReqStudio replaces the blank document with guided sections and a readiness score, so "is this safe to send?" has an answer.

## The brief

Ten sections, fillable in any order. A half-finished section never blocks the rest.

| # | Section | Purpose |
| --- | --- | --- |
| 1 | Project Overview | What is being built, why now, and what sits outside the work. |
| 2 | Business Goals | The outcomes the project is accountable for. |
| 3 | Target Audience | Who it is for and what they need. |
| 4 | Website Structure | The shape of the site and how pages relate. |
| 5 | Page Requirements | Every page, with purpose, calls to action, content needs, components, SEO, accessibility and analytics. Unlimited pages, each with its own completeness bar. |
| 6 | Functional Requirements | What the system must do, prioritised and testable. |
| 7 | Content Inventory | What content exists, who owns it, and what must be written. |
| 8 | Technical Requirements | Platform, integrations, constraints and mandated vendors. |
| 9 | Risks & Assumptions | What could go wrong and what is being taken on trust. |
| 10 | Approvals | Who signs off. |

## What it does

- **Readiness score.** Weighted across every section, updates as you type, and names the missing answers.
- **Autosave.** No Save button. Writes a moment after typing stops and flushes if the tab closes.
- **Preview report.** A clean report with a sticky table of contents, collapsible sections and a print stylesheet.
- **Client-ready exports.** PDF, Word, Markdown and HTML.
- **Focused edit flows.** Creating or editing a project, a page or the document settings opens a right-side drawer, so the workspace stays visible behind it. Only destructive confirmations (delete project, delete page, reset local data) interrupt, with a centred dialog.
- **Projects.** Search, filter, sort and pin. A built-in, read-only sample project (Northwind Rebuild, fictional data) shows a complete brief and can be duplicated to edit.
- **Light and dark.** Light is the default; dark is chosen with the toggle. There is no "system" option.

## Principles

- **Private by architecture.** Projects live in the browser's IndexedDB and never leave the device. There is nothing to upload to, breach or sell.
- **Honest about the trade.** Clearing browser data deletes every brief, and briefs do not sync between devices. Both the app and the site say so up front.
- **Readiness, not completion.** The score says what is missing; it does not pretend a brief is done.
- **Free, with no catch.** No paid tier, trial or upsell. There are no servers to pay for.
- **Honest about the sample.** Anything shown from the sample project is labelled "Sample project — fictional data".

## Out of scope

Accounts, cloud sync, collaboration, AI drafting or scoring, and a Templates library. Templates appears in the navigation marked "Soon". Cloud sync is designed for (the data model carries the fields it needs) but deliberately not built.

## Where it lives

One origin, `getreqstudio.vercel.app` (the Vercel project is named `reqstudioapp`): the marketing site at `/` and the app at `/app/`. The site also has About, Privacy and Terms pages (`/about`, `/privacy`, `/terms`), and its top nav glides to the page's sections. The app's origin must never change, because IndexedDB is scoped per origin and moving it would strand every user's briefs. The repository is `prabhu-cg/ReqStudio`; the site is in `landing/`. See the README for the build and deploy details.
