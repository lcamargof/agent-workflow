# Prior Art — The Ten Laws

Distilled from five research sweeps (full sourced reports in `research/`): build-system boundary enforcement, manifest/capability systems, contract testing & interface evolution, modular-architecture war stories, LLM-era codebase patterns. Headline: **the capsule combination — machine-verified per-module contract + auto-loaded agent context + local verification — is unoccupied ground; every component mechanism exists and is battle-tested somewhere.** Existing context linters (ctxlint, agents-lint) check freshness only, never provides/requires semantics. Closest research: auto-generated architecture descriptors cut agent navigation 33–44% (arXiv 2604.13108). Closest practice: teams ad-hoc composing Nx boundaries + nested AGENTS.md + scoped test targets.

Naming: "context capsule" is taken (unrelated products); "Agent Capsules" exists in arXiv for pipeline orchestration. "Capsule architecture" appears clear.

## The laws

**1. Generated declarations can't lie; hand-written ones rot in months.**
OSGi's bnd derives Import-Package from bytecode — drift structurally impossible. VS Code infers activation events from contributions. Spring Modulith regenerates each module's doc canvas from the verified model on every test run. Auto-generated descriptors beat hand-written on precision (100% vs 80%). Counterexamples: Android permissions (~1/3 of apps overprivileged — from confusion, not malice), Helm values schemas (optional ⇒ universally rotted). → Generate both contract sides; humans sign the diff (api-extractor model).

**2. Any escape hatch cheaper than the honest path becomes the default.**
OSGi `DynamicImport-Package: *`; Deno `-A`; npm `"./*": "./*"`; Jest `-u` snapshot blindness; packwerk todo graveyards. Chrome's fix is the model: make the narrow path *strictly cheaper* (activeTab: no warning, no review penalty, auto-expiring). Generation gives tight-by-default for free.

**3. Enforcement rides something that already runs; docs derive from the verified model.**
Spring Modulith's `verify()` is a JUnit test; buf breaking is a CI step. Every degenerated effort became "a ledger of exceptions with no owner"; every survivor bound the check to the ordinary build/test cycle and generated human-facing artifacts from the same model it verified.

**4. Structure can be totally enforced; behavior is the permanent gap — with a number on it.**
Elm's registry computes versions from API diffs and refuses understated bumps (structural enforcement can be total) — yet its canonical counterexample (`maxSize = 3` → `-3` ships as PATCH) shows types ≠ semantics. Program-repair literature: **73–81% of patches passing full suites are wrong outside them.** The composite that closes the gap: property-based tests (name behavior, never structure — regeneration-stable), characterization corpus + differential testing vs the old implementation (AWS Cedar's production architecture), and **mutation score as the mechanical answer to "is this spec tight enough to regenerate against."**

**5. Risk is derived, never self-declared.**
Chrome: broad permissions route to slow human review. Google Play: SMS permission requires a *role*, not a checkbox. Fuchsia: sensitive capabilities pinned in an allowlist whose edits require security review. bnd: computes change severity, refuses understated versions. No surveyed system lets an author claim low risk while holding dangerous capabilities.

**6. All-or-nothing module systems die; shrink-only ratchets survive.**
JPMS: shipped late, collective-action payoff, permanently stalled. OSGi: correct-but-undiagnosable errors made people leave despite the resolver being right. Survivors: ArchUnit FreezingArchRule (fixed violations auto-removed — shrink-only), packwerk per-package todos (adjacent to owner). Packwerk's caveat: a ratchet with no drain plan is permanent amnesty — Shopify were likely the first user ever to empty a todo file, years in.

**7. Static green ≠ actually isolated.**
Shopify packages with zero violations still crashed alone (dynamic loads, implicit framework deps). Isolation must be executable: the capsule's suite boots and passes with only declared dependencies present.

**8. Boundary independence, not deployment independence.**
Micro-frontends died of per-fragment infra + version skew; Zalando's end-state (team autonomy inside one platform-owned runtime) is capsules + kernel. VS Code beat Eclipse with a dependency graph that is "a simple tree of depth one" — a measurable target, and under a fleet, a throughput requirement.

**9. Error messages are part of the enforcement design.**
Fuchsia names the exact broken hop ("X was not offered to Y by parent"); OSGi's uses-conflicts needed a blog series to decode and people routed around *correct* enforcement. Primary reader of capsule-lint output is an agent that acts on it immediately.

**10. Agent context is auto-loaded by position, never fetch-on-judgment.**
Static always-loaded context: 100% task pass vs 79% when the agent had to decide to fetch. Directory-scoped loaders (CLAUDE.md/AGENTS.md nesting) are the delivery mechanism; index-server/MCP-lookup approaches are ruled out for capsule context. Bonus (VS Code lazy activation): manifests let a planner see every capsule's surface without paying any body's context cost.

## Steal-map (mechanism → source → where it lands)

| Mechanism | Source | Lands in |
|---|---|---|
| Generate surface, sign the diff | api-extractor `.api.md`; bnd | CONTRACT.md `provides`, capsule-lint |
| Declared outbound policy vs derived actuals | Buck2 `visibility`/`within_view` | `requires` policy check |
| Default-deny by placement | Go `internal/` | capsule `src/` privacy |
| Computed version, refused understatement | Elm registry; bnd baselining; cargo-semver-checks | §4 versioning (+ tests-as-surface, our extension) |
| Breaking-for-whom rule bundles | buf FILE/PACKAGE/WIRE tiers | surface-diff classification |
| Whole-graph route verification | Fuchsia scrutiny | assembly CI check |
| Sensitive-capability external allowlist | Fuchsia component_manager_policy | risk floors, human-owned |
| Review tier priced by declared capabilities | Chrome Web Store; Google Play declarations | risk derivation |
| Verified fakes + shared contract suite | Google SWE book ch.13; ploeh; Fowler ContractTest | `fake/` + contract suite |
| Pending expectations, blocks only author | Pact pending/WIP pacts | cross-capsule lifecycle |
| Compatibility vs observed usage | Apollo operation checks (+ its traffic-window blind spot) | consumer-closure scoping caveat |
| Shrink-only violation baseline | ArchUnit FreezingArchRule; dep-cruiser known-violations | brownfield ratchet |
| Typed contract vocabulary over edge regexes | import-linter layers/independence/forbidden | boundary lint config |
| Module test in isolation + generated module canvas | Spring Modulith `@ApplicationModuleTest`, Documenter | local verify + doc generation |
| Zero-dep kernel at the bottom | Shopify Platform Essentials; DDD shared-kernel containment | platform layer rules |
| Edge relationship types | DDD context mapping (conformist/ACL/customer-supplier) | `requires.capsules` edge metadata |
| Small durable spec + differential acceptance of disposable implementations | AWS Cedar | regeneration gate |
| Reward-hacked verifier warning | AlphaVerus | adversarial spec audit requirement |
| Witness programs for claimed breakage | cargo-semver-checks study | nice-to-have: breakage evidence artifacts |
| Contract-before-parallelism; worktree per agent | 2025-26 multi-agent conventions | fleet model |

## Anti-patterns (learned the expensive way by others)

- Hand-maintained consumer lists (drift is guaranteed — every system that tried).
- Prose privacy rules without resolution-level enforcement (packwerk privacy checker: deleted in 3.0; our own repo violated its own written rule within weeks).
- Ceremony-first spec systems ("sea of markdown" — Spec Kit criticism; Codified Context's 19-agent constitution).
- Append-only logs as coordination bus (races, stale instructions executed late — including our own stale-checkout incident).
- Baselines without drains; extension registries between modules (Eclipse); runtime composition when build-time suffices (micro-frontends); index servers for context (staleness + agents fail the fetch decision).
