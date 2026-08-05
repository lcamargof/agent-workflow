import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { existsSync, mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { test } from "node:test";
import { fileURLToPath } from "node:url";

const kitRoot = join(dirname(fileURLToPath(import.meta.url)), "..");

function freshTarget() {
  const dir = mkdtempSync(join(tmpdir(), "llm-workflow-test-"));
  mkdirSync(join(dir, ".git")); // enough to pass the git check
  return dir;
}

function realTarget() {
  const dir = mkdtempSync(join(tmpdir(), "llm-workflow-real-"));
  execFileSync("git", ["init", "-q"], { cwd: dir });
  execFileSync("git", ["config", "user.email", "test@example.com"], { cwd: dir });
  execFileSync("git", ["config", "user.name", "Test"], { cwd: dir });
  return dir;
}

function install(target, ...flags) {
  return execFileSync("node", [join(kitRoot, "install.mjs"), target, ...flags], { encoding: "utf8" });
}

test("fresh install scaffolds everything", () => {
  const target = freshTarget();
  try {
    install(target);
    for (const path of [
      "skills/workflow.md",
      "skills/planning.md",
      "skills/testing.md",
      "skills/debugging.md",
      "skills/architecture-review.md",
      "skills/re-conciliate.md",
      "scripts/llm-workflow/scope.mjs",
      "scripts/llm-workflow/lib/core.mjs",
      "AGENTS.md",
      "CLAUDE.md",
      "llm-workflow.config.json",
      "docs/wiki/index.md",
      "docs/wiki/progress.md",
      ".gitattributes",
    ]) {
      assert.ok(existsSync(join(target, path)), `missing ${path}`);
    }
    const log = readFileSync(join(target, "docs/wiki/log.md"), "utf8");
    assert.ok(!log.includes("{{DATE}}"), "date placeholder not replaced");
  } finally {
    rmSync(target, { recursive: true, force: true });
  }
});

test("fresh install with existing agent context points at adopt.md", () => {
  const target = freshTarget();
  try {
    writeFileSync(join(target, "CLAUDE.md"), "# Existing rules");
    writeFileSync(join(target, ".cursorrules"), "old rules");
    const output = install(target);
    assert.ok(output.includes("skills/adopt.md"), "missing adopt.md pointer");
    assert.ok(output.includes("CLAUDE.md"), "detected files not named");
    assert.ok(output.includes(".cursorrules"), "detected files not named");
    // Pre-existing context is never overwritten by scaffolding.
    assert.equal(readFileSync(join(target, "CLAUDE.md"), "utf8"), "# Existing rules");
  } finally {
    rmSync(target, { recursive: true, force: true });
  }
});

test("fresh install into a clean repo does not mention adoption", () => {
  const target = freshTarget();
  try {
    const output = install(target);
    assert.ok(!output.includes("adopt.md"), "clean install should not route to adopt.md");
    assert.ok(output.includes("next: edit llm-workflow.config.json"), "missing fresh-install next step");
  } finally {
    rmSync(target, { recursive: true, force: true });
  }
});

test("update replaces kit files but never project files", () => {
  const target = freshTarget();
  try {
    install(target);
    writeFileSync(join(target, "llm-workflow.config.json"), JSON.stringify({ kitVersion: 0, gate: ["true"], verify: [] }, null, 2));
    writeFileSync(join(target, "docs/wiki/project.md"), "MINE");
    writeFileSync(join(target, "skills/workflow.md"), "STALE KIT FILE");
    writeFileSync(
      join(target, ".gitattributes"),
      "*.lock binary\ndocs/wiki/log.md merge=union\ndocs/wiki/progress.md\t-merge\n",
    );
    install(target, "--update");
    assert.equal(readFileSync(join(target, "docs/wiki/project.md"), "utf8"), "MINE");
    assert.ok(readFileSync(join(target, "skills/workflow.md"), "utf8").includes("# Workflow Skill"));
    assert.equal(JSON.parse(readFileSync(join(target, "llm-workflow.config.json"), "utf8")).kitVersion, 1);
    const attributes = readFileSync(join(target, ".gitattributes"), "utf8");
    assert.ok(attributes.includes("*.lock binary"), "existing attributes must survive");
    assert.equal(attributes.match(/docs\/wiki\/log\.md merge=union/g)?.length, 1, "managed attributes must not duplicate");
    assert.ok(attributes.includes("docs/wiki/decisions.md merge=union"), "missing managed attribute");
    assert.ok(attributes.includes("docs/wiki/progress.md\t-merge"), "existing path policy must survive");
    assert.ok(!attributes.includes("docs/wiki/progress.md merge=union"), "tab-separated existing path policy must win");
  } finally {
    rmSync(target, { recursive: true, force: true });
  }
});

test("fresh install refuses to clobber non-kit files in kit dirs", () => {
  const target = freshTarget();
  try {
    mkdirSync(join(target, "skills"), { recursive: true });
    writeFileSync(join(target, "skills/my-own-skill.md"), "precious");
    assert.throws(() => install(target));
    assert.equal(readFileSync(join(target, "skills/my-own-skill.md"), "utf8"), "precious");
  } finally {
    rmSync(target, { recursive: true, force: true });
  }
});

test("update preserves non-kit files in kit dirs", () => {
  const target = freshTarget();
  try {
    install(target);
    writeFileSync(join(target, "skills/my-own-skill.md"), "precious");
    install(target, "--update");
    assert.equal(readFileSync(join(target, "skills/my-own-skill.md"), "utf8"), "precious");
  } finally {
    rmSync(target, { recursive: true, force: true });
  }
});

test("fresh install produces runnable scoped and wiki verifiers in a real repository", () => {
  const target = realTarget();
  try {
    install(target);
    writeFileSync(
      join(target, "llm-workflow.config.json"),
      `${JSON.stringify(
        {
          kitVersion: 1,
          gate: ["node --version"],
          verify: [{ name: "source", globs: ["src/**"], commands: ["node --version"] }],
          lenses: {},
          wiki: { ledgerDriftCommits: 15, domainDriftCommits: 5, ledgerRowMaxChars: 700 },
        },
        null,
        2,
      )}\n`,
    );
    execFileSync("git", ["add", "."], { cwd: target });
    execFileSync("git", ["commit", "-qm", "install workflow"], { cwd: target });
    mkdirSync(join(target, "src"));
    writeFileSync(join(target, "src/example.ts"), "export const value = 1;\n");

    const scope = execFileSync(
      process.execPath,
      [join(target, "scripts/llm-workflow/scope.mjs"), "--base", "HEAD", "--dry-run", "--json"],
      { cwd: target, encoding: "utf8" },
    );
    const result = JSON.parse(scope);
    assert.deepEqual(result.files, ["src/example.ts"]);
    assert.deepEqual(result.commands, ["node --version"]);
    assert.match(
      execFileSync(process.execPath, [join(target, "scripts/llm-workflow/wiki-lint.mjs")], {
        cwd: target,
        encoding: "utf8",
      }),
      /wiki-lint: 5 pages green/,
    );
  } finally {
    rmSync(target, { recursive: true, force: true });
  }
});
