import fs from "node:fs/promises";
import crypto from "node:crypto";
import path from "node:path";
import { fileURLToPath } from "node:url";

const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(here, "..");

const readme = await fs.readFile(path.join(root, "README.md"), "utf8");
const sha = crypto.createHash("sha256").update(readme).digest("hex");

const koPath = path.join(root, "README.ko.md");
const ko = await fs.readFile(koPath, "utf8");

const pattern = /^<!-- source-sha: [0-9a-f]+ -->$/m;
if (!pattern.test(ko)) {
  console.error("README.ko.md is missing the `<!-- source-sha: ... -->` header marker.");
  process.exit(1);
}

const updated = ko.replace(pattern, `<!-- source-sha: ${sha} -->`);
await fs.writeFile(koPath, updated, "utf8");

console.log(`Stamped README.ko.md with source-sha ${sha.slice(0, 12)}...`);
