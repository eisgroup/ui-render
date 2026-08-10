/**
 * Rewrites every runtime `data-version="..."` in the tree to match package.json.
 *
 * The version is duplicated across the published wrapper and the demo shell. Wired to the
 * `version` npm lifecycle script, so `npm version` keeps them in step instead of leaving a
 * release commit that fails its own contract test.
 *
 * Run directly to check or repair at any time:
 *   node scripts/sync-version.js          # rewrite files that drifted
 *   node scripts/sync-version.js --check  # report drift, exit 1, change nothing
 */
const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const { version } = require(path.join(ROOT, 'package.json'));

// Keep in step with VERSION_SITES in src/library/__tests__/library.public-api-and-wrapper.test.js
const FILES = [
    'src/library/AppWrapper.js',
    'public/index.html',
];

const ATTRIBUTE = /data-version="([^"]*)"/g;
const checkOnly = process.argv.includes('--check');

let drifted = 0;

for (const file of FILES) {
    const fullPath = path.join(ROOT, file);
    const source = fs.readFileSync(fullPath, 'utf8');
    const found = Array.from(source.matchAll(ATTRIBUTE)).map((match) => match[1]);

    if (!found.length) {
        console.error(`${file}: no data-version attribute found — update FILES in scripts/sync-version.js`);
        process.exitCode = 1;
        continue;
    }

    const stale = found.filter((found) => found !== version);
    if (!stale.length) continue;

    drifted += stale.length;

    if (checkOnly) {
        console.error(`${file}: ${stale.join(', ')} != ${version}`);
        continue;
    }

    fs.writeFileSync(fullPath, source.replace(ATTRIBUTE, `data-version="${version}"`));
    console.log(`${file}: -> ${version}`);
}

if (!drifted) {
    console.log(`data-version already at ${version} in ${FILES.length} files`);
} else if (checkOnly) {
    process.exitCode = 1;
}
