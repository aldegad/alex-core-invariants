import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ignoredDirs = new Set([
  ".git",
  "node_modules",
  "dist",
  "build",
  "coverage",
  ".next",
  ".turbo",
  "test",
  "tests",
  "__tests__",
  "fixtures",
  "__fixtures__"
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

const codeExtensions = new Set([
  ".js",
  ".mjs",
  ".cjs",
  ".ts",
  ".tsx",
  ".jsx",
  ".sh"
]);

const markdownExtensions = new Set([".md"]);

const rules = [
  {
    id: "silent-fallback",
    description: "Possible silent fallback or quiet failure masking",
    pattern: /\b(fallback(?:To)?[A-Z]\w*|fallback|silent\s+fallback|default\s+on\s+error)\b/i,
    allow: /alex-allow-failover/i
  },
  {
    id: "legacy-shadow-path",
    description: "Possible legacy or shadow path",
    pattern: /\b(legacy[A-Z]\w*|legacy|shadow\s+path|compat(?:ibility)?(?:\s+path|Path)|deprecated\s+write\s+path)\b/i,
    allow: /alex-allow-legacy/i
  },
  {
    id: "dual-write",
    description: "Possible dual-write or mirror-write pattern",
    pattern: /\b(dual[-\s]?write|dualWrite|mirror[-\s]?write|mirrorWrite|write\s+both|fan[-\s]?out\s+write|fanOutWrite)\b/i,
    allow: /alex-allow-dual-write/i
  },
  {
    id: "catch-return",
    description: "Catch-and-return may be hiding primary-path failure",
    pattern: /\bcatch\s*\([^)]*\)\s*\{[^}]*\breturn\b/i,
    allow: /alex-allow-failover/i
  }
];

function appendBlank(output, char) {
  return output + (char === "\n" ? "\n" : " ");
}

function canStartRegexLiteral(previousCodeChar, recentCode) {
  if (!previousCodeChar) return true;
  if ("([{=,:;!&|?+-*~^<>".includes(previousCodeChar)) return true;
  return /\b(return|throw|case|delete|typeof|void|new|in|of|yield|await)$/.test(recentCode);
}

function stripCodeContext(content, options = {}) {
  const hashLineComments = options.hashLineComments ?? false;
  let output = "";
  let state = "code";
  let quote = "";
  let escaped = false;
  let regexCharClass = false;
  let previousCodeChar = "";
  let recentCode = "";

  function appendCode(char) {
    output += char;
    if (!/\s/.test(char)) {
      previousCodeChar = char;
      recentCode = `${recentCode}${char}`.slice(-40);
    }
  }

  for (let index = 0; index < content.length; index += 1) {
    const char = content[index];
    const next = content[index + 1];

    if (state === "line-comment") {
      if (char === "\n") {
        state = "code";
        output += "\n";
      } else {
        output = appendBlank(output, char);
      }
      continue;
    }

    if (state === "block-comment") {
      if (char === "*" && next === "/") {
        output = appendBlank(output, char);
        output = appendBlank(output, next);
        index += 1;
        state = "code";
      } else {
        output = appendBlank(output, char);
      }
      continue;
    }

    if (state === "string") {
      output = appendBlank(output, char);
      if (escaped) {
        escaped = false;
        continue;
      }
      if (char === "\\") {
        escaped = true;
        continue;
      }
      if (char === quote) {
        state = "code";
        quote = "";
        continue;
      }
      if (char === "\n" && quote !== "`") {
        state = "code";
        quote = "";
      }
      continue;
    }

    if (state === "regex") {
      output = appendBlank(output, char);
      if (escaped) {
        escaped = false;
        continue;
      }
      if (char === "\\") {
        escaped = true;
        continue;
      }
      if (char === "[") {
        regexCharClass = true;
        continue;
      }
      if (char === "]") {
        regexCharClass = false;
        continue;
      }
      if (char === "/" && !regexCharClass) {
        state = "code";
        regexCharClass = false;
        while (/[a-z]/i.test(content[index + 1] ?? "")) {
          index += 1;
          output = appendBlank(output, content[index]);
        }
        continue;
      }
      if (char === "\n") {
        state = "code";
        regexCharClass = false;
      }
      continue;
    }

    if (char === "/" && next === "/") {
      output = appendBlank(output, char);
      output = appendBlank(output, next);
      index += 1;
      state = "line-comment";
      continue;
    }

    if (char === "/" && next === "*") {
      output = appendBlank(output, char);
      output = appendBlank(output, next);
      index += 1;
      state = "block-comment";
      continue;
    }

    if (hashLineComments && char === "#") {
      output = appendBlank(output, char);
      state = "line-comment";
      continue;
    }

    if (char === "\"" || char === "'" || char === "`") {
      output = appendBlank(output, char);
      state = "string";
      quote = char;
      escaped = false;
      continue;
    }

    if (char === "/" && canStartRegexLiteral(previousCodeChar, recentCode)) {
      output = appendBlank(output, char);
      state = "regex";
      escaped = false;
      regexCharClass = false;
      continue;
    }

    appendCode(char);
  }

  return output;
}

function markdownScannableLines(content) {
  const lines = content.split(/\r?\n/);
  const output = Array(lines.length).fill("");
  let inFence = false;
  let blockLines = [];
  let blockLineIndexes = [];

  function flushBlock() {
    const stripped = stripCodeContext(blockLines.join("\n")).split(/\r?\n/);
    for (let index = 0; index < blockLineIndexes.length; index += 1) {
      output[blockLineIndexes[index]] = stripped[index] ?? "";
    }
    blockLines = [];
    blockLineIndexes = [];
  }

  for (let index = 0; index < lines.length; index += 1) {
    if (/^\s{0,3}(```+|~~~+)/.test(lines[index])) {
      if (inFence) {
        flushBlock();
      }
      inFence = !inFence;
      continue;
    }

    if (inFence) {
      blockLines.push(lines[index]);
      blockLineIndexes.push(index);
    }
  }

  if (inFence) {
    flushBlock();
  }

  return output;
}

function scannableLinesFor(file, content) {
  const extension = path.extname(file);
  if (markdownExtensions.has(extension)) {
    return markdownScannableLines(content);
  }
  if (codeExtensions.has(extension)) {
    return stripCodeContext(content, { hashLineComments: extension === ".sh" }).split(/\r?\n/);
  }
  return content.split(/\r?\n/);
}

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

async function collectFiles(target) {
  const stat = await fs.stat(target);
  if (stat.isFile()) {
    return textExtensions.has(path.extname(target)) ? [target] : [];
  }
  if (!stat.isDirectory()) {
    return [];
  }
  return walk(target);
}

export function findIssues(file, content) {
  const issues = [];
  const rawLines = content.split(/\r?\n/);
  const scannableLines = scannableLinesFor(file, content);
  for (let index = 0; index < rawLines.length; index += 1) {
    const rawLine = rawLines[index];
    const scannableLine = scannableLines[index] ?? "";
    for (const rule of rules) {
      if (!rule.pattern.test(scannableLine)) continue;
      if (rule.allow.test(rawLine)) continue;
      issues.push({
        rule: rule.id,
        file,
        line: index + 1,
        text: rawLine.trim(),
        description: rule.description
      });
    }
  }
  return issues;
}

export async function scanTarget(targetPath) {
  const target = path.resolve(targetPath);
  const files = await collectFiles(target);
  const issues = [];

  for (const file of files) {
    const content = await fs.readFile(file, "utf8");
    issues.push(...findIssues(file, content));
  }

  return issues;
}

async function main() {
  if (!process.argv[2]) {
    console.error("Usage: node checks/policy-scan.mjs <path>");
    process.exit(1);
  }

  const target = path.resolve(process.argv[2]);
  const issues = await scanTarget(target);

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
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  await main();
}
