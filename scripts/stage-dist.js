const fs = require('fs');
const path = require('path');

const root = path.join(__dirname, '..');
const dist = path.join(root, 'dist');

function copyDir(from, to) {
    if (!fs.existsSync(from)) return;
    fs.mkdirSync(to, { recursive: true });
    for (const e of fs.readdirSync(from, { withFileTypes: true })) {
        const a = path.join(from, e.name);
        const b = path.join(to, e.name);
        if (e.isDirectory()) copyDir(a, b);
        else fs.copyFileSync(a, b);
    }
}

function listFiles(dir, base = dir) {
    if (!fs.existsSync(dir)) return [];
    const out = [];
    for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
        const full = path.join(dir, e.name);
        if (e.isDirectory()) out.push(...listFiles(full, base));
        else out.push(path.relative(base, full).split(path.sep).join('/'));
    }
    return out.sort();
}

function stageDist() {
    if (!fs.existsSync(path.join(dist, 'config.js'))) {
        throw new Error('Falta dist/config.js. Corre `npm run deploy` antes de urano-launch.');
    }
    for (const f of ['SKILL.md', 'README.md', 'package.json', 'LICENSE']) {
        const s = path.join(root, f);
        if (fs.existsSync(s)) fs.copyFileSync(s, path.join(dist, f));
    }
    copyDir(path.join(root, 'fixtures'), path.join(dist, 'fixtures'));
    copyDir(path.join(root, 'assets'), path.join(dist, 'assets'));
    if (!listFiles(path.join(root, 'fixtures')).length) {
        throw new Error('fixtures/ está vacío. El ZIP debe llevar el banco de aventuras.');
    }
    const uiSrc = path.join(root, 'ui', 'widgets.js');
    const uiDist = path.join(dist, 'ui', 'widgets.js');
    fs.mkdirSync(path.dirname(uiDist), { recursive: true });
    if (fs.existsSync(uiSrc)) fs.copyFileSync(uiSrc, uiDist);
    else if (!fs.existsSync(uiDist)) {
        throw new Error('Falta ui/widgets.js. Corre `npm run build:ui` / `npm run deploy`.');
    }
    return dist;
}

function requiredRel() {
    const fixtures = listFiles(path.join(root, 'fixtures')).map((rel) => `fixtures/${rel}`);
    return [
        'config.js',
        'SKILL.md',
        'ui/widgets.js',
        'Plugins/Quest/QuestPlugin.js',
        'Plugins/Engine/UranoKidquestEnginePlugin.js',
        ...fixtures,
    ];
}

function assertStaged() {
    const missing = requiredRel().filter((rel) => !fs.existsSync(path.join(dist, rel)));
    if (missing.length) throw new Error(`ZIP incompleto:\n  - ${missing.join('\n  - ')}`);
}

if (require.main === module) {
    stageDist();
    assertStaged();
    console.log('[stage-dist] dist listo (SKILL, fixtures, ui/widgets.js)');
}

module.exports = { stageDist, assertStaged, requiredRel, dist, root };
