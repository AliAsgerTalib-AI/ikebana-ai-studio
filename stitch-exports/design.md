# Design System: Washi & Moss (和紙と苔)

## 1. Visual Identity & Brand Direction
An artisanal, serene, and tactile mobile experience inspired by traditional Japanese papercraft (Washi) and natural aesthetics. It balances editorial craftsmanship with high-precision modern metrics and legible mobile interaction patterns.

---

## 2. Color Palette & Design Tokens

| Token Name | Hex Value | Semantic Role & Inspiration |
| :--- | :--- | :--- |
| `--surface-base` | `#F8F7F4` | **Warm Washi Paper** — Tactile, organic background ground |
| `--surface-card` | `#FFFFFF` | **Pure Card Elevation** — Crisp white for modular cards & bottom sheets |
| `--border-hairline` | `#E6E2DB` | **Hairline Border** — Subtle dividers, outlines, and structural frames |
| `--text-primary` | `#1A1B19` | **Sumi Ink** — Deep mineral black for legible, high-contrast text |
| `--text-muted` | `#6F716B` | **Muted Earth** — Subdued neutral for secondary copy, captions & hints |
| `--accent-primary` | `#3E5343` | **Moss Green (Koke)** — Grounded organic green for primary actions & active states |
| `--accent-alert` | `#BD4B37` | **Vermilion (Shurui Red)** — Dynamic caliper/warning marker & accent highlights |

---

## 3. Typography Scale & Pairings

- **Editorial Headings**: `Playfair Display` or `Noto Serif JP` (Serif)
  - **Display / H1**: `32px` | Weight: `600` | Line Height: `1.25` | Tracking: `-0.01em`
  - **Section / H2**: `24px` | Weight: `600` | Line Height: `1.3`
  - **Subheading / H3**: `19px` | Weight: `500` | Line Height: `1.35`
- **Body & Numerical Metrics**: `Inter`, system-ui (Sans-Serif)
  - **Body Regular**: `15px` | Weight: `400` | Line Height: `1.5` (`#1A1B19`)
  - **Body Secondary**: `13px` | Weight: `400` | Line Height: `1.4` (`#6F716B`)
  - **Metrics / Data**: `20px - 28px` | Weight: `600` | Tabular numbers
  - **Micro Badges**: `11px` | Weight: `600` | Uppercase | Letter spacing `+0.05em`

---

## 4. Geometry, Elevation & Visual Tokens

- **Card Radius**: `rounded-2xl` (`16px - 20px`) for elevated card surfaces, list items, and modal dialogs.
- **Controls & Pills**: `rounded-full` (`9999px`) for CTA buttons, status tags, toggle chips, and input fields.
- **Shadows**: `shadow-sm` (`0 1px 3px 0 rgba(26, 27, 25, 0.04)`). Visual separation relies primarily on `#E6E2DB` 1px hairline borders rather than heavy drop shadows.

---

## 5. Viewport & Interaction Standards

- **Screen Dimensions**: Mobile portrait standard `390px × 844px`.
- **Touch Target Accessibility**: Minimum interactive target area $\ge 48\text{px} \times 48\text{px}$.
- **Screen Margins**: `16px` to `20px` lateral padding with clean vertical rhythm (`12px`, `16px`, `24px`, `32px`).
