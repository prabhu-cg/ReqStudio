---
name: ReqStudio
description: "Requirements. Planned. Perfected. A flat, warm workspace for guided project briefs: white paper on a pale butter desk, butter hairlines and one amber accent, built on the Solvr \"Butter\" system."
colors:
  accent: "#e8b923"
  accent-hover: "#d4a615"
  accent-text: "#826400"
  accent-tint: "#faf4df"
  on-accent: "#353335"
  background: "#ffffff"
  desk: "#fcfaf3"
  sand: "#f8f4e4"
  ink: "#4d4a4d"
  ink-strong: "#353335"
  ink-muted: "#6b6b6b"
  hairline: "#ece5cc"
  hairline-strong: "#dccfa6"
  control-border: "#8a7f6e"
  success: "#146c43"
  success-soft: "#e6f4ec"
  warning: "#8a5a00"
  warning-soft: "#fdf3e0"
  info: "#1f5f9e"
  info-soft: "#ebf3fb"
  destructive: "#b3261e"
  destructive-soft: "#fdeceb"
typography:
  display:
    fontFamily: "Newsreader, Georgia, serif"
    fontSize: "4.5rem"
    fontWeight: 500
    lineHeight: 1
    letterSpacing: "-0.02em"
  headline:
    fontFamily: "Newsreader, Georgia, serif"
    fontSize: "2.25rem"
    fontWeight: 500
    lineHeight: 1.1
    letterSpacing: "-0.02em"
  title:
    fontFamily: "DM Sans, ui-sans-serif, system-ui, sans-serif"
    fontSize: "1rem"
    fontWeight: 600
    lineHeight: 1.4
  body:
    fontFamily: "DM Sans, ui-sans-serif, system-ui, sans-serif"
    fontSize: "0.875rem"
    fontWeight: 400
    lineHeight: 1.43
  label:
    fontFamily: "DM Sans, ui-sans-serif, system-ui, sans-serif"
    fontSize: "0.75rem"
    fontWeight: 600
    lineHeight: 1.33
rounded:
  control: "8px"
  input: "8px"
  panel: "12px"
  menu: "12px"
  card: "20px"
  pill: "9999px"
spacing:
  xs: "4px"
  sm: "8px"
  md: "12px"
  lg: "16px"
  xl: "24px"
  section: "80px"
  container-site: "1152px"
  container-app: "1440px"
components:
  button-primary:
    backgroundColor: "{colors.accent}"
    textColor: "{colors.on-accent}"
    rounded: "{rounded.pill}"
    height: "44px"
    padding: "0 20px"
  button-outline:
    backgroundColor: "{colors.background}"
    textColor: "{colors.ink-strong}"
    rounded: "{rounded.pill}"
    height: "44px"
  input-control:
    backgroundColor: "{colors.background}"
    textColor: "{colors.ink}"
    rounded: "{rounded.input}"
    height: "40px"
    padding: "4px 12px"
  card:
    backgroundColor: "{colors.background}"
    textColor: "{colors.ink}"
    rounded: "{rounded.card}"
    padding: "20px"
  badge-soft:
    backgroundColor: "{colors.accent-tint}"
    textColor: "{colors.accent-text}"
    typography: "{typography.label}"
    rounded: "{rounded.pill}"
    padding: "2px 8px"
---

# Design System: ReqStudio

## Overview

**Creative North Star: "White Paper on a Butter Desk"**

ReqStudio uses the Solvr "Butter" design system, shared by the app and the marketing site. Desk (`desk`, #fcfaf3) is the chrome: the app's left navigation and the site's alternating bands. Paper (`background` / `card`, #ffffff) is what people work with: the workspace, cards, forms and dialogs. Amber (`accent`, #e8b923) is a fill that marks what is actionable or selected: the primary button, the logo mark, progress fills. Amber is never text; text that carries it is ochre (`accent-text`, #826400). Newsreader carries h1 and h2; DM Sans carries everything else.

Two surfaces share one system. The **site** persuades: desk and white bands alternate, the hero headline carries one ochre phrase, and a MacBook-framed capture of the real app shows the product. The **app** operates: a collapsible desk rail of navigation beside a white working area. Both stay calm and scannable because the work is long-form writing, not dashboards.

**Key Characteristics:**

- **One amber voice.** Fill, not text. Text on amber is charcoal (`on-accent`), never white.
- **Newsreader for h1/h2, DM Sans for everything else.** An unlayered rule in each stylesheet (`src/index.css`, `landing/app/globals.css`) forces h1, h2 and `.font-display` to Newsreader 500 at -0.02em, so per-page `font-bold` classes cannot change them. The `bold` and `extrabold` weights both resolve to 600.
- **Paper and desk.** White is paper; pale butter is the desk; `sand` is the stronger wash for hover.
- **Flat pages.** Depth comes from ground and a 1px hairline. `shadow-xs`, `shadow-sm` and `shadow-card` are defined as none. Shadows are for what leaves the page plane: menus, dialogs, drawers, the hover lift on clickable project cards, and the device mockup. No gradients, no glow, no blurred scrims.
- **Shape.** Buttons, chips, nav items, menu items, the search box and segmented controls are full pills. Inputs and textareas are 8px. Inner panels and menus are 12px. Cards, dialogs and drawers are 20px.
- **Selection is butter, not grey.** Selected nav items, segments and tabs use `accent-tint` with `accent-text` (tabs use an amber underline). Hover uses `sand`.
- **Light or dark, nothing else.** Light is the default; there is no system option. A toggle sits in the app's top bar and the site's nav. In the app the choice is stored in `localStorage` (`reqstudio.settings`); on the site in `reqstudio-theme`. Both are applied on `<html class="dark">` by an inline script before first paint. Dark is a warm charcoal ramp (`#141312` ground, `#1c1b19` cards), never neutral grey.
- **Honest about what is simulated.** Site captures are labelled "Sample project — fictional data" and show the bundled fictional sample project.
- **Motion explains state.** A 2% press scale on buttons, short fades on overlays, a 2px lift on clickable cards. Reduced motion drops all travel.

## Colors

### Accent

- **Butter Amber** (`--rs-primary`, #e8b923): primary button, logo mark, active-tab underline, progress fills.
- **Amber Hover** (`--rs-primary-hover`, #d4a615; dark #f0c94a).
- **Ochre** (`--rs-primary-text` and `--rs-ring`, #826400; dark #f0c94a): accent-coloured text, links, eyebrows, the focus ring and active nav text. The only accent allowed as text.
- **Amber Tint** (`--rs-primary-soft`, #faf4df; dark #2a2410): selected items, soft badges, icon tiles.

### Neutral

- **Desk** (`--rs-surface`, #fcfaf3; dark #181716). On the site this is `secondary`.
- **Sand** (`--rs-muted`, #f8f4e4; dark #262420).
- **Paper** (`--rs-background`, #ffffff; dark #141312) and raised paper / cards (`--rs-surface-raised`, #ffffff; dark #1c1b19).
- **Ink** (`--rs-ink`, #4d4a4d; dark #e6e2da): body text. **Ink Strong** (`--rs-foreground`, #353335; dark #faf8f2): headings and button labels. **Ink Muted** (`--rs-muted-foreground`, #6b6b6b; dark #a8a399).
- **Hairline** (`--rs-border`, #ece5cc; dark #2e2b26). **Hairline Strong** (`--rs-border-strong`, #dccfa6; dark #433e35): menus, outline buttons.
- **Control Border** (`--rs-input`, #8a7f6e; dark #7d7569): field outlines, so boundaries meet 3:1.

### Semantic

`success`, `warning`, `info`, `danger` and their `-soft` grounds are tokens, with dark-mode values chosen for the dark ramp. The danger button is an outline with red text, never solid red.

### Contrast

Ochre text on white is 5.6:1, on desk 5.3:1, on amber tint 5.1:1. Charcoal on the amber fill is 6.8:1. Body ink on white is 8.7:1. Dark-mode ochre on the dark ground is 11.6:1.

### Named Rules

**The One Voice Rule.** Amber is the only accent, and it is a fill. Anything that needs amber as text uses `primary-text`.

**The Token Only Rule.** No literal brand hex in components; use the tokens (`primary`, `surface`, `muted`, `border`…) so dark mode holds. The exceptions are the CSS-built MacBook, the favicon, and the PDF, Word and HTML exports, which carry their own fixed styling.

## Typography

**Display font:** Newsreader (500 only), Georgia fallback, from `@fontsource-variable/newsreader` in the app and `next/font/google` on the site. **Body font:** DM Sans (400, 500, 600).

### Hierarchy

- **Display** (Newsreader 500, 3rem on mobile, 4.5rem from `sm`, line-height 1): the site's hero headline, with one `primary-text` phrase.
- **Headline** (Newsreader 500, 1.875rem to 2.25rem): site section titles. App page titles are Newsreader 500 at `text-2xl`.
- **Title** (DM Sans 600, 1rem): card, dialog and feature titles (h3).
- **Body** (DM Sans 400, 0.875rem): app copy and form text. Site lead paragraphs are 1.125rem in `muted-foreground`. Inputs are `text-base` so mobile never zooms.
- **Label** (DM Sans 600, 0.75rem): badges, meta, eyebrows (uppercase, tracked, in `primary-text`).

### Named Rules

**The One Heading Rule.** Every h1 and h2 looks the same wherever it appears: Newsreader, weight 500. Do not add `font-bold` to a heading; it is overridden.

**The Tabular Numbers Rule.** Scores, percentages and stage numbers get `tabular-nums`.

## Layout

**Site.** Content caps at 1152px (`max-w-6xl`, padding included) with 80px (`py-20`) vertical rhythm. Sections alternate desk and white: hero (desk), product preview (white), features (desk), how it works (white), privacy (desk), FAQ (white), closing call to action (desk). The closing call to action is not an amber band. The nav is a sticky translucent white bar with pill links, the theme toggle and one primary button. The footer is white with a hairline top border: logo left, copyright centred, links right, stacking on mobile. About, Privacy and Terms are their own routes (`/about`, `/privacy`, `/terms`), linked from the footer. Each has the site nav and footer, a Newsreader h1 with an optional badge and description, and a single 20px card on the desk ground, capped at `max-w-3xl`.

**App.** A 56px white top bar (search, save state, theme toggle) over a desk navigation rail (240px, collapsible to 68px) and a white content area. Page content sits in a 1440px container (`rs-page`). The project workspace pins its header and tab bar and scrolls only the active tab.

**Two containers, on purpose.** The site is 1152px; the app is 1440px, because a form-heavy workspace uses the width.

## Elevation & Depth

Flat by default. Surfaces separate by ground and a 1px hairline. Clickable project cards lift on hover: the border strengthens to `hairline-strong`, the card rises 2px and gains a shadow. Menus, dialogs and drawers carry a shadow over a `bg-black/40` scrim with no blur. The MacBook mockup carries a deep soft shadow because it is a picture of a device.

### Named Rules

**The Quiet Elevation Rule.** Rows, badges, inputs and resting cards have no shadow. Lift belongs to hover on clickable cards, menus, dialogs, drawers and the device mockup.

## Shapes

Pills for every button and chip; 8px for fields; 12px for menus and inner panels (the bordered blocks inside a card); 20px for cards, dialogs and site cards. Borders are 1px hairline, dashed only for empty or upload zones. The logo is the ReqStudio hexagon-and-check mark, filled amber, with grey document rules.

## Components

### Buttons

- **Shape:** full pill, 44px tall by default (36px `sm`, 52px `lg`, 36px square `icon`), DM Sans 600, 2% press scale.
- **Primary:** amber fill, charcoal text; hover `primary-hover`. One filled primary per view.
- **Secondary** (the default): card ground with a `hairline-strong` border; hover `sand`. **Subtle:** `sand` fill. **Ghost:** transparent, `sand` hover. **Danger:** outline with red text; hover `danger-soft`. **Link:** `primary-text`.
- **Focus:** 2px outline in `ring` (ochre), offset 2px.

### Inputs and textareas

40px tall (textarea min 96px), 8px radius, card ground, `control-border` outline, `text-base`. Focus turns the border ochre with a 3px ring at 30% opacity. Invalid fields use a `danger` border. The app's global search is the one pill-shaped field.

### Cards

20px radius, card ground, 1px hairline, `p-5` or `p-6`. Clickable project cards stretch the title link over the whole card, carry a menu top right, and lift on hover.

### Badges

Full pills, at least 20px tall, DM Sans 600. Neutral is `sand` with a hairline; primary is `accent-tint` with `accent-text`; plus success, warning, danger, info and outline variants.

### Tabs and segmented controls

Underlined workspace tabs use an amber underline with `primary-text` on the active tab. Segmented controls (theme toggle, layout switch, settings) are a pill track on the desk ground with a hairline and 4px padding; the selected segment is an `accent-tint` pill with `accent-text`.

### Navigation

Rail items are pills: hover `sand` with `foreground` text, active `accent-tint` with `accent-text`. The Collapse button uses the same padding and gap as the nav items so icons and labels share left edges. Site nav links are pills with a `sand` hover.

### Theme toggle

App: a two-option pill segmented control (sun, moon). Site: a 36px pill icon button (moon in light mode, sun in dark) labelled "Toggle light and dark mode"; both icons render and swap with CSS, so there is no flash.

### Device mockup

A CSS-built MacBook (`landing/components/macbook-mockup.tsx`) holding a 16:10 capture of the app's Brief tab. The light capture shows in light mode and the dark one in dark mode, with the caption "Sample project — fictional data". Captures are 2880x1800 PNGs of the fictional sample project at `landing/public/mockups/workspace-light-v2.png` and `workspace-dark-v2.png`. Retake them whenever the app chrome changes and bump the `-v2` suffix so caches refresh. Device colours are fixed, not themed.

## Do's and Don'ts

### Do:

- **Do** use amber as a fill and `primary-text` for accent-coloured text; put charcoal text on amber.
- **Do** use `bg-surface` (desk) for chrome and site bands, raised paper for cards, forms and popovers, and `muted` (sand) for hover.
- **Do** keep every button a pill, every field 8px, every card 20px.
- **Do** make selected states `primary-soft` with `primary-text`, hover `muted`.
- **Do** keep site content inside the 1152px container and app content inside 1440px.
- **Do** retake the mockup captures after changing app chrome.

### Don't:

- **Don't** use amber as text, or white text on an amber fill.
- **Don't** add gradients, glow, blurred scrims, grey selection washes or amber full-width sections.
- **Don't** put a literal brand hex in components, or `font-bold` on a heading.
- **Don't** add a shadow to rows, badges, inputs or resting cards.
- **Don't** make destructive buttons solid red.
- **Don't** offer a "system" theme option, or use neutral grey for dark mode.
- **Don't** invent copy or statistics in the screenshots beyond clearly sample data.
