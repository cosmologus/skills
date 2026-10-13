/**
 * Closed-form damped springs for product UI motion. Zero dependencies.
 *
 * Every value is an analytic function of time (no per-frame integration), so a spring can be
 * sampled at any timestamp — including backwards — which is what makes frame audits with a
 * fake clock possible. Times are milliseconds on the performance.now() timebase; velocities
 * are units per second.
 *
 * Config: `response` = seconds for one undamped oscillation (perceived speed), `damping` =
 * damping ratio in [0.5, 1]. 0.8 overshoots ~1.5%, 0.9 ~0.15%, 1 never overshoots.
 */

const DEFAULTS = { response: 0.35, damping: 0.9, precision: 0.01 };

function evaluate(state, t) {
  const { x, v, target, t0, config } = state;
  if (t0 === -Infinity || t <= t0) return { value: x, velocity: v };
  const dt = (t - t0) / 1000;
  const z = Math.min(Math.max(config.damping, 0.05), 1);
  const w = (2 * Math.PI) / config.response;
  const a = x - target;
  if (z === 1) {
    const c = v + w * a;
    const e = Math.exp(-w * dt);
    return { value: target + e * (a + c * dt), velocity: e * (v - w * c * dt) };
  }
  const wd = w * Math.sqrt(1 - z * z);
  const b = (v + z * w * a) / wd;
  const e = Math.exp(-z * w * dt);
  const cos = Math.cos(wd * dt);
  const sin = Math.sin(wd * dt);
  return {
    value: target + e * (a * cos + b * sin),
    velocity: e * ((b * wd - z * w * a) * cos - (a * wd + z * w * b) * sin),
  };
}

function isSettled(sample, target, precision) {
  return Math.abs(sample.value - target) <= precision && Math.abs(sample.velocity) <= precision * 10;
}

/**
 * Creates a retargetable spring for one scalar (px, 0–1 progress, degrees…).
 *
 * Retargeting mid-flight keeps both value and velocity, so interrupted motion never kinks.
 * History is kept as an event log so `sample(t)` is a pure function of `t`; the log compacts
 * whenever a new event arrives after the spring has settled, so seeking works across the
 * current motion only.
 *
 * @param {number} initial
 * @param {{response?: number, damping?: number, precision?: number}} [config]
 *   `precision` is in the value's own units: keep 0.01 for px, use 0.001 for 0–1 values.
 */
export function createSpring(initial, config = {}) {
  const base = { ...DEFAULTS, ...config };
  const rest = (value, t) => ({ x: value, v: 0, target: value, t0: t, config: base });
  let events = [{ t: -Infinity, state: rest(initial, -Infinity) }];
  let holds = [];

  function stateAt(t) {
    let current = events[0].state;
    for (let i = 1; i < events.length && events[i].t <= t; i++) current = events[i].state;
    return current;
  }

  function push(t, next) {
    const prev = stateAt(t);
    if (isSettled(evaluate(prev, t), prev.target, prev.config.precision)) {
      events = [{ t: -Infinity, state: rest(prev.target, -Infinity) }];
    }
    events = events.filter((e) => e.t <= t);
    events.push({ t, state: next });
  }

  return {
    /** Springs toward `target` from wherever the value is at `t`, velocity included. */
    to(target, t, override) {
      const s = evaluate(stateAt(t), t);
      holds = [];
      push(t, { x: s.value, v: s.velocity, target, t0: t, config: { ...base, ...override } });
    },

    /** Direct manipulation: pins the value (e.g. to the pointer) with no animation. */
    hold(value, t) {
      holds.push({ value, t });
      holds = holds.filter((h) => t - h.t <= 100);
      push(t, rest(value, t));
    },

    /**
     * Ends a drag: springs from the held value toward `target`. Without `velocity`, uses the
     * hold samples from the last ~100ms, so a flick carries its momentum into the spring.
     */
    release(target, t, velocity, override) {
      const s = evaluate(stateAt(t), t);
      let v = velocity;
      if (v === undefined) {
        const first = holds[0];
        const last = holds[holds.length - 1];
        v = first && last && last.t > first.t ? ((last.value - first.value) / (last.t - first.t)) * 1000 : 0;
      }
      holds = [];
      push(t, { x: s.value, v, target, t0: t, config: { ...base, ...override } });
    },

    /** Snaps to `value` at rest; for reduced motion and first paint. */
    jump(value, t) {
      holds = [];
      push(t, rest(value, t));
    },

    /** @returns {{value: number, velocity: number, target: number, settled: boolean}} */
    sample(t) {
      const state = stateAt(t);
      const s = evaluate(state, t);
      const settled = isSettled(s, state.target, state.config.precision);
      return { value: settled ? state.target : s.value, velocity: settled ? 0 : s.velocity, target: state.target, settled };
    },
  };
}

/**
 * A 0→1 spring as an easing function plus its duration, for APIs that take `(p) => number`
 * (Svelte `transition:` / `animate:`, canvas tweens). Output may exceed 1 while overshooting.
 * Not retargetable with velocity: use only where interruption is impossible or harmless.
 *
 * @returns {{easing: (p: number) => number, duration: number}} duration in ms, until within
 *   0.1% of rest.
 */
export function springCurve(config = {}) {
  const cfg = { ...DEFAULTS, ...config, precision: 0.001 };
  const state = { x: 0, v: 0, target: 1, t0: 0, config: cfg };
  let duration = 0;
  let calm = 0;
  for (let t = 0; t < 5000 && calm < 50; t++) {
    if (isSettled(evaluate(state, t), 1, cfg.precision)) calm++;
    else {
      calm = 0;
      duration = t + 1;
    }
  }
  const easing = (p) => (p >= 1 ? 1 : evaluate(state, p * duration).value);
  return { easing, duration };
}

/**
 * Same curve as `springCurve`, sampled into a CSS `linear()` easing for CSS transitions and
 * WAAPI.
 *
 * @returns {{easing: string, duration: number}}
 */
export function springEasing(config = {}) {
  const { easing, duration } = springCurve(config);
  const steps = Math.min(Math.max(Math.ceil(duration / 10), 8), 100);
  const points = [];
  for (let i = 0; i <= steps; i++) points.push(+easing(i / steps).toFixed(4));
  return { easing: `linear(${points.join(', ')})`, duration };
}

/**
 * Resistance for dragging past a bound: returns the visible overshoot for a raw overshoot.
 * Approaches `dimension` asymptotically; `c` sets stiffness (0.55 matches iOS scroll views).
 */
export function rubberBand(overshoot, dimension, c = 0.55) {
  const sign = Math.sign(overshoot);
  const d = Math.abs(overshoot);
  return sign * (1 - 1 / ((d * c) / dimension + 1)) * dimension;
}

/**
 * Runs `frame(now)` once per animation frame while it returns true, then idles until the next
 * `kick()`. Reads performance.now() instead of the rAF timestamp so frames never sample
 * earlier than an event recorded in the same frame.
 */
export function createLoop(frame) {
  let id = 0;
  const tick = () => {
    id = frame(performance.now()) ? requestAnimationFrame(tick) : 0;
  };
  return {
    kick() {
      if (!id) id = requestAnimationFrame(tick);
    },
    stop() {
      cancelAnimationFrame(id);
      id = 0;
    },
  };
}
