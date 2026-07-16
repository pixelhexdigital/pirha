---
name: Pirha
description: Run your entire restaurant from one simple system.
colors:
  pirha-magenta: "#EA2A88"
  pirha-magenta-hover: "#EC3F94"
  deep-indigo: "#090B53"
  warm-white: "#FAF9F9"
  ink: "#020817"
  surface: "#FFFFFF"
  muted-wash: "#F1F5F9"
  slate: "#64748B"
  hairline: "#E2E8F0"
  destructive: "#EF4444"
  success: "#22C55E"
  warning: "#F59E0B"
  info: "#3B82F6"
  night: "#040525"
  night-surface: "#080A30"
typography:
  display:
    fontFamily: "ui-sans-serif, system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif"
    fontSize: "3.75rem"
    fontWeight: 700
    lineHeight: 1
    letterSpacing: "-0.025em"
  headline:
    fontFamily: "ui-sans-serif, system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif"
    fontSize: "2.25rem"
    fontWeight: 700
    lineHeight: 1.1
    letterSpacing: "-0.045em"
  title:
    fontFamily: "ui-sans-serif, system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif"
    fontSize: "1.5rem"
    fontWeight: 600
    lineHeight: 1.2
    letterSpacing: "-0.03em"
  body:
    fontFamily: "ui-sans-serif, system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif"
    fontSize: "1.0625rem"
    fontWeight: 400
    lineHeight: 1.5
    letterSpacing: "-0.01em"
  label:
    fontFamily: "ui-sans-serif, system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif"
    fontSize: "0.875rem"
    fontWeight: 500
    lineHeight: 1.5
    letterSpacing: "-0.02em"
  caption:
    fontFamily: "ui-sans-serif, system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif"
    fontSize: "0.75rem"
    fontWeight: 500
    lineHeight: 1.33
    letterSpacing: "-0.03em"
rounded:
  sm: "4px"
  md: "6px"
  lg: "8px"
  xl: "12px"
  full: "9999px"
spacing:
  xs: "4px"
  sm: "8px"
  md: "16px"
  lg: "24px"
  xl: "32px"
components:
  button-primary:
    backgroundColor: "{colors.pirha-magenta}"
    textColor: "{colors.surface}"
    rounded: "{rounded.md}"
    padding: "8px 16px"
    height: "36px"
  button-primary-hover:
    backgroundColor: "{colors.pirha-magenta-hover}"
    textColor: "{colors.surface}"
  button-secondary:
    backgroundColor: "{colors.deep-indigo}"
    textColor: "{colors.surface}"
    rounded: "{rounded.md}"
    padding: "8px 16px"
    height: "36px"
  button-outline:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.ink}"
    rounded: "{rounded.md}"
    padding: "8px 16px"
    height: "36px"
  input:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.ink}"
    rounded: "{rounded.md}"
    padding: "4px 12px"
    height: "40px"
  badge:
    backgroundColor: "{colors.pirha-magenta}"
    textColor: "{colors.surface}"
    rounded: "{rounded.md}"
    padding: "2px 10px"
  card:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.ink}"
    rounded: "{rounded.xl}"
    padding: "24px"
---

# Design System: Pirha

## 1. Overview

**Creative North Star: "The Open Kitchen"**

Pirha is a restaurant service-operations tool, and its interface is built like an open kitchen: everything that matters is visible at a glance, nothing important hides behind clutter, and the tone stays human even at full tempo. Staff — managers, servers, cashiers, kitchen operators — reach for this system mid-service, under time pressure, to move orders through faster and with fewer mistakes. The design's job is to disappear into that work. Warmth lives in one confident magenta and generous, legible type; clarity comes from restraint everywhere else.

This system explicitly rejects the **generic SaaS dashboard with heavy card clutter**. Surfaces are calm and operational, not busy. Color is earned, not sprayed: the Pirha Magenta appears only where a service-moving action or a live status needs to be found instantly. A cool slate neutral scale carries structure; a deep indigo anchors the brand and powers the whole dark theme. Depth is quiet — soft shadows and hairline borders, never drama.

The look is familiar on purpose. A cashier who knows Stripe, a manager who knows Notion, should sit down and trust every control on first contact. Earned familiarity beats novelty; the same button means the same thing on every screen.

**Key Characteristics:**
- Single magenta accent reserved for primary actions and live status — never decoration.
- Cool slate neutrals for structure; deep indigo for brand anchor and dark-mode ground.
- Full light + dark theme, class-toggled, brand-consistent across both.
- System sans at a fixed rem scale — no display fonts, no fluid headings in the UI.
- Soft-layered depth: gentle shadows + hairline borders, calm at rest.
- Semantic status vocabulary (success / warning / info / destructive) with a signature dotted badge.

## 2. Colors

A cool, structural neutral palette lit by one warm magenta, grounded by a deep indigo that becomes the entire dark theme. Tokens are defined as HSL CSS custom properties on `:root` / `.dark` (shadcn convention); the hex values in the frontmatter are their sRGB equivalents.

### Primary
- **Pirha Magenta** (#EA2A88 · `hsl(330.6 82.1% 54.1%)`): The brand's one loud voice. Primary buttons, active nav state, focus rings in dark mode, links, and the Spinner. Identical in light and dark themes so the brand never shifts. This is the color a hand reaches for; it must stay rare enough to stay findable.

### Secondary
- **Deep Indigo** (#090B53 · `hsl(238 80% 18%)`): The brand anchor. Secondary buttons and, more importantly, the seed of the entire dark theme — the dark background (#040525), cards, borders, and accents are all tints of this hue. Warm-neutral by contrast with the cool slate scale.

### Neutral
- **Warm White** (#FAF9F9 · `hsl(0 11% 98%)`): The light-mode body background. A barely-warm off-white, not a cool gray — the one place warmth enters the neutrals.
- **Surface** (#FFFFFF): Cards, popovers, inputs, and raised panels in light mode. One step brighter than the body so containers read without heavy borders.
- **Ink** (#020817 · `hsl(222.2 84% 4.9%)`): Primary text and headings in light mode. Near-black slate; carries the reading load.
- **Slate** (#64748B · `hsl(215.4 16.3% 46.9%)`): Muted/secondary text, captions, placeholders, inactive icons. Meets 4.5:1 on white and warm-white; do not push muted text lighter than this.
- **Muted Wash** (#F1F5F9 · `hsl(210 40% 96.1%)`): Hover fills, ghost-button backgrounds, table zebra, disabled surfaces.
- **Hairline** (#E2E8F0 · `hsl(214.3 31.8% 91.4%)`): Borders, dividers, input strokes. The quiet structural line that replaces heavy card shadows.
- **Night** (#040525 · `hsl(238 80% 8%)`) / **Night Surface** (#080A30 · `hsl(238 70% 11%)`): Dark-mode body and card grounds — deep indigo, never neutral black.

### Semantic
- **Success** (#22C55E · `hsl(142 71% 45%)`): "Ready" status, confirmations, positive deltas.
- **Warning** (#F59E0B · `hsl(38 92% 50%)`): "Preparing" status, cautions.
- **Info** (#3B82F6 · `hsl(217 91% 60%)`): "New" status, neutral informational accents.
- **Destructive** (#EF4444 · `hsl(0 84.2% 60.2%)`): "Cancelled" status, delete actions, errors.

### Named Rules
**The One Loud Voice Rule.** Pirha Magenta is used on ≤10% of any screen — primary action and live status only. If two magenta things compete for the eye on one view, one of them is wrong. Its rarity is what makes a service-moving action instant to find.

**The Indigo-Not-Black Rule.** Dark mode is grounded in deep indigo (#040525), never in neutral black or gray. The brand hue must survive the theme flip.

**The Tinted-Status Rule.** Status colors appear as a `/10` background + solid text + `/20` border trio (never full-saturation fills), so many live statuses can share a dense view without shouting over each other.

## 3. Typography

**Display / Body / Label Font:** One family — the native system sans stack (`ui-sans-serif, system-ui, -apple-system, "Segoe UI", Roboto, …`). No web font is loaded; type renders instantly at the user's native DPI, which matters for a tool opened dozens of times a shift.

**Character:** Neutral, legible, operational. A single well-tuned sans carries headings, buttons, labels, body, and dense data. Personality comes from weight and tight tracking on headings, not from a second typeface.

### Hierarchy
Fixed rem scale (never fluid `clamp()` in the UI), tightened with negative letter-spacing as size grows. Exposed as `.h1`–`.h6` and `.body*` / `.base*` / `.caption*` component classes.

- **Display** (700, 3.75rem / `text-6xl`, line-height 1, -0.025em): `.h1` — the largest heading, page titles and marketing-adjacent surfaces. Ceiling of the scale.
- **Headline** (700, 2.25rem / `text-4xl`, -0.045em): `.h3` — section headings inside app pages.
- **Title** (600, 1.5rem / `text-2xl`, -0.03em): `.h5` — card titles, panel headers, modal titles.
- **Body** (400–500, 1.0625rem / `.body2`, line-height 1.5, -0.01em): Default reading text. Cap prose at 65–75ch; dense tables and data may run wider.
- **Label** (500, 0.875rem / `.base2`, -0.02em): The UI workhorse — buttons, form labels, table cells, nav. Drops to 0.8rem below `sm`.
- **Caption** (500, 0.75rem / `.caption1`, -0.03em): Metadata, timestamps, helper text, badge text.

### Named Rules
**The System-Sans Rule.** No display or decorative fonts anywhere in the product UI. Labels, buttons, and data are the system sans in a heavier weight — never a serif or script for "flavor."

**The Fixed-Scale Rule.** Headings use fixed rem steps, not viewport-fluid `clamp()`. A title that shrinks inside a sidebar looks broken, not responsive.

## 4. Elevation

Soft-layered. Depth is real but quiet: gentle shadows lift interactive and raised surfaces while hairline borders (#E2E8F0) define their edges. The two work together — a card is both faintly shadowed and outlined — which keeps containers legible without the heavy drop-shadow stacking that makes an interface feel like a 2014 app. Dark mode leans harder on indigo borders and tonal separation than on shadow, since shadows read weakly on the deep ground.

### Shadow Vocabulary
- **Resting** (`box-shadow: 0 1px 2px 0 rgb(0 0 0 / 0.05)` — Tailwind `shadow-sm`): Inputs and secondary controls at rest.
- **Raised** (`box-shadow: 0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)` — Tailwind `shadow`): Cards, primary buttons, popovers.
- **Ring** (`shadow` + `ring-2 ring-border/50` — custom `.shadow-ring` / `.shadow-ring-lg`): Emphasis for selected or focused containers, pairing a soft shadow with a translucent border ring.

### Named Rules
**The Border-Carries-Structure Rule.** A hairline border, not a deep shadow, is the primary way surfaces are separated. Shadows stay in the 0.05–0.10 alpha range; if a shadow is visible as gray haze, it is too dark.

## 5. Components

The component layer is shadcn/ui (new-york) over Radix primitives, themed entirely through the CSS-variable tokens above. The feel is **calm and operational**: predictable, unfussy controls built for fast repeated use, one consistent vocabulary across every screen.

### Buttons
- **Shape:** Gently rounded (`rounded-md`, 6px). Default height 36px (`h-9`), `px-4 py-2`; `sm` 32px, `lg` 40px, `icon` 36×36.
- **Primary:** Pirha Magenta fill, white text, soft `shadow`. Hover drops to 90% opacity. The single highest-emphasis action per view.
- **Secondary:** Deep Indigo fill, white text, `shadow-sm`; hover 80% opacity.
- **Outline:** Surface background, hairline border, ink text; hover fills with Muted Wash.
- **Ghost / Link:** No fill until hover (Muted Wash); Link variant is magenta with underline-on-hover.
- **Focus:** `focus-visible:ring-1 ring-ring`. Disabled: 50% opacity, pointer-events off.

### Badges & Status
- **Badge:** `rounded-md`, `px-2.5 py-0.5`, `text-xs font-semibold`. Variants: primary (magenta), secondary (indigo), destructive, outline.
- **Status Badge (signature):** A colored dot + tinted pill encoding order lifecycle: **new** → info, **preparing** → warning, **ready** → success, **served** → purple, **billed** → indigo, **cancelled** → destructive. Each renders as `bg-{color}/10 text-{color} border-{color}/20` with a `size-1.5` leading dot. This is the primary at-a-glance status language of the app.

### Cards / Containers
- **Corner Style:** `rounded-xl` (12px) — softer than controls, so containers read as surfaces, not buttons.
- **Background:** Surface (#FFFFFF light / Night Surface dark).
- **Elevation:** Soft `shadow` + hairline border (see Elevation).
- **Internal Padding:** 24px (`p-6`); header/content/footer share the rhythm.

### Inputs / Fields
- **Style:** 40px tall (`h-10`), `rounded-md`, hairline border, transparent/surface background, `shadow-sm`.
- **Focus:** `focus-visible:ring-1 ring-ring` — a quiet 1px ring, not a glow.
- **Placeholder:** Slate (#64748B) — meets contrast; never lighter.
- **Disabled:** `cursor-not-allowed`, 50% opacity.

### Navigation (LeftSidebar, signature)
- **Style:** Vertical rail. Active items use a rounded-pill fill; collapsed state swaps labels for shadcn Tooltips.
- **States:** Active pill (magenta-tinted), hover (Muted Wash), default (transparent). Consistent icon style (Lucide) throughout.

### Feedback
- **Spinner (signature):** SVG dual-arc spinner in Pirha Magenta (`animate-spin`), sizes `sm`/`default`/`lg`, plus a `ButtonSpinner` for inline button-loading. Prefer **Skeleton** placeholders over spinners for content loading; reserve the spinner for actions and buttons.

## 6. Do's and Don'ts

### Do:
- **Do** reserve Pirha Magenta (#EA2A88) for primary actions and live status only — the One Loud Voice Rule (≤10% of any screen).
- **Do** ground dark mode in deep indigo (#040525 / #080A30), never neutral black.
- **Do** render statuses with the tinted `/10` bg + solid text + `/20` border trio and a leading dot.
- **Do** use the fixed rem type scale and the system sans in a heavier weight for emphasis.
- **Do** convey depth with soft shadows (0.05–0.10 alpha) plus hairline #E2E8F0 borders.
- **Do** give every interactive control its full state set: default, hover, focus-visible ring, active, disabled, loading (skeleton or spinner).
- **Do** keep muted text at Slate (#64748B) or darker so it clears 4.5:1.

### Don't:
- **Don't** build the **generic SaaS dashboard with heavy card clutter** (PRODUCT.md's stated anti-reference) — no nested cards, no card for every stat, no decorative panels.
- **Don't** spray the magenta as decoration, gradient, or on inactive states; it loses its job as the findable action color.
- **Don't** introduce a display or script typeface for "flavor" in UI labels, buttons, or data — System-Sans Rule.
- **Don't** use fluid `clamp()` headings in the app UI; a heading that shrinks in a sidebar looks broken.
- **Don't** stack heavy drop shadows; if a shadow reads as visible gray haze it is too dark (2014-app tell).
- **Don't** use `border-left`/`border-right` greater than 1px as a colored accent stripe on cards, alerts, or list items.
- **Don't** lean on modals as the first answer; exhaust inline and progressive alternatives — staff are mid-task.
- **Don't** let placeholder or muted text drift lighter than Slate; light-gray-for-elegance fails contrast under service lighting.
