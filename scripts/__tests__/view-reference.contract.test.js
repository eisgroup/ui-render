/**
 * GENERATED VIEW REFERENCE CONTRACT ===========================================
 *
 * Guards `docs/SUPPORTED-VIEWS.md` the way `library.public-api-and-wrapper.test.js`
 * guards the hand-written `data-version` sites: the page is regenerated here and
 * compared to what is on disk, so a `FIELD` constant or a resolver `case` cannot
 * change without the page changing with it. UPGRADE-PLAN §9.4 asked for the docs to
 * "stop drifting by construction"; generating a file nobody checks would not do that,
 * and this is the check.
 *
 * Four layers, weakest to strongest:
 *   1. the page equals `renderMarkdown(buildReference())` — the drift gate;
 *   2. the statically parsed constants equal the REAL, fully assembled `FIELD`
 *      object — so the generator's parsing cannot quietly lie about the vocabulary;
 *   3. counted tripwires (how many views, which ones are unresolved) — so a
 *      behavioural change shows up as a named failure, not a silent doc rewrite;
 *   4. a vacuity guard, because a comparison that cannot fail proves nothing.
 *
 * The generator itself throws on the structural failures (a constant with no curated
 * description, curation for a deleted constant, a `resolvesTo` naming a component that
 * no longer occurs in the resolver, a fourth module starting to declare constants), so
 * those surface here as a thrown error rather than as separate cases.
 */
const { execFileSync } = require('child_process')
const fs = require('fs')
const path = require('path')

const {
    buildReference,
    renderMarkdown,
    readConstants,
    resolverFacts,
    OUTPUT_FILE,
    WRITE_COMMAND,
} = require('../generate-view-reference')

// Importing the engine runs all three modules that assign to FIELD (variables/fields.js,
// form/constants.js, pages/main/rules.js), so `FIELD` below is the vocabulary the renderer
// really dispatches on — not a subset that happens to be loaded.
require('../../src/core/pages/main/rules')
const { FIELD } = require('../../src/core/modules/variables')

const ROOT = path.resolve(__dirname, '..', '..')

/**
 * Counted tripwires. These are not aspirations — they are the current shape of the
 * vocabulary. Changing one is fine; changing one WITHOUT regenerating the page, or
 * without noticing that a `view` just became reachable, is what these catch.
 */
const EXPECTED_COUNTS = { views: 46, resolved: 37, unresolved: 9, renderers: 7, actions: 13 }

/**
 * `view` strings that are declared as constants but that no resolver case handles: a node
 * using one renders the "field does not exist!" placeholder. §9.4 recorded `FIELD.TYPE.DATE`
 * as unused; this is the full list, taken from the source rather than from that note.
 * Implementing one of these should delete its entry here in the same change.
 */
const UNRESOLVED_VIEWS = [
    'Date',
    'Dates',
    'Fields',
    'FieldsWithLevel',
    'Group',
    'Link',
    'Place',
    'UploadGrid',
    'UploadGrids',
]

/**
 * `FIELD.TYPE` and `FIELD.RENDER` are separate namespaces, so one string can legally be
 * both — and exactly one is. That collision is the reason the page has to say that
 * `"Date"` works as a `render*` value while being dead as a `view`; pinning it keeps the
 * note from outliving the situation it describes.
 */
const VIEW_RENDERER_COLLISIONS = ['Date']

const byKey = (entries) => entries.reduce((all, { key, value }) => ({ ...all, [key]: value }), {})

describe('generated view reference', () => {
    const reference = buildReference()
    const generated = renderMarkdown(reference)
    const page = fs.readFileSync(path.join(ROOT, OUTPUT_FILE), 'utf8')

    it(`keeps ${OUTPUT_FILE} identical to the generator output — run \`${WRITE_COMMAND}\``, () => {
        // Compared line by line so the failure names the drifting line instead of dumping
        // the whole page. A `FIELD` constant, a resolver `case` or a curated sentence
        // changed and the page was not regenerated.
        expect(page.split('\n')).toEqual(generated.split('\n'))
    })

    it('parses the same constants the engine actually assembles at runtime', () => {
        const parsed = readConstants()
        // If these diverge the generator's static parsing is wrong, and every derived
        // statement on the page is suspect — this is the assertion that makes the rest mean
        // something.
        expect(byKey(parsed.TYPE)).toEqual({ ...FIELD.TYPE })
        expect(byKey(parsed.RENDER)).toEqual({ ...FIELD.RENDER })
        expect(byKey(parsed.ACTION)).toEqual({ ...FIELD.ACTION })
    })

    it('pins the size of the vocabulary', () => {
        expect({
            views: reference.views.length,
            resolved: reference.views.filter(view => view.resolved).length,
            unresolved: reference.views.filter(view => !view.resolved).length,
            renderers: reference.renderers.length,
            actions: reference.actions.length,
        }).toEqual(EXPECTED_COUNTS)
    })

    it('pins which views no resolver case handles', () => {
        // Sorted by `view` string already, so this list is stable.
        expect(reference.views.filter(view => !view.resolved).map(({ value }) => value))
            .toEqual(UNRESOLVED_VIEWS)
    })

    it('pins the one string that is both a view and a value renderer', () => {
        const renderers = reference.renderers.map(({ value }) => value)
        expect(reference.views.map(({ value }) => value).filter(value => renderers.includes(value)))
            .toEqual(VIEW_RENDERER_COLLISIONS)
    })

    it('lists every constant on the page as its own table row', () => {
        // Guards the renderer itself: a template that dropped a section would still be
        // byte-identical to its own output, and only this notices.
        reference.views.forEach(({ key, value }) => {
            expect(page).toContain(`| \`${value}\` | \`FIELD.TYPE.${key}\` |`)
        })
        reference.renderers.forEach(({ key, value }) => {
            expect(page).toContain(`| \`${value}\` | \`FIELD.RENDER.${key}\` |`)
        })
        reference.actions.forEach(({ key, value }) => {
            expect(page).toContain(`| \`${value}\` | \`FIELD.ACTION.${key}\` |`)
        })
    })

    it('describes every entry, and never claims a resolver for a view that has none', () => {
        const described = [...reference.views, ...reference.renderers, ...reference.actions]
        described.forEach(({ summary }) => {
            expect(typeof summary).toBe('string')
            expect(summary.trim()).not.toHaveLength(0)
        })
        reference.views.forEach(({ value, resolved, resolvesTo, resolvedIn }) => {
            expect({ value, hasTarget: Boolean(resolvesTo), dispatched: resolvedIn.length > 0 })
                .toEqual({ value, hasTarget: resolved, dispatched: resolved })
        })
    })

    it('reads dispatch out of the resolver, in every shape the resolver writes it', () => {
        // The regexes are the load-bearing part of "derived, not curated": if one stopped
        // matching, every view would quietly become unresolved and the page would agree with
        // itself. Synthetic sources in the four real shapes, so the patterns are pinned to
        // the syntax rather than to today's file contents.
        const facts = resolverFacts({
            mapper: [
                '        case FIELD.TYPE.LINK:',
                '        case FIELD.TYPE.ROW: {',
                '            if (view === FIELD.TYPE.DROPDOWN) return null',
                '                        view = FIELD.TYPE.SLIDER',
                '        case FIELD.RENDER.PERCENT:',
            ].join('\n'),
            renderField: '    case FIELD.TYPE.INPUT:\n      Field = PlaceholderField',
            rules: '            FIELD.FUNC[FIELD.ACTION.SUBMIT] = this.submit',
            fields: '  [FIELD.ACTION.WARN]: console.warn,',
        })

        expect([...facts.switchCases].sort()).toEqual(['LINK', 'ROW'])
        expect([...facts.defaultBranch]).toEqual(['DROPDOWN'])
        expect([...facts.typeAliases]).toEqual(['SLIDER'])
        expect([...facts.fieldCases]).toEqual(['INPUT'])
        expect([...facts.methodCases]).toEqual(['PERCENT'])
        expect([...facts.actionSites.keys()].sort()).toEqual(['SUBMIT', 'WARN'])
    })

    it('would notice a page that lost a row', () => {
        // Vacuity guard for the first test: prove the comparison distinguishes content.
        const withoutOneView = { ...reference, views: reference.views.slice(1) }
        expect(renderMarkdown(withoutOneView)).not.toEqual(page)
    })

    it('passes its own --check from the command line', () => {
        // The npm script and the CI step run the CLI, not this module. Exercise that path
        // too: a broken argv or exit-code contract would otherwise only fail in CI.
        const output = execFileSync('node', ['scripts/generate-view-reference.js', '--check'],
            { cwd: ROOT, encoding: 'utf8' })
        expect(output).toContain('up to date')
    })
})
