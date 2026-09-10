import * as fs from 'fs';
import * as path from 'path';

export function bundledFixtures(fromFile: string): string {
    const candidates = [
        path.join(fromFile, '..', '..', '..', 'fixtures'),
        path.join(fromFile, '..', '..', 'fixtures'),
        path.join(fromFile, 'fixtures'),
        path.join(fromFile, '..', '..', '..', '..', 'fixtures'),
    ];
    for (const c of candidates) {
        const resolved = path.resolve(c);
        if (fs.existsSync(resolved)) return resolved;
    }
    return path.resolve(path.join(fromFile, '..', '..', '..', 'fixtures'));
}

export function resolveDataRoot(configStore: any, fromFile: string): string {
    const dir = String(configStore?.DATA_DIR || '').trim();
    if (dir && fs.existsSync(dir)) return path.resolve(dir);
    return bundledFixtures(fromFile);
}
