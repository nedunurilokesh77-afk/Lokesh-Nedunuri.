import { cpSync, existsSync, mkdirSync } from "node:fs";
import { join } from "node:path";

const root = process.cwd();
const standalone = join(root, ".next", "standalone");
const staticSource = join(root, ".next", "static");
const staticTarget = join(standalone, ".next", "static");
const publicSource = join(root, "public");
const publicTarget = join(standalone, "public");

if (!existsSync(standalone)) {
  throw new Error("Next.js standalone output was not found. Run next build first.");
}
mkdirSync(join(standalone, ".next"), { recursive: true });
if (existsSync(staticSource)) cpSync(staticSource, staticTarget, { recursive: true });
if (existsSync(publicSource)) cpSync(publicSource, publicTarget, { recursive: true });
console.log("Standalone output prepared (static assets and public files copied).");
