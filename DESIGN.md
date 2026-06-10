# Design

## Theme

Dark product UI. Scene: a developer's personal workspace at midnight — precision instruments on a matte black desk, one green LED glowing steady. Dark, not moody; focused, not atmospheric.

## Color Strategy

**Committed** — one saturated green primary carries 30–40% of surfaces. Dark bg as the neutral field. Amber accent for file-type differentiation (HTML vs React).

## Palette

```css
--bg:         oklch(0.10 0.000 0);      /* near-black, no hue tint */
--surface:    oklch(0.14 0.005 145);    /* card/panel bg, faint green tint */
--surface-2:  oklch(0.18 0.005 145);    /* hover states */
--border:     oklch(0.22 0.005 145);    /* default borders */
--border-2:   oklch(0.28 0.006 145);    /* stronger dividers */
--primary:    oklch(0.65 0.15 145);     /* green — brand anchor */
--primary-hi: oklch(0.70 0.16 145);     /* hover state of primary */
--accent:     oklch(0.72 0.18 55);      /* amber — HTML tool type */
--ink:        oklch(0.92 0.005 145);    /* primary text */
--ink-2:      oklch(0.75 0.008 145);    /* secondary headings */
--muted:      oklch(0.56 0.008 145);    /* labels, placeholders */
--danger:     oklch(0.62 0.20 25);      /* errors */
```

## Typography

- **Display/Brand**: JetBrains Mono — logo, monospace labels, code, type badges. Tight, technical identity.
- **Body**: Inter — descriptions, body copy, UI labels. Clean, readable at small sizes.
- Scale: 0.65rem (micro badges) → 0.72rem (labels) → 0.82rem (tool descriptions) → 0.9rem (nav, search) → 1rem (card titles) → 1.5rem (logo)

## Components

### ToolCard
- `background: --surface`; `border: 1px solid --border`; `border-radius: 14px`
- Hover: border becomes `--primary` (category-colored), bg steps to `--surface-2`, translateY(-2px)
- Top: type badge (TSX/HTML) + category badge in category color
- Arrow in bottom-right animates right on hover
- Radial gradient glow (category color) fades in on hover via `::before`

### Toolbar (Search + Filter)
- Search: full-width, `--surface` bg, focus ring in `--primary`
- Filter chips: pill shape, active state = primary tint fill + border

### ToolViewer
- React tools: `React.lazy()` wrapped in `<Suspense>`
- HTML tools: `<iframe sandbox="allow-scripts allow-forms allow-modals">`

### ToolPage Nav
- Sticky top bar, `--surface` bg, tool name breadcrumb
- Fullscreen button opens `position: fixed` shell with escape button

## Layout

- Gallery: `repeat(auto-fill, minmax(280px, 1fr))` grid
- Max content width: 1100px
- Page padding: 48px top, 24px horizontal
- Card gap: 12px

## Motion

- Card hover: `transition: border-color 0.2s, background 0.2s, transform 0.2s`
- Arrow: `transition: color 0.2s, transform 0.2s`
- Glow overlay: `transition: opacity 0.25s`
- All reduced-motion: instant via `prefers-reduced-motion`

## Signature Element

The radial green glow that bleeds into each card from the top-left corner on hover — visible only when the user's cursor is on the card, it makes the grid feel alive without any particle effects or ambient animation.
