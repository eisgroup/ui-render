/**
 * PUBLISHED META CONTRACT — SCHEMA AND VALIDATOR ==============================
 *
 * UPGRADE-PLAN §9.4 items 1-3. This is the suite that keeps `meta.schema.json`
 * (a published artifact, shipped in the tarball) and the dev-mode runtime
 * validator honest, using the same 38 real examples the DOM contract snapshots
 * render.
 *
 * Three obligations, in order of what breaks first when something drifts:
 *
 * 1. EVERY EXAMPLE VALIDATES. A schema that rejects a working example is worse
 *    than no schema, so all 38 metas are evaluated against the shipped file. The
 *    evaluator (../../testing/jsonSchema) implements only the keywords the schema
 *    uses and THROWS on any other, so the schema cannot grow an assertion that
 *    nothing here checks.
 *
 * 2. THE VOCABULARIES COME FROM THE ENGINE, NOT FROM MEMORY. The schema's
 *    suggested `view`, render-method, action and normalizer names are compared
 *    against the live `FIELD` definitions after the engine has finished
 *    registering them. Adding a view to `FIELD.TYPE` without adding it here
 *    fails, which is the drift §9.4 calls out ("docs stop drifting by
 *    construction").
 *
 * 3. NO EXAMPLE IS BROKEN, AND THE WARNINGS ARE A LEDGER. `validateMeta` reports
 *    zero `error`-severity problems for all 38 — every error check corresponds to
 *    a measured engine crash, so an error here would mean a genuinely broken
 *    example. The `warning`-severity findings are real, pre-existing, and pinned
 *    below with their cause, following the KNOWN_DOM_DEFECTS convention: recorded
 *    rather than blessed, and a change in either direction fails.
 *
 * IMPORT ORDER MATTERS: `FIELD.TYPE` is assembled in three passes
 * (`variables/fields`, then `modules/form/constants`, then `pages/main/rules`),
 * so the engine entry point must be loaded before the vocabularies are read.
 * -----------------------------------------------------------------------------
 */
import fs from 'fs'
import path from 'path'
import { FIELD } from '../../../core/modules/variables/fields'
// Side-effect import: registers the Input/Select/Data/Popup/... half of FIELD.TYPE
// and every FIELD.ACTION. Without it the vocabulary assertions below are partial.
import '../../../core/pages/main/rules'
import {
    CURRENT_META_VERSION,
    META_SEVERITY,
    META_PROBLEM,
    META_VERSION_PATTERN,
    validateMeta,
} from '../../../core/ui-render/validateMeta'
import { assertSupported, validateAgainstSchema } from '../../testing/jsonSchema'
import { EXAMPLES } from '../manifest'

const SCHEMA_PATH = path.resolve(__dirname, '../../../../meta.schema.json')
const schema = JSON.parse(fs.readFileSync(SCHEMA_PATH, 'utf8'))

/** The `$defs` whose first `anyOf` branch is an enum mirroring a FIELD definition group. */
const VOCABULARIES = [
    ['view', () => FIELD.TYPE, 'FIELD.TYPE'],
    ['renderMethodName', () => FIELD.RENDER, 'FIELD.RENDER'],
    ['actionName', () => FIELD.ACTION, 'FIELD.ACTION'],
    ['normalizerName', () => FIELD.NORMALIZE, 'FIELD.NORMALIZE'],
]

const sortedValues = (group) => Object.keys(group).map(key => group[key]).sort()
const suggestedEnum = (name) => [...schema.$defs[name].anyOf[0].enum].sort()

/**
 * Warnings the current example set legitimately produces. Each is a real, pre-existing
 * defect in an example's meta that the engine tolerates by silently degrading — exactly
 * what §9.4's dev-mode validation exists to surface. Pinned so the inventory is recorded
 * rather than blessed: fixing one of these must update the ledger, and a new warning
 * cannot appear unnoticed.
 */
const KNOWN_META_WARNINGS = [
    {
        code: META_PROBLEM.UNKNOWN_RENDER_METHOD,
        value: 'double5',
        count: 4,
        cause: 'table-vertical_meta.json, table-nested_meta.js and popup_meta.js (twice) declare'
            + ' `renderCell: "double5"`, but the built-in renderer is spelled "Double5" (FIELD.RENDER).'
            + ' The lower-case spelling belongs to FIELD.NORMALIZE, which `format`/`normalize`/`parse`'
            + ' use — not `render*`. The cells therefore render unformatted plain text.',
    },
    {
        code: META_PROBLEM.UNKNOWN_RENDER_METHOD,
        value: 'float',
        count: 3,
        cause: 'the same confusion as "double5": table-nested_meta.js and popup_meta.js (twice) declare'
            + ' `renderCell: "float"` where the built-in renderer is "Float".',
    },
    {
        code: META_PROBLEM.UNKNOWN_RENDER_METHOD,
        value: 'renderNumber',
        count: 1,
        cause: 'select-reorder-meta.json declares `renderCell: "renderNumber"`, which is not a'
            + ' FIELD.RENDER name at all — the "render" prefix names the meta attribute, not the method.',
    },
    {
        code: META_PROBLEM.UNKNOWN_VIEW,
        value: 'Tab',
        count: 7,
        cause: 'rating_details.js, rowlist-relative-data_meta.json and invalid-array_meta.json use'
            + ' `view: "Tab"` inside a Tabs `items` entry. There is no Tab view: the Tabs branch of'
            + ' mapper.js renders the entry\'s `tab` and `content` itself, and the surplus `view`'
            + ' resolves to the "field does not exist" placeholder. The examples still look right'
            + ' because the placeholder is what the tab header slot receives.',
    },
]

describe('published meta.json schema', () => {
    it('is a draft 2020-12 schema using only keywords the evaluator implements', () => {
        expect(schema.$schema).toBe('https://json-schema.org/draft/2020-12/schema')
        expect(schema.$id).toBe('https://eisgroup.github.io/ui-render/meta.schema.json')
        // Throws, naming the keyword, if the schema asserts something untested.
        expect(() => assertSupported(schema)).not.toThrow()
    })

    it('ships in the published package', () => {
        const { files } = JSON.parse(fs.readFileSync(path.resolve(__dirname, '../../../../package.json'), 'utf8'))
        expect(files).toContain('meta.schema.json')
    })

    it.each(EXAMPLES.map(example => [example.id, example]))('validates %s', (id, example) => {
        const errors = validateAgainstSchema(schema, example.meta)
        // Printed in full: a schema that rejects a working example is the failure mode
        // this test exists to prevent, so the message has to be actionable.
        expect(errors.map(error => `${error.path || '(root)'}: ${error.message}`)).toEqual([])
    })

    it.each(VOCABULARIES)('suggests exactly the %s values the engine declares', (name, group, label) => {
        expect(suggestedEnum(name)).toEqual(sortedValues(group()))
        expect(suggestedEnum(name).length).toBeGreaterThan(0)
        expect(label).toBeTruthy()
    })

    it.each(VOCABULARIES)('keeps %s open, so an unlisted value is not rejected', (name) => {
        // The engine accepts any string in these positions (unknown views render a
        // placeholder, unknown render methods fall back to plain text, actions may come
        // from the host `methods` prop). The schema must not be stricter than that.
        expect(schema.$defs[name].anyOf[1]).toEqual({ type: 'string' })
        expect(validateAgainstSchema(schema, { view: 'SomeHostSpecificView' })).toEqual([])
    })

    it('accepts the inline $schema pointer editors resolve validation through', () => {
        expect(schema.properties.$schema.type).toBe('string')
        expect(validateAgainstSchema(schema, {
            $schema: './node_modules/eis-ui-render/meta.schema.json',
            view: 'Row',
        })).toEqual([])
    })

    it('declares metaVersion with the same rule the runtime validator enforces', () => {
        expect(schema.$defs.metaVersion.pattern).toBe(META_VERSION_PATTERN.source)
        expect(schema.$defs.metaVersion.description).toContain(`current: "${CURRENT_META_VERSION}"`)
        expect(validateAgainstSchema(schema, { metaVersion: CURRENT_META_VERSION, view: 'Row' })).toEqual([])
    })

    it.each([
        ['a non-array items', { view: 'Row', items: {} }, 'items'],
        ['a non-array headers', { view: 'Table', headers: 'a' }, 'headers'],
        ['a non-string name', { view: 'Row', name: 7 }, 'name'],
        ['a malformed metaVersion', { metaVersion: 'draft', view: 'Row' }, 'metaVersion'],
        ['a nested non-array items', { view: 'Row', items: [{ view: 'Col', items: 3 }] }, 'items[0].items'],
    ])('rejects %s', (label, meta, expectedPath) => {
        const errors = validateAgainstSchema(schema, meta)
        expect(errors.map(error => error.path)).toContain(expectedPath)
    })

    it('rejects a root that is not a single Field object', () => {
        expect(validateAgainstSchema(schema, [])).not.toEqual([])
        expect(validateAgainstSchema(schema, 'Row')).not.toEqual([])
    })
})

describe('dev-mode meta validation over the real example set', () => {
    const problemsById = new Map(EXAMPLES.map(example => [example.id, validateMeta(example.meta)]))
    const allProblems = [...problemsById.values()].reduce((all, problems) => all.concat(problems), [])

    it.each(EXAMPLES.map(example => [example.id]))('reports no error-severity problem for %s', (id) => {
        const errors = problemsById.get(id).filter(problem => problem.severity === META_SEVERITY.ERROR)
        // Every error check corresponds to a measured engine crash (see validateMeta.js),
        // so an error here means the example is broken, not that the validator is noisy.
        expect(errors.map(problem => `${problem.path}: ${problem.message}`)).toEqual([])
    })

    it('reports a JSON path for every problem it does find', () => {
        expect(allProblems.length).toBeGreaterThan(0)
        allProblems.forEach(problem => {
            expect(typeof problem.path).toBe('string')
            expect(problem.path).not.toBe('')
            expect(problem.severity).toBe(META_SEVERITY.WARNING)
        })
    })

    it.each(KNOWN_META_WARNINGS)('still reports the known $code "$value" $count times', ({ code, value, count }) => {
        const matching = allProblems.filter(problem => problem.code === code && problem.message.includes(`"${value}"`))
        expect(matching).toHaveLength(count)
    })

    it('produces no warning outside the ledger', () => {
        const ledgered = allProblems.filter(problem => KNOWN_META_WARNINGS.some(known => (
            known.code === problem.code && problem.message.includes(`"${known.value}"`)
        )))
        const unledgered = allProblems
            .filter(problem => ledgered.indexOf(problem) === -1)
            .map(problem => `${problem.code} ${problem.path}: ${problem.message}`)

        expect(unledgered).toEqual([])
        expect(allProblems).toHaveLength(
            KNOWN_META_WARNINGS.reduce((total, known) => total + known.count, 0)
        )
    })
})

/**
 * SCHEMA AND VALIDATOR MUST AGREE ON WHAT THE ENGINE ACCEPTS ==================
 *
 * The two halves of §9.4 describe one contract from different angles: the schema
 * is what an author's editor enforces, the validator is what the engine reports
 * at runtime. Nothing above compares them, and that gap let the shipped schema
 * drift *stricter* than the engine — it rejected `items: null`, `name: null`,
 * `showIf: null` and an array `className`, all of which render fine, while
 * `validateMeta` correctly stayed silent. A schema stricter than the engine is
 * worse than a loose one: it reddens an author's editor on working meta.
 *
 * So this pins the biconditional over a fixed table: the schema rejects a shape
 * exactly when the validator calls it an error. Add a row when either half
 * learns a new rule.
 */
const AGREEMENT_TABLE = [
    // Tolerated by the engine: null attributes are deleted before rendering.
    { label: 'items: null', meta: { view: 'Text', items: null }, engineAccepts: true },
    { label: 'headers: null', meta: { view: 'Table', name: 'rows', headers: null }, engineAccepts: true },
    { label: 'extraHeaders: null', meta: { view: 'Table', name: 'rows', extraHeaders: null }, engineAccepts: true },
    { label: 'extraItems: null', meta: { view: 'Table', name: 'rows', extraItems: null }, engineAccepts: true },
    { label: 'name: null', meta: { view: 'Text', name: null }, engineAccepts: true },
    { label: 'showIf: null', meta: { view: 'Text', showIf: null }, engineAccepts: true },
    // classNames() recurses over arrays and reads truthy object keys.
    { label: 'className: array', meta: { view: 'Text', className: ['a', 'b'] }, engineAccepts: true },
    { label: 'styles: array', meta: { view: 'Text', styles: ['a'] }, engineAccepts: true },
    // Genuine crashes -- the shapes the schema exists to catch.
    { label: 'items: string', meta: { view: 'Text', items: 'nope' }, engineAccepts: false },
    { label: 'headers: number', meta: { view: 'Table', name: 'rows', headers: 7 }, engineAccepts: false },
]

describe('published schema and dev validator agree', () => {
    it.each(AGREEMENT_TABLE)('$label', ({ meta, engineAccepts }) => {
        const schemaErrors = validateAgainstSchema(schema, meta)
        const validatorErrors = validateMeta(meta)
            .filter(problem => problem.severity === META_SEVERITY.ERROR)

        // Each half must match the engine's real tolerance...
        expect(schemaErrors.length === 0).toBe(engineAccepts)
        expect(validatorErrors.length === 0).toBe(engineAccepts)
        // ...which means they must also match each other. Stated separately so a
        // failure says whether one half drifted or both did.
        expect(schemaErrors.length === 0).toBe(validatorErrors.length === 0)
    })
})
