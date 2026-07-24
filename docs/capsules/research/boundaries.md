# Research: Static/Build-Time Boundary-Enforcement Mechanisms

Provenance: research-agent sweep, 2026-07-24. Preserved verbatim as evidence base; synthesis lives in `../prior-art.md`.

## 1. Bazel visibility + package_group / Buck2

**(a) Mechanism.** Every Bazel target carries a `visibility` attribute: a list of package patterns (or `package_group` targets) allowed to depend on it. Enforcement happens at build-graph analysis time — an out-of-visibility dep is a hard analysis error before anything compiles. `package_group` names a reusable set of packages (with `includes` for composition) so many BUILD files can share one audience definition. Buck2 mirrors this and adds the inverse: `within_view` restricts what a target *may depend on* (outbound allowlist), with `within_view` taking precedence over the dependee's `visibility` on conflict; Buck2 `PACKAGE` files let both be inherited hierarchically.

**(b) Declared vs derived.** Humans declare visibility lists, package_groups, and per-package `default_visibility`; the tool derives the full dependency graph from BUILD files and checks every edge against declarations. Nothing about the consumer graph is inferred/registered automatically — consumers just fail if not allowlisted. Default when undeclared: `//visibility:private` (Bazel) / same-BUILD-file-only (Buck2).

**(c) Violations.** Hard fail at analysis time. No warning tier, no baseline. Brownfield escape hatch in practice: an "allowlist" package_group of legacy consumers that you shrink over time — a hand-rolled ratchet, not tool-supported.

**(d) Failure modes.** At scale, visibility declarations become overwhelming to maintain; Salesforce built a dedicated tool (bazel-visibility-tool) for centralized layer/allowlist management because raw per-target visibility didn't scale. Practitioner guidance: each package should appear in at most one visibility group to keep cognition manageable. Historical inconsistency: `config_setting` visibility wasn't enforced for years (`--incompatible_enforce_config_setting_visibility` migration flags). Also, visibility only guards inbound edges — Bazel has no native `within_view` equivalent, so "what may this module use" needs extra tooling.

**(e) Steal.** The **two-sided model from Buck2**: `visibility` (who may consume me) + `within_view` (what I may consume) as separate declarations, with the outbound constraint winning on conflict. That pair maps exactly onto "declared surface" + "declared requirements" in a capsule. Also `package_group` as a named, composable audience object rather than inline lists.

Sources: [Bazel visibility](https://bazel.build/concepts/visibility), [Buck2 visibility](https://buck2.build/docs/concepts/visibility/), [Buck2 PACKAGE files](https://buck2.build/docs/rule_authors/package_files/), [salesforce/bazel-visibility-tool](https://github.com/salesforce/bazel-visibility-tool)

## 2. Nx module boundaries + affected; Turborepo

**(a) Mechanism.** Nx builds a project graph by parsing imports and package.json deps. Each project declares string tags (`"tags": ["scope:client", "type:ui"]`); the `@nx/enforce-module-boundaries` ESLint rule checks every import edge against `depConstraints` (which source tags may depend on which target tags; also `notDependOnLibsWithTags`, external-package constraints, banning circulars and deep imports outside a project's entry point). `nx affected` uses the same derived graph plus git diff to run lint/test/build only on projects transitively affected by a change.

**(b) Declared vs derived.** Humans declare tags and the tag-constraint matrix (in root ESLint config); the tool derives the project graph, the affected set, and the actual import edges. Constraints compose with AND across all tags a project has.

**(c) Violations.** ESLint errors — hard fail if lint gates CI. No native baseline; since ESLint v9.24 you can layer [bulk suppressions](https://eslint.org/blog/2025/04/introducing-bulk-suppressions/) (`--suppress-all` → `eslint-suppressions.json`) on top, though Nx executor integration has open bugs ([nx#35284](https://github.com/nrwl/nx/issues/35284)).

**(d) Failure modes.** Performance: the rule historically took minutes on large workspaces because it needs the whole project graph inside a lint run ([nx#3161](https://github.com/nrwl/nx/issues/3161)). False-positive circular deps reported ([discussion #30174](https://github.com/nrwl/nx/discussions/30174)). Tag taxonomy drift: untagged projects silently match `*` catch-all constraints or become unable to depend on anything; the escape-hatch `{"sourceTag": "*", "onlyDependOnLibsWithTags": ["*"]}` hides both config errors and real violations. Tags are stringly-typed with no schema — typos enforce nothing.

**Turborepo Boundaries** (experimental since 2.4): tags declared in each package's `turbo.json`, allow/deny rules in root `turbo.json`; also checks undeclared dependencies and files imported from outside the package dir (which silently break caching). Rust-side implementation, `turbo boundaries` command; still marked experimental, no baseline mode. ([docs](https://turborepo.com/docs/reference/boundaries), [RFC #9435](https://github.com/vercel/turborepo/discussions/9435))

**(e) Steal.** The **tags-as-indirection** pattern: constraints are written against a small vocabulary of tags, not against N² project pairs — new capsules join a policy by declaring tags, and the matrix stays O(taxonomy) not O(modules). And from `affected`: hashing the derived graph so verification scope is computed, not chosen by the agent — exactly the "local verification with minimal context" property you want. Turborepo's insight that *boundary violations are also cache-correctness violations* is a good framing: an undeclared input is both an architecture bug and a build bug.

Sources: [Nx enforce-module-boundaries](https://nx.dev/docs/features/enforce-module-boundaries), [ESLint rule reference](https://nx.dev/docs/technologies/eslint/eslint-plugin/guides/enforce-module-boundaries), [Nx blog on boundaries](https://nx.dev/blog/mastering-the-project-boundaries-in-nx)

## 3. TypeScript project references / package.json `exports` / api-extractor

**(a) Mechanisms.** *Project references*: each package's tsconfig sets `composite: true` and lists `references`; TS resolves cross-project imports only through referenced projects' emitted `.d.ts`, giving incremental per-project builds and refusing imports of unreferenced projects. *`exports` field*: once present in package.json, **all non-listed subpaths are encapsulated** — `require('pkg/internal/x')` throws `ERR_PACKAGE_PATH_NOT_EXPORTED`; resolution-level enforcement by Node/bundlers/TS (`moduleResolution: bundler/node16`). *api-extractor*: rolls up all exports reachable from the entry point into a committed `etc/<pkg>.api.md` pseudocode report; CI fails when the generated report differs from the committed one, forcing API changes through explicit review; also enforces `@public/@beta/@internal` release tags and generates trimmed `.d.ts` rollups.

**(b) Declared vs derived.** Humans declare: references list, exports map, release tags (TSDoc), entry point. Tool derives: build order, the full public surface (api.md is *generated*, humans only approve the diff), which subpaths resolve.

**(c) Violations.** Project refs: hard compile error. `exports`: hard resolution error at build/runtime — but *not strong encapsulation*: absolute-path requires still work, and older resolvers/metro configs ignored `exports` for years. api-extractor: configurable per message (error/warning/none); the api.md diff is effectively a **committed baseline** — the check is "surface changed without acknowledgment", not "surface is wrong".

**(d) Failure modes.** Project refs: notorious config burden (every package needs composite + declaration + references kept in sync with package.json deps — usually needs a generator like moon/Nx sync to not rot; [TS#59727](https://github.com/microsoft/TypeScript/issues/59727) shows the opt-out mess); they enforce *reference topology*, not fine-grained "which symbols". `exports`: ecosystem-resolution drift (tools that ignore it), dual-CJS/ESM hazard, and it can't express per-consumer audiences — it's public/private only. api-extractor: single-entry-point assumption, TSDoc strictness, monorepo multi-package setup is boilerplate-heavy; it detects *changes*, not *semver correctness* (no breaking-vs-additive classification as strong as cargo-semver-checks).

**(e) Steal.** api-extractor's core move: **the machine-generated surface report committed next to the module, with CI failing on unacknowledged drift**. That's the exact mechanic for a capsule's "declared surface is machine-checked": humans don't write the surface, they *sign* it. Combine with `exports`-style resolution enforcement so the surface file is also the only physically importable thing.

Sources: [TS Project References handbook](https://www.typescriptlang.org/docs/handbook/project-references.html), [Nx on TS project refs](https://nx.dev/blog/typescript-project-references), [Node packages/exports](https://nodejs.org/api/packages.html), [api-extractor API report demo](https://api-extractor.com/pages/overview/demo_api_report/), [api-extractor README](https://github.com/microsoft/rushstack/blob/main/apps/api-extractor/README.md)

## 4. Go `internal/` / Rust visibility + cargo-semver-checks

**(a) Go.** Compiler-enforced path convention since Go 1.4: a package under `.../internal/...` is importable only by code rooted at `internal`'s parent. Zero configuration, nestable, one bit of information (in/out). **Rust:** item-level visibility keywords — private by default, `pub`, `pub(crate)`, `pub(super)`, `pub(in path)` — enforced by the compiler; cargo workspaces share deps/lockfile but crate boundaries are the visibility unit. **cargo-semver-checks:** diffs the rustdoc JSON of the new version against the released baseline via Trustfall queries (~100+ lints) and reports semver-major/minor changes that the version bump doesn't license.

**(b) Declared vs derived.** Go: humans declare only directory placement; everything else derived. Rust: humans declare per-item visibility inline; compiler derives reachability (`pub` item in private module is effectively invisible). semver-checks: humans declare only the version number; the tool derives both API surfaces and the breaking-change classification.

**(c) Violations.** All hard compile/CI fail. No baseline concept in Go/Rust visibility. cargo-semver-checks: lint levels configurable (allow/warn/deny per lint in Cargo.toml, `[package.metadata.cargo-semver-checks]`); the "baseline" is the previously published crate, fetched automatically.

**(d) Failure modes.** Go: only two audiences (inside subtree / everyone) — no way to say "these two modules may see each other"; cargo-cult top-level `internal/` in apps that export nothing anyway ([criticism](https://mortenvistisen.com/posts/top-level-internal-is-unnecessary)). Rust: visibility is per-item and syntactic — great precision, but no cross-crate "friend" concept; workspace-internal crates must be `pub` to each other, so people publish accidentally-public surfaces (mitigated by not publishing, or `#[doc(hidden)]` hacks). semver-checks: acknowledged false negatives (can't detect all break classes — type changes, auto-trait leaks), and cross-crate re-exports are the top false-positive source; runtime/behavioral breakage invisible ([predr.ag on challenges](https://predr.ag/blog/four-challenges-cargo-semver-checks-has-yet-to-tackle/), [docs.rs](https://docs.rs/crate/cargo-semver-checks/latest)).

**(e) Steal.** From Go: **zero-config default-deny by placement** — a capsule's `internal/` needs no manifest entry at all; the cheapest possible declaration is a directory name. From cargo-semver-checks: **classifying surface diffs as breaking vs additive against the declared version**, so "did my change require consumers to change" is machine-answered — the missing piece api-extractor doesn't do.

Sources: [internal packages proposal](https://groups.google.com/g/golang-dev/c/_cAggq73yME), [Go module layout](https://go.dev/doc/modules/layout), [cargo-semver-checks](https://crates.io/crates/cargo-semver-checks), [Rust project goal: merge into cargo](https://rust-lang.github.io/rust-project-goals/2024h2/cargo-semver-checks.html)

## 5. JPMS + ArchUnit

**(a) JPMS.** `module-info.java` declares `requires` (deps), `exports` (packages visible to all or `exports ... to <friend>`), `opens` (reflection access), `provides/uses` (services). Enforced by compiler *and* runtime — even reflection is blocked without `opens`. ArchUnit: a Java library where architecture rules are unit tests (`noClasses().that().resideIn("..domain..").should().dependOnClassesThat().resideIn("..web..")`), evaluated against imported bytecode in the normal test run.

**(b) Declared vs derived.** JPMS: humans declare everything in module-info (requires/exports per module); tool derives the readability graph and fails on split packages, missing modules, illegal access. ArchUnit: humans declare rules in test code; tool derives the class-dependency graph from bytecode.

**(c) Violations.** JPMS: hard fail (compile or launch), escape hatches only via CLI flags (`--add-exports`, `--add-opens`) — no baseline. ArchUnit: test failure, **but** `FreezingArchRule.freeze(rule)` records current violations into a committed `archunit_store` (text files, `stored.rules` index); new violations fail, fixed ones are auto-removed, so the baseline monotonically shrinks — a first-class ratchet.

**(d) Why JPMS stalled.** (i) It shipped a decade late (2017): Maven/Gradle/OSGi and convention had already solved dependency management, so JPMS solved a problem people had stopped feeling; (ii) benefits are back-loaded and collective — jlink needs the *entire* graph to be explicit modules, automatic modules block it, so early adopters pay cost for no payoff; (iii) mixed classpath/module-path semantics and opaque `InaccessibleObjectException` failures; (iv) Colebourne's "negative benefits" argument: for library authors, module-info adds split-package landmines and constraints while the ecosystem can't consume them anyway; (v) frameworks depending on reflection (Spring, Hibernate) forced pervasive `opens`, gutting the encapsulation value. JSR-376 was even initially voted down by the EC in 2017. Enterprise adoption remains low in 2026. **Lesson for capsules: an all-or-nothing boundary system with collective-action payoff fails; incremental per-module value and a debt mechanism are mandatory.**

**(e) Steal.** From JPMS: `exports ... to <specific-module>` — **per-consumer (friend) exports** as a first-class concept, and the requires/exports symmetry in one manifest file. From ArchUnit: **rules as executable tests co-located with code**, plus the shrink-only violation store design (fixed violations leave the baseline automatically — no stale-todo problem).

Sources: [ArchUnit user guide](https://www.archunit.org/userguide/html/000_Index.html), [Colebourne: JPMS negative benefits](https://blog.joda.org/2018/03/jpms-negative-benefits.html), [InfoQ: JPMS rejected](https://www.infoq.com/news/2017/05/jpms-rejected), [Java Module System in 2026](https://www.javacodegeeks.com/2026/04/java-module-system-in-2026-still-ignored-still-relevant.html), [FreezingArchRule example](https://github.com/TNG/ArchUnit-Examples/blob/main/example-plain/src/test/java/com/tngtech/archunit/exampletest/FrozenRulesTest.java)

## 6. Packwerk (Shopify)

**(a) Mechanism.** Each package is a directory with `package.yml` declaring `enforce_dependencies: true|strict` and an explicit `dependencies:` list of other packages. Packwerk statically resolves Ruby constant references (via Zeitwerk conventions) and flags references to packages not in the declared dependency list. Privacy checking (`enforce_privacy` + `app/public` folder) existed but was **removed in v3.0**.

**(b) Declared vs derived.** Humans declare package boundaries (directory + yml) and each package's allowed dependencies. Tool derives actual constant references. Todo files are tool-generated.

**(c) Violations.** The defining feature: `packwerk update-todo` writes every current violation into per-package `package_todo.yml` (né `deprecated_references.yml`), CI fails only on *new* violations — "declare bankruptcy, hold the line." `enforce_dependencies: strict` refuses new todo entries entirely.

**(d) Failure modes (the retrospective is brutal and essential reading).** (i) Domain-based package boundaries "do not reflect the way Shopify's code actually functions," producing "monstrously large todo files" that grew faster than teams fixed them — Shopify believes they were the *first user ever* to fully empty a todo file, years after release; (ii) static analysis blind spots: dynamic constants, `require`/autoload, Rails engine routes/initializers/fixtures — packages with **zero violations still crashed when run in isolation**; (iii) privacy enforcement turned a dependency tool into an API-design tool and fought Rails conventions, so they deleted it; (iv) lesson: when a violation appears, ask whether the *graph* is wrong, not just the code — adjust boundaries to observed reality. "A sharp knife, wielded with care."

**(e) Steal.** Two things: the **per-package todo file as the canonical ratchet artifact** (violations recorded adjacent to the owning package, diffable, reviewable), and the retrospective's negative lesson — **static boundary green ≠ actually decoupled; capsules need an executable isolation check** (can this module load/test alone?), which is precisely the "local verification" pillar. Packwerk proves declared-surface checking without runtime verification gives false confidence.

Sources: [Packwerk retrospective](https://shopify.engineering/a-packwerk-retrospective), [USAGE.md](https://github.com/Shopify/packwerk/blob/main/USAGE.md), [original announcement](https://shopify.engineering/enforcing-modularity-rails-apps-packwerk), [strict mode discussion](https://github.com/Shopify/packwerk/discussions/241)

## 7. import-linter (Python) / deptrac (PHP)

**(a) import-linter.** Config file (`.importlinter` / pyproject) declares typed **contracts** over the statically-built import graph (via Grimp): `forbidden` (X must not import Y, even indirectly), `independence` (siblings never import each other), `layers` (ordered list, only downward imports; supports `containers` to apply one layering across many subpackages). `lint-imports` checks all contracts. **deptrac:** YAML/PHP config defines **layers** via collectors (namespace/class/attribute/directory patterns) and a **ruleset**; default is *all inter-layer dependencies forbidden* unless allowed; `+layer` transitively inherits the allowed set.

**(b) Declared vs derived.** Both: humans declare layer membership rules and allowed relations; tools derive the actual dependency graph (imports / use-statements + type references) and check edges. Note deptrac's default-deny is stricter than most JS tools' default-allow.

**(c) Violations.** import-linter: hard fail; no generated baseline — brownfield handled by per-contract `ignore_imports` lists (wildcards supported, `unmatched_ignore_imports_alerting: error|warn|none` keeps the ignore list from rotting — a manual ratchet with staleness detection). deptrac: has a real **baseline formatter** — generates a `deptrac_baseline` file of `skip_violations` importable from the main config, regenerable; violations otherwise fail CI, with `reportUncovered`/warning options.

**(d) Failure modes.** import-linter: whole-graph static analysis cost on very large codebases (mitigated by caching added in v2.x); Python dynamism (import-inside-function is seen, but `importlib`/string imports aren't); contracts are expressive but the config is centralized — one big file far from the code it governs. deptrac: collector regexes drift from the actual namespace layout; uncovered classes (in no layer) silently escape rules unless `reportUncovered` is on; YAML config for large layer counts gets unwieldy (they added PHP-config for dynamism).

**(e) Steal.** import-linter's **typed contract vocabulary** (`layers` / `independence` / `forbidden` as named contract types rather than raw edge rules) — a capsule manifest could ship the same three primitives and cover ~90% of real policies; plus `unmatched_ignore_imports_alerting` — **the ignore-list itself is linted for staleness**, solving the rotting-baseline problem most tools ignore. From deptrac: **default-deny between layers** as the starting posture.

Sources: [import-linter contract types](https://import-linter.readthedocs.io/en/latest/contract_types.html), [repo](https://github.com/seddonym/import-linter), [Seddon: Meet Import Linter](https://seddonym.me/2019/05/20/meet-import-linter/), [deptrac](https://github.com/deptrac/deptrac), [deptrac concepts](https://deptrac.github.io/deptrac/concepts/), [deptrac configuration (baseline)](https://github.com/deptrac/deptrac/blob/3.0.x/docs/configuration.md)

## 8. dependency-cruiser / eslint-plugin-boundaries

**(a) dependency-cruiser.** Standalone CLI: crawls the actual JS/TS resolution graph (including npm deps, orphans, circulars) and validates it against `.dependency-cruiser.js` rules — each rule = name + severity + `from`/`to` path-regex matchers with rich predicates (`circular`, `couldNotResolve`, `moreThanOneDependencyType`, license, orphan, `reachable`). Also generates graph visualizations. **eslint-plugin-boundaries:** ESLint plugin; `settings` classify files into named **element types** via patterns with capture groups; rules (`element-types`, `entry-point`, `external`, `no-private`) allow/deny relationships between types, with captured values usable in matchers (e.g. "a component may import its own children only").

**(b) Declared vs derived.** Humans declare rule sets / element-type taxonomies (both are config-heavy, regex-based); tools derive the real dependency graph (dep-cruiser) or per-file classification + import targets (boundaries).

**(c) Violations.** dep-cruiser: per-rule severity `error|warn|info|ignore`; **native baseline**: `depcruise-baseline` writes `.dependency-cruiser-known-violations.json`, subsequent runs report only new violations. eslint-plugin-boundaries: standard ESLint errors; no native baseline, but composes with ESLint v9.24 bulk suppressions.

**(d) Failure modes.** Both are famous for **config burden**: regex-matcher rule sets grow into a parallel model of the architecture that drifts from reality; dep-cruiser on huge monorepos is slow (full graph crawl; caching/`--affected` options exist but tuning is on you); rules are path-based, so a file move silently changes its policy. eslint-plugin-boundaries: element-type patterns are order-sensitive and debugging "why was this file classified as X" is a common complaint (there's a debug env var for exactly that); ESLint-run-scoped, so it only sees files ESLint touches. Neither has a first-class "public surface" concept — entry-point rules approximate it.

**(e) Steal.** dep-cruiser's **severity ladder per rule + generated known-violations baseline as a plain JSON artifact** (tool-written, human-committed); and eslint-plugin-boundaries' **capture-group matchers** — rules can reference properties of *both* endpoints ("elements of family X may only import same-`${family}` elements"), which is more expressive than flat tag matrices and would let capsule rules be written once, parameterized by capsule identity.

Sources: [rules reference](https://github.com/sverweij/dependency-cruiser/blob/main/doc/rules-reference.md), [CLI docs incl. baseline](https://github.com/sverweij/dependency-cruiser/blob/main/doc/cli.md), [eslint-plugin-boundaries](https://github.com/javierbrea/eslint-plugin-boundaries)

---

## Ratchet / baseline support matrix (the brownfield question)

| Tool | Ratchet mode | Mechanics |
|---|---|---|
| **Packwerk** | **Yes, first-class** | per-package `package_todo.yml`, generated by `update-todo`; `strict` mode forbids new entries |
| **ArchUnit** | **Yes, best design** | `FreezingArchRule` + committed violation store; new→fail, fixed→auto-removed (shrink-only) |
| **dependency-cruiser** | **Yes** | `depcruise-baseline` → `known-violations.json` |
| **deptrac** | **Yes** | baseline formatter → `skip_violations` file, regenerable, importable |
| **ESLint-based (Nx boundaries, eslint-plugin-boundaries)** | **Yes, via host** | ESLint v9.24+ bulk suppressions (`--suppress-all` → `eslint-suppressions.json`); also `@rushstack/eslint-bulk` predates it; Nx executor integration still buggy |
| **import-linter** | Partial (manual) | `ignore_imports` lists per contract; no generator, but `unmatched_ignore_imports_alerting` lints the baseline for staleness |
| **api-extractor** | Different shape | the committed `.api.md` *is* a baseline of the surface; ratchets acknowledgment, not violations |
| **Bazel/Buck2** | No (convention only) | legacy-consumer package_groups you shrink by hand |
| **JPMS, Go internal, Rust visibility, TS project refs, `exports`** | **No** | binary hard-fail; JPMS's only relief is CLI flags |
| **Turborepo boundaries, cargo-semver-checks** | No baseline | semver-checks' "baseline" is the previous release, not recorded debt |

The strongest baseline designs share three properties worth adopting wholesale: **tool-generated, committed adjacent to the owning module, and shrink-only** (fixed violations are removed automatically — ArchUnit even debated whether a fixed-then-stale entry should fail the build, [TNG/ArchUnit#676](https://github.com/TNG/ArchUnit/issues/676)). Packwerk's retrospective is the cautionary counterweight: a ratchet with no drain plan just becomes a permanently growing debt ledger, and a green static checker still doesn't prove a module runs in isolation — pair the ratchet with an executable per-capsule verification.

Cross-cutting takeaways for the capsule model: (1) declare both directions (Buck2 visibility/within_view); (2) generate the surface, sign the diff (api-extractor), classify the diff (cargo-semver-checks); (3) cheap default-deny by placement (Go internal); (4) small typed contract vocabulary over raw edge regexes (import-linter); (5) shrink-only recorded debt (ArchUnit/Packwerk); (6) avoid JPMS's collective-action trap — every capsule must get value the day it's declared, alone.
