# Research: LLM-Agent-Oriented Codebase Patterns (2024–2026)

Provenance: research-agent sweep, 2026-07-24. Preserved verbatim as evidence base; synthesis lives in `../prior-art.md`.

## 1. AGENTS.md / CLAUDE.md — per-directory agent context

**What it is.** AGENTS.md (agents.md) formalized Aug 2025 by OpenAI, Google, Cursor, Factory, Sourcegraph; contributed to the Agentic AI Foundation (Linux Foundation) alongside MCP in late 2025. Plain markdown, no schema, nearest-file-wins nesting: root = global conventions, subdirectory files override for their subtree. Claude Code's CLAUDE.md does the same hierarchically (user → project root → per-directory, loaded when the agent works in that directory), plus `@imports` and skills.

**Adoption reality.** Real, not announcement-ware: 20k–60k+ repos depending on count date; read by Codex, Cursor, Aider, Devin, Amp, Jules, Zed, Copilot, Gemini CLI, Windsurf, Amazon Q. OpenAI's own Codex repo carries **88 nested AGENTS.md files** — nested-per-module context is already the practiced pattern at the origin. Notable wrinkle: Claude Code still doesn't read AGENTS.md natively as of mid-2026 (4,300-upvote issue); the blessed workaround is the symlink (`ln -s AGENTS.md CLAUDE.md`).

**Enforced vs vibes.** The spec is 100% vibes — no schema, no validation, nothing machine-checked. Compliance is per-tool prompt injection.

**Steal:** nested nearest-file-wins scoping + the loader/router pattern (root file as index pointing to module files, keeping any single context load small). **Avoid:** treating the file as trustworthy — unchecked AGENTS.md rots and actively misleads agents.

Sources: https://www.iuriio.com/blog/posts/2026/05/agents-md-field-guide-2026 · https://www.morphllm.com/agents-md-guide · https://www.harness.io/blog/the-agent-native-repo-why-agents-md-is-the-new-standard · https://pub.towardsai.net/claude-md-vs-agents-md-vs-skill-md-which-file-owns-what-in-2026-13859378f56a

## 2. llms.txt

**What it is.** Jeremy Howard's Sep 2024 proposal: `/llms.txt` markdown index of a site for LLM consumption, plus `.md` versions of pages.

**Adoption reality by 2026: effectively dead as a mechanism, alive as a cargo cult.** Ahrefs analyzed 137k domains: ~28% publish one, but **97% of llms.txt files are never fetched by any AI crawler**, and statistical models found **zero citation effect**. SE Ranking's XGBoost model got *more* accurate when the llms.txt variable was removed (pure noise). Google stated (June 2026) it has no effect on Search/AI Overviews. **No major AI vendor — OpenAI, Google, Anthropic, Meta, Mistral — has committed to reading it.**

**Steal:** the *documents-as-curated-index* shape (a small index file linking to markdown expansions — basically the AGENTS.md loader). **Avoid:** its core failure — publishing context nobody's runtime is contractually obligated to read. A capsule's context must be loaded by the harness, not offered hopefully.

Sources: https://ahrefs.com/blog/llmstxt-study/ · https://www.digitalapplied.com/blog/google-llms-txt-no-seo-value-lighthouse-audit-2026 · https://codersera.com/blog/llms-txt-complete-guide-2026/

## 3. Context engineering for repositories

**Key sources.** Anthropic's "Effective context engineering for AI agents" (Sep 2025): context is a finite resource with diminishing returns; curate the smallest high-signal token set. Karpathy coined/blessed the term mid-2025 and in his YC Software 3.0 keynote pushed "build for agents": docs in plain markdown, curl not click-this; his 2026 "LLM wiki" pattern (compile raw sources once into an interlinked markdown wiki, query the wiki not the sources) is repo-memory generalized. Dex Horthy's "No Vibes Allowed"/Advanced Context Engineering: the "dumb zone" (recall degrades past ~40% window use), **frequent intentional compaction** (compress noisy context into a focused markdown file, restart fresh session pointed at it), Research→Plan→Implement. Maintainable.software's "agentic codebase principles" is the closest published articulation of context boundaries *as architecture*: locality, **small blast radius**, boundary integrity, navigability, narrow rebuild/test scope; recommends domain → vertical slice structure where **each slice is the unit of change and validation**; explicitly says advisory docs can't replace mechanical enforcement (dependency-direction checks, architecture linters, test-impact analysis). Monorepo-vs-polyrepo: consensus tipped monorepo *if* boundary discipline exists — Nx's argument is the project graph gives agents queryable blast radius; the caveat everywhere is "a monorepo with no boundary discipline gives an agent a wide blast radius worse than clean small repos"; mitigation is per-directory context files + deny rules — i.e., capsules inside a monorepo.

**Enforced vs vibes.** Mostly essays. The mechanical parts that exist: architecture linters (ArchUnit, import-linter, dependency-cruiser, Nx module-boundary ESLint rules) and Factory.ai's "Using Linters to Direct Agents" (encode module boundaries/no-cycles/import rules as lint so the agent's feedback loop enforces architecture).

**Steal:** "linters as the agent's architecture teacher" — encode capsule import boundaries as lint the agent hits immediately. Also Horthy's compaction: a capsule's CONTRACT.md *is* pre-computed compaction. **Avoid:** memory folders of dated session logs (append-only context that itself rots).

Sources: https://maintainable.software/agentic-engineering-part-2-agentic-codebase-principles/ · https://factory.ai/news/using-linters-to-direct-agents · https://newsletter.pragmaticengineer.com/p/context-engineering-with-dex-horthy · https://medium.com/@asatkinson/the-decade-of-agents-karpathys-strategy-for-building-the-agent-optimized-web-735191a69009 · https://nx.dev/blog/the-effect-of-monorepos-on-the-effectiveness-of-ai-agents · https://monorepo.tools/ai · https://www.trychroma.com/research/context-rot

## 4. Spec-driven development

**What it is.** Kiro (AWS, Jul 2025): Requirements→Design→Tasks in an IDE. GitHub Spec Kit (Sep 2025): constitution→specify→plan→tasks markdown pipeline. Tessl (Podjarny/Snyk founder): the maximalist bet — spec-as-source, generated code stamped `// GENERATED FROM SPEC - DO NOT EDIT`, bidirectional sync, plus a Spec Registry (10k+ library usage specs) and a skills package manager.

**Adoption reality.** Tools are real and used; the *paradigm* is unproven. Birgitta Böckeler's Martin Fowler-site analysis is the sharpest: **Kiro and Spec Kit are actually spec-FIRST, not spec-driven — specs are discarded/branch-scoped after implementation**; Spec Kit is "a sea of markdown documents"; she'd "rather review code than all these markdown files"; agents frequently ignore the elaborate structure anyway ("illusory control"); spec-as-source risks repeating Model-Driven Development's failure while adding LLM non-determinism. Tessl is "the most aggressive vision and the least proven." Thoughtworks Radar v34 (2026) puts SDD in Assess-tier and headline-warns about "cognitive debt."

**SDK codegen (the industry that already works).** Stainless / Speakeasy / Fern regenerate entire SDK implementations from an OpenAPI contract in CI on every spec change — the one shipping, commercially proven "regenerate implementation from contract" loop. Key detail: Speakeasy treats OpenAPI as sole source of truth; Stainless and Fern each add a proprietary config layer between spec and output, and that layer **drifts from the spec** — the exact failure mode a CONTRACT.md must avoid (one contract file, no shadow config).

**Steal:** from SDK codegen, the CI regeneration loop + contract-diff as the change-review surface. **Avoid:** Spec Kit's ceremony weight; per Böckeler, don't pretend prose specs are executable — the machine-checkable part of the contract (provides/requires/tests) is the real spec, prose is commentary.

Sources: https://www.martinfowler.com/articles/exploring-gen-ai/sdd-3-tools.html · https://tessl.io/blog/tessl-launches-spec-driven-framework-and-registry/ · https://codemyspec.com/blog/tessl-review · https://www.speakeasy.com/blog/choosing-an-sdk-vendor/ · https://buildwithfern.com/post/best-sdk-generation-tools-multi-language-api · https://codemyspec.com/blog/spec-driven-development

## 5. MCP as capability manifest

**What it is.** Anthropic's protocol (Nov 2024), donated to Linux Foundation Dec 2025 — vendor-neutral like AGENTS.md. Servers declare typed tools/resources/prompts; the manifest is machine-readable and schema-enforced (the only part of this survey with a real wire contract). For codebases: code-index MCP servers, knowledge-graph indexes, and the Thoughtworks-noted stronger pattern — **LSP/AST via MCP** so agents do real "rename symbol"/"find references" instead of text guessing.

**Adoption reality.** Protocol adoption is massive; codebase-navigation MCP servers specifically are a long tail of small projects, none dominant — most practitioners report grep+Read in Claude Code beats an indexing server for medium repos.

**Enforced vs vibes.** Tool schemas: enforced (JSON Schema). Nothing in MCP addresses module boundaries or context scoping — capability declaration, not context architecture.

**Steal:** the manifest *shape* — typed `provides` (tools/resources) declared machine-readably, discovered at runtime; a CONTRACT.md provides/requires block is an MCP-manifest-for-a-module. **Avoid:** shipping an index server as the boundary mechanism; indexes go stale and add infra where a file convention suffices.

Sources: https://en.wikipedia.org/wiki/Model_Context_Protocol · https://dev.to/corestory/mcp-servers-for-codebase-context-how-ai-coding-agents-access-code-intelligence-3757 · https://github.com/johnhuang316/code-index-mcp

## 6. Module-level contracts for agents — who's already there

The terminology hasn't converged ("agent-native repo", "AI-native codebase", "agentic codebase", "codified context"), but the convergent claims across Harness, Factory, maintainable.software, Augment, and the arXiv literature are: **hierarchical per-module context + mechanically enforced boundaries + local verification loops** — the capsule, in pieces, never assembled by anyone as a named unit. Two research results stand out: **"Codified Context" (arXiv 2602.20478)** — 108k-line C# system, hot-memory constitution + 34 on-demand cold-memory spec documents + 19 domain agents, 283 sessions; and **"Formal Architecture Descriptors as Navigation Primitives" (arXiv 2604.13108)** — structured module-boundary/signature/constraint descriptors cut agent navigation steps **33–44%** (d=0.92), auto-generated descriptors hit 100% precision vs 80% blind, 52% less behavioral variance across 7,012 real Claude Code sessions; bonus finding: S-expression descriptors caught all injected structural errors while **YAML silently corrupted 50%** — format choice matters for machine-verifiability. Voices: Ronacher — tools for agents must be fast and fail loudly; low-churn ecosystems (Go) beat high-churn (JS) because agents generate less outdated code; lately "a language for agents." 12-Factor Agents (Horthy) — own your context window; most good "agents" are deterministic code with LLM steps at the right points. Note the name "context capsule" is **already taken** by unrelated products (contextcapsule.ai = agent-handoff token packets; llmcapsule.ai = enterprise data masking; "Agent Capsules" arXiv 2605.00410 = pipeline orchestration granularity) — none is this concept, but expect collision.

**Steal:** auto-*generate* the descriptor/contract from code, then verify — 2604.13108 shows generated beats hand-written on precision. **Avoid:** the 19-subagent constitution apparatus of Codified Context — ceremony that only a paper author maintains.

Sources: https://arxiv.org/abs/2604.13108 · https://arxiv.org/abs/2602.20478 · https://lucumr.pocoo.org/2025/6/12/agentic-coding/ · https://lucumr.pocoo.org/2026/2/9/a-language-for-agents/ · https://github.com/humanlayer/12-factor-agents · https://www.aihero.dev/how-to-make-codebases-ai-agents-love · https://www.thoughtworks.com/radar/techniques/team-of-coding-agents

## 7. Multi-agent codebase coordination

**Converged conventions (2026):** git worktrees as the isolation primitive (one agent = one worktree; universal across Claude Code/Codex/Cursor ecosystems); ownership by *directory/layer/test surface*, never by abstract idea; **shared contracts/interfaces created before parallel implementation starts**; no agent touches lockfiles, migrations, root config, or shared interfaces unless assigned; incremental commits as audit trail; coordination artifacts are a root TASKS.md (read-only to workers) or an orchestrator-managed queue — Claude Code Agent Teams productized the shared-task-list version. File locks essentially don't exist in practice; ownership partitioning replaced locking.

**Enforced vs vibes.** Worktree isolation: enforced by git. Ownership boundaries: pure convention — merge conflicts are the only referee. This is the strongest practical argument for capsules: **the parallel-agent partition unit everyone improvises is exactly a directory-scoped module with a pre-agreed contract.**

**Steal:** contract-before-parallelism. **Avoid:** shared mutable scratch files as coordination (race-prone; the ecosystem is moving to orchestrator-owned queues).

Sources: https://www.mindstudio.ai/blog/parallel-agentic-development-git-worktrees · https://www.aakashx.com/blog/parallel-claude-code-agents/ · https://www.developersdigest.tech/blog/git-worktrees-claude-code-parallel-agents-guide

## 8. Evidence: smaller bounded context → better agent output

The evidence is strong and one-directional. **Chroma "Context Rot"** (18 SOTA models): reliability degrades with input length even on trivial tasks; all 35 models tested degrade. **LongCodeBench**: Claude 3.5 Sonnet on LongSWE-Bench falls **29% → 3%** going from 32K → 256K context; long-context performance can't be extrapolated from short. Lost-in-the-middle: >30% accuracy drop for mid-context info; Horthy's session-data version: the "dumb zone" at 40–60% window fill. **Specification Grounding** (arXiv 2607.06636): spec-grounded tests produce correct code **+38pp** across three Claude tiers — spec quality, not test quantity, drives correctness. Plus 2604.13108's 33–44% navigation reduction from bounded architecture context. One counterweight worth noting: a cited result that static always-loaded context hit 100% pass rate vs 79% for dynamic skill-retrieval — **agents fail ~56% of the time at deciding to fetch context**. Capsule implication: the capsule's context must be auto-loaded by position (agent works inside the directory), never fetch-on-judgment.

Sources: https://www.trychroma.com/research/context-rot · https://arxiv.org/html/2505.07897v2 · https://arxiv.org/pdf/2607.06636 · https://arxiv.org/html/2601.11564v1

---

## Direct answers

**1) Has anyone shipped machine-VERIFIED per-module agent context?** Partially — verification of *freshness*, not of *interface contracts*. A 2025–26 wave of context linters exists: **ctxlint** (https://github.com/YawLabs/ctxlint — checks CLAUDE.md/AGENTS.md against the actual codebase: file paths exist, documented commands match package.json/Makefile, staleness vs recent code changes, cross-file contradictions, token budgets; `--strict` CI exit codes, GitHub Action, SARIF), **agents-lint** (https://github.com/giacomo/agents-lint — "your AGENTS.md is probably lying"), **agentlint** (https://github.com/samilozturk/agentlint), AgentLinter (https://agentlinter.com/), Fiberplane's doc-rot linter (https://fiberplane.com/blog/drift-documentation-linter/). All are tiny — the category is months old. **Nobody has shipped machine-checked provides/requires semantics per module.** Closest research: arXiv 2604.13108 (auto-generated, error-detecting architecture descriptors); closest industry practice: SDK codegen's OpenAPI-contract loop plus Nx/import-linter boundary enforcement. A CONTRACT.md with checked provides/requires = context-linter freshness + architecture-linter boundaries + codegen-style contract diff, combined. **That combination is genuinely unoccupied ground.**

**2) Emerging consensus on tests-as-spec for agent regeneration?** Converging with a sharp caveat. The practitioner pattern is real ("write tests first, then delete and regenerate the implementation"), and Böckeler's MDD critique implies executable artifacts (tests) beat prose specs as the durable contract. But arXiv 2607.06636 shows *ungrounded* tests barely help — tests derived from a spec are +38pp; and agent-written tests against agent-written code just launder the same misunderstanding. Consensus shape: **prose spec → grounded test suite → tests are the enforcement surface; the regeneration unit only works if the tests were derived from intent the agent didn't invent.** Nobody has this in a productized per-module loop yet; Tessl is nearest and unproven.

**3) Closest existing thing to a module an agent fully owns with zero external reads?** Three candidates, in order: (a) **Nx-style monorepo package with enforced module-boundary lint + nested AGENTS.md + project-scoped test target** — all pieces shipped, assembled ad hoc by teams; (b) **maintainable.software's vertical slice** as the "complete unit of change and validation" — best conceptual articulation, advisory only; (c) **the parallel-worktree ownership convention** (§7) — behaviorally identical to capsule ownership, enforced only by merge conflicts. Nobody has bundled context + contract + local verification into a named, machine-checked unit. The capsule idea is well-supported by the evidence base (§8), collides with existing product names (§6), and its differentiator vs everything surveyed is the *verified* contract — the part the ecosystem keeps writing essays about and not shipping.
