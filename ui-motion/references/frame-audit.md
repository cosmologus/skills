# Frame audit

Freeze time and step through every transition in unit increments. Works for both stacks: spring.js and `SpringValue` read `performance.now()` and `requestAnimationFrame`, which Playwright's fake clock controls; Svelte `transition:` / `animate:` and CSS run as Web Animations, frozen separately.

```js
// Playwright: fake clock drives performance.now() and requestAnimationFrame
await page.clock.install();
await page.goto(url);
await page.getByRole('button', { name: 'Save' }).click();
for (let i = 0; i <= 12; i++) {
  await page.screenshot({ path: `audit/save-${String(i).padStart(2, '0')}.png`, clip });
  await page.clock.runFor(60);
}
```

- WAAPI / CSS animations are not driven by the fake clock: freeze them with `document.getAnimations().forEach((a) => { a.pause(); a.currentTime = t; })`.
- Also capture peak overshoot (densify frames around it) and interrupted runs: retarget at 1u, 2u, mid-flight — look for kinks.
- Round trip: screenshot rest A, run A → B → A, screenshot again, pixel-compare (`expect(page).toHaveScreenshot()`).
- Manual passes: DevTools Animations panel at 10% speed; Rendering → emulate `prefers-reduced-motion: reduce`.

Per frame, reject: overlapping or clipped text, text blurred beyond the swap window, cramped padding, content outside its container, neighbour layout shift, timing off the unit grid.
