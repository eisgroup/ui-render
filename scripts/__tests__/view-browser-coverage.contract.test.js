/**
 * THE BROWSER VIEW MAP CONTRACT ===============================================
 *
 * `e2e/view-coverage.js` says, for each of the views `docs/SUPPORTED-VIEWS.md` lists, which browser
 * tests drive it, or why none needs to. A map like that is worth reading only while it is true, so
 * this checks it against the two things it describes, without running a browser:
 *   1. its keys are exactly the views `FIELD.TYPE` declares, as the generated page lists them;
 *   2. every entry is well formed for its kind, and an alias points at a view that is not one;
 *   3. every test it names exists, by its exact title, in the spec it names;
 *   4. every test of `e2e/interactive-views.pw.js` is named by some view, so that spec cannot grow
 *      a test the map does not account for.
 * The titles are read out of the spec files as text; jest never loads `@playwright/test`.
 */
const fs = require('fs')
const path = require('path')

const { buildReference } = require('../generate-view-reference')
const { VIEW_COVERAGE } = require('../../e2e/view-coverage')

const E2E = path.join(__dirname, '../../e2e')

/** Every `test('…')` title in a spec, unescaped. */
function testTitles (spec) {
    const source = fs.readFileSync(path.join(E2E, spec), 'utf8')
    const titles = []
    const pattern = /\btest\(\s*(['"`])((?:\\.|(?!\1)[^\\])*)\1/g
    let match
    while ((match = pattern.exec(source))) titles.push(match[2].replace(/\\(.)/g, '$1'))
    return titles
}

describe('e2e/view-coverage.js', () => {
    const entries = Object.entries(VIEW_COVERAGE)

    it('classifies exactly the views FIELD.TYPE declares', () => {
        const declared = buildReference().views.map(view => view.value).sort()
        expect(declared).toHaveLength(37)
        expect(Object.keys(VIEW_COVERAGE).sort()).toEqual(declared)
    })

    it('gives every entry what its kind needs', () => {
        const malformed = entries.filter(([, entry]) => {
            if (entry.kind === 'alias') return !VIEW_COVERAGE[entry.aliasOf] || VIEW_COVERAGE[entry.aliasOf].kind === 'alias'
            if (entry.kind === 'passive') return !entry.why
            if (entry.kind === 'interactive') return !Array.isArray(entry.browser) || (!entry.browser.length && !entry.gap)
            return true
        })
        expect(malformed.map(([view]) => view)).toEqual([])
    })

    it('names only tests that exist, by their exact title', () => {
        const titlesOf = {}
        const missing = []
        for (const [view, entry] of entries) {
            for (const { spec, test } of entry.browser || []) {
                if (!fs.existsSync(path.join(E2E, spec))) {
                    missing.push(`${view}: no spec ${spec}`)
                    continue
                }
                titlesOf[spec] = titlesOf[spec] || testTitles(spec)
                if (!titlesOf[spec].includes(test)) missing.push(`${view}: ${spec} has no test "${test}"`)
            }
        }
        expect(missing).toEqual([])
    })

    it('accounts for every test of interactive-views.pw.js', () => {
        const named = new Set(entries.flatMap(([, entry]) => (entry.browser || [])
            .filter(({ spec }) => spec === 'interactive-views.pw.js')
            .map(({ test }) => test)))
        const titles = testTitles('interactive-views.pw.js')
        // Vacuity guard: the title reader must find the spec's tests at all.
        expect(titles.length).toBeGreaterThanOrEqual(16)
        expect(titles.filter(title => !named.has(title))).toEqual([])
    })
})
