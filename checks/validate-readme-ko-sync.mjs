import fs from "node:fs/promises";
import crypto from "node:crypto";
import path from "node:path";
import { fileURLToPath } from "node:url";

const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(here, "..");

const readme = await fs.readFile(path.join(root, "README.md"), "utf8");
const expectedSha = crypto.createHash("sha256").update(readme).digest("hex");

const ko = await fs.readFile(path.join(root, "README.ko.md"), "utf8");
const match = ko.match(/^<!-- source-sha: ([0-9a-f]+) -->$/m);

if (!match) {
  console.error("README.ko.md is missing the `<!-- source-sha: ... -->` header marker.");
  process.exit(1);
}

const actualSha = match[1];

if (actualSha !== expectedSha) {
  console.error("README.ko.md source-sha does not match README.md.");
  console.error(`  expected: ${expectedSha}`);
  console.error(`  actual:   ${actualSha}`);
  console.error("");
  console.error("README.ko.md is stale. Update the Korean translation to reflect README.md, then run `npm run translate` to restamp.");
  process.exit(1);
}

console.log("README.ko.md sync check passed.");
