# Svelte recipes

Svelte 5 runes (≥ 5.29 for `{@attach}`). Timing unit `u = 60ms`; spring presets are in [SKILL.md](../SKILL.md#spring-presets). Every example below compiles cleanly and passes `svelte-autofixer`.

## Contents

- [Setup](#setup)
- [SpringValue](#springvalue)
- [Content swap](#content-swap)
- [Morph button (label → loader → check)](#morph-button-label--loader--check)
- [Two-edge tab indicator](#two-edge-tab-indicator)
- [Drag + rubber band](#drag--rubber-band)
- [Icon morph](#icon-morph)
- [Self-drawing chart + tooltip](#self-drawing-chart--tooltip)
- [List filter](#list-filter)
- [Toast](#toast)
- [Svelte gotchas](#svelte-gotchas)

## Setup

Copy into the project's motion folder (e.g. `src/lib/motion/`):

- [../scripts/spring.js](../scripts/spring.js): the math, framework-free.
- [../scripts/spring-value.svelte.js](../scripts/spring-value.svelte.js): the reactive adapter.
- `swap.js` from [Content swap](#content-swap).

Built-in `svelte/motion` `Spring` / `Tween` are fine for a lone hover or press value that is never dragged. Use `SpringValue` for everything else: it takes `response` / `damping` (the preset table), keeps velocity on retarget, carries fling velocity on release, and can be sampled under a fake clock.

## SpringValue

| Member | Use |
| --- | --- |
| `new SpringValue(initial, config)` | spring driven by event handlers or attachments |
| `SpringValue.of(() => target, config)` | spring bound to state; returning `null` means "not measured yet", so the first real value jumps instead of animating in on mount |
| `.current` / `.settled` | reactive; read in the template (`style:width="{w.current}px"`) |
| `.target` | not reactive, safe to read in effects |
| `.to(v, override?)` | retarget, keeping velocity; jumps under reduced motion |
| `.hold(v)` / `.release(v, velocity?)` | drag: pin to the pointer, then spring back with the pointer's velocity |
| `.jump(v)` | snap without animating |

It ticks once per frame only while it is read and moving, and stops when the component is destroyed. Reading `.current` in an `$effect` re-runs that effect every frame, so keep it in the template or in `$derived`.

## Content swap

Svelte's `in:` / `out:` give the exiting and entering copies their own timing. Wrap the content in `{#key}` and stack both copies in one grid cell so neither one sizes the container.

```js
// src/lib/motion/swap.js
import { cubicOut } from 'svelte/easing';
import { prefersReducedMotion } from 'svelte/motion';

export const U = 60;

/** Content-swap enter: starts 1u after the exit, 3u long; plain 2u fade under reduced motion. */
export function swapIn() {
  if (prefersReducedMotion.current) return { duration: 2 * U, css: (t) => `opacity: ${t}` };
  return {
    delay: U,
    duration: 3 * U,
    easing: cubicOut,
    css: (t) => `opacity: ${t}; filter: blur(${(1 - t) * 4}px); translate: 0 ${(1 - t) * 3}px`,
  };
}

/** Content-swap exit: 2u; plain 2u fade under reduced motion. */
export function swapOut() {
  if (prefersReducedMotion.current) return { duration: 2 * U, css: (t) => `opacity: ${t}` };
  return { duration: 2 * U, easing: cubicOut, css: (t) => `opacity: ${t}; filter: blur(${(1 - t) * 4}px)` };
}
```

## Morph button (label → loader → check)

The container's width only gets an inline style while it is moving, so at rest the button is plain CSS for its `data-status`. A hidden twin with the same class measures the idle width. The spinner's constant-speed rotation is the one allowed loop; the check draws itself with CSS after 2u.

```svelte
<script>
	// One button that morphs label → spinner → check and back. `status` is owned by the parent.
	import { SpringValue } from '$lib/motion/spring-value.svelte.js';
	import { swapIn, swapOut } from '$lib/motion/swap.js';

	/** @type {{ status: 'idle' | 'busy' | 'done', label: string, onclick: () => void }} */
	let { status, label, onclick } = $props();

	const SIZE = 40;
	let idleWidth = $state(0);
	const width = SpringValue.of(() => (status !== 'idle' ? SIZE : idleWidth || null), {
		response: 0.3,
		damping: 0.9
	});
	const ink = SpringValue.of(() => (status === 'done' ? 1 : 0), {
		response: 0.3,
		damping: 1,
		precision: 0.001
	});
</script>

<button
	class="morph"
	data-status={status}
	style:width={width.settled ? null : `${width.current}px`}
	style:background="color-mix(in oklab, var(--accent) {ink.current * 100}%, var(--ink))"
	aria-label={status === 'idle' ? label : status === 'busy' ? 'Saving' : 'Saved'}
	aria-disabled={status !== 'idle'}
	onclick={() => status === 'idle' && onclick()}
>
	{#key status}
		<span class="layer" in:swapIn out:swapOut>
			{#if status === 'idle'}
				{label}
			{:else if status === 'busy'}
				<svg class="spinner" viewBox="0 0 20 20" aria-hidden="true">
					<circle cx="10" cy="10" r="8" pathLength="1" />
				</svg>
			{:else}
				<svg class="check" viewBox="0 0 20 20" aria-hidden="true">
					<path d="M5 10.5l3.2 3L15 7" pathLength="1" />
				</svg>
			{/if}
		</span>
	{/key}
</button>
<span class="morph measure" aria-hidden="true" bind:offsetWidth={idleWidth}>{label}</span>

<style>
	.morph {
		display: grid;
		place-items: center;
		height: 40px;
		box-sizing: border-box;
		padding: 0 20px;
		border-radius: 20px;
		white-space: nowrap;
		contain: layout;
	}
	.morph[data-status='busy'],
	.morph[data-status='done'] {
		width: 40px;
		padding: 0;
	}
	.layer {
		grid-area: 1 / 1;
	}
	svg {
		width: 20px;
		height: 20px;
		fill: none;
		stroke: currentColor;
		stroke-width: 2;
		stroke-linecap: round;
	}
	.spinner circle {
		stroke-dasharray: 0.25 1;
		transform-origin: center;
		animation: spin 720ms linear infinite;
	}
	.check path {
		stroke-dasharray: 1;
		animation: draw 180ms 120ms cubic-bezier(0.2, 0, 0, 1) both;
	}
	@keyframes spin {
		to {
			rotate: 1turn;
		}
	}
	@keyframes draw {
		from {
			stroke-dashoffset: 1;
		}
	}
	.measure {
		position: absolute;
		visibility: hidden;
		pointer-events: none;
	}
</style>
```

## Two-edge tab indicator

A conditional attachment runs `follow` on whichever tab becomes active. The edge moving in the direction of travel uses the faster spring. A `ResizeObserver` keeps the indicator correct when fonts load or the locale changes.

```svelte
<script>
	// Tab bar whose indicator stretches ahead and catches up. Selected index is owned by the parent via bind:active.
	import { SpringValue } from '$lib/motion/spring-value.svelte.js';

	/** @type {{ tabs: string[], active: number }} */
	let { tabs, active = $bindable(0) } = $props();

	const LEAD = { response: 0.22, damping: 0.9 };
	const TRAIL = { response: 0.34, damping: 0.95 };
	const left = new SpringValue(0);
	const right = new SpringValue(0);
	let placed = false;

	/** @type {import('svelte/attachments').Attachment<HTMLElement>} */
	function follow(tab) {
		const place = () => {
			const x = tab.offsetLeft;
			const w = tab.offsetWidth;
			if (!placed) {
				left.jump(x);
				right.jump(x + w);
				placed = true;
				return;
			}
			const toRight = x > left.target;
			left.to(x, toRight ? TRAIL : LEAD);
			right.to(x + w, toRight ? LEAD : TRAIL);
		};
		place();
		const resize = new ResizeObserver(place);
		resize.observe(tab);
		return () => resize.disconnect();
	}
</script>

<div class="tabs" role="tablist">
	{#each tabs as tab, i (tab)}
		<button role="tab" aria-selected={i === active} onclick={() => (active = i)} {@attach i === active && follow}>
			{tab}
		</button>
	{/each}
	<span
		class="indicator"
		aria-hidden="true"
		style:translate="{left.current}px 0"
		style:width="{right.current - left.current}px"
	></span>
</div>

<style>
	.tabs {
		position: relative;
		display: flex;
	}
	.indicator {
		position: absolute;
		left: 0;
		bottom: 0;
		height: 2px;
		border-radius: 1px;
		background: currentColor;
	}
</style>
```

Toggle: the same two springs on the knob. On `pointerdown` the leading edge extends about 20% (a press stretch); on release both edges spring to the far side, lead and trail as above. The track color is a 0–1 `SpringValue` fed into `color-mix(in oklab, …)`.

## Drag + rubber band

While held, the pointer owns the value (`hold`). Past either end, the track itself stretches and thins by the rubber-banded overshoot. On release the value springs back carrying the flick's velocity. Keyboard steps go through the same `$effect`.

```svelte
<script>
	// Volume slider: direct-manipulation drag, rubber-band stretch past either end, spring release. Value (0–1) is owned by the parent via bind:value.
	import { untrack } from 'svelte';
	import { SpringValue } from '$lib/motion/spring-value.svelte.js';
	import { rubberBand } from '$lib/motion/spring.js';

	/** @type {{ value: number }} */
	let { value = $bindable(0.5) } = $props();

	const clamp = (/** @type {number} */ v) => Math.min(Math.max(v, 0), 1);
	const shown = new SpringValue(
		untrack(() => value),
		{ response: 0.35, damping: 0.85, precision: 0.001 }
	);
	/** @type {{ x: number, from: number } | null} */
	let drag = null;

	const under = $derived(Math.max(0, -shown.current));
	const over = $derived(Math.max(0, shown.current - 1));

	$effect(() => {
		const target = value;
		if (!drag) shown.to(target);
	});

	/** @param {PointerEvent & { currentTarget: HTMLDivElement }} e */
	function down(e) {
		e.currentTarget.setPointerCapture(e.pointerId);
		drag = { x: e.clientX, from: shown.current };
	}

	/** @param {PointerEvent & { currentTarget: HTMLDivElement }} e */
	function move(e) {
		if (!drag) return;
		const raw = drag.from + (e.clientX - drag.x) / e.currentTarget.offsetWidth;
		value = clamp(raw);
		shown.hold(value + rubberBand(raw - value, 0.25));
	}

	function up() {
		if (!drag) return;
		drag = null;
		shown.release(value);
	}

	/** @param {KeyboardEvent} e */
	function key(e) {
		const step = { ArrowRight: 0.05, ArrowUp: 0.05, ArrowLeft: -0.05, ArrowDown: -0.05 }[e.key];
		if (step === undefined) return;
		e.preventDefault();
		value = clamp(value + step);
	}
</script>

<div
	class="slider"
	role="slider"
	tabindex="0"
	aria-label="Volume"
	aria-valuemin={0}
	aria-valuemax={100}
	aria-valuenow={Math.round(value * 100)}
	onpointerdown={down}
	onpointermove={move}
	onlostpointercapture={up}
	onkeydown={key}
>
	<div
		class="track"
		style:left="{-under * 100}%"
		style:right="{-over * 100}%"
		style:height="{6 * (1 - 1.5 * (under + over))}px"
	>
		<div class="fill" style:width="{((shown.current + under) / (1 + under + over)) * 100}%"></div>
	</div>
</div>

<style>
	.slider {
		position: relative;
		height: 24px;
		touch-action: none;
	}
	.track {
		position: absolute;
		top: 50%;
		translate: 0 -50%;
		border-radius: 3px;
		overflow: hidden;
		background: var(--track);
	}
	.fill {
		height: 100%;
		background: currentColor;
	}
</style>
```

A scrubbable progress bar uses the same pattern, but commits the seek in `up()` only.

## Icon morph

Two filled quads interpolated vertex by vertex, with no stroke-width mismatch. Icons that don't share a vertex correspondence get a content swap instead.

```svelte
<script>
	// Filled play/pause glyph whose two quads morph into each other. `playing` is owned by the parent.
	import { SpringValue } from '$lib/motion/spring-value.svelte.js';

	/** @type {{ playing: boolean }} */
	let { playing } = $props();

	const PLAY = [[7, 5], [13, 8.5], [13, 15.5], [7, 19], [13, 8.5], [19, 12], [19, 12], [13, 15.5]];
	const PAUSE = [[6, 5], [10, 5], [10, 19], [6, 19], [14, 5], [18, 5], [18, 19], [14, 19]];
	const p = SpringValue.of(() => (playing ? 1 : 0), { response: 0.28, damping: 0.9, precision: 0.001 });

	const d = $derived.by(() => {
		const v = p.current;
		const pts = PLAY.map(([x, y], i) => `${x + (PAUSE[i][0] - x) * v} ${y + (PAUSE[i][1] - y) * v}`);
		return `M${pts.slice(0, 4).join('L')}Z M${pts.slice(4).join('L')}Z`;
	});
</script>

<svg viewBox="0 0 24 24" width="24" height="24" aria-hidden="true"><path {d} fill="currentColor" /></svg>
```

## Self-drawing chart + tooltip

`in:draw` inside `{#key d}` redraws the line on each data change. Drawing is progress, not movement, so easing is fine. The tooltip jumps to the first hovered point, then springs between points. Changing numbers use `tabular-nums`.

```svelte
<script>
	// Line chart that draws itself whenever the data changes, with a tooltip that springs to the nearest point. Points (already in px) are owned by the parent.
	import { cubicOut } from 'svelte/easing';
	import { draw, fade } from 'svelte/transition';
	import { SpringValue } from '$lib/motion/spring-value.svelte.js';
	import { U } from '$lib/motion/swap.js';

	/** @type {{ points: { x: number, y: number, label: string }[], width: number, height: number, title: string }} */
	let { points, width, height, title } = $props();

	const FOLLOW = { response: 0.18, damping: 1 };
	const tipX = new SpringValue(0, FOLLOW);
	const tipY = new SpringValue(0, FOLLOW);
	let hovered = $state(-1);
	const d = $derived(points.map((p, i) => `${i ? 'L' : 'M'}${p.x} ${p.y}`).join(''));

	/** @param {PointerEvent & { currentTarget: HTMLDivElement }} e */
	function track(e) {
		const x = e.clientX - e.currentTarget.getBoundingClientRect().left;
		let nearest = 0;
		for (let i = 1; i < points.length; i++) {
			if (Math.abs(points[i].x - x) < Math.abs(points[nearest].x - x)) nearest = i;
		}
		const { x: px, y: py } = points[nearest];
		if (hovered < 0) {
			tipX.jump(px);
			tipY.jump(py);
		} else {
			tipX.to(px);
			tipY.to(py);
		}
		hovered = nearest;
	}
</script>

<div class="chart" role="group" aria-label={title} onpointermove={track} onpointerleave={() => (hovered = -1)}>
	<svg {width} {height} aria-hidden="true">
		{#key d}
			<path {d} in:draw={{ duration: 7 * U, easing: cubicOut }} />
		{/key}
		{#if hovered >= 0}
			<line x1={tipX.current} x2={tipX.current} y1="0" y2={height} transition:fade={{ duration: 2 * U }} />
		{/if}
	</svg>
	{#if hovered >= 0}
		<div class="tip" style:translate="{tipX.current}px {tipY.current}px" transition:fade={{ duration: 2 * U }}>
			{points[hovered].label}
		</div>
	{/if}
</div>

<style>
	.chart {
		position: relative;
	}
	path {
		fill: none;
		stroke: currentColor;
		stroke-width: 1.5;
	}
	line {
		stroke: currentColor;
		stroke-opacity: 0.2;
	}
	.tip {
		position: absolute;
		top: 0;
		left: 0;
		margin: -32px 0 0 8px;
		font-variant-numeric: tabular-nums;
		pointer-events: none;
	}
</style>
```

## List filter

A command-palette body. `animate:flip` with a `springCurve` easing slides the survivors. Leavers fade out in 1u while Svelte keeps them out of flow; arrivals fade in after them. The list is capped at the visible window.

```svelte
<script>
	// Filtered result list (command palette body): survivors slide, arrivals fade in, leavers fade out in place. Items and query are owned by the parent.
	import { flip } from 'svelte/animate';
	import { fade } from 'svelte/transition';
	import { springCurve } from '$lib/motion/spring.js';
	import { U } from '$lib/motion/swap.js';

	/** @type {{ items: { id: string, label: string }[], query: string }} */
	let { items, query } = $props();

	const SLIDE = springCurve({ response: 0.4, damping: 0.95 });
	const shown = $derived(items.filter((i) => i.label.toLowerCase().includes(query.toLowerCase())).slice(0, 12));
</script>

<ul role="listbox">
	{#each shown as item (item.id)}
		<li role="option" aria-selected="false" animate:flip={SLIDE} in:fade={{ duration: 2 * U, delay: U }} out:fade={{ duration: U }}>
			{item.label}
		</li>
	{/each}
</ul>
```

The highlight row is a vertical two-edge indicator (the Tabs pattern on `offsetTop` / `offsetHeight`). Enter commits immediately and never waits for an animation.

## Toast

`springCurve` gives a custom `in:` transition a spring shape; `t` passes 1 while overshooting. A shared `aria-live` region announces each toast.

```svelte
<script>
	// Toast stack: toasts rise from the bottom edge on a spring curve and the stack re-flows with flip. The list (and dismiss timers) are owned by the parent.
	import { flip } from 'svelte/animate';
	import { prefersReducedMotion } from 'svelte/motion';
	import { fade } from 'svelte/transition';
	import { springCurve } from '$lib/motion/spring.js';
	import { U } from '$lib/motion/swap.js';

	/** @type {{ toasts: { id: string, text: string }[] }} */
	let { toasts } = $props();

	const RISE = springCurve({ response: 0.4, damping: 0.9 });
	const STACK = springCurve({ response: 0.4, damping: 0.95 });

	function rise() {
		if (prefersReducedMotion.current) return { duration: 2 * U, css: (/** @type {number} */ t) => `opacity: ${t}` };
		return { ...RISE, css: (/** @type {number} */ t) => `opacity: ${Math.min(t * 2, 1)}; translate: 0 ${(1 - t) * 16}px` };
	}
</script>

<ol class="toasts" aria-live="polite">
	{#each toasts as toast (toast.id)}
		<li animate:flip={STACK} in:rise out:fade={{ duration: 2 * U }}>{toast.text}</li>
	{/each}
</ol>
```

When the toast comes from a visible control (a Save button, say), make that control morph into the toast rather than spawning a new element. The parent pauses auto-dismiss on hover and focus.

## Svelte gotchas

- Transitions are local by default: an `in:` inside a branch that mounts with its parent does not play. Put the `{#key}` or `{#if}` that should animate directly around the element, or use CSS keyframes as the check does.
- Never put a CSS `transition` on a property that a `SpringValue` writes through `style:`; the two fight every frame.
- `style:prop={null}` removes the inline style, which is how an element returns to pure CSS at rest (`width.settled ? null : …`).
- `bind:offsetWidth` reports through `ResizeObserver`, before paint. Combine it with `SpringValue.of(() => w || null)` so the first measurement jumps.
- Initialise a spring from a prop with `untrack(() => value)`, then keep it in sync with `$effect(() => spring.to(value))`, skipped while dragging.
- `prefersReducedMotion` from `svelte/motion` is reactive: `SpringValue` reads it on every retarget, and `swap.js` reads it when each transition starts.
