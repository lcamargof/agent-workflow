# Capsule Specification (binding)

The frozen, authoritative definition of a capsule (converged 2026-07-24). `design.md`,
`prior-art.md`, and the dated review notes here are rationale and history; this file is the
decision. `pilot.md` is how it gets proven; `README.md` is the one-page pitch.

A capsule is:

> A qualified software module plus a generated, budgeted agent view and optional earned
> structural enforcement.

It is not automatically a process, service, security sandbox, fault domain, deployment unit,
version, work packet, or agent.

## Qualification

A module must pass all five:

1. **Deletion:** removing it removes a coherent capability.
2. **Depth:** its seam is smaller than the behavior hidden.
3. **Locality:** most conceptual changes remain inside.
4. **Test seam:** important behavior is observable through a stable public seam.
5. **Economic case:** recurring navigation, coordination, defect, or verification cost could
   repay the capsule tax.

## Three states

**Folder** — the default for new and fast-changing features. Ordinary local code and tests. No
capsule context or policy tax.

**Observed** — an existing qualified boundary with native public entry paths. Generated direct
dependencies, consumers, side-effect observations, and blind spots; a compact hot brief and a
conservative impact query. Violations report; they do not block.

**Enforced** — rejects internal/deep imports; checks allowed versus actual edges; routes
selected ambient I/O through named platform seams; propagates effect categories across edges
and routes cross-module writes to stronger review; fails closed or widens on analyzer
failure/staleness; owns and expires its own exceptions; provides honest local-verification
isolation.

Promotion is evidence-driven and reversible. Demotion, merge, split, or removal are all valid.

## Separate boundary axes

| Axis | Question | v1 |
| --- | --- | --- |
| Source/module | Who may import what? | Observed/enforced |
| Task/allocation | Who should do this change? | Computed per task |
| Runtime/fault | What failure is contained? | Out of scope |
| Security/authority | What can code actually access? | Observation/routing only |

Observed side effects are review and scope signals, never security claims. Changing or deleting
contract-test evidence flags the affected intent and widens consumer verification; tooling does
not infer that the semantic change is breaking, safe, major, or minor.

## Artifacts

**Authored policy** (in the existing config): name/root/mode; purpose and high-value intent
invariants; public entry paths; allowed module/platform edges; local verify command; owned
temporary exceptions.

**Generated cold report**: actual direct dependencies and consumers; supported public surface
facts; unresolved/dynamic edges; observed effects and blind spots; analyzer provenance,
freshness, and input digest.

**Generated hot brief**: purpose and intent; public entry paths; direct allowed/actual edges;
verify command and honest isolation; observed effects and blind spots; a query path for detail.

**Task packet** (only when needed): goal and intent path; bounded writable roots; allowed
public paths; changed cut edges; focused verifier; compact handoff contract.

Use native interface declarations at independently consumed or changed public cut edges.
Markdown describes; the language/schema mechanism enforces.

## Boundary rent

Every capsule feature carries recurring rent — keeping the policy true as code changes,
regenerating the view, honoring the edges. A feature is only worth its rent where the
qualification's economic case is real. When the rent exceeds the return, demote toward Folder.

## Not in v1

One agent per capsule; a separate capsule CLI/config/database/service; a general cross-stack
adapter framework; internal semantic versions; universal provider fakes or pending
expectations; artifact attestation; mutation thresholds; regeneration authority; runtime
security or fault isolation; dashboards or telemetry services.
