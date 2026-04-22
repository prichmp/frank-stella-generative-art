# Frank Stella — Interactive Static Website Plan

A static site that replicates signature Frank Stella works by rendering them procedurally to HTML `<canvas>` elements. Each piece exposes a set of controls (colors, line counts, angles, etc.) that update the canvas in real time. Built with Vite + React + TypeScript, deployed as static assets (no backend, no runtime data).

## Goals

- Faithfully reproduce the geometry and palette of several Stella series.
- Each piece is rendered from code — resolution-independent, resizable, crisp on any display.
- Each piece has a **controls panel** so the user can tweak parameters and see the canvas redraw immediately.
- A gallery-style single page that scrolls through works, with a caption and controls per piece.
- Zero runtime dependencies beyond React + Vite; ship a small static build.

## Works to replicate

Focus on the series that translate cleanly to 2D canvas geometry. Each lists its tweakable parameters.

1. **Black Paintings (1958–60)** — mirrored nested rectangular bands with thin unpainted pinstripes.
   - Controls: band count, band thickness, pinstripe thickness, band color, background color, symmetry mode (mirrored / concentric / nested-V).
2. **Concentric Squares (1960s/70s)** — nested squares as flat color bands separated by thin unpainted gaps.
   - Controls: band count, band width, gap width, two palette pickers (warm/cool) or a full palette editor, rotation angle.
3. **Protractor Series (1967–71)** — interlocking arcs; tiled protractor shapes in a rectangular field.
   - Controls: arc count, arc thickness, start/end angle of the fan, palette (ordered color list), tile layout (1×1 / 2×1 / 2×2), frame shape per tile (semicircle / full circle). The "overlapping fans" variants are scoped to single-tile studies; multi-fan compositions like *Harran II* require the tiling control for fidelity.
4. **Irregular Polygons (1966)** — flat color fields on a shaped canvas. On a rectangular `<canvas>` the shape is drawn as a filled polygon over a transparent background (the page background shows around it); the work's outline is part of the piece.
   - Controls: polygon vertex count, per-region color pickers, inner-division angle.
5. *(Stretch)* **Polish Village series** — collaged angular shapes, muted palette.

Each work is a React component with its own parameter state; controls live next to the canvas.

## Tech stack

- **Vite** — dev server + static build (`react-ts` template).
- **React 18** — functional components, hooks. No router needed.
- **TypeScript** — strict mode.
- **Canvas 2D API** — all drawing. No WebGL needed.
- **CSS modules** (or plain CSS) — minimal layout, museum-wall feel.
- **ESLint + Prettier** — `@typescript-eslint`, `eslint-plugin-react-hooks`, Prettier defaults. Run in CI and as a pre-build step.

No state manager, no UI library — native `<input type="range|color|number">` is enough.

**Deployment target:** GitHub Pages. Set `base: '/generative-art/'` in `vite.config.ts` (or the repo name) and publish `dist/` via an Actions workflow. Switching hosts later is a one-line change.

**Browser support:** current Chrome, Firefox, Safari, Edge (last two major versions). Relies on `ResizeObserver`, `devicePixelRatio`, and standard Canvas 2D — all broadly supported. No polyfills.

## Project structure

```
generative-art/
├── index.html
├── package.json
├── tsconfig.json
├── vite.config.ts
├── public/
│   └── favicon.svg
└── src/
    ├── main.tsx                 # React entry
    ├── App.tsx                  # gallery: maps over works registry
    ├── styles.css
    ├── types.ts                 # Work<Params>, ParamSchema, Renderer
    ├── components/
    │   ├── CanvasFigure.tsx     # DPR-aware canvas, redraws when params change
    │   ├── Controls.tsx         # renders inputs from a ParamSchema
    │   └── WorkCard.tsx         # figure + caption + controls for one work
    ├── lib/
    │   ├── canvas.ts            # setupCanvas(dpr), clear, fill helpers, pinstripe-safe band rects
    │   ├── geometry.ts          # arc, polygon, nested-rect utilities (unit-tested)
    │   └── palette.ts           # named Stella palettes per work, shared neutrals
    └── works/
        ├── index.ts             # registry of all works
        ├── blackPainting.ts
        ├── concentricSquares.ts
        ├── protractor.ts
        └── irregularPolygon.ts
```

## Rendering architecture

- A `Work<P>` exports:
  ```ts
  {
    id: string;
    title: string;
    year: string;
    series: string;
    aspectRatio: number;
    defaultParams: P;
    schema: ParamSchema<P>;          // drives the Controls UI
    render(ctx, w, h, params: P): void;
  }
  ```
- `ParamSchema<P>` is typed as a discriminated union of field descriptors, keyed by `kind` and parameterized by `K extends keyof P`, so each `kind` constrains `P[K]`:
  ```ts
  type Field<P, K extends keyof P> =
    | { key: K; label: string; kind: 'color';     /* P[K] = string */ }
    | { key: K; label: string; kind: 'range' | 'int'; min: number; max: number; step?: number; /* P[K] = number */ }
    | { key: K; label: string; kind: 'select';    options: readonly P[K][]; /* P[K] extends string */ }
    | { key: K; label: string; kind: 'colorList'; /* P[K] = string[] */ };
  type ParamSchema<P> = ReadonlyArray<{ [K in keyof P]: Field<P, K> }[keyof P]>;
  ```
  `Controls` renders inputs from this schema — no per-work control code.
- `WorkCard` holds `useState<P>(work.defaultParams)` and passes params + `render` down to `CanvasFigure`.
- `CanvasFigure`:
  - `useRef<HTMLCanvasElement>`, `useEffect` on `[params, size]` to schedule a redraw.
  - Draws are **rAF-throttled**: the effect requests a frame; if another change arrives before the frame fires, the pending frame is reused (coalesces bursty `input` events from color/range sliders).
  - `ResizeObserver` on the container → updates size state.
  - Sets `canvas.width = cssW * dpr`, `canvas.height = cssH * dpr`, then `ctx.scale(dpr, dpr)`, then calls `work.render(ctx, cssW, cssH, params)`. DPR is capped at 2 to bound redraw cost on 3× displays; the visual difference is imperceptible at these stroke widths.
  - Guards for `getContext('2d')` returning `null` (older/locked-down browsers) — renders a fallback message in that case.
- `render(ctx, w, h, params)` contract: `w, h` are **CSS pixels**. The context is already DPR-scaled, so `render` never multiplies by `devicePixelRatio`. Coordinates are `[0..w] × [0..h]`.
- **Pinstripe crispness**: 1px unpainted lines blur if drawn via `strokeRect` at integer coords. `lib/canvas.ts` exposes helpers that draw pinstripes as *fills between adjacent band rects* rather than strokes, which sidesteps the half-pixel problem entirely.
- A "Reset" button per work restores `defaultParams`.

## Accessibility

- Each `<canvas>` gets `role="img"` and a descriptive `aria-label` (e.g. `"Frank Stella — Die Fahne Hoch, nested black bands"`), plus a sibling `<figcaption>` for sighted users.
- Every control `<input>` has an explicit `<label htmlFor>`; ranges announce current value via `aria-valuetext` when the unit isn't obvious.
- Controls are keyboard-operable by default (native inputs); focus rings are preserved in CSS.
- The canvas itself is not interactive, so no keyboard focus on it.

## Testing

- **Vitest** for `lib/geometry.ts` (arc endpoint math, polygon vertex generation, nested-rect layouts) and `lib/palette.ts`. These are pure and easy to lock down.
- Schema/Controls wiring: a small render test (React Testing Library) that mounts `Controls` against a sample schema and asserts each `kind` produces the right input.
- No visual regression testing in v1 — manual review of the gallery is sufficient for this scope.

## Implementation steps

1. **Scaffold** — `npm create vite@latest . -- --template react-ts`, prune the starter, enable `strict: true`.
2. **Core types & components** — `types.ts`, `CanvasFigure` (DPR + ResizeObserver + draw), `Controls` (schema-driven inputs), `WorkCard` (state + layout), empty `works/` modules.
3. **Wire up the gallery** — `App.tsx` reads the registry and renders a `WorkCard` per work.
4. **Black Paintings** — mirrored nested bands; implement schema + render. Verify live updates for band count, thickness, colors.
5. **Concentric Squares** — nested squares with palette controls and rotation.
6. **Protractor series** — hardest piece. Build an `arc(cx, cy, r, startAngle, endAngle, thickness)` helper; compose interlocking fans. Expose arc count, fan count, palette list.
7. **Irregular Polygon** — polygon path + clipped flat-color regions; per-region color pickers.
8. **Styling** — single-column gallery, each card is canvas on the left (or top on narrow viewports) and controls on the right. Max-width ~1100px. Caption in small caps.
9. **Polish** — favicon, page title, about-section footer crediting Stella and noting the reproductions are procedural approximations. Reset button per work.
10. **Build & verify** — `npm run build`, serve `dist/`, confirm canvases render crisply at multiple widths and on a high-DPR display, and that all controls drive the canvas without jank.

## Performance notes

- Redraws happen on every controlled input change; the canvases are small enough that a full redraw per change is fine.
- `<input type="color">` and `<input type="range">` fire `input` events continuously while dragging. All redraws go through a single `requestAnimationFrame` per `CanvasFigure`, so bursts of events coalesce into one frame.
- DPR is capped at 2 in `CanvasFigure`. A 1100px card at DPR=3 would draw ~11MP per frame; at DPR=2 it's ~5MP, and the visual difference is imperceptible at these stroke widths.
- No offscreen canvases or workers needed at this scale.

## Non-goals

- No animation loops — redraws are input-driven only.
- No image assets of the original paintings (avoid licensing; this is a code-drawn homage).
- No routing, no multi-page site.
- No saving/sharing of parameter presets (could be a stretch goal via URL hash).

## Open questions

- Should parameter state persist across reloads (localStorage) or reset each visit? Default: reset. (URL-hash sharing is tracked under *Non-goals* as a stretch.)
- Exact palette choices for the Protractor pieces — pick one reference work per variant and hand-tune hex defaults.
