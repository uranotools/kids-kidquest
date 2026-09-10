const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const { stageDist, assertStaged, requiredRel, dist, root } = require('./stage-dist');

stageDist();
assertStaged();

const pkg = JSON.parse(fs.readFileSync(path.join(root, 'package.json'), 'utf8'));
const zipName = `${pkg.name}.zip`;
const zip = path.join(root, zipName);
if (fs.existsSync(zip)) fs.unlinkSync(zip);

const distEsc = dist.replace(/'/g, "''");
const zipEsc = zip.replace(/'/g, "''");
execSync(
    `powershell -NoProfile -Command "Compress-Archive -Path '${distEsc}\\*' -DestinationPath '${zipEsc}' -Force"`,
    { stdio: 'inherit' }
);

const bytes = fs.statSync(zip).size;
console.log(`[urano-launch] ${zipName} (${Math.round(bytes / 1024)} KB)`);
console.log('[urano-launch] incluye:');
for (const rel of requiredRel()) console.log(`  ✓ ${rel}`);
console.log('Instalar MCP (.zip) en Integraciones de Urano Desktop.');
