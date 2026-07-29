#!/usr/bin/env node
/**
 * Railway / production API build: compile shared + api and fail if dist is missing.
 */
const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..');
const apiIndex = path.join(root, 'apps/api/dist/index.js');
const sharedIndex = path.join(root, 'packages/shared/dist/index.js');

function run(cmd) {
  console.log(`\n> ${cmd}\n`);
  execSync(cmd, { cwd: root, stdio: 'inherit', env: process.env });
}

run('npm run build --workspace=@ayeza/shared');
run('npm run build --workspace=@ayeza/api');

if (!fs.existsSync(apiIndex)) {
  console.error(`FATAL: missing ${apiIndex}`);
  process.exit(1);
}
if (!fs.existsSync(sharedIndex)) {
  console.error(`FATAL: missing ${sharedIndex}`);
  process.exit(1);
}

console.log(`OK: ${apiIndex}`);
console.log(`OK: ${sharedIndex}`);
