import fs from "node:fs/promises";
import path from "node:path";

if (!process.argv[2]) {
  console.error("Usage: node checks/policy-scan.mjs <path>");
  process.exit(1);
}

const target = path.resolve(process.argv[2]);
const ignoredDirs = new Set([
  ".git",
  "node_modules",
  "dist",
  "build",
  "coverage",
  ".next",
  ".turbo"
]);

const textExtensions = new Set([
  ".js",
  ".mjs",
  ".cjs",
  ".ts",
  ".tsx",
  ".jsx",
  ".json",
  ".md",
  ".txt",
  ".yaml",
  ".yml",
  ".toml",
  ".sh"
]);

const rules = [
  {
    id: "silent-fallback",
    description: "Possible silent fallback or quiet failure masking",
    pattern: /\b(fallback|fallbackTo|silent fallback|default on error)\b/i,
    allow: /alex-allow-failover/i
  },
  {
    id: "legacy-shadow-path",
    description: "Possible legacy or shadow path",
    pattern: /\b(legacy|shadow path|compat(ibility)? path|deprecated write path)\b/i,
    allow: /alex-allow-legacy/i
  },
  {
    id: "dual-write",
    description: "Possible dual-write or mirror-write pattern",
    pattern: /\b(dual[- ]write|mirror[- ]write|write both|fan[- ]out write)\b/i,
    allow: /alex-allow-dual-write/i
  },
  {
    id: "catch-return",
    description: "Catch-and-return may be hiding primary-path failure",
    pattern: /\bcatch\s*\([^)]*\)\s*\{[^}]*\breturn\b/i,
    allow: /alex-allow-failover/i
  }
];

async function walk(dir) {
  const results = [];
  const entries = await fs.readdir(dir, { withFileTypes: true });
  for (const entry of entries) {
    if (ignoredDirs.has(entry.name)) continue;
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      results.push(...(await walk(full)));
      continue;
    }
    if (entry.isFile() && textExtensions.has(path.extname(entry.name))) {
      results.push(full);
    }
  }
  return results;
}

function findIssues(file, content) {
  const issues = [];
  const lines = content.split(/\r?\n/);
  for (let index = 0; index < lines.length; index += 1) {
    const line = lines[index];
    for (const rule of rules) {
      if (!rule.pattern.test(line)) continue;
      if (rule.allow.test(line)) continue;
      issues.push({
        rule: rule.id,
        file,
        line: index + 1,
        text: line.trim(),
        description: rule.description
      });
    }
  }
  return issues;
}

const files = await walk(target);
const issues = [];

for (const file of files) {
  const content = await fs.readFile(file, "utf8");
  issues.push(...findIssues(file, content));
}

if (issues.length === 0) {
  console.log(`No heuristic policy-scan findings in ${target}`);
  process.exit(0);
}

for (const issue of issues) {
  console.log(`[${issue.rule}] ${issue.file}:${issue.line}`);
  console.log(`  ${issue.description}`);
  console.log(`  ${issue.text}`);
}

process.exit(1);
