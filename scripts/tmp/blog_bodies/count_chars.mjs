import { readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const dir = dirname(fileURLToPath(import.meta.url));
const path = join(dir, "all_bodies.json");
const data = JSON.parse(readFileSync(path, "utf8"));
const langs = ["de", "fr", "es", "it", "pl", "ja", "ko"];
const lines = [];

for (const [slug, bodies] of Object.entries(data)) {
  lines.push(`## ${slug}`);
  for (const lang of langs) {
    const body = bodies[lang] ?? "";
    const hasFaq = body.includes("## FAQ");
    const hasTable = body.includes("| --- |");
    const clean =
      !/Related reading|Try it on Seedance|## Related|## Try it/i.test(body);
    lines.push(
      `  ${lang}: ${String(body.length).padStart(5)} chars | FAQ=${hasFaq} | table=${hasTable} | clean=${clean}`,
    );
  }
  lines.push("");
}

const report = lines.join("\n") + "\n";
writeFileSync(join(dir, "char_counts.txt"), report, "utf8");
console.log(report);
