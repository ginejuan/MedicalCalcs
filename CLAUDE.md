# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project

MedicalCalcs — a React + TypeScript + Vite single-page app that hosts a small set of evidence-based clinical calculators (three perinatology tools and one endocrinology tool). Public-facing, bilingual (English / Spanish), deployed at MedicalCalcs.com. Author: Prof. Dr. Juan Jesús Fernández Alba.

## Commands

- `npm run dev` — start Vite dev server (HMR)
- `npm run build` — TypeScript project build (`tsc -b`) followed by Vite production build
- `npm run lint` — ESLint over the whole repo
- `npm run preview` — serve the built `dist/` locally

Deployment uses Nixpacks (`nixpacks.toml` pins Node 22 + npm 9). There is no test suite configured.

## Architecture

### Layer separation
The calculators follow a strict three-layer split that must be preserved when adding new calculators:

1. **Pure math/model layer — `src/data/calculators/*Logic.ts` (or `thyroidRisk.ts`)**
   Contains only the published formulas: regression coefficients, reference tables (e.g. INTERGROWTH-21 lookup), normal CDF / inverse CDF implementations, and a `computePercentile` / `calculate*` function that takes a typed input and returns a typed result. **No React, no I18n, no DOM.** Each file has a header comment citing the peer-reviewed source (e.g. Fernández-Alba et al. *Fetal Diagn Ther* 2016; Villar et al. *Lancet* 2014; Carral et al. *Endocr Pract* 2020). Coefficients must stay byte-exact with the published model — don't round or refactor numeric literals.

2. **Presentation layer — `src/pages/*Calculator.tsx`**
   One page component per calculator, wired via `react-router-dom` routes in `src/App.tsx`. Pages own the form state, call the pure logic, and render results + the percentile chart. Keep validation ranges (GA weeks, EFW bounds, etc.) in the page, not in the logic module — the logic module trusts its inputs.

3. **Export layer — `src/utils/pdfExport.ts`**
   All PDF generation with `jsPDF` lives here. Fetal-growth calculators share `drawPDFBase` (percentile box + patient/result rows + chart image + disclaimer). The thyroid report is bespoke (different layout, no percentile chart). PDFs pull the live chart via `document.getElementById('percentile-chart-canvas')` → `canvas.toDataURL` — `PercentileChart` tags its `<canvas>` with that id and a `customCanvasBackgroundColor` plugin so the exported image is opaque white rather than transparent.

### Internationalization
`src/contexts/LanguageContext.tsx` holds a single `translations` object with `en` and `es` keys, plus a `LanguageProvider` / `useLanguage` hook. Default language is `'en'`. `translations` is exported and re-imported by `pdfExport.ts` — adding a translation key used in a PDF requires adding it to **both** language blocks. The thyroid calculator's PDF and UI use inline ternaries (`lang === 'es' ? … : …`) instead of the translations object; follow whichever pattern the sibling calculator uses rather than mixing styles.

### Routing & entry
`src/main.tsx` → `src/App.tsx` mounts `LanguageProvider` → `BrowserRouter`. Routes are declared directly in `App.tsx`. `App.tsx` also performs a client-side redirect from `medicalcalcs.org` → `medicalcalcs.com` preserving path+query — keep that intact.

### UI primitives & design tokens
`src/components/ui/` contains `Badge`, `Card`, `Typography`, and `PercentileChart`. Global CSS custom properties (colors, spacing scale `--space-xs`…`--space-3xl`, radii, transitions) are defined in `src/index.css`; use those tokens rather than hard-coded colors/px. The palette is a dark theme (`--color-bg-main: #0a0e17`) with gold (`--color-accent-gold`) for emphasized italics and green (`--color-accent-green`) for perinatology accents.

### Charts
`PercentileChart` uses `react-chartjs-2` + `chart.js` with five reference curves (p3, p10, p50, p90, p97) plus a single highlighted "current case" point. The chart id `percentile-chart-canvas` is load-bearing for PDF export (see above). For a new calculator that needs a percentile chart, reuse this component and pass precomputed arrays rather than forking the chart.

## Conventions specific to this repo

- **Do not invent new routes or calculator categories silently** — the Home page (`src/pages/Home.tsx`) hard-codes category sections ("Perinatology", "Endocrinology") and the calculator count in a stats strip. Update both when adding a calculator.
- **Bilingual variable names are intentional.** The fetal-growth logic files use Spanish identifiers (`pesoCorr`, `tallaM`, `paridad`, `edad`, `gardosiProp`, `corregirPeso`) that mirror the original published formulas and the legacy HTML calculators in `legacy_html_calculators/`. The thyroid model also uses Spanish-coded coefficient keys (`afcdt_si`, `sex_hombre`, `edad_cuadrado`, `tiroiditis`, `solido`, `hipoecoico`). Do not "anglicize" these — they are the canonical names from the source papers / R models.
- **`legacy_html_calculators/`** holds the original standalone HTML versions (including a Shiny export for the thyroid model). They are reference implementations for verifying numeric parity; don't edit them as part of feature work.
- **Clinical disclaimers** are mandatory on every calculator output and PDF. The `disc_text` translation and the hard-coded thyroid disclaimer in `pdfExport.ts` exist for a reason — don't remove them even if they look boilerplate.
- **License:** CC BY-NC 4.0 (shown on the hero strip). Non-commercial only.
