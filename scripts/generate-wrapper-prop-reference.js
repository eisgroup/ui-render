/**
 * Generates `docs/SUPPORTED-PROPS.md` — the prop surface of the views §9.7-F1 replaces, and the
 * parity checklist its steps are judged against — from the component source plus the curated
 * prose in `scripts/wrapper-prop-curation.js`.
 *
 * TWO SHAPES OF SECTION, BECAUSE STEP 1 LANDED
 * `Table` is in-house since §9.7-F1 step 1: it renders native elements and imports nothing, so
 * it has no "forwarded" set at all and its section documents what it EMITS and what it no longer
 * ACCEPTS. `TooltipPop` and `Dropdown` are still `semantic-ui-react` wrappers and keep the
 * wrapper shape. Both halves are derived the same way, from the source.
 *
 * WHY THIS EXISTS (UPGRADE-PLAN §9.7-F1 step 0)
 * Step 0 asked for two things: an audit of which props actually reach the wrapped SUIR
 * components, and a published supported-prop list. A hand-written list would be stale by
 * step 3 — the wrappers are being rewritten one at a time, and a checklist nobody
 * verifies rots faster than the code it describes. So the enumerable half is derived:
 *
 *   FROM THE WRAPPER SOURCE  which props each wrapper intercepts (its own destructuring),
 *                            which it generates onto the rest bag, which it writes as JSX
 *                            attributes on the SUIR element, and whether the rest spread
 *                            lands before or after those attributes (which decides who wins).
 *   FROM THE IN-HOUSE SOURCE which props the root and the shared subcomponent destructure
 *                            consume, which native element each subcomponent renders, and that
 *                            the file no longer references SUIR by any mechanism.
 *   FROM domProps.js         which props are stripped at the DOM boundary, and by which
 *                            component — `Table.js` applies both lists in all seven components
 *                            since step 1, `Dropdown.js` applies both, `TooltipPop.js` none.
 *                            Derived, so the page cannot claim a strip that is gone.
 *   FROM THE CALL SITES      which JSX attributes the codebase actually puts on `Table` and
 *                            its subcomponents — the step-1 parity surface, kept after the step
 *                            because it is what a future change to the family is measured against.
 *   FROM THE IMPORT SCAN     every file importing SUIR. This ALSO closes the eslint guard's
 *                            blind spot: `no-restricted-imports` cannot see
 *                            `jest.mock('semantic-ui-react')` or a `require()`, and this can.
 *   FROM THE CURATION        what a prop means, whether any real meta uses it, and — where it has been
 *                            measured — what the component emits, what opens and closes it, and which of
 *                            our own CSS rules select on the result. Nothing else.
 *
 * The mapping between the two halves is enforced total in both directions: a prop the component
 * intercepts with no curated line fails, a curated line for a prop it no longer intercepts
 * fails, a curated `via: 'element'`/`'generated'` claim that disagrees with the source fails, and
 * a `dropped` entry naming a prop the in-house component still accepts fails.
 * `scripts/__tests__/wrapper-prop-reference.contract.test.js` runs the whole check inside the
 * suite, and additionally walks every tracked example meta so the corpus inventory cannot drift.
 *
 * WHAT IT DOES NOT GUARANTEE: which props reach SUIR *at runtime*. A rest spread is open by
 * construction, so the forwarded set is closed only for the names the source writes down; the
 * rest is corpus evidence, pinned in the curation and (for the tracked corpus) enforced by the
 * contract test. And the corpus is initial-render only — an interaction-driven prop is not in it.
 *
 * Usage (mirrors scripts/generate-view-reference.js):
 *   node scripts/generate-wrapper-prop-reference.js            # write the page
 *   node scripts/generate-wrapper-prop-reference.js --check    # report drift, exit 1, change nothing
 */
const fs = require('fs')
const path = require('path')

const {
    IN_HOUSE_CURATION,
    WRAPPER_CURATION,
    FORWARDED_CURATION,
    META_ATTRIBUTES,
    CONSUMER_ONLY_ATTRIBUTES,
    STEP_OBLIGATIONS,
} = require('./wrapper-prop-curation')

const ROOT = path.resolve(__dirname, '..')
const OUTPUT_FILE = 'docs/SUPPORTED-PROPS.md'
const GENERATOR = 'scripts/generate-wrapper-prop-reference.js'
const CURATION = 'scripts/wrapper-prop-curation.js'
const WRITE_COMMAND = 'npm run docs:props'
const PACK = 'src/core/components'
const DOM_PROPS_FILE = `${PACK}/domProps.js`
const VIEWS_PAGE = 'docs/SUPPORTED-VIEWS.md'

/**
 * The wrappers that still exist. `suir` and `localName` are asserted against the actual import,
 * so a renamed alias or a new wrapper fails here instead of producing a page that omits it.
 * `Table` left this list when §9.7-F1 step 1 took it in-house, and `TooltipPop` when step 2 part 3
 * did — see IN_HOUSE below. Only `Dropdown` is still a wrapper.
 */
const WRAPPERS = [
    { id: 'Dropdown', file: `${PACK}/Dropdown.js`, fn: 'Dropdown', suir: 'Dropdown', localName: 'DropDown' },
]

/**
 * The components a completed F1 step replaced. `root` is the element the top-level component
 * renders and `factory` the helper its subcomponents are built with — both are asserted against
 * the source, so the page cannot describe markup the component does not emit.
 */
const IN_HOUSE = [
    { id: 'Table', file: `${PACK}/Table.js`, fn: 'Table', root: 'table', factory: 'tablePart' },
    // One element, no subcomponent family, so no `factory`.
    { id: 'TooltipPop', file: `${PACK}/TooltipPop.js`, fn: 'TooltipPop', root: 'span' },
]

const read = (file) => fs.readFileSync(path.join(ROOT, file), 'utf8')

// ---------------------------------------------------------------------------
// Source scanning primitives
// ---------------------------------------------------------------------------

/** Every `.js`/`.jsx`/`.ts`/`.tsx` file under `dir`, recursively (TS included for §9.6-E2). */
function sourceFiles (dir, out = []) {
    for (const entry of fs.readdirSync(path.join(ROOT, dir), { withFileTypes: true })) {
        const relative = `${dir}/${entry.name}`
        if (entry.isDirectory()) sourceFiles(relative, out)
        else if (/\.[jt]sx?$/.test(entry.name)) out.push(relative)
    }
    return out
}

/**
 * Removes comments, keeping string and template literals intact. Every derivation below runs
 * on the stripped text: `Dropdown.js` mentions `props.onClose` in prose, and a regex that
 * counted prose as code would report a prop the wrapper does not set.
 */
function stripComments (source) {
    let out = ''
    let i = 0
    let quote = null
    while (i < source.length) {
        const ch = source[i]
        const next = source[i + 1]
        if (quote) {
            out += ch
            if (ch === '\\') { out += next === undefined ? '' : next; i += 2; continue }
            if (ch === quote) quote = null
            i++
            continue
        }
        if (ch === '"' || ch === "'" || ch === '`') { quote = ch; out += ch; i++; continue }
        if (ch === '/' && next === '/') {
            while (i < source.length && source[i] !== '\n') i++
            continue
        }
        if (ch === '/' && next === '*') {
            i += 2
            while (i < source.length && !(source[i] === '*' && source[i + 1] === '/')) i++
            i += 2
            continue
        }
        out += ch
        i++
    }
    return out
}

/**
 * Index just past the group opened by the bracket at `from`.
 * Depth-counted and quote-aware, so a `}` inside a string does not close the group.
 */
function endOfGroup (source, from, file) {
    const open = source[from]
    const close = { '{': '}', '(': ')', '[': ']' }[open]
    if (!close) throw new Error(`${file}: endOfGroup called at a non-bracket character.`)
    let depth = 0
    let quote = null
    for (let i = from; i < source.length; i++) {
        const ch = source[i]
        if (quote) {
            if (ch === '\\') { i++; continue }
            if (ch === quote) quote = null
            continue
        }
        if (ch === '"' || ch === "'" || ch === '`') { quote = ch; continue }
        if (ch === '{' || ch === '(' || ch === '[') depth++
        else if (ch === '}' || ch === ')' || ch === ']') {
            depth--
            if (depth === 0) return i + 1
        }
    }
    throw new Error(`${file}: unterminated \`${open}\` group. The source shape changed — fix ${GENERATOR}.`)
}

/** Splits `text` on commas that are not inside a bracket group or a string. */
function splitTopLevel (text) {
    const parts = []
    let depth = 0
    let quote = null
    let start = 0
    for (let i = 0; i < text.length; i++) {
        const ch = text[i]
        if (quote) {
            if (ch === '\\') { i++; continue }
            if (ch === quote) quote = null
            continue
        }
        if (ch === '"' || ch === "'" || ch === '`') { quote = ch; continue }
        if (ch === '{' || ch === '(' || ch === '[') depth++
        else if (ch === '}' || ch === ')' || ch === ']') depth--
        else if (ch === ',' && depth === 0) { parts.push(text.slice(start, i)); start = i + 1 }
    }
    parts.push(text.slice(start))
    return parts.map(part => part.trim()).filter(Boolean)
}

const NAME = '[A-Za-z_$][A-Za-z0-9_$]*'

/**
 * The object-pattern parameter of `function <fn> ({…})`, as ordered entries.
 * Throws on an entry it cannot parse: a prop the parser skipped would be a prop missing from
 * the published list, which is the exact failure this page exists to prevent.
 *
 * @returns {{intercepted: Array<{name, alias, hasDefault}>, restName: String|null}}
 */
function interceptedProps (rawSource, fn, file) {
    // Stripped again here, not only by the caller, so the exported helper is correct on its own:
    // `Dropdown.js` carries a trailing `// not used, removing from DOM` inside the pattern.
    const source = stripComments(rawSource)
    const opening = source.match(new RegExp(`export\\s+(?:default\\s+)?function\\s+${fn}\\s*\\(\\s*\\{`))
    if (!opening) {
        throw new Error(`${file}: no \`export function ${fn} ({\` destructuring parameter found.`
            + ` The wrapper's signature changed — update WRAPPERS in ${GENERATOR}.`)
    }
    const braceAt = opening.index + opening[0].length - 1
    const inner = source.slice(braceAt + 1, endOfGroup(source, braceAt, file) - 1)
    const intercepted = []
    let restName = null
    for (const entry of splitTopLevel(inner)) {
        const rest = entry.match(new RegExp(`^\\.\\.\\.(${NAME})$`))
        if (rest) {
            if (restName) throw new Error(`${file}: two rest elements in ${fn}'s parameter.`)
            restName = rest[1]
            continue
        }
        const match = entry.match(new RegExp(`^(${NAME})\\s*(?::\\s*(${NAME}))?\\s*(=\\s*[\\s\\S]+)?$`))
        if (!match) {
            throw new Error(`${file}: cannot parse \`${entry}\` in ${fn}'s destructuring parameter.`
                + ` Widen the pattern in ${GENERATOR} deliberately, do not let a prop go unlisted.`)
        }
        intercepted.push({ name: match[1], alias: match[2] || null, hasDefault: Boolean(match[3]) })
    }
    if (!intercepted.length) throw new Error(`${file}: ${fn} destructures no named props.`)
    return { intercepted, restName }
}

/**
 * Every JSX opening tag for `tag` in `source`, as `{attributes, spreads}`.
 *
 * Written as a small tokenizer rather than a regex because the tags in question span lines,
 * carry `//` comments between attributes (`TableView.js`), and hold arrow functions and object
 * literals whose `>` and `}` must not be mistaken for the end of the tag.
 */
function jsxOpenings (source, tag) {
    const openings = []
    const pattern = new RegExp(`<${tag.replace(/\./g, '\\.')}(?=[\\s/>])`, 'g')
    let match
    while ((match = pattern.exec(source)) !== null) {
        let i = match.index + match[0].length
        const attributes = []
        const spreads = []
        for (;;) {
            while (i < source.length && /\s/.test(source[i])) i++
            if (i >= source.length) throw new Error(`unterminated <${tag}> opening tag.`)
            const ch = source[i]
            if (ch === '>') { i++; break }
            if (ch === '/' && source[i + 1] === '>') { i += 2; break }
            if (ch === '/' && source[i + 1] === '/') { while (i < source.length && source[i] !== '\n') i++; continue }
            if (ch === '/' && source[i + 1] === '*') { i += 2; while (i < source.length && !(source[i] === '*' && source[i + 1] === '/')) i++; i += 2; continue }
            if (ch === '{') {
                const end = endOfGroup(source, i, `<${tag}>`)
                const inner = source.slice(i + 1, end - 1).trim()
                if (inner.startsWith('...')) spreads.push(inner)
                i = end
                continue
            }
            const name = new RegExp(`^${NAME}(?:-${NAME})*`).exec(source.slice(i))
            if (!name) throw new Error(`<${tag}>: cannot parse attribute at \`${source.slice(i, i + 30)}\`.`)
            attributes.push(name[0])
            i += name[0].length
            while (i < source.length && /\s/.test(source[i])) i++
            if (source[i] !== '=') continue
            i++
            while (i < source.length && /\s/.test(source[i])) i++
            if (source[i] === '{') { i = endOfGroup(source, i, `<${tag}>`); continue }
            if (source[i] === '"' || source[i] === "'") {
                const quote = source[i]
                i++
                while (i < source.length && source[i] !== quote) i++
                i++
                continue
            }
            throw new Error(`<${tag}>: unexpected attribute value at \`${source.slice(i, i + 30)}\`.`)
        }
        openings.push({ attributes, spreads, index: match.index })
    }
    return openings
}

// ---------------------------------------------------------------------------
// Derivations
// ---------------------------------------------------------------------------

// Quotes are matched as a character class, not a literal `'`: a double-quoted specifier reaches
// the same module and must not slip past the scan. `import(...)` is here because ESLint 8's
// `no-restricted-imports` does not visit `ImportExpression`, so a dynamic import is invisible to
// the lint half of the guard — this scan is the only thing that can see it.
const SPECIFIER = String.raw`["'](semantic-ui-react(?:\/[^"']*)?)["']`
const IMPORT_KINDS = [
    { kind: 'import', pattern: new RegExp(String.raw`from\s+` + SPECIFIER, 'g') },
    { kind: 'import()', pattern: new RegExp(String.raw`import\(\s*` + SPECIFIER, 'g') },
    { kind: 'require', pattern: new RegExp(String.raw`require\(\s*` + SPECIFIER, 'g') },
    { kind: 'jest.mock', pattern: new RegExp(String.raw`jest\.mock\(\s*` + SPECIFIER, 'g') },
]

/**
 * Every file that reaches `semantic-ui-react` by any mechanism, with the ones the eslint guard
 * cannot see flagged. Fails if any of them is outside the components pack.
 */
function readImportSites () {
    const sites = []
    for (const file of sourceFiles('src')) {
        const source = stripComments(read(file))
        for (const { kind, pattern } of IMPORT_KINDS) {
            pattern.lastIndex = 0
            let match
            while ((match = pattern.exec(source)) !== null) {
                sites.push({
                    file,
                    kind,
                    specifier: match[1],
                    test: /(__tests__|\.test\.)/.test(file),
                    lintVisible: kind === 'import',
                })
            }
        }
    }
    const strays = sites.filter(site => !site.file.startsWith(`${PACK}/`))
    if (strays.length) {
        throw new Error(`semantic-ui-react is reached from outside ${PACK}:\n  `
            + strays.map(({ file, kind }) => `${file} (${kind})`).join('\n  ')
            + `\nThat is the §9.7-F1 isolation invariant. The eslint guard fails on a static \`import\`;`
            + ` this check also covers \`import()\`, \`require\` and \`jest.mock\`, none of which the`
            + ` rule can see (ESLint 8's no-restricted-imports does not visit ImportExpression).`)
    }
    if (!sites.length) throw new Error('no semantic-ui-react references found at all — the exit is complete, or the scan broke.')
    return sites.sort((a, b) => a.file.localeCompare(b.file) || a.kind.localeCompare(b.kind))
}

/** `ENGINE_PROPS` and `FIELD_ONLY_PROPS`, parsed out of the boundary module. */
function readDomPropsLists () {
    const source = read(DOM_PROPS_FILE)
    const lists = {}
    for (const name of ['ENGINE_PROPS', 'FIELD_ONLY_PROPS']) {
        const opening = source.match(new RegExp(`export const ${name}\\s*=\\s*\\[`))
        if (!opening) {
            throw new Error(`${DOM_PROPS_FILE}: no \`export const ${name} = [\` found.`
                + ` The boundary lists moved — update ${GENERATOR}.`)
        }
        const at = opening.index + opening[0].length - 1
        const inner = source.slice(at + 1, endOfGroup(source, at, DOM_PROPS_FILE) - 1)
        lists[name] = splitTopLevel(stripComments(inner)).map((entry) => {
            const quoted = entry.match(/^'([^']+)'$/)
            if (!quoted) throw new Error(`${DOM_PROPS_FILE}: \`${entry}\` in ${name} is not a plain quoted string.`)
            return quoted[1]
        })
        if (!lists[name].length) throw new Error(`${DOM_PROPS_FILE}: ${name} parsed to zero entries.`)
    }
    return lists
}

/**
 * The subcomponents an in-house component defines, with the native element each renders, in
 * source order. Derived from the factory calls, so the page's element mapping is a fact about
 * the source rather than a claim about it.
 */
function readSubcomponents (source, spec) {
    const pattern = new RegExp(`^${spec.fn}\\.([A-Za-z]+)\\s*=\\s*${spec.factory}\\('([a-z]+)'`, 'gm')
    const found = [...source.matchAll(pattern)]
    if (!found.length) {
        throw new Error(`${spec.file}: no \`${spec.fn}.X = ${spec.factory}('element', …)\` definitions found.`
            + ` The subcomponent API is part of the published contract — update ${GENERATOR} deliberately`
            + ' if the shape changed, do not let a subcomponent go unlisted.')
    }
    return found.map(([, name, element]) => ({ name, element }))
}

/**
 * The destructuring parameter of the shared subcomponent implementation — `const Part = ({…}) =>`
 * inside the factory. Six components share it, so its props are consumed by all six, and a prop
 * added there without a curated line must fail the same way a wrapper prop does.
 *
 * @returns {{intercepted: Array<{name, alias, hasDefault}>, restName: String|null}}
 */
function readSharedPart (source, spec) {
    const opening = source.match(new RegExp(`const\\s+Part\\s*=\\s*\\(\\s*\\{`))
    if (!opening) {
        throw new Error(`${spec.file}: no \`const Part = ({\` shared subcomponent parameter found.`
            + ` Update ${GENERATOR} — the page documents what the subcomponents consume.`)
    }
    const braceAt = opening.index + opening[0].length - 1
    const inner = source.slice(braceAt + 1, endOfGroup(source, braceAt, spec.file) - 1)
    const intercepted = []
    let restName = null
    for (const entry of splitTopLevel(inner)) {
        const rest = entry.match(new RegExp(`^\\.\\.\\.(${NAME})$`))
        if (rest) { restName = rest[1]; continue }
        const match = entry.match(new RegExp(`^(${NAME})\\s*(?::\\s*(${NAME}))?\\s*(=\\s*[\\s\\S]+)?$`))
        if (!match) throw new Error(`${spec.file}: cannot parse \`${entry}\` in the shared Part parameter.`)
        intercepted.push({ name: match[1], alias: match[2] || null, hasDefault: Boolean(match[3]) })
    }
    if (!intercepted.length) throw new Error(`${spec.file}: the shared Part destructures no named props.`)
    if (!restName) throw new Error(`${spec.file}: the shared Part has no rest element — nothing reaches the element.`)
    return { intercepted, restName }
}

/** Every `omitProps(x, LIST, LIST)` list identifier used in `source`, deduped, in source order. */
function readOmitLists (source, file) {
    const calls = [...source.matchAll(/omitProps\(([^)]*)\)/g)]
    if (!calls.length) return []
    const lists = []
    for (const [, args] of calls) {
        const names = [...args.matchAll(/\b([A-Z][A-Z0-9_]*)\b/g)].map(match => match[1])
        if (!names.length) {
            throw new Error(`${file}: \`omitProps\` is called with no list identifiers — cannot document the strip.`)
        }
        names.forEach(name => { if (!lists.includes(name)) lists.push(name) })
    }
    return lists
}

/**
 * One in-house component's derived facts. The SUIR check is the point of the whole exercise:
 * a step is not done while the file still reaches the package by any mechanism, and this catches
 * `require`/`jest.mock`/dynamic `import` as well as a static one.
 */
function readInHouse (spec) {
    const raw = read(spec.file)
    const source = stripComments(raw)
    for (const { kind, pattern } of IMPORT_KINDS) {
        pattern.lastIndex = 0
        if (pattern.test(source)) {
            throw new Error(`${spec.file}: reaches semantic-ui-react by \`${kind}\`, but ${GENERATOR}`
                + ` lists it as in-house (${spec.id}). Either the step regressed, or move the entry back`
                + ' to WRAPPERS.')
        }
    }
    const { intercepted, restName } = interceptedProps(source, spec.fn, spec.file)
    const openings = jsxOpenings(source, spec.root)
    if (openings.length !== 1) {
        throw new Error(`${spec.file}: renders <${spec.root}> ${openings.length} times; the page describes one.`)
    }
    return {
        ...spec,
        lines: raw.replace(/\n$/, '').split('\n').length,
        intercepted,
        restName,
        // Gated with `factory`: a single-element component has no shared subcomponent part.
        part: spec.factory ? readSharedPart(source, spec) : { intercepted: [], restName: null },
        omitLists: readOmitLists(source, spec.file),
        // `factory` is absent for a single-element component (TooltipPop). Requiring it would
        // force a fake factory just to satisfy the reader.
        subcomponents: spec.factory ? readSubcomponents(source, spec) : [],
    }
}

/** One wrapper's derived facts. */
function readWrapper (spec) {
    const raw = read(spec.file)
    const source = stripComments(raw)
    const imported = source.match(new RegExp(`import\\s*\\{\\s*(${NAME})\\s+as\\s+(${NAME})\\s*\\}\\s*from\\s*'semantic-ui-react'`))
    if (!imported) {
        throw new Error(`${spec.file}: no \`import { X as Y } from 'semantic-ui-react'\` found.`
            + ' Either the wrapper stopped importing SUIR (delete its WRAPPERS entry and this section)'
            + ` or the import shape changed — update ${GENERATOR}.`)
    }
    if (imported[1] !== spec.suir || imported[2] !== spec.localName) {
        throw new Error(`${spec.file}: imports \`${imported[1]} as ${imported[2]}\`,`
            + ` but WRAPPERS says \`${spec.suir} as ${spec.localName}\`. Reconcile in ${GENERATOR}.`)
    }

    const { intercepted, restName } = interceptedProps(source, spec.fn, spec.file)
    const openings = jsxOpenings(source, spec.localName)
    if (!openings.length) throw new Error(`${spec.file}: SUIR's \`${spec.localName}\` is imported but never rendered.`)

    // Several renders of the same element must agree, or the page would document one of them and
    // silently drop the other.
    const shape = ({ attributes, spreads }) => JSON.stringify([attributes, spreads])
    const distinct = [...new Set(openings.map(shape))]
    if (distinct.length > 1) {
        throw new Error(`${spec.file}: \`<${spec.localName}>\` is rendered with ${distinct.length} different`
            + ` prop shapes:\n  ${distinct.join('\n  ')}\nThe page can only describe one — reconcile the source`
            + ` or extend ${GENERATOR}.`)
    }
    const { attributes, spreads } = openings[0]

    // Where the rest bag lands relative to the explicit attributes decides who wins a collision:
    // spread last means a caller can override an attribute the wrapper wrote.
    const body = source.slice(source.indexOf(`<${spec.localName}`))
    const restSpread = spreads.find(spread => spread.includes(restName))
    if (!restSpread) throw new Error(`${spec.file}: \`<${spec.localName}>\` does not spread \`${restName}\`.`)
    const spreadIsLast = attributes.length === 0
        ? null // nothing to be last relative to
        : body.indexOf(restSpread) > Math.max(...attributes.map(a => body.indexOf(a)))

    const omitLists = [...restSpread.matchAll(/\b([A-Z][A-Z0-9_]*)\b/g)].map(match => match[1])
    if (restSpread.includes('omitProps') && !omitLists.length) {
        throw new Error(`${spec.file}: \`omitProps\` is applied with no list identifiers — cannot document the strip.`)
    }

    // Props the wrapper assigns onto the rest bag; they reach SUIR under a SUIR name.
    const generated = [...new Set([...source.matchAll(new RegExp(`\\b${restName}\\.(${NAME})\\s*=(?!=)`, 'g'))]
        .map(match => match[1]))].sort()

    return {
        ...spec,
        lines: raw.replace(/\n$/, '').split('\n').length,
        intercepted,
        restName,
        attributes,
        spreadIsLast,
        omitLists,
        generated,
    }
}

/** JSX attributes the codebase puts on an in-house component and its subcomponents, with the files involved. */
function readCallSites (inHouse) {
    const tags = [inHouse.fn, ...inHouse.subcomponents.map(({ name }) => `${inHouse.fn}.${name}`)]
    const usage = {}
    // `attributeFiles` maps an attribute name to the files that actually pass it, so a guard
    // failure can name the offender instead of every file that renders the tag.
    tags.forEach(tag => {
        usage[tag] = { attributes: new Set(), spreads: new Set(), files: new Set(), attributeFiles: new Map() }
    })
    for (const file of sourceFiles('src')) {
        if (/(__tests__|\.test\.)/.test(file)) continue
        if (file === inHouse.file) continue
        const source = stripComments(read(file))
        for (const tag of tags) {
            for (const { attributes, spreads } of jsxOpenings(source, tag)) {
                attributes.forEach(name => {
                    usage[tag].attributes.add(name)
                    if (!usage[tag].attributeFiles.has(name)) usage[tag].attributeFiles.set(name, new Set())
                    usage[tag].attributeFiles.get(name).add(file)
                })
                spreads.forEach(spread => usage[tag].spreads.add(spread))
                usage[tag].files.add(file)
            }
        }
    }
    const out = {}
    tags.forEach(tag => {
        out[tag] = {
            attributes: [...usage[tag].attributes].sort(),
            spreads: [...usage[tag].spreads].sort(),
            files: [...usage[tag].files].sort(),
            attributeFiles: usage[tag].attributeFiles,
        }
    })
    return out
}

// ---------------------------------------------------------------------------
// Curation totality
// ---------------------------------------------------------------------------

/** Fails when the curation and a derived inventory have diverged in either direction. */
function assertTotal (label, derived, curated, where) {
    const missing = derived.filter(name => !curated.includes(name))
    if (missing.length) {
        throw new Error(`${label}: no curated entry for ${missing.join(', ')}.`
            + ` Add one to ${where} in ${CURATION} — an undocumented prop is an unpublished promise.`)
    }
    const orphans = curated.filter(name => !derived.includes(name))
    if (orphans.length) {
        throw new Error(`${label}: ${where} in ${CURATION} still describes ${orphans.join(', ')},`
            + ' which the source no longer does. Remove the entry, or move it to another `via`.')
    }
}

const VIA = ['element', 'generated', 'rest']

/** Cross-checks every FORWARDED_CURATION entry against what the wrapper source actually does. */
function assertForwardedShape (label, entries, derived) {
    for (const [name, entry] of Object.entries(entries)) {
        if (!VIA.includes(entry.via)) {
            throw new Error(`${label}.${name}: \`via\` must be one of ${VIA.join('/')}, got \`${entry.via}\`.`)
        }
        if (entry.tier !== 1 && entry.tier !== 2) throw new Error(`${label}.${name}: \`tier\` must be 1 or 2.`)
        if (entry.tier === 1 && !entry.source) throw new Error(`${label}.${name}: tier 1 must say where it was seen.`)
        if (entry.tier === 2 && entry.source) throw new Error(`${label}.${name}: tier 2 is by definition unexercised.`)
        if (!entry.summary || entry.summary.includes('|') || entry.summary.includes('\n')) {
            throw new Error(`${label}.${name}: \`summary\` must be a non-empty single line without \`|\`.`)
        }
    }
    if (!derived) return
    assertTotal(`${label} (via: 'element')`, derived.attributes,
        Object.keys(entries).filter(name => entries[name].via === 'element'), 'FORWARDED_CURATION')
    assertTotal(`${label} (via: 'generated')`, derived.generated,
        Object.keys(entries).filter(name => entries[name].via === 'generated'), 'FORWARDED_CURATION')
    const claimedRest = Object.keys(entries).filter(name => entries[name].via === 'rest')
    const written = [...derived.attributes, ...derived.generated]
    const wrong = claimedRest.filter(name => written.includes(name))
    if (wrong.length) {
        throw new Error(`${label}: ${wrong.join(', ')} are curated as \`via: 'rest'\`, but the wrapper writes`
            + ' them explicitly. A caller-supplied value is not what reaches SUIR — fix the `via`.')
    }
}

/** Fails when a curated in-house section and the source have diverged. */
function assertInHouseCuration (component, callSites) {
    const label = `IN_HOUSE_CURATION.${component.id}`
    const curation = IN_HOUSE_CURATION[component.id]
    if (!curation) throw new Error(`no ${label} entry in ${CURATION}.`)
    for (const field of ['shipped', 'summary', 'classContract', 'cssContract', 'droppedNote', 'passthrough']) {
        if (!curation[field]) throw new Error(`${label}: \`${field}\` is required.`)
    }
    assertTotal(`${label}.props`, component.intercepted.map(({ name }) => name),
        Object.keys(curation.props), 'IN_HOUSE_CURATION')
    assertTotal(`${label}.partProps`, component.part.intercepted.map(({ name }) => name),
        Object.keys(curation.partProps), 'IN_HOUSE_CURATION')
    assertTotal(`${label}.elements`, component.subcomponents.map(({ name }) => name),
        Object.keys(curation.elements), 'IN_HOUSE_CURATION')
    // A `dropped` entry that names something the component still consumes would tell a reader the
    // opposite of the truth, so it fails rather than being rendered.
    const consumed = [
        ...component.intercepted.map(({ name }) => name),
        ...component.part.intercepted.map(({ name }) => name),
    ]
    const contradictions = Object.keys(curation.dropped).filter(name => consumed.includes(name))
    if (contradictions.length) {
        throw new Error(`${label}.dropped: ${contradictions.join(', ')} ${contradictions.length === 1 ? 'is' : 'are'}`
            + ' still destructured by the component. A prop cannot be both dropped and consumed.')
    }
    // A call site passing a dropped prop is the regression this section exists to catch.
    for (const [tag, usage] of Object.entries(callSites)) {
        const revived = usage.attributes.filter(attr => attr in curation.dropped)
        if (revived.length) {
            const where = revived
                .map(attr => `${attr} at ${[...(usage.attributeFiles.get(attr) || [])].sort().join(', ')}`)
                .join('; ')
            throw new Error(`${label}.dropped: \`${tag}\` is rendered with ${where}, but the page says`
                + ' the prop was dropped. One of the two is wrong.')
        }
    }
    for (const field of ['props', 'partProps', 'elements', 'dropped']) {
        for (const [name, text] of Object.entries(curation[field])) {
            if (!text || text.includes('|') || text.includes('\n')) {
                throw new Error(`${label}.${field}.${name}: must be a non-empty single line without \`|\`.`)
            }
        }
    }
}

/** The reference model both the markdown and the contract test read. */
function buildReference () {
    const importSites = readImportSites()
    const domProps = readDomPropsLists()
    const wrappers = WRAPPERS.map(readWrapper)
    const inHouse = IN_HOUSE.map(readInHouse)
    const table = inHouse.find(component => component.id === 'Table')
    // Per component, then merged: tags are unique across components, but "a component's own file is
    // not a call site" is only true of ITS own tags.
    const callSites = Object.assign({}, ...inHouse.map(readCallSites))

    for (const component of inHouse) {
        assertInHouseCuration(component, callSites)
        for (const list of component.omitLists) {
            if (!domProps[list]) {
                throw new Error(`${component.file}: applies \`${list}\`, which ${DOM_PROPS_FILE} does not export.`)
            }
        }
    }

    for (const wrapper of wrappers) {
        const curation = WRAPPER_CURATION[wrapper.id]
        if (!curation) throw new Error(`no WRAPPER_CURATION entry for ${wrapper.id} in ${CURATION}.`)
        if (!curation.summary || !curation.cssContract) {
            throw new Error(`WRAPPER_CURATION.${wrapper.id}: \`summary\` and \`cssContract\` are both required.`)
        }
        // `classContract` and `behaviourContract` are rendered when present and NOT required, because
        // "absent" has to mean "not measured yet" rather than "no contract". §9.7-F1 step 2 part 1
        // measured both for `TooltipPop`; step 3 owes the same for `Dropdown` before its swap, and that
        // obligation is carried in STEP_OBLIGATIONS rather than as a throw here — a required field would
        // only invite a placeholder, which is worse than a visible gap.
        for (const field of ['classContract', 'behaviourContract']) {
            const text = curation[field]
            if (text !== undefined && (typeof text !== 'string' || !text.trim())) {
                throw new Error(`WRAPPER_CURATION.${wrapper.id}.${field}: omit it, or make it a non-empty string.`)
            }
        }
        assertTotal(`WRAPPER_CURATION.${wrapper.id}.props`, wrapper.intercepted.map(({ name }) => name),
            Object.keys(curation.props), 'WRAPPER_CURATION')
        for (const [name, text] of Object.entries(curation.props)) {
            if (!text || text.includes('|') || text.includes('\n')) {
                throw new Error(`WRAPPER_CURATION.${wrapper.id}.props.${name}: must be a non-empty single line without \`|\`.`)
            }
        }
        assertForwardedShape(`FORWARDED_CURATION.${wrapper.id}`, FORWARDED_CURATION[wrapper.id] || {}, wrapper)
        for (const list of wrapper.omitLists) {
            if (!domProps[list]) {
                throw new Error(`${wrapper.file}: applies \`${list}\`, which ${DOM_PROPS_FILE} does not export.`)
            }
        }
    }

    const curatedKeys = Object.keys(FORWARDED_CURATION).sort()
    const expectedKeys = WRAPPERS.map(({ id }) => id).sort()
    if (curatedKeys.join(',') !== expectedKeys.join(',')) {
        throw new Error(`FORWARDED_CURATION keys are ${curatedKeys.join(', ')};`
            + ` the source has ${expectedKeys.join(', ')}. Reconcile ${CURATION}.`
            + ' A component that has gone in-house forwards nothing — its section is IN_HOUSE_CURATION.')
    }

    const views = Object.keys(META_ATTRIBUTES).sort()
    const consumerViews = Object.keys(CONSUMER_ONLY_ATTRIBUTES).sort()
    if (views.join(',') !== consumerViews.join(',')) {
        throw new Error(`META_ATTRIBUTES covers ${views.join(', ')} but CONSUMER_ONLY_ATTRIBUTES covers`
            + ` ${consumerViews.join(', ')}. Both maps must name the same views.`)
    }
    for (const view of views) {
        const overlap = CONSUMER_ONLY_ATTRIBUTES[view].filter(name => META_ATTRIBUTES[view].includes(name))
        if (overlap.length) {
            throw new Error(`CONSUMER_ONLY_ATTRIBUTES.${view} lists ${overlap.join(', ')}, which the tracked`
                + ' corpus also uses. "Consumer-only" is the whole point of that map — move them.')
        }
    }

    return { importSites, domProps, wrappers, inHouse, callSites, table }
}

// ---------------------------------------------------------------------------
// Markdown
// ---------------------------------------------------------------------------

const row = (cells) => `| ${cells.join(' | ')} |`
const code = (value) => `\`${value}\``
const codeList = (values) => (values.length ? values.map(code).join(', ') : '—')

function wrapperSection (wrapper, { domProps }) {
    const curation = WRAPPER_CURATION[wrapper.id]
    const forwarded = FORWARDED_CURATION[wrapper.id]
    const stripped = wrapper.omitLists.flatMap(list => domProps[list])
    const rePassed = wrapper.intercepted.filter(({ name }) => wrapper.attributes.includes(name))

    const lines = [
        `### ${code(wrapper.id)} — wraps semantic-ui-react ${code(wrapper.suir)}`,
        '',
        `${code(wrapper.file)}, ${wrapper.lines} lines.`,
        '',
        curation.summary,
        '',
        ...(curation.classContract ? [`**What it emits.** ${curation.classContract}`, ''] : []),
        ...(curation.behaviourContract
            ? [`**What opens and closes it.** ${curation.behaviourContract}`, '']
            : []),
        `**Consumed by the wrapper (${wrapper.intercepted.length}).** These never reach`
        + ` semantic-ui-react${rePassed.length ? '' : ' at all'} — we own the behaviour, and the`
        + ' §9.7-F1 swap cannot change it.',
        '',
        row(['Prop', 'Meaning']),
        row(['---', '---']),
        ...wrapper.intercepted.map(({ name, alias, hasDefault }) => row([
            code(name)
            + (alias ? ` <br>*(bound as ${code(alias)})*` : '')
            + (hasDefault ? ' <br>*(has a default)*' : ''),
            curation.props[name],
        ])),
        '',
    ]

    if (rePassed.length) {
        lines.push(`${codeList(rePassed.map(({ name }) => name))} ${rePassed.length === 1 ? 'is' : 'are'}`
            + ' also written back onto the semantic-ui-react element under the same name, so'
            + ' the same prop appears in both tables.', '')
    }

    lines.push(
        `**Stripped at the DOM boundary.** ${stripped.length
            ? `${code(wrapper.file)} applies ${codeList(wrapper.omitLists)} from ${code(DOM_PROPS_FILE)}`
              + ` to the rest bag, so these never become attributes: ${codeList(stripped)}.`
            : `${code(wrapper.file)} applies no boundary filter. Whatever the caller passes reaches`
              + ' semantic-ui-react, which spreads what it does not recognise onto a DOM element —'
              + ' so this is an unprotected boundary, and the replacement should apply'
              + ` ${code('omitProps')} where the current wrapper does not.`}`
        + (curation.strippedNote ? ` ${curation.strippedNote}` : ''),
        '',
        `**Forwarded to semantic-ui-react (${Object.keys(forwarded).length}) — the parity checklist.**`
        + (wrapper.attributes.length
            ? ` The wrapper writes ${codeList(wrapper.attributes)} as explicit attributes`
              + `${wrapper.generated.length ? `, generates ${codeList(wrapper.generated)} onto the rest bag,` : ','}`
              + ` and spreads ${code(wrapper.restName)} ${wrapper.spreadIsLast ? 'AFTER' : 'BEFORE'} them`
              + ` — so a caller ${wrapper.spreadIsLast ? 'CAN' : 'cannot'} override what the wrapper wrote.`
            : ` The wrapper writes no attributes of its own: it spreads ${code(wrapper.restName)}`
              + ' and nothing else, so everything below arrives straight from the caller.'),
        '',
        `CSS contract: ${curation.cssContract}`,
        '',
        row(['Prop', 'Reaches SUIR via', 'Tier', 'Seen in', 'What has to be reproduced']),
        row(['---', '---', '---', '---', '---']),
        ...Object.keys(forwarded).sort((a, b) => (forwarded[a].tier - forwarded[b].tier) || a.localeCompare(b))
            .map(name => row([
                code(name),
                forwarded[name].via === 'rest' ? `caller, via ${code(wrapper.restName)}` : forwarded[name].via,
                String(forwarded[name].tier),
                forwarded[name].source || '—',
                forwarded[name].summary,
            ])),
        '',
    )

    return lines
}

/**
 * The section for a component a completed F1 step took in-house. Deliberately NOT the wrapper
 * shape: there is no "forwarded" column because there is nothing to forward to, and the two
 * questions a reader now has are "what does it emit" and "what does it no longer accept".
 */
function inHouseSection (component, { domProps, callSites }) {
    const curation = IN_HOUSE_CURATION[component.id]
    const stripped = component.omitLists.flatMap(list => domProps[list])
    const tags = [component.fn, ...component.subcomponents.map(({ name }) => `${component.fn}.${name}`)]

    return [
        `### ${code(component.id)} — in-house, no semantic-ui-react`,
        '',
        `${code(component.file)}, ${component.lines} lines. Replaced the wrapper in ${curation.shipped}.`,
        '',
        curation.summary,
        '',
        `**What it emits.** ${curation.classContract}`,
        '',
        row(['Component', 'Element', 'Notes']),
        row(['---', '---', '---']),
        ...component.subcomponents.map(({ name, element }) => row([
            code(`${component.fn}.${name}`),
            code(`<${element}>`),
            curation.elements[name],
        ])),
        '',
        `CSS contract: ${curation.cssContract}`,
        '',
        `**Consumed by the root (${component.intercepted.length}).** Read by ${code(component.fn)}`
        + ' itself; everything else rides the rest spread onto the element.',
        '',
        row(['Prop', 'Meaning']),
        row(['---', '---']),
        ...component.intercepted.map(({ name, alias, hasDefault }) => row([
            code(name)
            + (alias ? ` <br>*(bound as ${code(alias)})*` : '')
            + (hasDefault ? ' <br>*(has a default)*' : ''),
            curation.props[name],
        ])),
        '',
        `**Consumed by every subcomponent (${component.part.intercepted.length}).** All six share one`
        + ' implementation, so this list applies to each of them identically.',
        '',
        row(['Prop', 'Meaning']),
        row(['---', '---']),
        ...component.part.intercepted.map(({ name }) => row([code(name), curation.partProps[name]])),
        '',
        `**Stripped at the DOM boundary.** ${stripped.length
            ? `${code(component.file)} applies ${codeList(component.omitLists)} from`
              + ` ${code(DOM_PROPS_FILE)} in all ${tags.length} components, so these never become`
              + ` attributes: ${codeList(stripped)}.`
            : `${code(component.file)} applies no boundary filter, which for a component that spreads`
              + ' onto a real element is a leak waiting for a caller — see ' + code(DOM_PROPS_FILE) + '.'}`,
        '',
        `**Passthrough.** ${curation.passthrough}`,
        '',
        `**Dropped (${Object.keys(curation.dropped).length}) — the semver record.** Props`
        + ' semantic-ui-react handled that this implementation deliberately does not. All of them remain'
        + ' REACHABLE from a consumer meta — `mapper.js` spreads a `TableCells` node\'s whole rest bag onto'
        + ' the cell and `TableView` spreads its own rest onto the table — so the component strips them'
        + ' explicitly and warns once per prop in development. Stripping matters because a string-valued'
        + ' one would otherwise land as a lowercase DOM attribute (`verticalAlign="top"` rendered'
        + ' `verticalalign="top"`), which is the junk the DOM contract\'s tripwires exist to keep out;'
        + ' warning matters because a meta still carrying one would otherwise never learn it stopped'
        + ' working. React\'s own unknown-prop warning is not relied on: it is silent for a lowercase name.',
        '',
        row(['Prop', 'Why it is gone']),
        row(['---', '---']),
        ...Object.keys(curation.dropped).map(name => row([code(name), curation.dropped[name]])),
        '',
        curation.droppedNote,
        '',
        '**Call sites.** What the codebase puts on the family, derived from the source. This was the'
        + ' step-1 parity surface and it is kept afterwards, because it is what any future change to'
        + ' the family is measured against:',
        '',
        row(['Component', 'Attributes at the call sites', 'Spreads', 'Rendered by']),
        row(['---', '---', '---', '---']),
        ...tags.map(tag => row([
            code(tag),
            codeList(callSites[tag].attributes),
            codeList(callSites[tag].spreads),
            callSites[tag].files.length ? callSites[tag].files.map(file => code(file.replace(/^src\//, ''))).join(', ') : '*nothing*',
        ])),
        '',
        '`mapper.js`\'s spread onto `Table.Cell` is a meta node\'s whole rest bag and is still'
        + ' unfiltered at the call site — the filter is now inside the cell, which is why it is safe.'
        + ' The remaining unfiltered boundary on this surface is the tooltip wrapper, and step 2 owns it.',
        '',
    ]
}

function renderMarkdown (reference) {
    const { importSites, wrappers, inHouse } = reference
    const guardBlind = importSites.filter(site => !site.lintVisible)
    const done = inHouse.map(component => component.id)
    const left = wrappers.map(wrapper => wrapper.id)

    const lines = [
        '<!--',
        `  GENERATED FILE — DO NOT EDIT. Run \`${WRITE_COMMAND}\` to regenerate.`,
        '  Inventories are derived from the component source, `domProps.js` and the call sites;',
        `  the prose comes from ${CURATION}. Generator: ${GENERATOR}.`,
        '-->',
        '',
        '# Supported props — `Table`, `Tooltip`, `Select` / `Dropdown`',
        '',
        `Companion to \`${VIEWS_PAGE}\`, which lists every \`view\` name a meta may use. This page`,
        'covers the props of the three views the `semantic-ui-react` exit replaces one at a time',
        '(UPGRADE-PLAN §9.7-F1). It is both the **supported-prop list** for meta authors and the',
        '**parity checklist** the replacements are judged against.',
        '',
        `**${done.length} of the ${done.length + left.length} done so far.**`,
        `${codeList(done)} ${done.length === 1 ? 'is' : 'are'} in-house and`,
        `${done.length === 1 ? 'imports' : 'import'} nothing; ${codeList(left)}`,
        `${left.length === 1 ? 'still wraps' : 'still wrap'} semantic-ui-react. The two kinds of section answer different`,
        'questions, so they are shaped differently: a wrapper section ends in the **forwarded** table',
        'that its replacement owes, while an in-house section says what the component **emits** and',
        'what it no longer **accepts**.',
        '',
        '**This page is generated.** Editing it by hand is pointless — the contract test regenerates',
        `it and fails on any difference. Run \`${WRITE_COMMAND}\` after changing one of these`,
        `components, and edit prose in \`${CURATION}\`.`,
        '',
        '## The outcomes, and why they are not one list',
        '',
        '"A prop appears in a meta" is not "a prop reaches semantic-ui-react". Each prop on one of',
        'these views has exactly one of these fates, and they are different promises:',
        '',
        '| Outcome | What it means | What the §9.7-F1 swap does to it |',
        '| --- | --- | --- |',
        '| **consumed** | the component, or its caller in the engine, reads it | nothing — we already own the behaviour |',
        '| **stripped** | removed at the DOM boundary by `' + DOM_PROPS_FILE + '` | only the boundary moves |',
        '| **forwarded** | handed to semantic-ui-react, which decides what happens | everything: this is the parity risk |',
        '| **dropped** | semantic-ui-react handled it; the in-house component deliberately does not | already happened — this is the semver record for that step |',
        '',
        'A checklist that mixed them would be full of props that never mattered. Each section below',
        'is split that way.',
        '',
        'The forwarded set is tiered, because "supported" and "used" are different facts:',
        '',
        '- **tier 1 — exercised.** Used by a node in the tracked example corpus, by one of the',
        '  consumer metas audited in step 0, or generated unconditionally by the wrapper. A',
        '  regression here is a live bug.',
        '- **tier 2 — published but unexercised.** Reachable through the wrapper API or by',
        '  passthrough, but no meta in either corpus uses it. These cannot be dropped *silently* —',
        '  they are documented propTypes — but reimplement-vs-deprecate is a decision for the step',
        '  PR, not an automatic obligation.',
        '',
        '## Isolation invariant',
        '',
        `Everything semantic-ui-react does in this library happens inside \`${PACK}\`. Derived by`,
        'scanning `src` for every import, `require` and `jest.mock` of the package — so this table',
        'shrinks as the exit proceeds, and the components below that no longer appear in it are the',
        'ones that no longer depend on the package at all:',
        '',
        row(['File', 'How', 'Specifier']),
        row(['---', '---', '---']),
        ...importSites.map(site => row([
            code(site.file) + (site.test ? ' *(test)*' : ''),
            code(site.kind),
            code(site.specifier),
        ])),
        '',
        'An `eslint` `no-restricted-imports` override (in `package.json`, `eslintConfig.overrides`)',
        `fails \`npm run lint:js\` on a static \`import\` of the package from anywhere outside \`${PACK}\`,`,
        'including deep imports such as `semantic-ui-react/dist/...`. A static import is *all* it sees:',
        'it cannot see `require()`, `jest.mock()`, or a dynamic `import(\'semantic-ui-react\')` — ESLint 8',
        'does not visit `ImportExpression`. Nor does `lint:js` visit `.ts`/`.tsx` today, since it runs with',
        '`--ext .js,.jsx`; the override glob already covers them for when it does.',
        '',
        `The scan above closes every one of those gaps — dynamic imports, double-quoted specifiers and`,
        `TypeScript files included — which is why both halves run${guardBlind.length
            ? `; ${guardBlind.length} of the sites above ${guardBlind.length === 1 ? 'is' : 'are'}`
              + ' invisible to the rule'
            : ''}. Neither is sufficient alone.`,
        '',
        '## In-house — the exit, so far',
        '',
        ...inHouse.flatMap(component => inHouseSection(component, reference)),
        '## Wrappers — what is left',
        '',
        ...wrappers.flatMap(wrapper => wrapperSection(wrapper, reference)),
        '## What the meta corpus actually uses',
        '',
        'Every attribute name the **tracked** example corpus puts on a node of each of these views.',
        'This is the "discovered set" §9.7-F1 step 0 asked for, and it is enforced total in both',
        'directions by `scripts/__tests__/wrapper-prop-reference.contract.test.js`: add an example',
        'that uses a new attribute, and the test names it.',
        '',
        'Read it as an inventory, not a forwarding claim — most of these are consumed by',
        '`mapper.js` / `TableView.js` and never reach semantic-ui-react. Cross-reference the',
        'per-wrapper tables above for the fate of each.',
        '',
        row(['View', 'Attributes in the tracked corpus', 'Found only in consumer metas']),
        row(['---', '---', '---']),
        ...Object.keys(META_ATTRIBUTES).sort().map(view => row([
            code(view),
            codeList(META_ATTRIBUTES[view]),
            codeList(CONSUMER_ONLY_ATTRIBUTES[view]),
        ])),
        '',
        'The last column is a step-0 audit finding, not a CI-checked fact: consumer metas are',
        'untracked working files (UPGRADE-PLAN §0.8) and CI never sees them. It is recorded because',
        'two of those props reach semantic-ui-react and are styled — a checklist derived from the',
        'demo corpus alone would be wrong.',
        '',
        '## Obligations per step',
        '',
        'What each step owes beyond "the props above still work".',
        '',
        ...STEP_OBLIGATIONS.flatMap(({ step, effort, items }) => [
            `### ${step}`,
            '',
            `**Effort: ${effort}.**`,
            '',
            ...items.map(item => `- ${item}`),
            '',
        ]),
        '## What this page does and does not guarantee',
        '',
        'Guaranteed, because it is derived from source and checked in CI: the import inventory; each',
        "component's consumed set and its line count; which boundary lists each one applies; the",
        'attributes and spreads written on the semantic-ui-react element; the native element behind',
        'every in-house subcomponent, and that no in-house file reaches semantic-ui-react by import,',
        '`require`, `jest.mock` or dynamic `import`; every attribute the codebase puts on the `Table`',
        'family; that no call site passes a prop the page says was dropped; and that every one of',
        'those has a curated description.',
        '',
        'Also guaranteed: the tracked-corpus attribute inventory, enforced total by the contract',
        'test against the real `EXAMPLES` manifest.',
        '',
        'Not guaranteed, and deliberately so:',
        '',
        '- **the forwarded set is open.** A rest spread cannot be closed by static analysis; a meta',
        '  may pass any semantic-ui-react prop. The tier-1 list is what was found, not a proof of',
        '  what is possible.',
        '- **the emitted className strings.** The generator reads which props a component consumes,',
        '  not what it composes them into. `ui table` surviving on the root is asserted by',
        '  `src/core/components/__tests__/Table.test.js` and by the 38-example DOM baseline, not here.',
        '- **the dropped list is not proof of absence.** It names the props that had a curated entry',
        '  while the component was a wrapper, plus the wider semantic-ui-react surface recorded in',
        '  prose. A caller could always pass an undocumented semantic prop; those now land on the',
        '  element or draw a React warning, and no static check can enumerate them.',
        '- **corpus evidence is initial-render only.** The step-0 instrumented render recorded the',
        '  props reaching semantic-ui-react on first paint, so props that only appear once a',
        '  control is interacted with — opening a dropdown, switching a tab — were never observed.',
        '  Separately, a node inside an unrendered branch contributes nothing at all, which is why',
        '  the corpus produced no tooltip evidence: both declarations sit in a `Tabs` panel that is',
        '  not the active one. The tooltip rows above are read off the wrapper source and a direct',
        '  probe instead.',
        '- **consumer metas are not re-scanned.** They are untracked by design.',
        '- **the prose.** Curated sentences are reviewed documentation, not machine-checked facts.',
        '',
    ]

    return lines.join('\n')
}

function main (argv) {
    const checkOnly = argv.includes('--check')
    const generated = renderMarkdown(buildReference())
    const fullPath = path.join(ROOT, OUTPUT_FILE)
    const current = fs.existsSync(fullPath) ? fs.readFileSync(fullPath, 'utf8') : null

    if (current === generated) {
        console.log(`${OUTPUT_FILE} is up to date`)
        return 0
    }

    if (checkOnly) {
        if (current === null) {
            console.error(`${OUTPUT_FILE}: missing — run \`${WRITE_COMMAND}\``)
            return 1
        }
        const currentLines = current.split('\n')
        const generatedLines = generated.split('\n')
        const at = currentLines.findIndex((line, index) => line !== generatedLines[index])
        console.error(`${OUTPUT_FILE} is out of date — run \`${WRITE_COMMAND}\`.`)
        console.error(`first difference at line ${at + 1}:`)
        console.error(`  on disk:   ${currentLines[at] === undefined ? '<end of file>' : currentLines[at]}`)
        console.error(`  generated: ${generatedLines[at] === undefined ? '<end of file>' : generatedLines[at]}`)
        return 1
    }

    fs.writeFileSync(fullPath, generated)
    console.log(`${OUTPUT_FILE}: ${current === null ? 'created' : 'updated'}`)
    return 0
}

module.exports = {
    buildReference,
    renderMarkdown,
    readImportSites,
    readDomPropsLists,
    interceptedProps,
    jsxOpenings,
    stripComments,
    OUTPUT_FILE,
    WRITE_COMMAND,
    WRAPPERS,
}

if (require.main === module) {
    try {
        process.exitCode = main(process.argv.slice(2))
    } catch (error) {
        console.error(`${GENERATOR}: ${error.message}`)
        process.exitCode = 1
    }
}
