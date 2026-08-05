import assert from "node:assert/strict";
import { execFileSync, spawnSync } from "node:child_process";
import { mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { test } from "node:test";
import { fileURLToPath } from "node:url";

const kitRoot = join(dirname(fileURLToPath(import.meta.url)), "..");
const scopeScript = join(kitRoot, "scripts/scope.mjs");
const startScript = join(kitRoot, "scripts/workflow-start.mjs");

function fixtureRepo() {
  const root = mkdtempSync(join(tmpdir(), "agent-workflow-scripts-"));
  execFileSync("git", ["init", "-q"], { cwd: root });
  execFileSync("git", ["config", "user.email", "test@example.com"], { cwd: root });
  execFileSync("git", ["config", "user.name", "Test"], { cwd: root });
  mkdirSync(join(root, "docs/wiki"), { recursive: true });
  writeFileSync(join(root, "package.json"), '{"name":"fixture","private":true}\n');
  writeFileSync(
    join(root, "llm-workflow.config.json"),
    `${JSON.stringify(
      {
        kitVersion: 1,
        gate: ["node --version"],
        verify: [{ name: "source", globs: ["src/**"], commands: ["node --version"] }],
        lenses: { complexity: ["src/shared/**"] },
      },
      null,
      2,
    )}\n`,
  );
  writeFileSync(
    join(root, "docs/wiki/progress.md"),
    [
      "---",
      "title: Progress",
      "updated: 2026-07-12",
      "type: ledger",
      "---",
      "",
      "# Progress",
      "",
      "| Stage | Status | Verifier | Review | Next |",
      "|---|---|---|---|---|",
      "",
      "## Backlog",
      "",
    ].join("\n"),
  );
  execFileSync("git", ["add", "."], { cwd: root });
  execFileSync("git", ["commit", "-qm", "fixture"], { cwd: root });
  return root;
}

function run(script, args, cwd) {
  return spawnSync(process.execPath, [script, ...args], { cwd, encoding: "utf8" });
}

test("scope maps untracked files and reports a gate-equivalent scoped run", () => {
  const root = fixtureRepo();
  try {
    mkdirSync(join(root, "src"));
    writeFileSync(join(root, "src/a.ts"), "export const answer = 42;\n");
    const dry = run(scopeScript, ["--base", "HEAD", "--dry-run", "--json"], root);
    assert.equal(dry.status, 0, dry.stderr);
    const result = JSON.parse(dry.stdout);
    assert.deepEqual(result.files, ["src/a.ts"]);
    assert.deepEqual(result.commands, ["node --version"]);
    assert.deepEqual(result.unmappedFiles, []);
    assert.equal(result.gateEquivalent, true);

    const executed = run(scopeScript, ["--base", "HEAD"], root);
    assert.equal(executed.status, 0, executed.stderr);
    assert.match(executed.stdout, /gate-equivalent: yes/);
    assert.match(executed.stdout, /✓ node --version \([\d.]+s\)/);
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
});

test("scope reports every changed file without a scoped verification mapping", () => {
  const root = fixtureRepo();
  try {
    writeFileSync(join(root, "NOTES.md"), "scratch\n");
    const dry = run(scopeScript, ["--base", "HEAD", "--dry-run", "--json"], root);
    assert.equal(dry.status, 0, dry.stderr);
    assert.deepEqual(JSON.parse(dry.stdout).unmappedFiles, ["NOTES.md"]);

    const readable = run(scopeScript, ["--base", "HEAD", "--dry-run"], root);
    assert.match(readable.stdout, /verify-gap: NOTES\.md: no scoped command mapped/);
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
});

test("scope gate runs configured commands once and prints timed verifier evidence", () => {
  const root = fixtureRepo();
  try {
    const result = run(scopeScript, ["--gate"], root);
    assert.equal(result.status, 0, result.stderr);
    assert.equal(result.stdout.match(/▶ node --version/g)?.length, 1);
    assert.match(result.stdout, /Verifier: node --version \(fresh, green; [\d.]+s\)/);
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
});

test("workflow-start opens one stage and refuses a second mutable stage", () => {
  const root = fixtureRepo();
  try {
    const opened = run(startScript, ["--stage", "public API"], root);
    assert.equal(opened.status, 0, opened.stderr);
    assert.match(opened.stdout, /record the compact task contract/);
    assert.match(readFileSync(join(root, "docs/wiki/progress.md"), "utf8"), /\| public API \| active \(base [a-f0-9]+\)/);

    const second = run(startScript, ["--stage", "another stage", "--allow-dirty"], root);
    assert.equal(second.status, 1);
    assert.match(second.stderr, /an active stage already exists: public API/);
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
});

test("workflow-start refuses to reopen a closed stage under the same name", () => {
  const root = fixtureRepo();
  try {
    const opened = run(startScript, ["--stage", "release"], root);
    assert.equal(opened.status, 0, opened.stderr);
    const progressPath = join(root, "docs/wiki/progress.md");
    const closed = readFileSync(progressPath, "utf8").replace(/active \(base [^)]+\)/, "done");
    writeFileSync(progressPath, closed);

    const reopened = run(startScript, ["--stage", "release"], root);
    assert.equal(reopened.status, 1);
    assert.match(reopened.stderr, /stage already exists in progress ledger: release/);
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
});

test("workflow-start validates and links a durable high-work contract", () => {
  const root = fixtureRepo();
  try {
    mkdirSync(join(root, "docs/plans"), { recursive: true });
    const contractPath = "docs/plans/high.md";
    writeFileSync(
      join(root, contractPath),
      [
        "# High plan",
        "",
        "## Goal",
        "Ship behavior.",
        "## Current state",
        "Missing.",
        "## Non-goals",
        "None.",
        "## Acceptance evidence",
        "One command.",
        "## Test seams",
        "Public call.",
        "## Slices",
        "- Slice A; blocked by none.",
        "## Unresolved decisions",
        "None.",
      ].join("\n"),
    );
    const opened = run(startScript, ["--stage", "high work", "--contract", contractPath], root);
    assert.equal(opened.status, 0, opened.stderr);
    assert.match(opened.stdout, /contract: docs\/plans\/high\.md/);
    assert.match(
      readFileSync(join(root, "docs/wiki/progress.md"), "utf8"),
      /contract: \[plan\]\(\.\.\/plans\/high\.md\)/,
    );
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
});

test("workflow-start rejects an incomplete high-work contract", () => {
  const root = fixtureRepo();
  try {
    writeFileSync(join(root, "plan.md"), "## Goal\nNot enough.\n");
    const result = run(startScript, ["--stage", "high work", "--contract", "plan.md"], root);
    assert.equal(result.status, 1);
    assert.match(result.stderr, /contract missing required sections: Current state, Non-goals/);
    assert.doesNotMatch(readFileSync(join(root, "docs/wiki/progress.md"), "utf8"), /high work/);
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
});

test("workflow-start rejects a contract whose required sections have no content", () => {
  const root = fixtureRepo();
  try {
    writeFileSync(
      join(root, "plan.md"),
      [
        "## Goal",
        "Ship behavior.",
        "## Current state",
        "",
        "## Non-goals",
        "None.",
        "## Acceptance evidence",
        "One command.",
        "## Test seams",
        "Public call.",
        "## Slices",
        "- Slice A; blocked by none.",
        "## Unresolved decisions",
      ].join("\n"),
    );
    const result = run(startScript, ["--stage", "hollow contract", "--contract", "plan.md"], root);
    assert.equal(result.status, 1);
    assert.match(result.stderr, /contract sections are empty: Current state, Unresolved decisions/);
    assert.doesNotMatch(readFileSync(join(root, "docs/wiki/progress.md"), "utf8"), /hollow contract/);
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
});

test("workflow-start requires explicit allow-dirty for inspected in-progress input", () => {
  const root = fixtureRepo();
  try {
    writeFileSync(join(root, "package.json"), '{"name":"changed"}\n');
    const refused = run(startScript, ["--stage", "adoption"], root);
    assert.equal(refused.status, 1);
    assert.match(refused.stderr, /tracked tree is dirty/);

    const allowed = run(startScript, ["--stage", "adoption", "--allow-dirty"], root);
    assert.equal(allowed.status, 0, allowed.stderr);
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
});
