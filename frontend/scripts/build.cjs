const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const tmpDir = path.resolve(__dirname, '..', '.tmp');
if (!fs.existsSync(tmpDir)) {
  fs.mkdirSync(tmpDir, { recursive: true });
}

process.env.TEMP = tmpDir;
process.env.TMP = tmpDir;

const npxCmd = process.platform === 'win32' ? 'npx.cmd' : 'npx';
execSync(`${npxCmd} tsc && ${npxCmd} vite build`, {
  cwd: path.resolve(__dirname, '..'),
  stdio: 'inherit',
  env: process.env,
  shell: true,
});

