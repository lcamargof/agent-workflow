// The kit must stay project-agnostic: no references to the product it was extracted from.
import assert from "node:assert/strict";
import { readFileSync, readdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { test } from "node:test";
import { fileURLToPath } from "node:url";

const kitRoot = join(dirname(fileURLToPath(import.meta.url)), "..");
// Product-specific terms that must never appear on a shipped surface — projects the kit was
// extracted from and agent tools it must not assume. Bare common words (register, reserve) are
// deliberately NOT banned: they collide with real English; the project *names* are caught by
// their distinctive product strings instead. Keep this list to distinctive strings, not words.
const BANNED = [
  /interview[- ]?friend/i,
  /\binterviewer\b/i,
  /\bavatar\b/i,
  /\bexercise\b/i,
  /\bcodex\b/i,
  /\bopencode\b/i,
  /\bchatty\b/i,
  /reserve-(api|ai|protocol|dashboard|sdk)/i,
  /api\.reserve/i,
  /reserve\.org/i,
  /\bDTFs?\b/,
  /\bRToken/i,
];
const SURFACES = ["skills", "scripts", "templates", "install.mjs", "README.md", "NOTICE.md"];

test("kit files contain no product-specific references", () => {
  const offenders = [];
  for (const surface of SURFACES) {
    for (const file of walk(join(kitRoot, surface))) {
      const content = readFileSync(file, "utf8");
      for (const pattern of BANNED) {
        if (pattern.test(content)) offenders.push(`${file}: ${pattern}`);
      }
    }
  }
  assert.deepEqual(offenders, []);
});

function walk(path) {
  try {
    const entries = readdirSync(path, { withFileTypes: true });
    return entries.flatMap((entry) =>
      entry.isDirectory() ? walk(join(path, entry.name)) : [join(path, entry.name)],
    );
  } catch {
    return [path]; // a file, not a directory
  }
}
