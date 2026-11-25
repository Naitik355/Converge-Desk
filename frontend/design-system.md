# SyncSpace Studio — Unified Design System

> Version 1.0 · Derived from the Notion Light, ClickUp Workspace and Linear Dark System references.
> This is the single source of truth for the SyncSpace frontend. It replaces the previous
> "ConvergeDesk / terminal-brutalist" surface entirely.

---

## 1. Design Reference Analysis

| Dimension | Notion Light | ClickUp Workspace | Linear Dark System | Decision for SyncSpace |
|---|---|---|---|---|
| Core personality | Editorial, calm, premium | Energetic, dense, productivity-first | Precise, technical, restrained | **Calm editorial shell with efficient, precise product surfaces.** Marketing breathes; the app is dense but composed. |
| Canvas | Pure white | White + `#F7F7F7` muted | Near-black `#08090A` | Warm paper `#F5F4EF` canvas, white surfaces in light mode; near-black tonal stack in dark mode. |
| Primary action | Brand blue `#005BAB` | Charcoal `#202020` | Inverse light `#E5E5E6` | **Ink primary button** (charcoal on light, near-white on dark). One primary action per view. |
| Brand accent | Blue | Electric violet `#5F55EE` | Violet `#7170FF` | **Electric violet** is the singular brand accent. Blue is demoted to informational/link only. |
| Status colors | Sparse red | Green / orange / red | Green / yellow / red | ClickUp's semantic hues, tuned for contrast in both themes. |
| Headings | NotionInter 600, very tight | Plus Jakarta Sans 650–700 | Inter 510, tight | **Plus Jakarta Sans 600/700, tight tracking.** Display sizes are dramatic on marketing, compact in-product. |
| Body | 14/16 px, comfortable | Inter 16–22 px | Inter 13–16 px, dense | **Inter.** 16 px marketing body, 14 px app body, 13 px dense metadata. |
| Mono | — | Sometype Mono (specialty) | Berkeley Mono | **JetBrains Mono** for code, IDs, room codes, technical metadata (already in stack). |
| Radius | 8 / 12 / full | 15 / 12 / full | 9 / 12 / full | **Controls 10 px, cards 14 px, panels 18 px, pills full.** |
| Elevation | Borders only | Hairlines, almost flat | Tonal layering + faint borders | **Borders and tonal layering first; shadows only for floating menus/dialogs.** |
| Density | Airy marketing | Dense app tables | Dense rail + pane + metadata column | **Airy marketing, compact app.** Sidebar rail + central pane + contextual right rail. |
| Navigation | Minimal top bar | Dark sidebar, icon-led | Persistent left rail, quiet items | Icon-led left rail with section eyebrows, violet active marker, utility footer. |
| Inputs | 8 px, 10/12 padding | Pill, 36 px | Pill, 44 px, raised surface | **10 px radius in forms; pill geometry reserved for search, filter chips and command bar.** |
| Motion | Subtle | Subtle | Restrained | 120–180 ms ease-out; no bounce, no decorative parallax. |

### Conflict resolutions (deliberate, not averaged)

1. **Primary color conflict** — Notion uses blue, ClickUp uses charcoal, Linear uses an inverse light pill.
   Resolution: `ink` is the primary action in both themes; `violet` identifies brand/active/navigation;
   `blue` is reserved for links and informational callouts. This preserves Linear's contrast-led CTA,
   ClickUp's serious charcoal, and keeps Notion's blue meaningful instead of competing.
2. **Radius conflict** — Notion's 8 px controls vs ClickUp's 15 px vs Linear's full-round CTAs.
   Resolution: 10 px form controls, 14 px content cards, 18 px feature panels, full-round only for chips,
   badges, search fields and compact filter pills. Marketing CTAs are full-round (Linear),
   in-app buttons are 10 px (Notion) so dense toolbars stay aligned.
3. **Type conflict** — three near-identical sans stacks. Resolution: one display face
   (Plus Jakarta Sans) for headings, nav, labels and numbers; Inter for reading; JetBrains Mono for
   technical values. Drop the editorial serif and Sometype Mono: they would create two personalities.
4. **Dark vs light** — rather than two products, the dark theme is a tonal inversion of exactly the same
   geometry, type and component anatomy (Linear surfaces, violet accent, ink-inverted primary button).
5. **Density** — Notion's generous whitespace is preserved on marketing and page headers; the workspace
   itself follows ClickUp/Linear density with 32–40 px rows and 12–16 px card padding.

---

## 2. Color Tokens

Semantic tokens only — components never use raw hex values.

### Light (default)
| Token | Value | Usage |
|---|---|---|
| `--canvas` | `#F5F4EF` | App + marketing page background |
| `--surface` | `#FFFFFF` | Panels, cards, dialogs |
| `--surface-raised` | `#FBFAF7` | Nested blocks, muted cards |
| `--surface-inset` | `#F0EFEA` | Wells, code blocks, empty states |
| `--surface-hover` | `#F2F1EC` | Row/item hover |
| `--text-primary` | `#17181C` | Headings, body emphasis |
| `--text-secondary` | `#484B52` | Body copy |
| `--text-muted` | `#73767D` | Metadata, captions |
| `--border-subtle` | `#E3E1DA` | Card and table hairlines |
| `--border-strong` | `#CFCCC2` | Hover borders, dividers with intent |
| `--accent` | `#5F55EE` | Active nav, brand mark, focus ring |
| `--accent-strong` | `#4B41D9` | Accent hover |
| `--accent-soft` | `#ECEAFE` | Active nav fill, badge fill |
| `--ink` / `--ink-hover` | `#17181C` / `#2B2D33` | Primary button |
| `--on-ink` | `#FFFFFF` | Primary button label |
| `--info` | `#005BAB` | Links, informational callouts |
| `--success` | `#1F9D5B` | Done, connected |
| `--warning` | `#B87410` | In progress, due soon |
| `--error` | `#C93B3B` | Destructive, validation |

### Dark
`--canvas #0A0B0D`, `--surface #101113`, `--surface-raised #16181B`, `--surface-inset #0C0D0F`,
`--surface-hover #1C1E22`, text `#F4F4F2 / #C3C7CC / #8F959C`, borders `rgba(255,255,255,.08/.16)`,
accent `#8B8AFF` with soft fill `rgba(113,112,255,.16)`, primary button becomes
`#F4F4F2` with `#0A0B0D` label (Linear's inverse CTA), success `#46D98A`, warning `#FFC53D`, error `#FF7373`.

### Usage rules
- Violet never fills large areas; it marks state and identity.
- Max one ink primary button per view or panel header.
- Status color appears as a dot, 1 px border and soft tint — never as a saturated block.
- WCAG AA: body text ≥ 4.5:1; large display ≥ 3:1; focus ring 2 px `--accent` with 2 px offset.

---

## 3. Typography

| Role | Family | Size / line-height | Weight | Tracking |
|---|---|---|---|---|
| Display XL (marketing hero) | Plus Jakarta Sans | `clamp(44px, 7vw, 76px)` / 1.02 | 700 | -0.04em |
| Display L (page hero) | Plus Jakarta Sans | `clamp(34px, 4.6vw, 52px)` / 1.06 | 700 | -0.035em |
| Display M (section) | Plus Jakarta Sans | 32 px / 1.15 | 650–700 | -0.03em |
| Display S | Plus Jakarta Sans | 22 px / 1.25 | 600 | -0.02em |
| Body L | Inter | 17 px / 1.65 | 400 | -0.01em |
| Body | Inter | 14 px / 1.55 | 400 | -0.005em |
| Body S | Inter | 13 px / 1.5 | 400 | 0 |
| Label | Plus Jakarta Sans | 13 px / 1.4 | 600 | 0 |
| Eyebrow | Plus Jakarta Sans | 11 px / 1.2 | 700 | 0.12em, uppercase |
| Caption | Inter | 12 px / 1.45 | 400 | 0 |
| Numeric display | Plus Jakarta Sans | 30 px / 1 | 700 | -0.03em |
| Code / meta | JetBrains Mono | 12–13 px / 1.6 | 400–500 | 0 |

Rules: sentence case everywhere except eyebrows. Headings are tight, body is not. Never use uppercase
for buttons, nav or table headers longer than two words. Numerals in stat tiles use tabular figures.

---

## 4. Spacing, Layout & Geometry

- Spacing scale: **4, 8, 12, 16, 20, 24, 32, 40, 48, 64, 80, 96, 120**.
- App shell: `264px` sidebar (rail `76px` collapsed), `64px` top bar, content max-width `1440px`,
  page padding `24px` mobile / `32–40px` desktop.
- Marketing container: `1120px`, gutters `24px`, section rhythm `96–120px`.
- Dashboard composition: 12-column grid, main pane 8 cols, contextual rail 4 cols; stat strip 4 × 3 cols.
- Grid gaps: `16px` compact cards, `24px` sections.
- Radius: `--radius-control 10px`, `--radius-card 14px`, `--radius-panel 18px`, `--radius-pill 999px`.
- Border: always 1 px hairline. Focus: 2 px accent outline, 2 px offset.
- Elevation: `--shadow-sm` for sticky chrome, `--shadow-menu` for popovers/dialogs only.
- Content blocks use a **panel** anatomy: 1 px border, optional tinted header strip with 11 px eyebrow,
  body padding 20–24 px. No decorative gradients inside the workspace; a single soft radial tint is
  allowed behind marketing hero and auth art.

Responsive:
- `≥1280px` full rail + rail metadata panel.
- `1024–1279px` collapsed rail labels hidden at `md`.
- `<1024px` contextual rail stacks below main content.
- `<768px` sidebar becomes a drawer; toolbars wrap; board columns scroll horizontally instead of stacking.
- `<640px` page padding 16 px; hero display 40 px; tables become stacked rows.

---

## 5. Component Specifications

### Buttons
- **Primary** — ink fill, `--on-ink` label, 10 px radius, 38 px (md) / 32 px (sm) / 46 px (lg), 12 px 16 px
  padding, weight 600, subtle 1 px inner highlight in dark mode. Hover: `--ink-hover`.
- **Accent** — violet fill + white text; only for product-defining CTAs (e.g. "Start building").
- **Secondary** — `--surface-raised` fill, strong hairline, primary text.
- **Outline** — transparent with hairline; hover fills `--surface-hover`.
- **Ghost** — no border; muted text until hover.
- **Danger** — error fill only in destructive confirmations.
- All: `active:translateY(0.5px)`, disabled 45 % opacity without layout shift, visible focus ring.

### Fields
Height 38–42 px, 10 px radius, `--surface` fill, hairline border, 13 px Inter text, label 12 px 600.
Focus: accent border + 3 px soft accent ring. Error: error border + 12 px message. Search fields are
pill-shaped with a leading icon and optional `⌘K` hint.

### Cards & panels
White surface, 1 px hairline, 14 px radius, 20 px padding, no default shadow. Hover raises only the
border tone (project/board cards may lift 1 px). Feature panels are 18 px radius with an inset header row.

### Chips, badges, status pills
Full-round, 11–12 px, weight 600, 4 px 8–10 px padding. Neutral chips use `--surface-inset` and muted
text. Status: soft tint + dot + readable tinted text. Priority: high = error, medium = warning, low = neutral.

### Navigation
Sidebar: brand lockup with 8 px violet mark; section eyebrows; 36 px nav rows with 16 px icons,
10 px radius; active row = `--accent-soft` fill, accent text, 2 px left marker. Footer holds
workspace switcher/user card and a "new project" affordance.
Top bar: 64 px, canvas-tinted blur, breadcrumb + page title, centered pill search, right-side
utility cluster. Menus: 12 px radius, `--shadow-menu`, 6 px padding, 32 px rows.

### Tabs & segmented controls
Two forms: inline underline tabs (project sections) with 2 px accent underline and count chips;
segmented pill controls for view switching (Board / List), background `--surface-inset`, selected
segment = surface + hairline + subtle shadow.

### Tables & lists
Header 11 px eyebrow on inset strip; rows 44–48 px; hairline dividers; hover tint; primary cell 13 px 600;
metadata muted 12 px. Row actions reveal on hover but remain focus-accessible.

### Kanban
Columns are inset wells (`--surface-inset`, 14 px radius, 12 px padding) on the canvas, not cards on cards.
Column header: status dot, 12 px label, count pill. Task cards white, 12 px radius, 12 px padding,
priority chip, 2-line title clamp, footer with date and assignee initials. Empty column shows a dashed
drop hint, never a large empty card.

### Dialogs / modals
Centered, max-width per size, 18 px radius, `--shadow-menu`, canvas scrim `rgba(10,11,13,.55)` with 2 px
blur. Header 16 px 650 title + 12 px description, hairline divider, 20–24 px body, footer on inset strip.
Mobile: full-width sheet anchored to bottom.

### Empty & loading states
Empty: dashed hairline inset block, 40 px icon tile, 15 px title, 13 px explanation, one action.
Loading: skeleton blocks in `--surface-inset` with shimmer; never spinners for page-level loads.

### Code workspace
Full-bleed IDE: 48 px activity strip, 232 px explorer, tab bar 36 px, Monaco, bottom output drawer,
status bar 26 px with language, encoding, sync state. Surfaces use dark chrome in both themes
(professional IDE is intentionally dark, Linear-derived).

### Whiteboard
Full-bleed canvas frame with 48 px contextual toolbar, floating zoom controls, presence pill,
full-screen mode. The canvas itself stays white (drawing surface), framing uses system chrome.

---

## 6. Interaction Patterns

- Hover: border tone, surface shift or 1 px lift — 140 ms.
- Focus-visible: 2 px accent ring on every interactive element, including custom cards and menu items.
- Active nav and selected segments persist through fill + weight, not color alone.
- Destructive actions always confirm in a dialog naming the entity.
- Toasts appear bottom-right, 12 px radius, hairline, icon + title + description.
- Keyboard: Escape closes drawer/dialog; ⌘K opens search; all menus dismiss on outside click.
- Motion: 120–180 ms `cubic-bezier(.2,.8,.2,1)`; respect `prefers-reduced-motion`.

---

## 7. Contribution Map

| Reference | Contributed |
|---|---|
| **Notion Light** | Editorial whitespace, black-on-white contrast, tight display tracking, hairline-over-shadow containers, 8/12 px geometry, quiet badges, link typography, "one blue action" restraint (retargeted to ink + violet). |
| **ClickUp Workspace** | Warm neutral canvas, Plus Jakarta Sans personality, electric violet accent, semantic greens/oranges/reds, pill chips and status pills, dense productivity tables, friendly 12–15 px rounding, icon-led sidebar rows. |
| **Linear Dark System** | Compact app chrome, tonal surface layering, left-rail + pane + right-rail composition, inverse pill primary button in dark mode, mono metadata, segmented/toolbar outline language, focus and hover restraint, IDE-grade density. |

---

## 8. Quality Checklist

- [ ] No component uses raw Tailwind palette colors (`slate-*`, `emerald-*`, `rose-*`) for theme surfaces.
- [ ] One primary button per view; violet only for state/identity.
- [ ] Every page shares header anatomy: eyebrow → display heading → description → actions.
- [ ] Cards are hairline-bordered, 14 px radius, 20 px padding.
- [ ] Boards are inset wells; task cards are the only raised elements.
- [ ] All routes usable at 375 px, 768 px, 1024 px and 1440 px.
- [ ] Focus rings visible; dialogs close on Escape; menus close on outside click.
- [ ] Marketing uses display type ≥44 px and 96 px section rhythm; app never does.
