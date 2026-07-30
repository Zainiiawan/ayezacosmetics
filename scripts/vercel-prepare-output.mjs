import fs from 'fs';
import path from 'path';

/**
 * Vercel project root is the monorepo root, but Next.js emits to frontend/.next.
 * Copy the build output to repository-root/.next so @vercel/next can detect it.
 * Local development is unaffected (this script only runs in the Vercel buildCommand).
 */
const src = path.join(process.cwd(), 'frontend', '.next');
const dest = path.join(process.cwd(), '.next');

if (!fs.existsSync(src)) {
  console.error(`[vercel-prepare-output] Missing build output at ${src}`);
  process.exit(1);
}

fs.rmSync(dest, { recursive: true, force: true });
fs.cpSync(src, dest, { recursive: true });

console.log(`[vercel-prepare-output] Copied ${src} → ${dest}`);
