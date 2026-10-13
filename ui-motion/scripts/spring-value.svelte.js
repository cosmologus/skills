import { untrack } from 'svelte';
import { prefersReducedMotion } from 'svelte/motion';
import { createSubscriber } from 'svelte/reactivity';
import { createSpring } from './spring.js';

/**
 * Svelte 5 (≥ 5.7) adapter for spring.js: one spring exposed as a reactive `current`.
 *
 * Ticks once per animation frame only while an effect or template reads it and the spring is
 * moving; the loop is cancelled when the last reader is destroyed. Under
 * `prefers-reduced-motion` every `to()` jumps instead of animating. Times come from
 * performance.now(), so a Playwright fake clock drives it.
 */
export class SpringValue {
  #spring;
  #wake = () => {};
  #notify = () => {};
  #subscribe = createSubscriber((update) => {
    let frame = 0;
    const tick = () => {
      update();
      frame = this.#spring.sample(performance.now()).settled ? 0 : requestAnimationFrame(tick);
    };
    this.#wake = () => {
      if (!frame) frame = requestAnimationFrame(tick);
    };
    this.#notify = update;
    this.#wake();
    return () => {
      cancelAnimationFrame(frame);
      frame = 0;
      this.#wake = () => {};
      this.#notify = () => {};
    };
  });

  /** @param {{response?: number, damping?: number, precision?: number}} [config] */
  constructor(initial, config) {
    this.#spring = createSpring(initial, config);
  }

  /**
   * Spring bound to `fn`: retargets whenever state read by `fn` changes. `fn` may return
   * `null` while its input is unknown (e.g. an element not measured yet); the first known
   * value jumps, so nothing animates in from a placeholder on mount. Call during component
   * initialisation.
   */
  static of(fn, config) {
    const initial = untrack(fn);
    const spring = new SpringValue(initial ?? 0, config);
    let known = initial != null;
    $effect.pre(() => {
      const target = fn();
      if (target == null) return;
      if (known) spring.to(target);
      else spring.jump(target);
      known = true;
    });
    return spring;
  }

  /** Reactive value at the current frame. */
  get current() {
    this.#subscribe();
    return this.#spring.sample(performance.now()).value;
  }

  /** Reactive; true once at rest on the target. Use it to drop inline styles at rest. */
  get settled() {
    this.#subscribe();
    return this.#spring.sample(performance.now()).settled;
  }

  /** Last target set. Not reactive, so effects can read it without re-running every frame. */
  get target() {
    return this.#spring.sample(performance.now()).target;
  }

  /** Retargets from the current value and velocity; same target without override is a no-op. */
  to(target, override) {
    const t = performance.now();
    if (!override && this.#spring.sample(t).target === target) return;
    if (prefersReducedMotion.current) return this.jump(target);
    this.#spring.to(target, t, override);
    this.#wake();
  }

  /** Pins the value, e.g. to the pointer during a drag; readers update in the same flush. */
  hold(value) {
    this.#spring.hold(value, performance.now());
    this.#notify();
  }

  /** Ends a drag; without `velocity`, uses the pointer's velocity over the last ~100ms. */
  release(target, velocity, override) {
    const t = performance.now();
    if (prefersReducedMotion.current) return this.jump(target);
    this.#spring.release(target, t, velocity, override);
    this.#wake();
  }

  /** Snaps to `value` at rest; readers update in the same flush. */
  jump(value) {
    this.#spring.jump(value, performance.now());
    this.#notify();
  }
}
