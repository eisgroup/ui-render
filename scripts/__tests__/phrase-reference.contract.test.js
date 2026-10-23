/**
 * GENERATED BUILT-IN PHRASE REFERENCE CONTRACT ===============================
 *
 * Guards `docs/BUILT-IN-PHRASES.md` as `view-reference.contract.test.js` guards the view reference: the
 * page is regenerated here and compared to what is on disk, so the table the widget falls back to
 * cannot change without the page a host's translators read changing with it.
 *
 *   1. the page equals `renderMarkdown(readPhrases())`: the drift gate;
 *   2. what the generator parses out of the source equals the REAL `BUILT_IN_PHRASES`, so its
 *      parsing cannot quietly lie about the table;
 *   3. the published `UIRenderPhraseId` lists the same ids;
 *   4. the parser refuses what it must not let through, on synthetic sources;
 *   5. a vacuity guard, because a comparison that cannot fail proves nothing.
 *
 * `src/library/contract.agreement.ts` holds the TYPES to the same ids at compile time, under
 * `npm run typecheck`; 3 holds the published text to them in every jest leg.
 */
const { execFileSync } = require('child_process')
const fs = require('fs')
const path = require('path')

const { parsePhrases, readPhrases, renderMarkdown, OUTPUT_FILE, WRITE_COMMAND } = require('../generate-phrase-reference')
const { BUILT_IN_PHRASES } = require('../../src/core/utils/phrases')
const { readVocabularyUnions } = require('../../src/demo/testing/contractTypes')

const ROOT = path.resolve(__dirname, '..', '..')

/** A source whose table holds `lines`, shaped as `src/core/utils/phrases.ts` is. */
const sourceWith = (...lines) => ['export const BUILT_IN_PHRASES = {', ...lines, '} as const', ''].join('\n')

describe('generated built-in phrase reference', () => {
    const phrases = readPhrases()
    const generated = renderMarkdown(phrases)
    const page = fs.readFileSync(path.join(ROOT, OUTPUT_FILE), 'utf8')

    it(`keeps ${OUTPUT_FILE} identical to the generator output — run \`${WRITE_COMMAND}\``, () => {
        // Compared line by line, so the failure names the line that drifted.
        expect(page.split('\n')).toEqual(generated.split('\n'))
    })

    it('parses the table the widget falls back to, text for text', () => {
        const parsed = Object.fromEntries(phrases.map(({ id, text }) => [id, text]))
        expect(parsed).toEqual({ ...BUILT_IN_PHRASES })
    })

    it('lists every phrase on the page as its own row, with its English text and where it shows', () => {
        phrases.forEach(({ id, text, where }) => {
            expect(page).toContain(`| \`${id}\` | ${text} | ${where} |`)
        })
    })

    it('publishes the same ids as `UIRenderPhraseId`, a closed union', () => {
        expect(readVocabularyUnions().UIRenderPhraseId).toEqual({ literals: Object.keys(BUILT_IN_PHRASES).sort(), isOpen: false })
    })

    it('publishes only ids an i18next-based host can take as keys', () => {
        Object.keys(BUILT_IN_PHRASES).forEach(id => {
            expect(id).toMatch(/^[A-Z][A-Z0-9]*(_[A-Z0-9]+)*$/)
        })
    })

    it('reads an entry as it is written, comments and escapes included', () => {
        expect(parsePhrases(sourceWith(
            '  // A comment line is skipped.',
            '',
            '  DONT_SHOW: \'Don\\\'t show | hide\', // A pipe, an apostrophe',
        ))).toEqual([{ id: 'DONT_SHOW', text: 'Don\'t show | hide', where: 'A pipe, an apostrophe' }])
    })

    it('escapes a pipe in a table cell', () => {
        expect(renderMarkdown([{ id: 'A', text: 'x | y', where: 'p | q' }])).toContain('| `A` | x \\| y | p \\| q |')
    })

    it('refuses an entry it cannot list, rather than leaving it off the page', () => {
        const refusals = [
            [sourceWith('  OK: \'Ok\', // Where'), null],
            ['const OTHER = {}\n', /no top-level `export const BUILT_IN_PHRASES = \{` found/],
            ['export const BUILT_IN_PHRASES = {\n  OK: \'Ok\', // Where\n}\n', /not closed by a line-initial `} as const`/],
            // Named by its line in the source: the table opens on line 1, so its first entry is line 2.
            [sourceWith('  OK: "Ok", // Double quotes'), /phrases\.ts:2: cannot read this entry/],
            [sourceWith('  ok: \'Ok\', // Lower case'), /`ok` is not UPPER_SNAKE_CASE/],
            [sourceWith('  OK__TWICE: \'Ok\', // Two underscores'), /`OK__TWICE` is not UPPER_SNAKE_CASE/],
            [sourceWith('  OK: \'Ok\', // Where', '  OK: \'Okay\', // Again'), /phrases\.ts:3: `OK` is listed twice/],
            [sourceWith('  OK: \' \', // Blank'), /`OK` has no English text/],
            [sourceWith('  OK: \'Ok\','), /`OK` has no comment saying where it shows/],
            [sourceWith('  // Only a comment'), /parsed to no entries/],
        ]
        refusals.forEach(([source, refusal]) => {
            if (refusal) expect(() => parsePhrases(source)).toThrow(refusal)
            else expect(() => parsePhrases(source)).not.toThrow()
        })
    })

    it('would notice a page that lost a row', () => {
        expect(renderMarkdown(phrases.slice(1))).not.toEqual(page)
    })

    it('passes its own --check from the command line', () => {
        // The npm script and the CI step run the CLI, not this module.
        const output = execFileSync('node', ['scripts/generate-phrase-reference.js', '--check'],
            { cwd: ROOT, encoding: 'utf8' })
        expect(output).toContain('up to date')
    })
})
