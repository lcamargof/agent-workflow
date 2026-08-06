# Pilot — Proving the Thesis

Goal: price the bet (`open-questions.md` R7) with a pet project small enough to finish and real enough to hurt. The pilot proves or kills three claims:

1. **Parallelism claim**: N agents on N capsules with frozen contracts ship faster and with fewer cross-boundary breaks than the same task run single-agent on a conventional layout.
2. **Trust claim**: an agent working inside a capsule completes changes with near-zero foreign reads, and the whole-graph check catches every undeclared dependency it tries to sneak in.
3. **Regeneration claim** (stretch): a low-risk capsule regenerated from contract + tests passes the gate stack and survives real use.

## Shape of the pet project

Requirements for a good candidate:
- Greenfield (no ratchet noise polluting the signal).
- 4–8 natural capsules + a small kernel — enough graph to exercise boxes, few enough to finish.
- At least one genuinely high-risk capsule (to exercise derived risk floors + human review lane) and several low-risk ones (to exercise the regeneration experiment).
- At least two capsules with a real consumer/provider edge (to exercise verified fakes + pending expectations).
- Something Luis actually wants to exist, or it dies of apathy.

Candidate directions (decide at kickoff, not here): a standalone tool/service in the product orbit (e.g., something adjacent to an internal service or a module data utility), or a neutral non-work app. Bias: neutral is a cleaner experiment; product-orbit is more likely to stay alive after the experiment. Both acceptable.

## Build order

1. **Kernel + scaffolding first**: capsule template, capsule-lint v1 (boundary lint + provides generation + requires diff), the local `verify` runner, whole-graph check. This is also the kit deliverable — the pilot builds the tooling by using it.
2. **Contracts before implementation**, every capsule (contract-first loop from design.md §2/§7). The contract diffs are the plan artifacts; no separate plan docs.
3. **Fan out**: one agent per capsule in worktrees, orchestrated; human reviews contract diffs + the high-risk capsule only.
4. **Late-stage experiments**: regenerate one low-risk capsule from scratch against its contract (claim 3); run one cold-stranger drill (foreign model, zero context, one capsule task).

## Measures (deliberately lightweight — heavy measurement gets skipped)

Recorded per work session in the project wiki, nothing fancier:

- Foreign files read per capsule task (the agent's own transcript shows it; spot-check, don't instrument).
- Human steering interventions per task (count + one-line cause).
- Boundary escapes: undeclared deps attempted / caught by lint vs caught later (this ratio is the trust claim, directly).
- Contract churn: contract edits per capsule per week (R2's price tag).
- Fleet wall-clock vs critical path through the contract graph for one fanned-out feature.
- Regeneration: gate pass/fail + post-regeneration defects found within a week.

## Kill / continue criteria

- **Continue** if: boundary escapes are caught mechanically (near-100% at the lint/graph layer), steering drops noticeably on in-capsule tasks, and contract churn stabilizes after the first week (boundaries settle).
- **Rethink boundaries** (not the thesis) if: one or two capsules absorb most churn — that's a wrong cut, packwerk-style; re-cut along how the code runs.
- **Kill** if: contract maintenance visibly exceeds coordination savings across the whole pilot (the R7 bet lost), or agents route around the gates faster than we can harden them (R3 lost). Write the post-mortem either way — a killed thesis with a written why is a successful pilot.

## After the pilot

Success path: promote capsule-lint + templates + `capsule-skill.md` (to `skills/capsule.md`) (+ an orchestration skill, written from observed practice, not speculation) into the kit proper; then the reference app brownfield begins with the overview diagnostic (graph first, ratchet second, migrate opportunistically).
