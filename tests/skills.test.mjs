import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { test } from "node:test";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const read = (path) => readFileSync(join(root, path), "utf8");
const words = (path) => read(path).trim().split(/\s+/).length;

test("router references only installed skill files", () => {
  const router = read("templates/AGENTS.md");
  const references = [...router.matchAll(/`(skills\/[^`]+\.md)`/g)].map((match) => match[1]);
  assert.ok(references.length >= 10, "router should expose the kit's task branches");
  for (const path of references) assert.ok(existsSync(join(root, path)), `router points at missing ${path}`);
  assert.match(router, /Never commit or push unless the user or project rules explicitly authorize it/);
});

test("profile and review rules keep cheap work cheap and bound fan-out", () => {
  const workflow = read("skills/workflow.md");
  const review = read("skills/review-panel.md");
  assert.match(workflow, /Touch-up.*Scoped verify \+ diff self-review/);
  assert.match(workflow, /Low.*Scoped verify \+ self-review/);
  assert.match(review, /Medium:.*at most one concise independent review/);
  assert.match(review, /High:.*at most two independent reports/);
  assert.match(review, /Do not spawn personas per lens/);
});

test("discipline skills include observable triggers and counter-scenarios", () => {
  const testing = read("skills/testing.md");
  const debugging = read("skills/debugging.md");
  const architecture = read("skills/architecture-review.md");
  assert.match(testing, /Skip for copy, docs, data-only config, generated code, or trivial wiring/);
  assert.match(testing, /confirm it fails for the expected missing\/broken behavior/);
  assert.match(debugging, /If no loop can be built, list what was tried/);
  assert.match(debugging, /After three failed fixes/);
  assert.match(architecture, /Do not run it on a calendar/);
  assert.match(architecture, /A valid result may be “keep the current shape.”/);
});

test("pair skills share a bounded, failure-safe review protocol", () => {
  const protocol = read("skills/pair-protocol.md");
  const reviewer = read("skills/pair.md");
  const worker = read("skills/pair-reviewer.md");
  const router = read("templates/AGENTS.md");

  for (const state of ["IDLE", "REVIEWED", "READ", "REPLIED", "LGTM"]) {
    assert.match(protocol, new RegExp(`\\b${state}\\b`));
  }
  // Heartbeats, liveness probes, and the ORPHANED state were removed as net-negative
  // (false alarms, zero true detections). Safety is now structural: only the reviewer
  // writes LGTM, so a silent peer cannot produce approval — no timer required. Assert the
  // removed mechanics are ABSENT, not just that the "we removed them" prose is present —
  // otherwise a regression that re-adds a heartbeat while keeping the note passes green.
  assert.match(protocol, /no heartbeats, timeouts, or liveness probes/);
  assert.match(protocol, /Wake on events, not on a clock/);
  assert.doesNotMatch(protocol, /->\s*`?ORPHANED/); // no transition INTO an orphaned state (the removal note may still name it)
  assert.doesNotMatch(reviewer, /\bpoll\b/i); // no clock-driven polling survives in the reviewer loop
  assert.match(protocol, /Any code change after the recorded snapshot invalidates a prospective `LGTM`/);
  assert.match(protocol, /Silence is not consent here by construction|never becomes `LGTM`/);
  assert.match(reviewer, /Do not edit implementation or tests/);
  assert.match(worker, /Do not spawn a polling sentinel/);
  assert.match(worker, /`LGTM` is the reviewer's to write/);
  assert.match(router, /reviewer loads `skills\/pair\.md`; implementation owner loads `skills\/pair-reviewer\.md`/);
});

test("honest-challenge behavior is diluted into the owner skills, not a standalone skill", () => {
  const review = read("skills/review-panel.md");
  const planning = read("skills/planning.md");
  const workflow = read("skills/workflow.md");
  const architecture = read("skills/architecture-review.md");
  const router = read("templates/AGENTS.md");
  assert.ok(!existsSync(join(root, "skills/be-honest.md")), "be-honest was dissolved; do not resurrect it");
  assert.doesNotMatch(router, /be-honest/);
  assert.match(review, /strongest disconfirming evidence sought against the verdict/);
  assert.match(review, /Do not manufacture findings, harshness, or alternatives/);
  assert.match(planning, /strongest case against the plan/);
  assert.match(planning, /A plan is a claim to evaluate, not proof that it works/);
  assert.match(workflow, /unknowns, and unavailable tools are named — "I don't know" beats manufactured confidence/);
  assert.match(architecture, /Steelman each candidate before trying to falsify/);
});

test("frequently routed skills stay within explicit context budgets", () => {
  const budgets = {
    "templates/AGENTS.md": 250,
    "skills/workflow.md": 1100,
    "skills/stage.md": 500,
    "skills/planning.md": 500,
    "skills/testing.md": 500,
    "skills/debugging.md": 500,
    "skills/review-panel.md": 650,
    "skills/architecture-review.md": 700,
    "skills/self-improve.md": 550,
    "skills/writing-great-skills.md": 550,
    "skills/re-conciliate.md": 500,
  };
  for (const [path, budget] of Object.entries(budgets)) {
    assert.ok(words(path) <= budget, `${path} is ${words(path)} words; budget is ${budget}`);
  }
});
