---
name: ui-motion
description: Designs and builds product-grade UI motion for web interfaces — one element morphing between states, closed-form springs, interruptible transitions, stretchy indicators, direct-manipulation drags, frame-by-frame audit. Human-invoked when creating a new UI interface or component.
disable-model-invocation: true
argument-hint: "Which UI surface or component are you building?"
---

# UI Motion

Dribbble-level motion for real, shipped UI (not video). Every state change reads as the same object changing, answers input instantly, survives interruption, and comes back to pixel-identical rest.

## 1. Ask for inputs (one message)

- **Surface + states**: the element and 3–12 states it moves through (e.g. button → loader → check → toast; toggle; tabs; slider; chart; command palette). Mark each transition user-triggered or system-triggered.
- **Palette**: pure black/white, or one accent — or the project's existing tokens (preferred when they exist).
- **Feel**: snappy / default / calm (scales the [spring presets](#spring-presets)).

Detect the stack yourself: framework, existing animation lib, design tokens, font, icon set. Never add a dependency without asking. Then load **one** implementation reference:

- Svelte 5 → [references/svelte.md](references/svelte.md)
- anything else (vanilla, Web Components, other frameworks) → [references/dom.md](references/dom.md), then port the idea.

## 2. Show the state map before any code

Present all three, then wait for approval:

1. **State table**: state | size | radius | fill / text color | content | trigger | spring.
2. **Timing grid**: one unit `u = 60ms`. Every duration and delay is a whole number of units. Multi-step sequences as one timeline row per element, e.g. `button ▮▮▮ → loader ▮▮▮▮▮▮ → check ▮▮▮`.
3. **Continuity map**: which DOM element persists across which states (the "one shape"). Any cut — element replaced without a morph — needs a stated reason.

## 3. Direction

- **One shape, never cut.** A state change morphs the same element's size, radius and color; its content swaps with a short blur (exit 2u; enter starts at 1u, lasts 3u).
- **Springs for anything that moves**, damping 0.8–1 — a tiny overshoot at most. Opacity may ease-out.
- **Feedback within 1u** of input: press state on `pointerdown`, not `click`.
- **No dead time**: input is never blocked by an animation; a long wait always has something moving.
- **Motion only where state changes.** Nothing idles or loops except progress indicators.
- **One UI font, one icon family**, one stroke width, one optical size. Changing numbers use `tabular-nums`.

**Banned**: bouncy / elastic / back easing, damping < 0.8, particle bursts, confetti, glows, gradients on UI chrome, mismatched icon strokes, dead time, linear easing on movement, interaction responses > 400ms, neighbours jumping while an element morphs, anything that looks like a template (fade-up-on-scroll everywhere, uniform staggers).

## 4. Build rules

1. Every animated property is derived each frame from (targets, spring state, time) in one render function. No state carried between frames besides the springs; never mix CSS transitions and JS springs on one property.
2. Retargeting mid-flight keeps value **and** velocity. Use the project's spring only if it does that and accepts a release velocity; otherwise copy [scripts/spring.js](scripts/spring.js) into the project (closed-form, seekable, zero deps). In Svelte, also copy [scripts/spring-value.svelte.js](scripts/spring-value.svelte.js).
3. Two-edge motion: a tab indicator's or toggle knob's edges ride different springs — the leading edge faster than the trailing one — so it stretches ahead and catches up.
4. Drags are direct manipulation: while held, value = f(pointer), rubber-banded past bounds. On release it springs from wherever it is, carrying the pointer's velocity.
5. One-shot transitions that can't be interrupted may use CSS/WAAPI with `springEasing()` → `linear()`, or Svelte `transition:` / `animate:` with `springCurve()`.
6. `prefers-reduced-motion`: keep every state change, swap morphs and movement for a ≤2u opacity crossfade, drop blur.
7. Accessibility: a morphing control keeps one accessible name (update `aria-label`, announce status via `aria-live`); focus is never lost when a container becomes something else.

## 5. Frame audit (before calling it done)

For every transition, capture frames at 0, at each unit boundary, at peak overshoot and at rest. Method: [references/frame-audit.md](references/frame-audit.md). Fix: overlapping or clipped text, off-grid timing, cramped padding mid-morph, unreadable frames, neighbour layout shift, and any rest state that differs after A → B → A.

## Gotchas

- Never `will-change` or `scale()` anything containing text the morph resizes — text rasterizes blurry. Animate real `width`/`height` (with `contain: layout`) or `clip-path: inset(… round r)` instead.
- Text swapping inside a morphing container needs its own exit and enter timing, and the exiting copy `position: absolute`, or both overlap and the container measures the wrong content.
- Pill radius is `height / 2` computed numerically; springing from `999px` stays pill then snaps.
- Round trips land pixel-identical: clear inline styles at rest, no residual transforms, velocity 0.
- Interpolate colors in oklab (`color-mix(in oklab, …)`); sRGB midpoints go muddy.

## Spring presets

`response` is in seconds for the default feel; multiply by 0.8 for snappy and 1.3 for calm. Damping 0.8 overshoots ~1.5%, 0.85 ~0.6%, 0.9 ~0.15%.

| Use | response | damping |
| --- | --- | --- |
| press / hover | 0.20 | 1 |
| small morph (button, toggle, chip) | 0.30 | 0.9 |
| container / layout morph | 0.40 | 0.95 |
| indicator leading / trailing edge | 0.22 / 0.34 | 0.9 / 0.95 |
| drag release | 0.35 | 0.85 |
| tooltip / cursor follow | 0.18 | 1 |
