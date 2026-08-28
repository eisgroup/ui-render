/**
 * DEV-MODE META VALIDATION CONTRACT ===========================================
 *
 * UPGRADE-PLAN §9.4: "on invalid meta, report the JSON path of the offending node
 * instead of a downstream render crash."
 *
 * The suite has two halves, and the second is the one that matters:
 *
 *  - the reporting contract: exact JSON paths, severities, codes, inertness, and
 *    the guarantee that nothing here ever throws into a host application;
 *
 *  - THE ERROR/CRASH PAIRING: every `error`-severity check is asserted against
 *    the real engine, by rendering the offending meta through UIRender and
 *    proving it actually breaks — and by proving the same meta with the defect
 *    fixed renders. That pairing is what stops the error set drifting into
 *    guesswork; a check that no longer predicts a crash fails here.
 * -----------------------------------------------------------------------------
 */
import React from 'react'
import { render } from '@testing-library/react'
import { AppContext, ConfigContext, initialAppState, initialConfigState } from '../../contexts'
import { FIELD } from '../../modules/variables/fields'
import { storedTouched } from '../../modules/form/utils'
import UIRender, { clearErrorsMap, formsStorage } from '../../pages/main/rules'
import { Render } from '../index'
import {
    CURRENT_META_VERSION,
    META_PROBLEM,
    META_SEVERITY,
    declaredRenderMethods,
    declaredViews,
    formatMetaProblem,
    reportMetaProblems,
    validateMeta,
} from '../validateMeta'

const errorsOf = (meta) => validateMeta(meta).filter(problem => problem.severity === META_SEVERITY.ERROR)
const codesOf = (meta) => validateMeta(meta).map(problem => `${problem.severity}:${problem.code}@${problem.path}`)

describe('validateMeta reporting contract', () => {
    it('accepts a well-formed document silently', () => {
        expect(validateMeta({
            metaVersion: CURRENT_META_VERSION,
            view: 'Col',
            items: [
                { view: 'Text', name: 'a.b' },
                { view: 'Table', name: 'rows', headers: [{ id: 'x', renderCell: 'Currency' }] },
            ],
        })).toEqual([])
    })

    it('reports the JSON path of a deeply nested offender', () => {
        const problems = validateMeta({
            view: 'Col',
            items: [
                { view: 'Row' },
                { view: 'Row' },
                { view: 'Row' },
                { view: 'Row', items: [{ view: 'Text', name: 7 }] },
            ],
        })

        expect(problems).toHaveLength(1)
        // The whole point of §9.4: a path, not a stack trace.
        expect(problems[0].path).toBe('items[3].items[0].name')
        expect(problems[0].code).toBe(META_PROBLEM.NAME_NOT_STRING)
        expect(problems[0].severity).toBe(META_SEVERITY.ERROR)
    })

    it('reports paths through every collection attribute the engine walks', () => {
        expect(codesOf({
            view: 'Table',
            name: 'rows',
            headers: [{ id: 'a', renderCell: { view: 'Row', items: 'nope' } }],
        })).toEqual([`error:${META_PROBLEM.NOT_AN_ARRAY}@headers[0].renderCell.items`])
    })

    it('reports a root that is not a single Field object, and stops there', () => {
        const forArray = validateMeta([{ view: 'Row' }])

        expect(forArray).toHaveLength(1)
        expect(forArray[0]).toMatchObject({ path: '', code: META_PROBLEM.ROOT_NOT_OBJECT })
        expect(forArray[0].message).toContain('an array')
        expect(validateMeta(null)[0].message).toContain('null')
        expect(validateMeta('Row')[0].message).toContain('string')
        expect(validateMeta(undefined)[0].code).toBe(META_PROBLEM.ROOT_NOT_OBJECT)
    })

    it('does not report null attributes, which the engine deletes before rendering', () => {
        // sanitizeResponse (via transformConfig) strips null/undefined attributes and filters
        // null array entries, so these are measurably as harmless as omitting them.
        expect(validateMeta({
            view: 'Row',
            items: [null, { view: 'Text' }],
            headers: null,
            extraItems: null,
            extraHeaders: null,
            name: null,
            showIf: null,
            relativeData: null,
        })).toEqual([])
    })

    it('does not report falsy non-string names, which the engine skips', () => {
        expect(validateMeta({ view: 'Text', name: 0 })).toEqual([])
        expect(validateMeta({ view: 'Text', name: '' })).toEqual([])
    })

    it.each([
        ['items', { view: 'Row', items: {} }],
        ['headers', { view: 'Table', headers: 'a' }],
        ['extraItems', { view: 'Table', extraItems: 1 }],
        ['extraHeaders', { view: 'Table', extraHeaders: true }],
    ])('reports a non-array %s as an error', (attribute, meta) => {
        expect(codesOf(meta)).toEqual([`error:${META_PROBLEM.NOT_AN_ARRAY}@${attribute}`])
    })

    it('warns about an unknown or non-string view without failing it', () => {
        expect(codesOf({ view: 'Rows' })).toEqual([`warning:${META_PROBLEM.UNKNOWN_VIEW}@view`])
        expect(validateMeta({ view: 'Rows' })[0].message).toContain('"Rows"')
        expect(codesOf({ view: 42 })).toEqual([`warning:${META_PROBLEM.VIEW_NOT_STRING}@view`])
        expect(errorsOf({ view: 'Rows' })).toEqual([])
    })

    it('warns about an unknown render method on any render* attribute', () => {
        expect(codesOf({
            view: 'Table',
            headers: [{ id: 'a', renderCell: 'double5' }],
            renderItem: 'nope',
            renderLabel: 'Currency',
        // Depth-first: `headers` precedes `renderItem` in the declaration, so its child's
        // warning is reported first. `renderLabel: 'Currency'` is a real method and is silent.
        })).toEqual([
            `warning:${META_PROBLEM.UNKNOWN_RENDER_METHOD}@headers[0].renderCell`,
            `warning:${META_PROBLEM.UNKNOWN_RENDER_METHOD}@renderItem`,
        ])
    })

    it('warns about a showIf that is neither a key path nor an object', () => {
        expect(codesOf({ view: 'Row', showIf: 5 })).toEqual([`warning:${META_PROBLEM.SHOW_IF_INVALID}@showIf`])
        expect(validateMeta({ view: 'Row', showIf: 'flag' })).toEqual([])
        expect(validateMeta({ view: 'Row', showIf: {} })).toEqual([])
        expect(validateMeta({ view: 'Row', showIf: { name: 'flag', equal: 'x' } })).toEqual([])
    })

    it('reads the view and render vocabularies from the live engine definitions', () => {
        // Captured at call time, never at import time: FIELD.TYPE is assembled in three passes.
        expect(declaredViews()).toEqual(expect.arrayContaining([FIELD.TYPE.ROW, FIELD.TYPE.INPUT, FIELD.TYPE.POPUP]))
        expect(declaredRenderMethods()).toEqual(expect.arrayContaining([FIELD.RENDER.CURRENCY]))
        expect(validateMeta({ view: FIELD.TYPE.INPUT })).toEqual([])
    })

    it('walks shared and cyclic references once, without hanging', () => {
        const shared = { view: 'Text', name: 7 }
        expect(validateMeta({ view: 'Row', items: [shared, shared] })).toHaveLength(1)

        const cyclic = { view: 'Row', items: [] }
        cyclic.items.push({ view: 'Col', items: [cyclic] })
        expect(validateMeta(cyclic)).toEqual([])
    })
})

describe('metaVersion declaration', () => {
    it('treats absence as "current"', () => {
        expect(validateMeta({ view: 'Row' })).toEqual([])
    })

    it.each(['1', '1.0', '2.13'])('accepts the shape %s', (value) => {
        const problems = validateMeta({ metaVersion: value, view: 'Row' })
        expect(problems.filter(problem => problem.severity === META_SEVERITY.ERROR)).toEqual([])
    })

    it.each([
        ['a non-string', 1],
        ['a name', 'draft'],
        ['a three-part version', '1.0.0'],
        ['an empty string', ''],
    ])('rejects %s', (label, value) => {
        expect(codesOf({ metaVersion: value, view: 'Row' }))
            .toEqual([`error:${META_PROBLEM.META_VERSION_INVALID}@metaVersion`])
    })

    it('warns when the declared major is newer than this build implements', () => {
        const ahead = String(Number(CURRENT_META_VERSION) + 1)
        expect(codesOf({ metaVersion: ahead, view: 'Row' }))
            .toEqual([`warning:${META_PROBLEM.META_VERSION_AHEAD}@metaVersion`])
        expect(validateMeta({ metaVersion: ahead, view: 'Row' })[0].message).toContain(CURRENT_META_VERSION)
    })

    it('warns when declared on a nested node, where it is ignored', () => {
        expect(codesOf({ view: 'Row', items: [{ view: 'Text', metaVersion: '1' }] }))
            .toEqual([`warning:${META_PROBLEM.META_VERSION_NOT_ROOT}@items[0].metaVersion`])
    })

    it('treats a nested UIRender `meta` declaration as its own document root', () => {
        // The engine does not transform that subtree, so the nested instance owns it —
        // including its own metaVersion.
        expect(validateMeta({ view: 'Data', meta: { metaVersion: '1', view: 'Row' } })).toEqual([])
        expect(codesOf({ view: 'Data', meta: { metaVersion: 'draft', view: 'Row' } }))
            .toEqual([`error:${META_PROBLEM.META_VERSION_INVALID}@meta.metaVersion`])
        expect(validateMeta({ view: 'Data', meta: 'not-a-document' })).toEqual([])
    })
})

describe('reportMetaProblems flag', () => {
    let consoleWarn

    beforeEach(() => {
        consoleWarn = jest.spyOn(console, 'warn').mockImplementation(() => {})
    })

    afterEach(() => {
        consoleWarn.mockRestore()
    })

    it.each([[undefined], [false], [null], [0], ['']])('is completely inert when the flag is %p', (flag) => {
        expect(reportMetaProblems({ view: 'Row', items: {} }, flag)).toBeNull()
        expect(consoleWarn).not.toHaveBeenCalled()
    })

    it('reports to console.warn, one path-first line per problem', () => {
        const problems = reportMetaProblems({ view: 'Row', items: [{ view: 'Text', name: 7 }] }, true)

        expect(problems).toHaveLength(1)
        expect(consoleWarn).toHaveBeenCalledTimes(1)
        expect(consoleWarn.mock.calls[0][0]).toBe('[ui-render] meta error at "items[0].name": '
            + 'name must be a string key path, got number — the engine interpolates it and throws on any other type')
    })

    it('stays silent on valid meta even when enabled', () => {
        expect(reportMetaProblems({ view: 'Row' }, true)).toEqual([])
        expect(consoleWarn).not.toHaveBeenCalled()
    })

    it('hands the problems to a function sink instead of the console', () => {
        const seen = []
        // A plain function, not jest.fn(): isFunction() in core/utils rejects cross-realm functions.
        const problems = reportMetaProblems({ view: 'Row', items: {} }, (list) => seen.push(list))

        expect(problems).toHaveLength(1)
        expect(seen[0]).toBe(problems)
        expect(consoleWarn).not.toHaveBeenCalled()
    })

    it('never throws into the host, whatever the sink does', () => {
        const explode = () => { throw new Error('sink exploded') }
        expect(reportMetaProblems({ view: 'Row' }, explode)).toBeNull()
        expect(() => reportMetaProblems(Object.create({ get view () { throw new Error('hostile meta') } }), true))
            .not.toThrow()
    })

    it('formats the root path readably', () => {
        expect(formatMetaProblem({ path: '', severity: 'error', message: 'boom' }))
            .toBe('[ui-render] meta error at (root): boom')
    })
})

/**
 * The pairing that keeps the error set honest: for each error-severity check,
 * render the offending meta through the real engine and prove it breaks, then
 * prove the corrected meta renders.
 */
describe('every error-severity check predicts a real engine failure', () => {
    const originalFetch = global.fetch
    let consoleError

    const clearGlobalRegistries = () => {
        formsStorage.clear()
        clearErrorsMap()
        Object.keys(storedTouched).forEach(key => delete storedTouched[key])
    }

    beforeEach(() => {
        clearGlobalRegistries()
        consoleError = jest.spyOn(console, 'error').mockImplementation(() => {})
        global.fetch = () => Promise.resolve({ json: () => Promise.resolve({}) })
    })

    afterEach(() => {
        consoleError.mockRestore()
        clearGlobalRegistries()
        if (originalFetch === undefined) delete global.fetch
        else global.fetch = originalFetch
    })

    const data = { rows: [{ a: 1 }], label: 'ok' }

    const mount = (meta) => {
        const caught = []
        const previousOnError = Render.onError
        Render.onError = ({ error }) => caught.push(error)
        try {
            const { container } = render(
                <ConfigContext.Provider value={initialConfigState}>
                    <AppContext.Provider
                        value={{ ...initialAppState, setPopupState: () => {}, togglePopupState: () => {} }}
                    >
                        <UIRender data={data} meta={meta} initialValues={data} form={{ id: 'probe' }} translate={value => value}/>
                    </AppContext.Provider>
                </ConfigContext.Provider>
            )
            return { thrown: null, caught, html: container.innerHTML }
        } catch (error) {
            return { thrown: error, caught, html: '' }
        } finally {
            Render.onError = previousOnError
        }
    }

    it.each([
        [
            'a non-array items',
            { view: 'Row', items: {} },
            { view: 'Row', items: [{ view: 'Text', children: 'ok' }] },
            'items.map is not a function',
        ],
        [
            'a non-array headers',
            { view: 'Table', name: 'rows', headers: {} },
            { view: 'Table', name: 'rows', headers: [{ id: 'a' }] },
            'headers.map is not a function',
        ],
        [
            'a non-array extraItems',
            { view: 'Table', name: 'rows', headers: [{ id: 'a' }], extraItems: {} },
            { view: 'Table', name: 'rows', headers: [{ id: 'a' }], extraItems: [] },
            'extraItems.map is not a function',
        ],
        [
            'a non-array extraHeaders',
            { view: 'Table', name: 'rows', headers: [{ id: 'a' }], extraHeaders: {} },
            { view: 'Table', name: 'rows', headers: [{ id: 'a' }], extraHeaders: [] },
            'extraHeaders.map is not a function',
        ],
        [
            'a truthy non-string name',
            { view: 'Text', name: true },
            { view: 'Text', name: 'label' },
            'resolvedName.includes is not a function',
        ],
    ])('%s: reported as an error, and really does break the engine', (label, broken, fixed, expectedMessage) => {
        expect(errorsOf(broken)).toHaveLength(1)
        expect(errorsOf(fixed)).toEqual([])

        const brokenRun = mount(broken)
        const messages = [brokenRun.thrown, ...brokenRun.caught]
            .filter(Boolean)
            .map(error => error.message || String(error))
        expect(messages.join(' | ')).toContain(expectedMessage)

        const fixedRun = mount(fixed)
        expect(fixedRun.thrown).toBeNull()
        expect(fixedRun.caught).toEqual([])
    })

    it('a non-object root: reported as an error, and renders nothing', () => {
        expect(errorsOf([])).toHaveLength(1)

        const run = mount([])
        expect(run.thrown).toBeNull()
        expect(run.html).not.toContain('flex--row')
    })

    /**
     * §9.4 item 3, plus the `$schema` pointer the published schema is consumed through, plus
     * `_comment` — an author annotation the (deliberately open) schema permits anywhere.
     * These are only additive-and-negotiable if declaring them changes nothing, and "nothing"
     * has to include the DOM: every meta attribute the engine does not consume is spread onto
     * the resolved component, so before metaToProps stripped them `metaVersion` rendered as
     * `metaversion="1"` with an unrecognised-prop warning, `$schema` tripped React's
     * invalid-attribute-name warning, and `_comment` rendered the author's prose into the page
     * as a `_comment="…"` attribute with no warning at all (React does not warn on a lowercase
     * unknown attribute, which is why it survived 2 occurrences deep in the example corpus).
     * All of it is asserted here, because every part of it would be a silent regression.
     */
    describe('the contract declarations are inert at render time', () => {
        const SCHEMA_REF = './node_modules/eis-ui-render/meta.schema.json'
        const COMMENT = 'layout for the summary block — keep the two columns in sync'
        const withDeclarations = {
            $schema: SCHEMA_REF,
            metaVersion: '1',
            _comment: COMMENT,
            view: 'Row',
            items: [{
                $schema: SCHEMA_REF, metaVersion: '1', _comment: COMMENT, view: 'Text', children: 'ok',
            }],
        }
        const withoutDeclarations = { view: 'Row', items: [{ view: 'Text', children: 'ok' }] }

        it('never reach the DOM, at the root or on a nested node', () => {
            const run = mount(withDeclarations)

            expect(run.thrown).toBeNull()
            expect(run.html).toContain('ok')
            expect(run.html.toLowerCase()).not.toContain('metaversion')
            expect(run.html).not.toContain('schema')
            expect(run.html).not.toContain('_comment')
            expect(run.html).not.toContain('summary block')
        })

        it('render byte-identically to the same document without them', () => {
            expect(mount(withDeclarations).html).toBe(mount(withoutDeclarations).html)
        })

        it('make React emit no unrecognised-prop or invalid-attribute warning', () => {
            mount(withDeclarations)

            const warnings = consoleError.mock.calls
                .map(args => args.map(String).join(' '))
                .filter(message => /metaVersion|metaversion|\$schema|_comment/.test(message))
            expect(warnings).toEqual([])
        })

        it('leave the host application\'s own meta object untouched', () => {
            // rules.js hands metaToProps a cloneDeep, so the strip is invisible to the caller.
            const hostMeta = {
                $schema: SCHEMA_REF,
                metaVersion: '1',
                _comment: COMMENT,
                view: 'Row',
                items: [{ view: 'Text', children: 'ok' }],
            }
            mount(hostMeta)

            expect(hostMeta.metaVersion).toBe('1')
            expect(hostMeta.$schema).toBe(SCHEMA_REF)
            expect(hostMeta._comment).toBe(COMMENT)
        })
    })
})
