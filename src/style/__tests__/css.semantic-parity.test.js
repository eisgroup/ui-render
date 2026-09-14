/**
 * PIXEL-PARITY GATE FOR §9.7-F1 STEP 4 — the criterion the step has always stated and never had.
 * =============================================================================================
 *
 * Step 4 replaces `@import`s of `semantic-ui-less` with CSS this repository owns, and UPGRADE-PLAN
 * defines done as "pixel parity of extracted CSS vs current compiled output". Until this file there
 * was no mechanism for that sentence: `grep` over `e2e/` finds no screenshot assertion anywhere, so
 * "the output is unchanged" could only be checked by looking at it.
 *
 * WHY NOT SCREENSHOTS, since "pixel parity" reads like a request for them. Three reasons, and the
 * third is the one that decides it: they are slow, they are flaky across platforms and font stacks,
 * and when one fails it says "these pixels differ" rather than naming the declaration that moved.
 * Comparing compiled CSS is deterministic and diagnostic — a failure prints the rule.
 *
 * WHAT IS PINNED. `src/style/__tests__/semantic-contributed-css.txt`: every rule the remaining
 * `semantic-ui-less` imports contribute, with its declarations, in cascade order. The list is
 * DERIVED, not hand-written — `scripts/generate-semantic-css-fixture.js` compiles the stylesheet
 * twice, once as-is and once with `_semantic.less`'s imports commented out, and takes the
 * difference. So the fixture cannot drift from what the imports really contribute, and it was built
 * with the same technique that proved three modules unused in step 4's first half.
 *
 * AT WHICH STAGE. The LESS output, BEFORE prefixwrap. That is deliberate: this gate asks "does the
 * CSS we own reproduce what Semantic's LESS produced", and prefixwrap applies identically either
 * way. The scoping stage has its own gate next door in `css.pipeline.parity.test.js`.
 *
 * HOW IT IS MEANT TO BE USED at the swap: vendor the CSS, run this, and a green result IS the
 * parity evidence. A red one names the rule that moved. The fixture is regenerated with
 * `npm run css:fixture` only when a change to that CSS is the intended product of the commit.
 *
 * WHEN THE EXIT COMPLETES, this file inverts rather than being deleted: with no imports left the
 * generator throws by design ("either the exit is complete and this fixture should be retired, or
 * the import detection broke"), which is the prompt to re-point it at the vendored file.
 */
const fs = require('fs');
const path = require('path');

const { contributedRules, FIXTURE, WRITE_COMMAND } = require('../../../scripts/generate-semantic-css-fixture.js');

/**
 * Blocks back out of the fixture. Only the `#` header lines are stripped and empty blocks dropped —
 * nothing else is normalised HERE, deliberately: the generator is the single place that decides the
 * canonical form, so a rule written by it and a rule read back are compared as-is. An earlier draft
 * trimmed each block on this side and produced a phantom failure against a value ending in a space.
 */
const parse = (text) => text
    .split('\n\n')
    .map(block => block.split('\n').filter(line => !line.startsWith('#')).join('\n'))
    .map(block => block.replace(/^\n+|\n+$/g, ''))
    .filter(Boolean);

let actual;

beforeAll(async () => {
    actual = await contributedRules();
    // 60s, matching the four sibling CSS suites: this one compiles the whole tree TWICE, and those
    // suites already showed that a tighter budget is the first thing to break when several
    // LESS-compiling workers contend for CPU on CI.
}, 60000);

describe('the CSS semantic-ui-less still contributes', () => {
    it('matches the fixture rule for rule, declaration for declaration', () => {
        const expected = parse(fs.readFileSync(FIXTURE, 'utf8'));

        // Reported as a first-difference rather than a whole-list diff: 285 rules produce an
        // unreadable failure otherwise, and the first divergence is what a reader needs.
        const firstDifference = actual.findIndex((rule, index) => rule !== expected[index]);
        if (firstDifference !== -1) {
            throw new Error(`compiled CSS diverges from ${path.basename(FIXTURE)} at rule ${firstDifference + 1}.`
                + `\n\n--- fixture ---\n${expected[firstDifference] || '(no such rule)'}`
                + `\n\n--- compiled ---\n${actual[firstDifference] || '(no such rule)'}`
                + `\n\nIf the change is intended, run \`${WRITE_COMMAND}\` and read the whole diff.`);
        }
        expect(actual).toHaveLength(expected.length);
    });

    it('still contributes the dropdown and the reset, so the fixture cannot silently empty', () => {
        // The vacuity guard. A fixture that matched an empty compilation would pass the test above
        // while proving nothing — and "the imports stopped resolving" is a real failure mode, since
        // they reach into `node_modules` through a webpack alias.
        const selectors = actual.map(rule => rule.split('\n')[0]);
        expect(selectors.some(selector => selector.includes('.ui.selection.dropdown'))).toBe(true);
        expect(selectors.some(selector => selector === 'html')).toBe(true);
        expect(actual.length).toBeGreaterThan(200);
    });
});
