const fs = require('fs');
const path = require('path');

/**
 * Put `theme.config` where `semantic-ui-less` looks for it, so the CSS suites can compile the real
 * LESS. This mutates `node_modules` — see CLAUDE.md's gotchas — and it runs once per jest WORKER,
 * which is what makes the mechanics below matter.
 *
 * WHY IT IS NOT A PLAIN `copyFileSync` — HARDENING, not a fix for anything observed. It was a
 * plain copy, and `copyFileSync` truncates the destination before writing it, so in principle a
 * worker compiling LESS can read the file while it is empty or partial. That race was NOT
 * reproducible: four runs at four workers with the truncating copy, and the destination deleted
 * first so every worker had to write, stayed green. It was my first hypothesis for a CI failure in
 * `css.compilation.test.js` and it was the wrong one — that suite's `beforeAll` was timing out at
 * 30s while its three siblings allowed 60s, and a `beforeAll` timeout reports every test in the
 * file as failed with an empty message. The timeout is fixed where it lives. This stays because
 * an unobserved race is still a race and the fix costs nothing.
 *
 * Two things fix it, in this order:
 *   1. Do nothing when the file is already correct. That is the common case after the first
 *      worker, so most runs perform no write at all and cannot race.
 *   2. When a write IS needed, write a worker-unique temp file next to the destination and
 *      `rename` it into place. Rename within one filesystem is atomic, so a concurrent reader
 *      sees either the complete old file or the complete new one — never a half-written one.
 */
const source = path.resolve(__dirname, '../override/theme.config');
const destination = path.resolve(__dirname, '../../../node_modules/semantic-ui-less/theme.config');

if (fs.existsSync(source)) {
    const wanted = fs.readFileSync(source);
    let current = null;
    try { current = fs.readFileSync(destination); } catch (error) { /* absent is expected once */ }

    if (current === null || !current.equals(wanted)) {
        const temporary = `${destination}.${process.pid}.tmp`;
        fs.writeFileSync(temporary, wanted);
        fs.renameSync(temporary, destination);
    }
}
