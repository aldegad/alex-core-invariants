import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(here, "..");
const skill = await fs.readFile(path.join(root, "SKILL.md"), "utf8");
const readme = await fs.readFile(path.join(root, "README.md"), "utf8");

if (!skill.includes("README.md")) {
  console.error("SKILL.md must defer to README.md as the canonical policy source.");
  process.exit(1);
}

if (!skill.includes("README.md wins")) {
  console.error("SKILL.md must explicitly state that README.md wins on policy drift.");
  process.exit(1);
}

const invariantMarkers = [...readme.matchAll(/^\d+\.\s+`([^`]+)`/gm)].map((m) => m[1]);

if (invariantMarkers.length === 0) {
  console.error("Could not extract invariant names from README.md. Is the numbered invariant list intact?");
  process.exit(1);
}

const duplicatedInvariantCount = invariantMarkers.filter((marker) => skill.includes(marker)).length;
if (duplicatedInvariantCount >= invariantMarkers.length) {
  console.error("SKILL.md appears to duplicate the full invariant list. Keep README.md as the sole canonical definition.");
  process.exit(1);
}

console.log("SKILL.md canonical-boundary check passed.");
