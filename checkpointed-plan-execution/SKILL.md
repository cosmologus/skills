---
name: checkpointed-plan-execution
description: Create and execute implementation plans in explicit checkpoints with user approval between steps. Use when the user wants work broken into numbered steps, wants to review or edit code after each step, asks to continue step by step, or wants later implementation adapted to their manual changes.
---

# Checkpointed Plan Execution

Use this skill when implementation should move through explicit review checkpoints instead of running straight through.

## Core Rules

- Break the work into as many concrete steps as needed.
- Keep progress visible as `current/total`, such as `1/5` and `5/5`.
- Only one step may be in progress at a time.
- After each completed step, stop and wait for the user before starting the next one.
- Treat user edits between steps as signal, not interference.
- Never overwrite or revert user changes unless they explicitly ask for that.

## Workflow

### 1. Build the plan

- Inspect the relevant code or files first.
- Convert the goal into sequential steps that can be reviewed independently.
- Keep each step narrow enough that the user can validate it in one pass.
- Present the full sequence up front and mark it as `0/N`.
- If a plan-tracking tool is available, keep it in sync with the same step count.

### 2. Execute the current step

- Announce the active step as `i/N`.
- Implement only the scope of that step.
- Run targeted checks for that step when possible.
- Summarize what changed and what the user should review.
- Stop when that step is complete.

### 3. Pause for review

- Do not begin `i+1/N` until the user explicitly says to continue.
- If the user requests revisions, stay on the same step number until that step is accepted.
- If the user edits files directly, read those changes before taking any new action.

### 4. Adapt to user edits

- Compare the current code to the state from the previous checkpoint.
- Infer preferences from concrete edits: naming, factoring, comments, formatting, control flow, and file layout.
- Apply those preferences to the remaining work.
- If the edits change the implementation path, re-slice the remaining work and update `N` clearly.

### 5. Finish cleanly

- Repeat until the final step reaches `N/N`.
- End with a concise summary of what was completed, what was verified, and any remaining risks.

## Guardrails

- Do not compress multiple reviewable changes into one large step just to keep the count small.
- Do not continue automatically after reporting a completed step.
- Do not ignore user edits when planning the next step.
- Do not cling to the original plan if the code changed in a way that makes replanning necessary.

## Example Status Lines

- `Plan ready: 0/4`
- `Working: 1/4`
- `Paused for review: 1/4 complete`
- `Replanned after user edits: 1/5`
- `Finished: 5/5`
