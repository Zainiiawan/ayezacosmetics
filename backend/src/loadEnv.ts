import path from 'path';
import fs from 'fs';
import dotenv from 'dotenv';

/**
 * Load env before any other app modules run.
 * Railway injects process.env — dotenv must NOT override those.
 * Locally we load the first existing .env from known monorepo locations.
 */
const candidates = [
  path.resolve(process.cwd(), '.env'),
  path.resolve(process.cwd(), 'backend/.env'),
  path.resolve(process.cwd(), '../.env'),
  path.resolve(process.cwd(), '../../.env'),
  // Compiled: backend/dist → repo root
  path.resolve(__dirname, '../../../.env'),
  path.resolve(__dirname, '../../.env'),
  path.resolve(__dirname, '../.env'),
];

let loadedFrom: string | null = null;

for (const envPath of candidates) {
  if (!fs.existsSync(envPath)) continue;
  const result = dotenv.config({ path: envPath, override: false });
  if (!result.error) {
    loadedFrom = envPath;
    break;
  }
}

if (process.env.MONGODB_URI) {
  // Soft signal only — never print credentials
  process.stdout.write(
    `[env] MONGODB_URI loaded${loadedFrom ? ` (file: ${path.basename(path.dirname(loadedFrom))}/${path.basename(loadedFrom)})` : ' (process environment)'}\n`
  );
} else if (process.env.NODE_ENV !== 'test') {
  process.stderr.write(
    '[env] WARNING: MONGODB_URI is not set. Set it in Railway Variables or local .env\n'
  );
}
