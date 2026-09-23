import { FIELD } from '../modules/variables/fields'
import { joinPath } from './metaPath'

/**
 * META CONTRACT VALIDATION ====================================================
 *
 * UPGRADE-PLAN §9.4: "on invalid meta, report the JSON path of the offending
 * node instead of a downstream render crash". `items[3].items[0].name` beats a
 * stack trace from a minified bundle.
 *
 * Hand-rolled on purpose — this ships inside the library bundle, and the project
 * does not take runtime dependencies (see the `lodash-lite` / custom-SVG-charts
 * precedent). It is also deliberately *not* a JSON Schema evaluator: the shipped
 * `meta.schema.json` covers editor-time validation, and duplicating a schema
 * engine at runtime would cost every host bundle far more than the handful of
 * checks below are worth.
 *
 * INERT UNLESS ASKED. `validateMeta()` walks nothing until it is called, and the
 * only caller (`src/library/main.js`) calls it only when the host opts in with
 * the `validateMeta` prop. Nothing here runs in a default host or in the test
 * suite, which matters: several suites assert an exact `console.error` allowlist.
 *
 * EVERY `error` IS A MEASURED FAILURE. Each error-severity check below was
 * confirmed against the real engine, not inferred:
 *   - `items` not an array          -> TypeError: items.map is not a function
 *   - `headers` not an array        -> TypeError: this.headers.map is not a function
 *   - `extraItems` not an array     -> TypeError: extraItems.map is not a function
 *   - `extraHeaders` not an array   -> TypeError: extraHeaders.map is not a function
 *   - truthy non-string `name`      -> TypeError: resolvedName.includes is not a function
 *   - root not a plain object       -> nothing renders at all
 * A `null` value is never reported: `transformConfig` runs the meta through
 * `sanitizeResponse`, which deletes null and undefined attributes before anything
 * renders, so `items: null` is measurably as harmless as no `items` at all.
 * `warning` severity is the opposite case: the engine accepts the node and
 * silently degrades (a placeholder instead of a component, plain text instead of
 * a formatted value), which is exactly what is hard to notice without a path.
 *
 * Deliberately NOT checked: `onClick` / `onChange` / `onDone` names. They resolve
 * against built-in actions *plus* the host's `methods` prop *plus* renderer
 * instance methods, so an unknown-name warning could not tell a typo from a
 * perfectly good host method and would cry wolf on the bundled examples.
 * -----------------------------------------------------------------------------
 */

/** Contract version this build implements. Meta files may declare `metaVersion` to pin it. */
export const CURRENT_META_VERSION = '1'

/** `MAJOR` or `MAJOR.MINOR`. */
export const META_VERSION_PATTERN = /^[0-9]+(\.[0-9]+)?$/

export const META_PROBLEM = {
    ROOT_NOT_OBJECT: 'ROOT_NOT_OBJECT',
    NAME_NOT_STRING: 'NAME_NOT_STRING',
    NOT_AN_ARRAY: 'NOT_AN_ARRAY',
    META_VERSION_INVALID: 'META_VERSION_INVALID',
    META_VERSION_NOT_ROOT: 'META_VERSION_NOT_ROOT',
    META_VERSION_AHEAD: 'META_VERSION_AHEAD',
    UNKNOWN_VIEW: 'UNKNOWN_VIEW',
    VIEW_NOT_STRING: 'VIEW_NOT_STRING',
    UNKNOWN_RENDER_METHOD: 'UNKNOWN_RENDER_METHOD',
    SHOW_IF_INVALID: 'SHOW_IF_INVALID',
}

export const META_SEVERITY = {
    ERROR: 'error',
    WARNING: 'warning',
}

/** Attributes the engine maps over, so a non-array value throws during render. */
const ARRAY_ATTRIBUTES = ['items', 'headers', 'extraHeaders', 'extraItems']

const isPlainObject = (value) => !!value && typeof value === 'object' && !Array.isArray(value)

/**
 * View names and render-method names are read at call time, never at module load:
 * `FIELD.TYPE` is populated in several passes (`variables/fields`, then
 * `modules/form/constants`, then `pages/main/rules`), so a set captured at import
 * time would be missing Input, Select, Data, Popup and the rest.
 *
 * @returns {Array<String>} declared values of the given FIELD definition group
 */
const declaredValues = (group) => Object.keys(group).map(key => group[key])

/** @returns {Array<String>} every `view` value the engine declares */
export const declaredViews = () => declaredValues(FIELD.TYPE)

/** @returns {Array<String>} every built-in `render*` method name */
export const declaredRenderMethods = () => declaredValues(FIELD.RENDER)

/**
 * Validate a `meta.json` declaration against the contract the engine actually
 * implements, without rendering it.
 *
 * @param {*} meta - meta.json declaration (the value passed to `UIRender.meta`)
 * @returns {Array<{path: String, severity: String, code: String, message: String}>} problems -
 *    depth first, parents before children; `path` is relative to the meta root
 *    ('' for the root itself)
 */
export function validateMeta (meta) {
    const problems = []
    if (!isPlainObject(meta)) {
        problems.push({
            path: '',
            severity: META_SEVERITY.ERROR,
            code: META_PROBLEM.ROOT_NOT_OBJECT,
            message: `meta must be a single root Field object, got ${describe(meta)}`,
        })
        return problems
    }
    const context = {
        problems,
        views: declaredViews(),
        renderMethods: declaredRenderMethods(),
        // Shared references (a meta assembled in JS can reuse one node) are reported once, and
        // a cyclic reference cannot hang the walk.
        visited: new Set([meta]),
    }
    walkNode(meta, '', context, true)
    return problems
}

/** @returns {String} human readable type of an unexpected value */
function describe (value) {
    if (value === null) return 'null'
    if (Array.isArray(value)) return 'an array'
    return `${typeof value}`
}

/**
 * @param {Object} node - meta node
 * @param {String} path - JSON path of `node`
 * @param {Object} context - accumulated problems + declared vocabularies + cycle guard
 * @param {Boolean} isRoot - whether `node` is a document root (the meta itself, or a nested
 *    `meta` declaration for an embedded UIRender, which is a complete document of its own)
 * @returns {void}
 */
function walkNode (node, path, context, isRoot) {
    const { problems } = context
    const report = (key, severity, code, message) => problems.push({
        path: joinPath(path, key),
        severity,
        code,
        message,
    })

    if (Object.prototype.hasOwnProperty.call(node, 'metaVersion')) {
        checkMetaVersion(node.metaVersion, isRoot, report)
    }

    // Truthiness, not presence: `null` is deleted by sanitizeResponse before rendering, and
    // `0` / `''` are skipped by the engine's own truthiness guards — measured, neither throws.
    if (node.name && typeof node.name !== 'string') {
        report('name', META_SEVERITY.ERROR, META_PROBLEM.NAME_NOT_STRING,
            `name must be a string key path, got ${describe(node.name)} — the engine interpolates it and throws on any other type`)
    }

    if (Object.prototype.hasOwnProperty.call(node, 'view')) {
        if (typeof node.view !== 'string') {
            report('view', META_SEVERITY.WARNING, META_PROBLEM.VIEW_NOT_STRING,
                `view must be a string, got ${describe(node.view)} — renders a "field does not exist" placeholder`)
        } else if (context.views.indexOf(node.view) === -1) {
            report('view', META_SEVERITY.WARNING, META_PROBLEM.UNKNOWN_VIEW,
                `unknown view "${node.view}" — renders a "field does not exist" placeholder`)
        }
    }

    ARRAY_ATTRIBUTES.forEach(attribute => {
        if (Object.prototype.hasOwnProperty.call(node, attribute) &&
            node[attribute] != null && !Array.isArray(node[attribute])) {
            report(attribute, META_SEVERITY.ERROR, META_PROBLEM.NOT_AN_ARRAY,
                `${attribute} must be an array, got ${describe(node[attribute])} — the engine maps over it and throws on any other type`)
        }
    })

    if (node.showIf != null && typeof node.showIf !== 'string' && !isPlainObject(node.showIf)) {
        report('showIf', META_SEVERITY.WARNING, META_PROBLEM.SHOW_IF_INVALID,
            `showIf must be a key path string or an object, got ${describe(node.showIf)} — the condition is ignored and the node always renders`)
    }

    Object.keys(node).forEach(key => {
        const value = node[key]
        if (key.indexOf('render') === 0 && typeof value === 'string' &&
            context.renderMethods.indexOf(value) === -1) {
            report(key, META_SEVERITY.WARNING, META_PROBLEM.UNKNOWN_RENDER_METHOD,
                `unknown render method "${value}" — the value falls back to plain text`)
        }
        // A nested `meta` is a complete document for an embedded UIRender: the engine does not
        // transform that subtree, so it is walked as its own root rather than as a child node.
        if (key === 'meta') {
            if (isPlainObject(value)) walkChild(value, joinPath(path, key), context, true)
            return
        }
        walkChild(value, joinPath(path, key), context, false)
    })
}

/**
 * @param {*} value - candidate child (anything; only objects and arrays are walked)
 * @param {String} path - JSON path of `value`
 * @param {Object} context - see walkNode
 * @param {Boolean} isRoot - see walkNode
 * @returns {void}
 */
function walkChild (value, path, context, isRoot) {
    if (!value || typeof value !== 'object') return
    if (context.visited.has(value)) return
    context.visited.add(value)
    if (Array.isArray(value)) {
        value.forEach((item, index) => walkChild(item, joinPath(path, index, true), context, false))
        return
    }
    walkNode(value, path, context, isRoot)
}

/**
 * @param {*} value - declared `metaVersion`
 * @param {Boolean} isRoot - whether the declaring node is a document root
 * @param {Function} report - (key, severity, code, message) => void
 * @returns {void}
 */
function checkMetaVersion (value, isRoot, report) {
    if (!isRoot) {
        report('metaVersion', META_SEVERITY.WARNING, META_PROBLEM.META_VERSION_NOT_ROOT,
            'metaVersion is a root-level declaration — on a nested node it is ignored')
        return
    }
    if (typeof value !== 'string' || !META_VERSION_PATTERN.test(value)) {
        report('metaVersion', META_SEVERITY.ERROR, META_PROBLEM.META_VERSION_INVALID,
            `metaVersion must be a "MAJOR" or "MAJOR.MINOR" string, got ${JSON.stringify(value)}`)
        return
    }
    if (parseInt(value, 10) > parseInt(CURRENT_META_VERSION, 10)) {
        report('metaVersion', META_SEVERITY.WARNING, META_PROBLEM.META_VERSION_AHEAD,
            `metaVersion "${value}" is newer than the contract this build implements (${CURRENT_META_VERSION}) — newer attributes may be ignored`)
    }
}

/**
 * @param {Object} problem - as returned by validateMeta()
 * @returns {String} single line, path first, suitable for a console warning
 */
export function formatMetaProblem ({ path, severity, message }) {
    return `[ui-render] meta ${severity} at ${path ? `"${path}"` : '(root)'}: ${message}`
}

/**
 * Dev-mode entry point: validate and report, or do nothing at all.
 *
 * Reporting goes to `console.warn`, not `console.error`: this is advisory output
 * about a configuration file, and `console.error` is the channel React's own
 * warnings and the project's suite guards use.
 *
 * Never throws. A validator that breaks a host application it was only meant to
 * advise would be worse than no validator, so both the walk and the reporting
 * sink are guarded.
 *
 * @param {*} meta - meta.json declaration
 * @param {Boolean|Function} [flag] - falsy disables everything (nothing is walked);
 *    `true` reports to console.warn; a function receives the problems array instead
 * @returns {Array<Object>|null} problems, or null when disabled or when reporting failed
 */
export function reportMetaProblems (meta, flag) {
    if (!flag) return null
    try {
        const problems = validateMeta(meta)
        if (typeof flag === 'function') {
            flag(problems)
        } else if (problems.length) {
            problems.forEach(problem => console.warn(formatMetaProblem(problem)))
        }
        return problems
    } catch (error) {
        return null
    }
}
