# Plain DOM recipes

Vanilla JS on top of [../scripts/spring.js](../scripts/spring.js): one `createLoop` render function writes styles from sampled springs. Timing unit `u = 60ms`; spring presets are in [SKILL.md](../SKILL.md#spring-presets).

## Contents

- [Morph container](#morph-container)
- [Content swap](#content-swap)
- [Two-edge indicator](#two-edge-indicator)
- [Drag + rubber band](#drag--rubber-band)
- [Icon morph](#icon-morph)
- [Loader → check](#loader--check)
- [Self-drawing chart + tooltip](#self-drawing-chart--tooltip)
- [List filter](#list-filter)
- [Toast](#toast)

## Morph container

One element, several springs, one render function.

```js
import { createSpring, createLoop } from './spring.js';

const now = () => performance.now();
const w = createSpring(el.offsetWidth), h = createSpring(el.offsetHeight);
const r = createSpring(el.offsetHeight / 2), ink = createSpring(0, { precision: 0.001 });

const loop = createLoop((t) => {
  const [W, H, R, I] = [w, h, r, ink].map((s) => s.sample(t));
  el.style.width = `${W.value}px`;
  el.style.height = `${H.value}px`;
  el.style.borderRadius = `${R.value}px`;
  el.style.background = `color-mix(in oklab, var(--accent) ${I.value * 100}%, var(--surface))`;
  const busy = ![W, H, R, I].every((s) => s.settled);
  if (!busy) el.removeAttribute('style'); // rest styles live in CSS per [data-state]
  return busy;
});

function goTo(state) {
  el.dataset.state = state;
  const { width, height, radius, accent } = measure(state); // see below
  w.to(width, now()); h.to(height, now()); r.to(radius, now()); ink.to(accent ? 1 : 0, now());
  loop.kick();
}
```

- `measure(state)`: render the incoming content into a hidden clone (same class, `visibility: hidden; position: absolute`) and read `getBoundingClientRect()`. Never guess sizes.
- Give the element `contain: layout` and reserve its max footprint in the parent (fixed slot or grid cell) so neighbours never move.
- Morphs larger than ~400px or containing lots of layout: animate `clip-path: inset(top right bottom left round r)` on a full-size element instead of `width`/`height`.

## Content swap

Two layers inside the morphing container; the exiting one leaves the flow.

```css
.slot { display: grid; place-items: center; }
.slot > * { grid-area: 1 / 1; }          /* layers stack without absolute positioning */
.slot > [data-exiting] { pointer-events: none; }
```

```js
const u = 60;
old.dataset.exiting = '';
old.animate(
  [{ opacity: 1, filter: 'blur(0)' }, { opacity: 0, filter: 'blur(4px)' }],
  { duration: 2 * u, easing: 'ease-in', fill: 'forwards' },
).finished.then(() => old.remove());
next.animate(
  [{ opacity: 0, filter: 'blur(4px)', translate: '0 3px' }, { opacity: 1, filter: 'blur(0)', translate: '0 0' }],
  { duration: 3 * u, delay: u, easing: 'ease-out', fill: 'backwards' },
);
```

- Stacking via `grid-area: 1 / 1` works only when the container's size is driven by the springs, not by content; otherwise use `position: absolute; inset: 0` on the exiting layer.
- Blur ≤ 4px, no `scale()` on text. Rapid re-swaps: cancel the in-flight exit and start from its current opacity (`getComputedStyle`), never stack three layers.

## Two-edge indicator

Tab underline / pill, segmented control, toggle knob. Edges are separate springs; the edge in the direction of travel leads.

```js
const lead = { response: 0.22, damping: 0.9 }, trail = { response: 0.34, damping: 0.95 };
const L = createSpring(x0), R = createSpring(x0 + w0);

function moveTo(x, width) {
  const t = now(), right = x > L.sample(t).value;
  L.to(x, t, right ? trail : lead);
  R.to(x + width, t, right ? lead : trail);
  loop.kick();
}
// render: indicator.style.translate = `${l}px 0`; indicator.style.width = `${r - l}px`;
```

- Use `width`, not `scaleX`, so the radius stays round while stretched.
- Liquid feel: thin the indicator slightly with stretch, `height = base * (1 - 0.12 * clamp((r - l) / restWidth - 1, 0, 1))`.
- Toggle: on `pointerdown` the knob widens (trailing edge stays, leading edge extends ~20%); on release the edges spring to the far side with lead/trail. Track color is a 0–1 spring mixed in oklab.

## Drag + rubber band

```js
import { rubberBand } from './spring.js';
const value = createSpring(0);
let start;

thumb.addEventListener('pointerdown', (e) => {
  thumb.setPointerCapture(e.pointerId);
  start = { x: e.clientX, v: value.sample(now()).value };
});
thumb.addEventListener('pointermove', (e) => {
  if (!start) return;
  const raw = start.v + (e.clientX - start.x) / trackPx;       // 0–1 domain
  const over = raw > 1 ? raw - 1 : raw < 0 ? raw : 0;
  value.hold(clamp(raw, 0, 1) + rubberBand(over, 0.25), now()); // visible stretch past bounds
  loop.kick();
});
thumb.addEventListener('lostpointercapture', () => { // fires on up and cancel
  start = null;
  value.release(clamp(value.sample(now()).value, 0, 1), now()); // velocity from recent holds
  loop.kick();
});
```

- Past max, stretch the **track** (render its length from the overshoot) and thin it slightly, so the slider itself looks pulled. The thumb lags the finger there — that lag is the resistance.
- Scrubbing a progress bar: same pattern; show the time label from the held value, commit the seek on release only.
- Set `touch-action: none` on the draggable element, and give it keyboard steps (`Arrow` keys call `value.to()`).

## Icon morph

Morph between icons with equal vertex counts, filled (no stroke-width mismatch). Play ↔ pause in a 24 viewBox, each as two quads:

```js
const PAUSE = [[6,5],[10,5],[10,19],[6,19], [14,5],[18,5],[18,19],[14,19]];
const PLAY  = [[7,5],[13,8.5],[13,15.5],[7,19], [13,8.5],[19,12],[19,12],[13,15.5]];
const p = createSpring(0, { response: 0.28, damping: 0.9, precision: 0.001 });

// render
const v = p.sample(t).value;
const pts = PLAY.map(([x, y], i) => [x + (PAUSE[i][0] - x) * v, y + (PAUSE[i][1] - y) * v]);
path.setAttribute('d', `M${pts.slice(0, 4).join('L')}Z M${pts.slice(4).join('L')}Z`);
```

Anything without a clean vertex correspondence: content-swap the icons instead of path-morphing.

## Loader → check

1. Button morphs to a circle (`width = height`, radius `h / 2`) over 3–4u while the label swaps out.
2. Spinner arc: SVG circle with `pathLength="1"`, `stroke-dasharray="0.25 1"`, rotating — the only allowed loop.
3. On success, grow the arc to a full ring (dash 0.25 → 1) over 3u, then draw the check (`stroke-dashoffset` 1 → 0) over 3u, ease-out.
4. Hold 6–10u, then morph back to the button or on to the next state (toast).

## Self-drawing chart + tooltip

- Line: `<path pathLength="1" stroke-dasharray="1" stroke-dashoffset="1">`, animate offset to 0 over 6–8u ease-out. Drawing is progress, not movement — easing is fine here.
- Area fill fades in after the line passes 50%; no gradient fills on chrome.
- Tooltip snaps to the nearest point: its x/y are springs (tooltip preset), its value text uses `tabular-nums` and swaps digits without blur.
- Vertical crosshair follows the tooltip spring, not the raw pointer.

## List filter

Command palette / search results on each keystroke:

1. Record `top` of each visible item (FLIP "first").
2. Apply the filter.
3. Measure again ("last"); for survivors set a `y` spring to `first - last` via `jump`, then `to(0)`.
4. New items fade in over 2u; removed items fade out over 1u in place (absolutely positioned at their old top).
5. List height is a container spring; the highlight row is a vertical two-edge indicator.

Cap animated items to the visible window. Enter commits immediately — the dismiss animation never delays the action.

## Toast

- If the action came from a visible element, the toast is that element morphing (shared element); otherwise enter from the nearest edge: `translate` spring + 2u fade.
- Stacking: FLIP existing toasts when one enters or leaves.
- Auto-dismiss timer pauses on hover and focus. `role="status"` (or `alert` for errors).
