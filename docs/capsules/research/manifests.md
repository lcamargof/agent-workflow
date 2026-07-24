# Research: Manifest-Driven & Capability-Declaration Systems

Provenance: research-agent sweep, 2026-07-24. Preserved verbatim as evidence base; synthesis lives in `../prior-art.md`.

Scope: systems where a module carries a machine-readable self-description that is *enforced*, not documentation. Per system: (a) what's declared, (b) enforcement point, (c) drift prevention, (d) failure modes, (e) steal-worthy mechanism. Cross-cutting answers at the end.

---

## 1. OSGi bundles — the most complete module system, and why it lost

**(a) Declares** (MANIFEST.MF headers, OSGi Core spec: https://docs.osgi.org/specification/osgi.core/7.0.0/framework.module.html):
- `Bundle-SymbolicName` + `Bundle-Version` (identity; `singleton:=true` directive)
- `Export-Package` with versions — everything not exported is private by default
- `Import-Package` with version *ranges* (`[1.0,2.0)`), package-level, deliberately decoupled from which bundle provides it
- `uses:` constraints — declares which dependencies leak through your exported API, forcing importers onto the *same* provider (class-space consistency; https://spring.io/blog/2008/10/20/understanding-the-osgi-uses-directive/)
- `Provide-Capability`/`Require-Capability` — the generalized model: capabilities are attribute sets in namespaces, requirements are LDAP filters over them. Import/Export-Package are internally just capabilities in `osgi.wiring.package` (https://docs.osgi.org/specification/osgi.core/7.0.0/framework.namespaces.html, https://blog.osgi.org/2015/12/using-requirements-and-capabilities.html)
- `Service-Component` (Declarative Services) — lazy service components read by an extender at activation

**(b) Enforced at three times by three mechanisms:** build (bnd generates the manifest), resolve (framework resolver refuses to start any bundle whose requirements can't be wired — you get the failure up front, not as a deep runtime NoClassDefFoundError; wiring is a first-class introspectable graph, https://docs.osgi.org/specification/osgi.core/8.0.0/framework.wiring.html), and runtime (per-bundle classloaders — classloading for a non-imported package *physically fails*; https://moi.vonos.net/java/osgi-classloaders/).

**(c) Drift prevention — OSGi's crown jewel:**
- **bnd derives Import-Package from bytecode analysis**, not human claims — the manifest is a build *output*, so it cannot drift; under-declaring is impossible, over-declaring doesn't happen because unreferenced packages aren't emitted (https://bnd.bndtools.org/chapters/920-faq.html, https://felix.apache.org/documentation/subprojects/apache-felix-maven-bundle-plugin-bnd.html, https://bndtools.org/)
- **Baselining**: `-baseline` diffs the new bundle's exported API against the last release, computes the semver bump the change *actually requires* (aware of `@ConsumerType` vs `@ProviderType` roles), and fails the build if the declared version understates it (https://bnd.bndtools.org/chapters/180-baselining.html, https://blog.osgi.org/2013/09/baselining-semantic-versioning-made-easy.html). Eclipse PDE API Tools is the parallel mechanism (https://github.com/eclipse-pde/eclipse.pde/blob/master/docs/API_Tools.md).

**(d) Failure modes / why it's niche:** undiagnosable `uses` constraint violations (Spring wrote a two-part guide just to read the errors: https://spring.io/blog/2008/11/22/diagnosing-osgi-uses-conflicts/); split packages breaking under per-bundle loaders; every non-OSGi-aware library doing `Class.forName`/TCCL tricks breaking (Hibernate needed a dedicated OSGi module); `Require-Bundle` misuse entrenched by Eclipse tooling; and crushing tooling burden — MuleSoft's "OSGi? No Thanks": "great specification for middleware vendors, terrible for the end user" (https://blogs.mulesoft.com/dev/news-dev/osgi-no-thanks/); Volt Software's 2020 retrospective on interface-versioning doubling maintenance (http://volt-software.nl/software/maintainability/osgi/2020/11/28/OSGi-will-be-the-end-of-your-project.html). JPMS deliberately dropped versioning, dynamism, and per-module loaders — and its `requires` reproduces exactly the deprecated Require-Bundle coupling (Bartlett: https://www.infoq.com/articles/java9-osgi-future-modularity/). OSGi retreated to places that genuinely need dynamic plugin ecosystems: Eclipse, Liferay, AEM, Karaf, embedded/IoT (https://blog.osgi.org/2019/05/osgi-after-20-years.html).

The core lesson: **any escape hatch cheaper than the honest declaration becomes the default** — `DynamicImport-Package: *` "turns the framework into a very expensive class path" and was the universal cargo-cult fix (https://felix.apache.org/documentation/tutorials-examples-and-presentations/apache-felix-osgi-faq.html). And: correctness that produces undiagnosable errors reads as brokenness — the resolver was *right* about uses-violations, and people left anyway.

**(e) Steal:** manifest-as-build-output (bnd) + baselining. Declarations generated from the artifact can't lie; a tool that computes change severity and refuses to let the declared version understate it is risk-tiering enforced mechanically.

---

## 2. Extension manifests: VS Code, Chrome MV3, Android

### VS Code (package.json)
**(a)** `contributes.*` (commands, views, languages, configuration...), `activationEvents` (`onLanguage`, `onCommand`, `workspaceContains`, `onStartupFinished`...), `capabilities.untrustedWorkspaces` / `virtualWorkspaces` (`true`/`limited`/`false`), `main` vs `browser` entry points (https://code.visualstudio.com/api/references/activation-events, /contribution-points).
**(b)** Enforced by the workbench at load/runtime: declared UI is rendered *from the manifest without loading extension code*; the extension host loads code only when a declared activation event fires. Workspace Trust is fail-closed: no `untrustedWorkspaces` declaration → extension disabled in restricted mode; `restrictedConfigurations` makes VS Code ignore workspace-supplied setting values (https://code.visualstudio.com/api/extension-guides/workspace-trust).
**(c)** Since 1.74 **activation events are inferred from contributions** — the platform derives behavior from the declaration, so drift is impossible by construction for those. But there is **no permission model**: once activated, an extension has full user-level power; Workspace Trust exists precisely because the manifest can't constrain code.
**(d)** `*`/`onStartupFinished` abuse; giant `contributes.configuration` blocks; `limited` capability declarations are honor-system.
**(e) Steal:** lazy activation as contract — the manifest is the runtime's *index*, letting the host present a module's surface without ever loading it. Directly applicable to LLM agents: an agent can know what a capsule offers without paying its context cost.

### Chrome MV3
**(a)** `permissions`, `host_permissions`, `optional_permissions` (runtime-requestable), `activeTab`, `declarativeNetRequest` rulesets (https://developer.chrome.com/docs/extensions/develop/concepts/declare-permissions).
**(b)** Three layers: Web Store review at publish (see risk-tiering below), install-time permission warnings (adding permissions in an update disables the extension until re-approved), runtime denial of undeclared APIs — plus **user-side withholding**: since MV3 the user can downgrade any extension's host access to "on click"/"on specific sites", making the manifest a *ceiling, not a grant*.
**(c)** Human review verifies permissions against functionality; architecturally, `declarativeNetRequest` replaced blocking `webRequest` — network modification became reviewable *data* (JSON rules with hard quotas) instead of arbitrary code (https://developer.chrome.com/docs/extensions/reference/api/declarativeNetRequest).
**(d)** Measured over-request: only **39.8% of extensions are least-privilege compliant** (Chalmers, IJIS 2022: https://www.cse.chalmers.se/~andrei/ijis22.pdf); 86% of top-100 request high-risk permissions.
**(e) Steal:** **activeTab** — the designed narrow alternative that is strictly *cheaper* than broad access (no install warning, no in-depth review trigger, gesture-scoped, auto-expiring).

### Android
**(a)** `<uses-permission>`: normal (auto-granted), signature, dangerous (runtime-prompted since 6.0, in groups), special (Settings-toggle only) (https://developer.android.com/guide/topics/permissions/overview).
**(b)** PackageManager at install; OS gates APIs at runtime (SecurityException); Play policy layer at publish.
**(c)** The cautionary literature: **Stowaway** (Felt et al., CCS 2011 — https://people.eecs.berkeley.edu/~daw/papers/androidperm-ccs11.pdf) found ~1/3 of apps overprivileged, mostly from *confusion, not malice* — the platform's own docs couldn't tell developers which permissions their code needed (PScout, CCS 2012). Without tooling closing the declaration↔usage loop, over-declaration is the steady state. Modern mitigation is *temporal*: **permission auto-reset / app hibernation** — unused apps get runtime permissions revoked automatically (backported to Android 6+; https://developer.android.com/topic/performance/app-hibernation).
**(d)** Group coarseness; library manifests silently merged in (dependency permission inheritance); prompt habituation; yearly-growing declaration-form burden.
**(e) Steal:** grants that **decay with disuse** — drift correction as a background process rather than an audit.

---

## 3. Deno permissions

**(a/b)** Deny-by-default runtime flags: `--allow-read/write/net/env/run/ffi/sys`, scopable (`--allow-net=example.com`), `--deny-*` subtracts and wins; interactive prompt on TTY, `NotCapable` throw otherwise; `Deno.permissions` query/request/revoke API. Enforced at the **ops layer**: V8 is the compute sandbox, every privileged action is a Rust op call checked against the permission set (https://docs.deno.com/runtime/fundamentals/security/).
**(c/d)** Key structural facts:
- Permissions are **invocation flags, not a package manifest** — whole-process granularity. Every dependency inherits the full grant; docs state it's impossible for modules on the same thread to have different privilege. Per-dependency permissions remain an open issue (#26448) — hard because all modules share one heap. Deno 2.5 (Sept 2025) shipped **named permission sets in `deno.json`** (`-P`), which makes grants declarative/reviewable but still whole-process (https://deno.com/blog/v2.5).
- Deno's own docs admit `--allow-run` and `--allow-ffi` **void the sandbox** (`--allow-run=deno` → relaunch with `-A`; FFI runs machine code in-process, bypassing checks entirely).
- Dominant failure mode: `-A` under prompt fatigue.
**(e) Steal:** the honesty of documenting which capabilities are sandbox-voiding — a capsule manifest should have an explicit "this capability implies all capabilities" tier rather than pretending `run`-equivalents are scoped.

---

## 4. Fuchsia Component Framework — the closest match to capsules

**(a) .cml manifests** (JSON5 → compiled to binary `.cm` by `cmc`): `program`, `children`/`collections`, `capabilities` (provided), `use` (needed), `offer` (route to children), `expose` (route to parent), `config` (structured config schema). Capability types: protocol, service, directory (with `rights:`), storage (framework-isolated per-component), runner, resolver, dictionary, config, event_stream (https://fuchsia.dev/reference/cml).

**Core principle:** no ambient authority — every capability must have a valid route from consumer to provider through the topology; "capabilities cannot escape a component's realm unless explicitly exposed" (https://fuchsia.dev/fuchsia-src/concepts/components/v2/capabilities, /topology). RFC-0093 locks in *why declarative*: "component definitions must be auditable and readily understandable, which makes an imperative-style configuration language a non-option" — a system image is auditable from manifests alone (https://fuchsia.dev/fuchsia-src/contribute/governance/rfcs/0093_component_manifest_design_principles).

**(b) Three enforcement layers:** (1) `cmc` compile-time validation; (2) **scrutiny static route verification** — `ffx scrutiny verify routes` walks the whole assembled topology and *fails the build* if any `use` lacks a valid offer/expose chain ("moving route validation from run-time to build-time"; https://fuchsia.dev/fuchsia-src/development/verification/build_integration); (3) `component_manager` resolves routes lazily at runtime and enforces policy allowlists.

**(c) Drift:** an undeclared/unrouted protocol fails at first use — channel closed with epitaph (`ZX_ERR_NOT_FOUND`), component_manager logs the exact broken hop ("was not offered to X by parent"); `ffx component route` traces routes. RFC-0155 added `availability: required/optional/transitional` and **`void` sources** with *compatibility checking* (required-use fed by optional-offer = build error) — replacing error-suppression allowlists that were masking real misconfigurations (https://fuchsia.dev/fuchsia-src/contribute/governance/rfcs/0155_optional_capability_routes). Structured config: schema in CML, build fails on schema/value mismatch, component refuses to start on invalid config.

**(d) Failure mode — offer plumbing:** point-to-point routing means every intermediate component must re-declare the route; near-universal capabilities (LogSink) bloated *every* manifest, and intermediaries "must tediously re-route dozens of capabilities." The fix is **RFC-0235 dictionaries**: first-class capability *bundles*, routed as one unit, consumed with path syntax (`use ... from: "parent/diagnostics"`), immutable when declaratively built, with routing policy still applying to members (https://fuchsia.dev/fuchsia-src/contribute/governance/rfcs/0235_component_dictionaries).

**(e) Steal — two things:**
1. **Static route verification over the whole topology as a build gate** — not per-module lint, but "does every requires have a provider, through an explicit chain" checked over the assembled system.
2. **Security-policy allowlists on top of routing**: `component_manager_policy.json5` pins sensitive capabilities (RootJob, kernel resources, raw process creation) to explicit target monikers — a valid manifest route to a restricted capability still fails unless the consumer is allowlisted, and editing the policy file goes through security review. **Declared capability sensitivity determines who must sign off** (https://fuchsia.googlesource.com/fuchsia/+/refs/heads/main/src/security/policy/component_manager_policy.json5).

---

## 5. Wasm Component Model + WIT (state mid-2026)

**(a)** WIT: versioned packages (`wasi:http@0.2.0`) → interfaces (functions + types) → **worlds** = the complete typed contract of everything a component imports and exports. Rich types incl. resources with `own`/`borrow` handles; no raw pointers cross the boundary (https://github.com/WebAssembly/component-model/blob/main/design/mvp/WIT.md).
**(b)** Enforced at validation (`wasm-tools`), composition (`wac` — export types must satisfy import types or composition fails), and instantiation (wasmtime's Linker type-checks every import). **Capability security by construction**: a component physically cannot call anything outside its world's imports — the import list *is* the sandbox, and `wasm-tools component wit` dumps a binary's full authority (https://component-model.bytecodealliance.org/design/worlds.html).
**(c)** Bindings are generated from WIT (wit-bindgen/jco/componentize-py), so code can't drift from contract without a loud link failure; WASI worlds are versioned and frozen per release.
**(d)** Still formally an early-phase W3C CG proposal; recurring "too complex" criticism (https://thenewstack.io/can-webassembly-get-its-act-together-for-a-component-model/); toolchain churn; uneven language support. Key 2026 fact: **WASI 0.3.0 shipped June 11, 2026** — native async/`stream`/`future` in the Canonical ABI, `wasi:io` deleted; wasmtime 46 ships it default-on; **WASI 1.0 / CM 1.0 targeted late 2026–early 2027** (https://bytecodealliance.org/articles/WASI-0.3, https://wasi.dev/roadmap).
**(e) Steal:** **WASI Virt — attenuation as ordinary composition.** You satisfy an import with a weaker virtual implementation (in-memory fs, stubbed sockets; deny-by-default CLI) through the same type-checked composition path. The security mechanism and the linking mechanism are the *same mechanism*; the composed artifact provably has fewer capabilities (https://github.com/bytecodealliance/WASI-Virt).

---

## 6. Object-capability lineage (brief)

A capability is an unforgeable reference combining **designation with authority**; no ambient authority means nothing is reachable by global name. POLA falls out naturally. Lineage: Dennis & Van Horn 1966 → Mark Miller's E and "Robust Composition" thesis (2006) → "Capability Myths Demolished" (Miller/Yee/Shapiro 2003 — capabilities ≠ ACLs, are revocable via forwarders, can enforce confinement; https://papers.agoric.com/assets/pdf/papers/capability-myths-demolished.pdf). Hardware/kernel endpoints: CHERI (ISA-level unforgeable pointers), seL4 (no-ambient-authority is part of the machine-checked proof).

**Mapping to module design — the sentence that matters for capsules:** *a module's imports = its total authority.* If the manifest is the only way authority enters, reading the manifest is a complete security audit; attenuation = wrapping an import; revocation = swapping it. WIT worlds and Fuchsia routing implement this; Node's ambient `require`/env/global-fetch violate it.

---

## 7. Kubernetes CRDs / Helm (brief)

**CRDs:** mandatory OpenAPI v3 structural schema validated by the API server at admission; **CEL validation rules** (`x-kubernetes-validations`, GA 1.29) put cross-field/immutability/transition constraints in the schema itself, replacing fragile admission webhooks (https://kubernetes.io/blog/2022/09/23/crd-validation-rules-beta/). Schema↔controller drift handled via versioning + conversion webhooks; classic failures: webhook availability dilemmas, `preserve-unknown-fields` letting junk in, controllers silently ignoring accepted fields.
**Helm:** `values.schema.json` validated at install/upgrade/lint — but optional and rarely maintained; most real charts are enormous untyped values files where a typo is silently ignored (https://github.com/helm/helm/issues/7756). Evidence that **unenforced schemas rot**: Helm 3.18.5's stricter validation broke charts with stale schemas.
**(e) Steal:** the **reconcile loop** — spec (declared) vs status (observed), converged continuously. Admission validates the declaration once; the loop keeps the *world* conformant. Drift detection as a level-triggered runtime process, not a one-shot gate.

---

## 8. npm `exports`/`imports`

**(a)** `exports`: the public entry-point map — subpaths, conditional exports (`types`/`import`/`require`/`node`/`default`, first match wins), subpath patterns, `null` to block subtrees. `imports`: `#`-prefixed internal aliases with the same conditions (https://nodejs.org/api/packages.html).
**(b)** Enforced by **Node's resolver at runtime**: undeclared subpath → `ERR_PACKAGE_PATH_NOT_EXPORTED`. Real encapsulation with no reviewer and no prompt — the manifest *is* the mechanism. Bundlers and TypeScript (`node16`/`bundler` resolution) implement the same algorithm.
**(c)** Best-in-class cheap drift tooling: **publint** (export points at missing/unpublished file, actual ESM/CJS syntax contradicts declared format; https://publint.dev/rules) and **arethetypeswrong** (simulates resolution across modes, flags "masquerading as CJS/ESM"). The Stowaway loop-closer, but cheap enough to run in CI on every publish.
**(d)** Dual-package hazard (two module instances with divergent state); types/runtime mismatch; and the inverse degeneration: forgetting to export a subpath breaks consumers instantly, so the pressure is toward `"./*": "./*"` — surrendering encapsulation.
**(e) Steal:** conditional resolution — one declared name, environment-selected implementation, declared entirely in the manifest.

---

## Cross-cutting answer 1: What actually counters "over-declare everything"?

Chrome/Android prove that *review + user warnings alone do not*: 60%+ of Chrome extensions are not least-privilege; ~1/3 of Android apps were overprivileged — and Stowaway's key finding is that over-declaration comes mostly from **confusion, not malice**, whenever developers can't cheaply determine what their code actually needs. Mechanisms that measurably worked, strongest first:

1. **Derive the declaration from the artifact** (OSGi bnd bytecode analysis; VS Code ≥1.74 inferring activation from contributions; WIT bindgen). If the manifest is generated, over-declaration is structurally impossible and drift can't exist. This is the strongest result in the whole survey.
2. **Make behavior flow from the declaration** (Node `exports`, Fuchsia routing, WIT worlds): when the platform *derives* runtime reality from the manifest, an over-declaration is inert until used and an under-declaration fails loudly. Note npm shows the inverse pressure — if under-declaring breaks users, people wildcard.
3. **Make the narrow path strictly cheaper than the broad one** (Chrome activeTab: no warning, no review penalty, auto-expiring). OSGi's negative proof of the same law: `DynamicImport-Package: *` was cheaper than honest imports, so everyone abused it.
4. **Make over-declared grants worth less** (Chrome runtime host withholding — manifest becomes a ceiling; Android auto-reset/hibernation — unused grants decay).
5. **Convert code capabilities into bounded data** (declarativeNetRequest: rules with quotas instead of arbitrary code).
6. **Cheap CI loop-closers** (publint/attw; bnd baselining): the difference between Android (over-declaration endemic, tooling arrived late and external) and OSGi-with-bnd (non-issue) is exactly whether declaration↔usage checking is in the default build.
7. **Ergonomic bundles for legitimately-common capability sets** (Fuchsia dictionaries, RFC-0235) — manifest bloat itself drives over-declaration fatigue; bundling universal capabilities removed the boilerplate that made people sloppy.

Nothing solved it by *policy* alone. Deno partially sidesteps it by having no package manifest at all (the consumer declares at invocation) — at the cost of zero per-dependency granularity, and its own degeneration is `-A`.

## Cross-cutting answer 2: Does anything derive risk/review-tier from declared capabilities?

Yes — four real precedents:

- **Chrome Web Store**: broad host permissions / sensitive permissions mechanically route a submission from automated review (<1 hr) to human in-depth review (1–4 weeks). Declared scope literally prices review latency (https://developer.chrome.com/docs/webstore/review-process).
- **Google Play SMS/Call Log policy (2018-19)**: declaring those permissions required being the default handler (a *role*, not a checkbox) or a human-reviewed Permissions Declaration Form with core-functionality justification; mass removals followed. The pattern has since extended to background location, all-files access, QUERY_ALL_PACKAGES (https://support.google.com/googleplay/android-developer/answer/10208820).
- **Fuchsia**: sensitive capabilities (RootJob, kernel resources, raw process creation) are pinned in `component_manager_policy.json5` to explicit monikers; a valid route still fails without the allowlist, and *editing the allowlist requires security review* — capability sensitivity determines who signs off.
- **OSGi/bnd baselining**: the tool computes change severity (micro/minor/major) from the actual API diff — scoped by declared roles (`@ConsumerType` vs `@ProviderType`, exported vs private packages) — and fails the build until the declared version matches. Review effort concentrates on exactly the declared-public surface.

For a capsule `risk:` field, the composite precedent is: **declared capabilities select the review tier (Chrome/Play), the most dangerous capabilities additionally require an out-of-manifest allowlist owned by a different party (Fuchsia), and a tool — not the author — computes the severity of changes (bnd baselining).** The one thing no surveyed system lets the author do is self-declare *low* risk while holding high-risk capabilities; risk is always derived or externally pinned, never trusted from the manifest itself.

## Design takeaways for CONTRACT.md capsules

1. Generate or verify `provides`/`requires` from the code (imports/exports analysis) — hand-written capability lists rot within months (Android, Helm schemas); generated ones can't (bnd).
2. Enforce at the assembly level, not just per-module: a Fuchsia-style "every requires has an explicit provider route" check over the whole capsule graph, failing CI.
3. Keep the manifest the *only* way authority enters (ocap/WIT) — otherwise you get VS Code: a beautiful contribution model with zero security value because activated code has ambient power.
4. Make risk derived, not self-declared: tier from the capability set; require an external allowlist for the sandbox-voiding tier (the `run`/`ffi` equivalents — name that tier explicitly, as Deno's docs do).
5. Budget for the OSGi lesson: enforcement that produces undiagnosable errors gets routed around. Error messages that name the exact broken hop (Fuchsia's "X was not offered to Y by parent") are part of the enforcement design, not polish.
6. Lazy loading from the manifest (VS Code) is the LLM-agent superpower: an agent should be able to plan against capsule manifests without paying the context cost of capsule bodies.
