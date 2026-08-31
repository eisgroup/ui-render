/**
 * GENERATED SUPPORTED-PROP REFERENCE CONTRACT ==================================
 *
 * Guards `docs/SUPPORTED-PROPS.md` the way `view-reference.contract.test.js` guards
 * `docs/SUPPORTED-VIEWS.md`: the page is regenerated here and compared to what is on disk.
 * UPGRADE-PLAN §9.7-F1 step 0 asked for a published parity checklist; a checklist nothing
 * verifies would be wrong by the time step 3 lands, and this is what stops that.
 *
 * Six layers, weakest to strongest:
 *   1. the page equals `renderMarkdown(buildReference())` — the drift gate;
 *   2. the statically parsed `domProps.js` lists equal the REAL exported arrays, so the
 *      generator's parsing cannot quietly lie about what is stripped;
 *   3. the TRACKED example corpus is walked here and its attribute inventory compared to
 *      META_ATTRIBUTES — the one part of the page that cannot be derived from source, made
 *      total in both directions against the real `EXAMPLES` manifest;
 *   4. counted tripwires (how many import sites, how many props per wrapper, tier-1 vs
 *      tier-2) — so a behavioural change shows up as a named failure, not a doc rewrite;
 *   5. the two contracts the page asserts but the page cannot enforce: the eslint erosion
 *      guard being configured at all, and `Dropdown`'s `displayName` surviving on the export
 *      the form adapter actually receives;
 *   6. tokenizer and vacuity guards, because a comparison that cannot fail proves nothing.
 *
 * The generator throws on the structural failures (a wrapper prop with no curated line,
 * curation for a prop the wrapper no longer intercepts, a `via` that disagrees with the
 * source, a SUIR import outside the pack), so those surface here as a thrown error.
 *
 * @Note: the corpus walk in layer 3 reads `EXAMPLES` — the tracked manifest — and never the
 *  directory. `src/demo/examples/` also holds untracked customer working files (§0.8), and
 *  enumerating the directory would pull them into a committed expectation.
 */
const { execFileSync } = require('child_process')
const fs = require('fs')
const path = require('path')

const {
    buildReference,
    renderMarkdown,
    readDomPropsLists,
    interceptedProps,
    jsxOpenings,
    stripComments,
    OUTPUT_FILE,
    WRITE_COMMAND,
} = require('../generate-wrapper-prop-reference')
const { META_ATTRIBUTES, FORWARDED_CURATION } = require('../wrapper-prop-curation')

const { EXAMPLES } = require('../../src/demo/examples/manifest')
const { ENGINE_PROPS, FIELD_ONLY_PROPS } = require('../../src/core/components/domProps')
const { Dropdown: NamedDropdown, default: MemoDropdown } = require('../../src/core/components/Dropdown')

const ROOT = path.resolve(__dirname, '..', '..')

/**
 * Counted tripwires. Not aspirations — the current shape of the surface. Changing one is
 * fine; changing one without regenerating the page, or without noticing that a prop just
 * became reachable, is what these catch.
 */
const EXPECTED = {
    importSites: 7,
    interceptedByWrapper: { Table: 1, TooltipPop: 4, Dropdown: 23 },
    forwardedTier1: 37,
    forwardedTier2: 24,
    // The three props no tracked example uses but consumer metas do. `upward` and `disabled`
    // reach semantic-ui-react and are both styled, which is why a demo-derived checklist
    // would have been wrong — see UPGRADE-PLAN §9.7-F1 step 0.
    consumerOnlyForwarded: ['disabled', 'upward'],
}

/** The four wrapped views, plus the header entries of a `Table` node. */
const WRAPPED_VIEWS = ['Table', 'Tooltip', 'Select', 'Dropdown']

/**
 * Every attribute name the tracked corpus puts on a node of a wrapped view.
 * Cycle-guarded: example metas share sub-objects, and `data` payloads can be self-referential.
 */
function corpusAttributes (metas) {
    const byView = {}
    const headers = new Set()
    const seen = new Set()
    const walk = (node) => {
        if (node == null || typeof node !== 'object') return
        if (Array.isArray(node)) return node.forEach(walk)
        if (seen.has(node)) return
        seen.add(node)
        if (WRAPPED_VIEWS.includes(node.view)) {
            const set = byView[node.view] || (byView[node.view] = new Set())
            Object.keys(node).forEach(key => set.add(key))
            if (node.view === 'Table' && Array.isArray(node.headers)) {
                node.headers.forEach((header) => {
                    if (header && typeof header === 'object' && !Array.isArray(header)) {
                        Object.keys(header).forEach(key => headers.add(key))
                    }
                })
            }
        }
        Object.keys(node).forEach(key => walk(node[key]))
    }
    metas.forEach(walk)
    const out = { 'Table headers[]': [...headers].sort() }
    WRAPPED_VIEWS.forEach(view => { out[view] = [...(byView[view] || [])].sort() })
    return out
}

describe('generated supported-prop reference', () => {
    const reference = buildReference()
    const generated = renderMarkdown(reference)
    const page = fs.readFileSync(path.join(ROOT, OUTPUT_FILE), 'utf8')

    it(`keeps ${OUTPUT_FILE} identical to the generator output — run \`${WRITE_COMMAND}\``, () => {
        // Line by line so the failure names the drifting line rather than dumping the page.
        expect(page.split('\n')).toEqual(generated.split('\n'))
    })

    it('parses the same DOM-boundary lists the components actually import', () => {
        // If these diverge, every "stripped" claim on the page is suspect — this is the
        // assertion that makes the rest of the strip section mean anything.
        expect(readDomPropsLists()).toEqual({ ENGINE_PROPS, FIELD_ONLY_PROPS })
    })

    it('matches the tracked example corpus attribute for attribute', () => {
        // The corpus half of the page. Add an example that puts a new attribute on a Table,
        // Tooltip, Select or Dropdown node and this names it — which is the whole reason the
        // parity checklist can be trusted at step 3.
        expect(corpusAttributes(EXAMPLES.map(example => example.meta))).toEqual({
            ...Object.keys(META_ATTRIBUTES).reduce((all, view) => ({ ...all, [view]: META_ATTRIBUTES[view] }), {}),
        })
    })

    it('pins the size of the audited surface', () => {
        const forwarded = Object.values(FORWARDED_CURATION).flatMap(entries => Object.values(entries))
        expect({
            importSites: reference.importSites.length,
            interceptedByWrapper: reference.wrappers.reduce((all, wrapper) => (
                { ...all, [wrapper.id]: wrapper.intercepted.length }
            ), {}),
            forwardedTier1: forwarded.filter(entry => entry.tier === 1).length,
            forwardedTier2: forwarded.filter(entry => entry.tier === 2).length,
            consumerOnlyForwarded: Object.values(FORWARDED_CURATION)
                .flatMap(entries => Object.entries(entries))
                .filter(([, entry]) => entry.source === 'consumer')
                .map(([name]) => name).sort(),
        }).toEqual(EXPECTED)
    })

    it('keeps every semantic-ui-react reference inside the components pack', () => {
        // buildReference() throws on a stray, so reaching here already proves it. Asserted
        // explicitly because this is the §9.7-F1 invariant, and because this check sees
        // `require()` and `jest.mock()`, which the eslint rule cannot.
        reference.importSites.forEach(({ file }) => {
            expect(file.startsWith('src/core/components/')).toBe(true)
        })
        expect(reference.importSites.some(site => site.kind === 'jest.mock')).toBe(true)
    })

    it('keeps the eslint erosion guard configured', () => {
        // The guard is a package.json override, so nothing else would notice it being dropped
        // until a stray import shipped. §9.7-F1 step 0's second deliverable, pinned.
        const { eslintConfig } = JSON.parse(fs.readFileSync(path.join(ROOT, 'package.json'), 'utf8'))
        const override = (eslintConfig.overrides || []).find(entry => (
            entry.rules && entry.rules['no-restricted-imports']
        ))
        expect(override).toBeDefined()
        expect(override.excludedFiles).toEqual(['src/core/components/**'])
        const [severity, options] = override.rules['no-restricted-imports']
        expect(severity).toBe('error')
        expect(options.paths.map(entry => entry.name)).toContain('semantic-ui-react')
        // `paths` alone does not stop `semantic-ui-react/dist/commonjs/...`.
        expect(options.patterns).toContain('semantic-ui-react/*')
    })

    it('keeps `displayName` on the export the form adapter receives', () => {
        // `modules/form/utils.js` branches on `InputComponent.displayName === 'Dropdown'`, and
        // that works only because `DropdownField` imports the NAMED export: React.memo does not
        // copy displayName, so the default export has none. §9.7-F1 step 3 has to preserve BOTH
        // facts — the string and the named-vs-default split — or refactor the adapter branch
        // with it. Asserted on the source for the import shape, because requiring
        // `DropdownField` here would pull the whole form/engine cycle into this suite.
        expect(NamedDropdown.displayName).toBe('Dropdown')
        expect(MemoDropdown.displayName).toBeUndefined()

        const field = fs.readFileSync(path.join(ROOT, 'src/core/modules/form/inputs/DropdownField.js'), 'utf8')
        expect(field).toMatch(/import\s*\{\s*Dropdown\s*\}\s*from\s*'\.\.\/\.\.\/\.\.\/components\/Dropdown'/)
        const adapter = fs.readFileSync(path.join(ROOT, 'src/core/modules/form/utils.js'), 'utf8')
        expect(adapter).toContain("displayName) === 'Dropdown'")
    })

    it('reads props out of the wrappers, in every shape the wrappers are written in', () => {
        // The parsers are the load-bearing part of "derived, not curated": if one stopped
        // matching, the page would list fewer props and still agree with itself. Synthetic
        // sources in the real shapes, so the patterns are pinned to the syntax rather than to
        // today's file contents.
        const parsed = interceptedProps([
            'export default function Widget ({',
            '  plain,',
            '  withDefault = false,',
            '  renamed: local,',
            '  // a comment between entries',
            '  bothWays: other = SOME.CONSTANT,',
            '  ...rest',
            '}) {',
        ].join('\n'), 'Widget', 'synthetic')
        expect(parsed.restName).toBe('rest')
        expect(parsed.intercepted).toEqual([
            { name: 'plain', alias: null, hasDefault: false },
            { name: 'withDefault', alias: null, hasDefault: true },
            { name: 'renamed', alias: 'local', hasDefault: false },
            { name: 'bothWays', alias: 'other', hasDefault: true },
        ])

        const [opening] = jsxOpenings([
            '<Thing',
            '  quoted="x"',
            '  braced={cn(\'a\', b, {c: d > 1})}',
            '  // a comment between attributes, which TableView really does',
            '  bare',
            '  {...omitProps(props, ENGINE_PROPS, FIELD_ONLY_PROPS)}',
            '/>',
        ].join('\n'), 'Thing')
        expect(opening.attributes).toEqual(['quoted', 'braced', 'bare'])
        expect(opening.spreads).toEqual(['...omitProps(props, ENGINE_PROPS, FIELD_ONLY_PROPS)'])

        // `<TableView>` must not be read as a `<Table>`, or the call-site table would be wrong.
        expect(jsxOpenings('<TableView foo="1"/><Table.Cell bar="2"/>', 'Table')).toEqual([])

        // Prose is not code: `Dropdown.js` mentions `props.onClose` in a comment.
        expect(stripComments("a // props.x = 1\nb /* props.y = 2 */ c\nconst d = 'http://k'"))
            .toBe("a \nb  c\nconst d = 'http://k'")
    })

    it('would notice a page that lost a section', () => {
        // Vacuity guard for the first test: prove the comparison distinguishes content.
        const withoutOneWrapper = { ...reference, wrappers: reference.wrappers.slice(1) }
        expect(renderMarkdown(withoutOneWrapper)).not.toEqual(page)
    })

    it('passes its own --check from the command line', () => {
        // The npm script and the CI step run the CLI, not this module.
        const output = execFileSync('node', ['scripts/generate-wrapper-prop-reference.js', '--check'],
            { cwd: ROOT, encoding: 'utf8' })
        expect(output).toContain('up to date')
    })
})
