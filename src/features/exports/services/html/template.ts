/**
 * The standalone HTML shell.
 *
 * Everything is inlined: no webfonts, no stylesheets, no scripts. The document
 * has to open correctly from a file:// URL on a machine with no network, which
 * is how these get emailed around.
 */

export const DOCUMENT_STYLES = `
:root {
  --ink: #1c1917;
  --body: #555555;
  --muted: #78716c;
  --line: #e5e0d5;
  --line-strong: #d6c7ab;
  --surface: #faf8f3;
  --primary: #c74504;
  --primary-dark: #a93a03;
  --primary-soft: #fdefe7;
  --info: #1f5f9e;
  --info-soft: #ebf3fb;
  --success: #146c43;
  --success-soft: #e6f4ec;
  --warning: #8a5a00;
  --warning-soft: #fdf3e0;
  --danger: #b3261e;
  --danger-soft: #fdeceb;
}

*, *::before, *::after { box-sizing: border-box; }

body {
  margin: 0;
  background: #f2efe8;
  color: var(--body);
  font-family: 'Manrope', ui-sans-serif, system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif;
  font-size: 15px;
  line-height: 1.65;
  -webkit-text-size-adjust: 100%;
  text-rendering: optimizeLegibility;
}

.doc {
  max-width: 62rem;
  margin: 2.5rem auto;
  background: #ffffff;
  border: 1px solid var(--line);
  border-radius: 16px;
  overflow: hidden;
  box-shadow: 0 2px 4px -1px rgba(16,16,20,.06), 0 8px 24px -6px rgba(16,16,20,.12);
}

h1, h2, h3, h4 { color: var(--ink); font-weight: 700; letter-spacing: -0.02em; margin: 0; }
p { margin: 0 0 1rem; max-width: 68ch; }
a { color: var(--primary-dark); }

/* Running header and footer ---------------------------------------------- */
.doc-header {
  display: flex; align-items: center; justify-content: space-between; gap: 1rem;
  padding: .85rem 3rem; background: var(--surface); border-bottom: 1px solid var(--line);
  font-size: 12px; color: var(--muted);
}
.doc-header strong { color: var(--ink); font-weight: 600; }
.doc-header .version { color: var(--primary-dark); font-weight: 700; }

.doc-footer {
  display: flex; flex-wrap: wrap; align-items: center; justify-content: space-between;
  gap: .5rem 1.5rem; padding: 1.1rem 3rem; background: var(--surface);
  border-top: 1px solid var(--line); font-size: 12px; color: var(--muted);
}

/* Cover ------------------------------------------------------------------ */
.cover { padding: 4rem 3rem; border-bottom: 1px solid var(--line); }
.cover-top { display: flex; align-items: flex-start; justify-content: space-between; gap: 1.5rem; }
.cover-mark {
  display: flex; align-items: center; justify-content: center;
  width: 3rem; height: 3rem; border-radius: 14px;
  background: var(--primary); color: #fff; font-weight: 700; font-size: 14px;
}
.cover-brand { display: flex; align-items: center; gap: .75rem; }
.cover-brand p { margin: 0; }
.cover-brand .name { color: var(--ink); font-weight: 600; font-size: 14px; }
.cover-brand .kind { font-size: 12px; color: var(--muted); }
.cover-meta { text-align: right; font-size: 12px; }
.cover-meta .version { color: var(--primary-dark); font-weight: 700; letter-spacing: .12em; text-transform: uppercase; }

.cover-title { padding: 4rem 0; }
.cover-eyebrow {
  margin: 0; color: var(--primary-dark); font-size: 12px; font-weight: 700;
  letter-spacing: .18em; text-transform: uppercase;
}
.cover h1 { margin: 1rem 0 0; font-size: clamp(2rem, 5vw, 3rem); line-height: 1.1; }
.cover-subtitle { margin-top: 1.25rem; font-size: 17px; color: var(--muted); }
.cover-rule { width: 6rem; height: 4px; margin-top: 2rem; border-radius: 999px; background: var(--primary); }

.cover-facts {
  display: grid; grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 1.5rem 2rem; padding-top: 2rem; border-top: 1px solid var(--line); margin: 0;
}
.cover-facts dt {
  font-size: 11px; font-weight: 700; letter-spacing: .1em;
  text-transform: uppercase; color: var(--muted);
}
.cover-facts dd { margin: .4rem 0 0; font-size: 14px; font-weight: 600; color: var(--ink); }

/* Blocks ----------------------------------------------------------------- */
.page { padding: 2.5rem 3rem; border-bottom: 1px solid var(--line); }
.body { padding: 2.5rem 3rem; }

.section { padding: 1.75rem 0; border-bottom: 1px solid var(--line); }
.section:last-child { border-bottom: 0; }
.section > h2 { font-size: 1.6rem; }
.section.level-2 { padding-left: 1.5rem; }
.section.level-2 > h2 { font-size: 1.15rem; }
.section .num { color: var(--primary-dark); margin-right: .6rem; }
.section-description { margin: .5rem 0 0; font-size: 14px; color: var(--muted); }
.section-body { margin-top: 1.25rem; }
.section-body > * + * { margin-top: 1rem; }

h3.block { font-size: 1rem; margin-top: 1.5rem; }
h4.block { font-size: .9rem; color: var(--primary-dark); margin-top: 1.25rem; }

ul, ol { margin: 0; padding-left: 1.35rem; max-width: 68ch; }
li { margin: .3rem 0; }

dl.fields { display: grid; grid-template-columns: minmax(8rem, 11rem) 1fr; gap: .85rem 2rem; margin: 0; }
dl.fields dt {
  font-size: 11px; font-weight: 700; letter-spacing: .06em;
  text-transform: uppercase; color: var(--muted); padding-top: .15rem;
}
dl.fields dd { margin: 0; max-width: 68ch; }
dl.fields dd.empty { font-style: italic; color: var(--muted); }

table { width: 100%; border-collapse: collapse; font-size: 14px; }
.table-wrap { overflow-x: auto; border: 1px solid var(--line); border-radius: 12px; }
caption { text-align: left; font-size: 11px; font-weight: 700; letter-spacing: .08em; text-transform: uppercase; color: var(--muted); padding-bottom: .5rem; }
th {
  background: #f4f2ea; text-align: left; font-size: 11px; font-weight: 700;
  letter-spacing: .06em; text-transform: uppercase; color: var(--muted);
  padding: .7rem .8rem; border-bottom: 1px solid var(--line);
}
td { padding: .7rem .8rem; border-bottom: 1px solid var(--line); vertical-align: top; }
tr:last-child td { border-bottom: 0; }
tr:nth-child(even) td { background: #fbfaf6; }
th.right, td.right { text-align: right; font-variant-numeric: tabular-nums; }

.callout { display: flex; gap: .85rem; padding: .9rem 1.1rem; border: 1px solid; border-radius: 12px; }
.callout p { margin: 0; }
.callout .label { font-size: 11px; font-weight: 700; letter-spacing: .08em; text-transform: uppercase; margin-bottom: .25rem; }
.callout .content { color: var(--ink); font-size: 14px; }
.callout-info { background: var(--info-soft); border-color: rgba(31,95,158,.3); }
.callout-info .label { color: var(--info); }
.callout-success { background: var(--success-soft); border-color: rgba(20,108,67,.3); }
.callout-success .label { color: var(--success); }
.callout-warning { background: var(--warning-soft); border-color: rgba(138,90,0,.3); }
.callout-warning .label { color: var(--warning); }
.callout-risk { background: var(--danger-soft); border-color: rgba(179,38,30,.3); }
.callout-risk .label { color: var(--danger); }
.callout-future { background: var(--primary-soft); border-color: rgba(199,69,4,.3); }
.callout-future .label { color: var(--primary-dark); }

hr.rule { border: 0; border-top: 1px solid var(--line); margin: 1.25rem 0; }
.empty { font-style: italic; color: var(--muted); }

/* Contents --------------------------------------------------------------- */
.toc ol { list-style: none; padding: 0; margin: 1.5rem 0 0; }
.toc li a {
  display: flex; align-items: baseline; gap: .75rem;
  padding: .35rem 0; text-decoration: none; color: var(--ink);
}
.toc li a:hover { color: var(--primary-dark); }
.toc .sub { padding-left: 2rem; font-size: 14px; color: var(--body); }
.toc .num { color: var(--primary-dark); font-weight: 700; }
.toc .sub .num { color: var(--muted); font-weight: 400; }
.toc .leader { flex: 1; border-bottom: 1px dotted var(--line-strong); transform: translateY(-.25em); min-width: 1rem; }
.toc .page-number { color: var(--muted); font-variant-numeric: tabular-nums; }

/* Responsive ------------------------------------------------------------- */
@media (max-width: 46rem) {
  body { font-size: 14px; }
  .doc { margin: 0; border: 0; border-radius: 0; }
  .cover, .page, .body { padding: 2rem 1.25rem; }
  .doc-header, .doc-footer { padding: .85rem 1.25rem; }
  .cover-facts { grid-template-columns: repeat(2, minmax(0, 1fr)); }
  dl.fields { grid-template-columns: 1fr; gap: .25rem; }
  dl.fields dd { margin-bottom: .75rem; }
  .section.level-2 { padding-left: 0; }
}

/* Print ------------------------------------------------------------------ */
@media print {
  @page { margin: 18mm 16mm; }
  body { background: #fff; font-size: 10.5pt; }
  .doc { max-width: none; margin: 0; border: 0; border-radius: 0; box-shadow: none; }
  .doc-header, .doc-footer { background: #fff; padding-left: 0; padding-right: 0; }
  .cover, .page, .body { padding-left: 0; padding-right: 0; }
  .cover { min-height: 80vh; page-break-after: always; }
  .page { page-break-after: always; }
  .section { page-break-inside: avoid; }
  table, .callout, figure { page-break-inside: avoid; }
  h2, h3, h4 { page-break-after: avoid; }
  a { color: inherit; text-decoration: none; }
}
`

export function htmlShell({
  title,
  description,
  body,
}: {
  title: string
  description: string
  body: string
}): string {
  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="generator" content="ReqStudio">
<meta name="description" content="${description}">
<title>${title}</title>
<style>${DOCUMENT_STYLES}</style>
</head>
<body>
${body}
</body>
</html>
`
}
