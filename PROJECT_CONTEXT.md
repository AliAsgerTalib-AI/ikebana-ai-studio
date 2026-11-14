# MaCraft (間 · Craft) — Architecture & State Handoff

## 1. Stack & Deployment
- **Framework:** Next.js (App Router, Client/Server Components), TypeScript, Tailwind CSS, Zustand
- **Hosting:** Vercel (`AliAsgerTalib-AI/ikebana-ai-studio`)
- **AI SDK:** `@google/genai` initialized with `httpOptions: { apiVersion: 'v1beta' }`
  - `gemini-2.5-flash` (Structured JSON mode) for `/api/analyze-inventory` and `/api/critique`
  - `gemini-2.5-flash-image` (`responseModalities: ['IMAGE']`) for `/api/render-preview`

## 2. Screen & File Map
- `app/page.tsx` — Landing screen branded **間 · MaCraft** with clickable `mailto:aliasgertalib@gmail.com` footer.
- `app/inventory/page.tsx` — Step 1: Multi-photo upload/camera with client-side canvas compression (`utils/imageCompression.ts`), ruler-calibrated mm extraction, demo kit preset, and inline tap-to-edit cards (`role`, `name`, `dimensions`, `notes`).
- `app/studio/page.tsx` — Step 2: School Rulebook switcher (`sogetsu` | `ikenobo` | `ohara`), 3-style selector (`moribana-slanted`, `moribana-upright`, `jiyuka-freestyle`), auto-generated Target Reference preview, and `components/TriangleAzimuthSandbox.tsx` (dual Front Elevation + Top Azimuth SVG simulator).
- `app/workbench/page.tsx` — Step 3: Tactile step-by-step execution guide (`Mizukiri` underwater cut specs, `Tameru` hand-warmed bending, zero-kenzan anchor setup).
- `app/critique/page.tsx` — Step 4: Side-by-side **Target Reference vs. Your Build** comparison card + eye-level photo capture with toggleable *Shin–Soe–Hikae* SVG vector overlay and *Hanko* seal score.

## 3. Core Invariants & State (`store/useIkebanaStore.ts`)
- **Zero-Hallucination & Vessel Lock:** `/api/render-preview` receives `uploadedImages` before the text prompt and locks the exact silhouette, material, color, and proportions of the `role === 'vessel'` item.
- **Zero-Kenzan Anchoring:** All blueprints use organic mechanics (`Komidome` forked-twig wedges, `Jūji-dome` cross-splits, river stones, or rim tension).
- **Store Keys:** `uploadedImages`, `inventory`, `arrangements`, `selectedSchool`, `selectedStyleId`, `activeStep` / `activeStepIndex`, `renderedPreviewUrl`.

## 4. Next Planned Milestones
1. Update `app/api/critique/route.ts` and `app/critique/page.tsx` to pass both `renderedPreviewUrl` and `photoPreview` plus `selectedSchool` into Gemini Vision for visual delta scoring.
2. Add Tokonoma lighting/shadow analysis and downloadable Archival Exhibition Plate export on `/critique`.
