/**
 * Generates `docs/SUPPORTED-VIEWS.md` — the reference for every `view`, `render*`
 * and action name a meta.json may use — from the `FIELD` constants plus the
 * curated prose in `scripts/view-reference-curation.js`.
 *
 * WHY THIS EXISTS (UPGRADE-PLAN §9.4, "Generated view-type reference")
 * The resolver is a `switch`, not a registry table, so nothing could enumerate
 * the supported views at runtime and a hand-written page drifted the moment a
 * `case` was added or removed. This script derives the enumerable half instead:
 *
 *   FROM THE CONSTANTS   which `view`/`render*`/action strings exist, and which
 *                        declaration file each comes from. `FIELD` is assembled
 *                        at import time by three modules (DECLARATION_SITES),
 *                        and assertDeclarationSites() proves no fourth exists.
 *   FROM THE RESOLVER    whether a constant is actually dispatched, by looking
 *                        for the references the resolver makes to it. A `view`
 *                        no `case` mentions is reported as unresolved, because
 *                        at runtime it falls through to `PlaceholderField`.
 *   FROM THE CURATION    the prose: one-line description, the component the node
 *                        resolves to, and notes. Nothing else.
 *
 * The mapping between the two halves is enforced total in both directions, so a
 * new constant, a deleted constant, a new `case` or a deleted `case` all fail the
 * check until the page is regenerated. `scripts/__tests__/view-reference.contract.test.js`
 * runs that check inside the suite (and cross-checks the statically parsed
 * constants against the real, fully populated `FIELD` object), so the docs cannot
 * drift silently in any of the four CI legs.
 *
 * WHAT IT DOES NOT GUARANTEE: the curated sentences are not machine-checked
 * against behaviour. Someone can change what `Column` renders without this
 * failing, as long as the `case` stays. Closing that gap needs the resolver to
 * become a registry table — §9.3 work, deliberately not done here.
 *
 * Usage (mirrors scripts/sync-version.js):
 *   node scripts/generate-view-reference.js            # write the page
 *   node scripts/generate-view-reference.js --check     # report drift, exit 1, change nothing
 */
const fs = require('fs')
const path = require('path')

const { VIEW_CURATION, RENDERER_CURATION, ACTION_CURATION } = require('./view-reference-curation')

const ROOT = path.resolve(__dirname, '..')
const OUTPUT_FILE = 'docs/SUPPORTED-VIEWS.md'
const GENERATOR = 'scripts/generate-view-reference.js'
const CURATION = 'scripts/view-reference-curation.js'
const WRITE_COMMAND = 'npm run docs:views'

/**
 * The three modules that assign to `FIELD.TYPE` / `FIELD.RENDER` / `FIELD.ACTION`,
 * in import order. `definitionSetup()` merges each assignment into the same object
 * and throws on a duplicate key or value, so the union below is the whole vocabulary.
 * assertDeclarationSites() fails if a fourth module starts assigning.
 */
const DECLARATION_SITES = [
    { file: 'src/core/modules/variables/fields.js', props: ['TYPE', 'RENDER', 'ACTION'] },
    { file: 'src/core/modules/form/constants.js', props: ['TYPE'] },
    { file: 'src/core/pages/main/rules.js', props: ['TYPE', 'ACTION'] },
]

/** Files whose references to the constants decide whether a name is live. */
const RESOLVER_FILES = {
    // Render.Component — the `view` switch, plus the `default` branch that handles
    // Dropdown inline and re-dispatches Input by `type`. Also Render.Method's `render*` switch.
    mapper: 'src/core/pages/main/mapper.js',
    // renderField — the form-field leg of the `default` branch.
    renderField: 'src/core/pages/main/components/renders.js',
    // FIELD.FUNC registrations for the action names.
    rules: 'src/core/pages/main/rules.js',
    fields: 'src/core/modules/variables/fields.js',
}

const read = (file) => fs.readFileSync(path.join(ROOT, file), 'utf8')

/** @returns {String} body of the `FIELD.<prop> = {…}` object literal in `source` */
function constantBlock (source, prop, file) {
    const opening = source.match(new RegExp(`^FIELD\\.${prop}\\s*=\\s*\\{$`, 'm'))
    if (!opening) {
        throw new Error(`${file}: no top-level \`FIELD.${prop} = {\` assignment found.`
            + ` The declaration moved or changed shape — update DECLARATION_SITES in ${GENERATOR}.`)
    }
    const from = opening.index + opening[0].length
    // Entries are indented, so the first line-initial `}` closes the literal.
    const to = source.indexOf('\n}', from)
    if (to === -1) throw new Error(`${file}: \`FIELD.${prop}\` literal is not closed by a line-initial \`}\`.`)
    return source.slice(from, to)
}

const ENTRY_LINE = /^\s*([A-Z][A-Za-z0-9_]*)\s*:\s*'([^']*)'\s*,?\s*(?:\/\/\s*(.*?))?\s*$/
const COMMENT_LINE = /^\s*(\/\/.*)?$/

/**
 * Parses one declaration block into entries.
 * Any line that is neither an entry nor a comment throws: a constant the parser
 * silently skipped would be a constant missing from the page, which is the exact
 * failure this script exists to prevent.
 */
function parseEntries (body, prop, file) {
    const entries = []
    body.split('\n').forEach((line, index) => {
        if (COMMENT_LINE.test(line)) return
        const match = line.match(ENTRY_LINE)
        if (!match) {
            throw new Error(`${file}: cannot parse line ${index + 1} of \`FIELD.${prop}\`: ${line.trim()}\n`
                + `Every entry must read \`KEY: 'value',\` with an optional trailing comment.`
                + ` Widen ENTRY_LINE in ${GENERATOR} deliberately, do not let an entry go unlisted.`)
        }
        const [, key, value, comment] = match
        entries.push({ key, value, comment: comment || null, file })
    })
    if (!entries.length) throw new Error(`${file}: \`FIELD.${prop}\` parsed to zero entries.`)
    return entries
}

/** Fails if a module outside DECLARATION_SITES assigns to one of the three props. */
function assertDeclarationSites () {
    const props = ['TYPE', 'RENDER', 'ACTION']
    const pattern = new RegExp(`^FIELD\\.(${props.join('|')})\\s*=\\s*\\{`, 'm')
    const found = new Map()

    const walk = (dir) => {
        for (const entry of fs.readdirSync(path.join(ROOT, dir), { withFileTypes: true })) {
            const relative = `${dir}/${entry.name}`
            if (entry.isDirectory()) {
                if (entry.name === '__tests__' || entry.name === '__mocks__' || entry.name === '__snapshots__') continue
                walk(relative)
            } else if (/\.jsx?$/.test(entry.name)) {
                const source = fs.readFileSync(path.join(ROOT, relative), 'utf8')
                if (!pattern.test(source)) continue
                found.set(relative, props.filter(prop => new RegExp(`^FIELD\\.${prop}\\s*=\\s*\\{`, 'm').test(source)))
            }
        }
    }
    walk('src')

    const expected = new Map(DECLARATION_SITES.map(({ file, props: declared }) => [file, declared]))
    const describe = (map) => [...map.entries()].map(([file, list]) => `${file} (${list.join(', ')})`).sort().join('\n  ')
    if (describe(found) !== describe(expected)) {
        throw new Error('the set of modules declaring FIELD.TYPE/RENDER/ACTION changed.\n'
            + `  expected:\n  ${describe(expected)}\n  found:\n  ${describe(found)}\n`
            + `Update DECLARATION_SITES in ${GENERATOR} so the reference stays complete.`)
    }
}

/** @returns {{TYPE: Array, RENDER: Array, ACTION: Array}} every declared constant, by prop */
function readConstants () {
    assertDeclarationSites()
    const byProp = { TYPE: [], RENDER: [], ACTION: [] }
    for (const { file, props } of DECLARATION_SITES) {
        const source = read(file)
        for (const prop of props) {
            for (const entry of parseEntries(constantBlock(source, prop, file), prop, file)) {
                const clash = byProp[prop].find(other => other.key === entry.key || other.value === entry.value)
                if (clash) {
                    throw new Error(`FIELD.${prop}: ${file} redeclares ${entry.key}='${entry.value}',`
                        + ` already declared as ${clash.key}='${clash.value}' in ${clash.file}.`)
                }
                byProp[prop].push(entry)
            }
        }
    }
    return byProp
}

const referenced = (source, pattern) => new Set([...source.matchAll(pattern)].map(match => match[1]))

/** Every reference the resolver makes to the constants, as sets of constant keys. */
function readResolver () {
    return resolverFacts({
        mapper: read(RESOLVER_FILES.mapper),
        renderField: read(RESOLVER_FILES.renderField),
        rules: read(RESOLVER_FILES.rules),
        fields: read(RESOLVER_FILES.fields),
    })
}

/**
 * The derivation itself, over source text rather than paths, so the contract test can prove
 * these patterns bite on the exact shapes the resolver is written in — a new `case` really is
 * picked up, and not silently missed by a regex that stopped matching.
 *
 * @param {Object<String>} sources - contents of RESOLVER_FILES, by the same keys
 * @returns {Object} sets of constant keys, plus the sources the caller needs for cross-checks
 */
function resolverFacts ({ mapper, renderField, rules, fields }) {
    if (!/PlaceholderField/.test(renderField)) {
        throw new Error(`${RESOLVER_FILES.renderField}: no PlaceholderField reference.`
            + ' The page documents it as the fallback for an unknown `view` — verify before regenerating.')
    }

    const actionSites = new Map()
    for (const key of referenced(rules, /FIELD\.FUNC\[FIELD\.ACTION\.([A-Za-z0-9_]+)\]\s*=/g)) {
        actionSites.set(key, RESOLVER_FILES.rules)
    }
    for (const key of referenced(fields, /\[FIELD\.ACTION\.([A-Za-z0-9_]+)\]\s*:/g)) {
        actionSites.set(key, RESOLVER_FILES.fields)
    }

    const switchCases = referenced(mapper, /case\s+FIELD\.TYPE\.([A-Za-z0-9_]+)\s*:/g)
    // `view === FIELD.TYPE.X` occurs in two roles: dispatch in the `default` branch
    // (Dropdown, Input, Select), and a tweak inside a case that already caught the view
    // (`Title` adding its `h3` class). Only the first is a dispatch site, and a view with
    // its own `case` can never reach `default`, so subtracting the cases separates them
    // without having to locate the `default` block in a file with several `default:` labels.
    const identityChecks = referenced(mapper, /view === FIELD\.TYPE\.([A-Za-z0-9_]+)/g)

    return {
        // `case FIELD.TYPE.X:` in Render.Component's switch
        switchCases,
        // `view === FIELD.TYPE.X` in the `default` branch (a view with its own case is not one)
        defaultBranch: new Set([...identityChecks].filter(key => !switchCases.has(key))),
        // `view = FIELD.TYPE.X` — Input re-dispatched by its `type`
        typeAliases: referenced(mapper, /view = FIELD\.TYPE\.([A-Za-z0-9_]+)/g),
        // `case FIELD.TYPE.X:` in renderField
        fieldCases: referenced(renderField, /case\s+FIELD\.TYPE\.([A-Za-z0-9_]+)\s*:/g),
        // `case FIELD.RENDER.X:` in Render.Method
        methodCases: referenced(mapper, /case\s+FIELD\.RENDER\.([A-Za-z0-9_]+)\s*:/g),
        // FIELD.FUNC[FIELD.ACTION.X] = … — where the action is registered
        actionSites,
        sources: { mapper, renderField },
    }
}

/**
 * Short label for a source file: parent directory plus filename. A bare filename would be
 * ambiguous here — `fields.js`, `constants.js` and `rules.js` each say very little alone,
 * and two of them sit under `src/core/modules/`.
 */
const shortPath = (file) => file.split('/').slice(-2).join('/')

/** Fails when the curation and the constants have diverged in either direction. */
function assertCurationTotal (label, keys, curation, where) {
    const missing = keys.filter(key => !(key in curation))
    if (missing.length) {
        throw new Error(`${label}: no curated description for ${missing.join(', ')}.`
            + ` Add an entry to ${where} in ${CURATION} — a new constant is undocumented until then.`)
    }
    const orphans = Object.keys(curation).filter(key => !keys.includes(key))
    if (orphans.length) {
        throw new Error(`${label}: ${where} in ${CURATION} still describes ${orphans.join(', ')},`
            + ' which no longer exists. Remove the entry.')
    }
    for (const key of keys) {
        for (const [field, text] of Object.entries(curation[key])) {
            if (text == null) continue
            if (typeof text !== 'string' || !text.trim()) {
                throw new Error(`${label}.${key}.${field}: must be a non-empty string or null.`)
            }
            if (text.includes('|') || text.includes('\n')) {
                throw new Error(`${label}.${key}.${field}: must not contain \`|\` or a newline — it breaks the table.`)
            }
        }
    }
}

/**
 * The reference model both the markdown and the contract test read.
 * Every `resolved`, `resolvedIn` and `registeredIn` value here is derived from the
 * resolver source; only `summary`, `resolvesTo` and `notes` come from the curation.
 */
function buildReference () {
    const constants = readConstants()
    const resolver = readResolver()

    const keys = {
        TYPE: constants.TYPE.map(({ key }) => key),
        RENDER: constants.RENDER.map(({ key }) => key),
        ACTION: constants.ACTION.map(({ key }) => key),
    }
    assertCurationTotal('FIELD.TYPE', keys.TYPE, VIEW_CURATION, 'VIEW_CURATION')
    assertCurationTotal('FIELD.RENDER', keys.RENDER, RENDERER_CURATION, 'RENDERER_CURATION')
    assertCurationTotal('FIELD.ACTION', keys.ACTION, ACTION_CURATION, 'ACTION_CURATION')

    // A resolver case naming a constant that no longer exists dispatches on `undefined`.
    const unknown = (label, set, known) => {
        const strays = [...set].filter(key => !known.includes(key))
        if (strays.length) throw new Error(`${label} references FIELD keys that are not declared: ${strays.join(', ')}.`)
    }
    unknown('the view resolver', new Set([
        ...resolver.switchCases, ...resolver.defaultBranch, ...resolver.typeAliases, ...resolver.fieldCases,
    ]), keys.TYPE)
    unknown('Render.Method', resolver.methodCases, keys.RENDER)
    unknown('the FIELD.FUNC registrations', new Set(resolver.actionSites.keys()), keys.ACTION)

    const views = constants.TYPE.map((entry) => {
        // Reachable from a node's own `view`. `typeAliases` is deliberately excluded:
        // it means "Input with this `type` becomes this view", not "this `view` resolves".
        const resolvedIn = []
        if (resolver.switchCases.has(entry.key)) resolvedIn.push('`mapper.js` switch')
        if (resolver.defaultBranch.has(entry.key)) resolvedIn.push('`mapper.js` default branch')
        if (resolver.fieldCases.has(entry.key)) resolvedIn.push('`renderField`')
        const view = {
            ...entry,
            ...VIEW_CURATION[entry.key],
            resolved: resolvedIn.length > 0,
            resolvedIn,
            viaInputType: resolver.typeAliases.has(entry.key),
        }
        if (view.resolved && !view.resolvesTo) {
            throw new Error(`FIELD.TYPE.${entry.key} is resolved in ${resolvedIn.join(', ')}`
                + ` but VIEW_CURATION gives it no \`resolvesTo\`. Name what the resolver hands the node to.`)
        }
        if (!view.resolved && view.resolvesTo) {
            throw new Error(`FIELD.TYPE.${entry.key} claims to resolve to \`${view.resolvesTo}\`,`
                + ' but no resolver case handles it. A node with this `view` falls through to PlaceholderField.')
        }
        if (view.resolvesTo) {
            // Cheap guard against a renamed component leaving stale prose behind.
            const symbol = new RegExp(view.resolvesTo.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'))
            const sources = resolvedIn.some(where => where.includes('renderField'))
                ? [resolver.sources.renderField, resolver.sources.mapper]
                : [resolver.sources.mapper]
            if (!sources.some(source => symbol.test(source))) {
                throw new Error(`FIELD.TYPE.${entry.key}: \`${view.resolvesTo}\` does not occur in`
                    + ` ${resolvedIn.join(' / ')}. It was renamed or removed — fix ${CURATION}.`)
            }
        }
        return view
    }).sort((a, b) => a.value.localeCompare(b.value))

    const renderers = constants.RENDER.map((entry) => ({
        ...entry,
        ...RENDERER_CURATION[entry.key],
        resolved: resolver.methodCases.has(entry.key),
    })).sort((a, b) => a.value.localeCompare(b.value))

    const actions = constants.ACTION.map((entry) => ({
        ...entry,
        ...ACTION_CURATION[entry.key],
        registeredIn: resolver.actionSites.get(entry.key) || null,
    })).sort((a, b) => a.value.localeCompare(b.value))

    const unregisteredActions = actions.filter(action => !action.registeredIn)
    if (unregisteredActions.length) {
        // Every action is wired today. If one stops being, the page must say so
        // instead of promising a name `getFunctionFromString` will not resolve.
        throw new Error(`these FIELD.ACTION names have no FIELD.FUNC registration: `
            + `${unregisteredActions.map(({ value }) => value).join(', ')}.`
            + ` Extend ${GENERATOR} to render them as unwired rather than dropping the distinction.`)
    }

    const unresolvedRenderers = renderers.filter(renderer => !renderer.resolved)
    if (unresolvedRenderers.length) {
        throw new Error(`these FIELD.RENDER names have no Render.Method case: `
            + `${unresolvedRenderers.map(({ value }) => value).join(', ')}.`
            + ` Extend ${GENERATOR} to render them as unwired rather than dropping the distinction.`)
    }

    return { views, renderers, actions }
}

const row = (cells) => `| ${cells.join(' | ')} |`
const describe = ({ summary, notes }) => (notes ? `${summary} ${notes}` : summary)

function renderMarkdown ({ views, renderers, actions }) {
    const resolved = views.filter(view => view.resolved)
    const unresolved = views.filter(view => !view.resolved)

    const lines = [
        '<!--',
        `  GENERATED FILE — DO NOT EDIT. Run \`${WRITE_COMMAND}\` to regenerate.`,
        `  Inventory and resolution status come from the FIELD constants and the resolver source;`,
        `  the prose comes from ${CURATION}. Generator: ${GENERATOR}.`,
        '-->',
        '',
        '# Supported `view` types',
        '',
        'Every name a `meta.json` may use: the `view` of a node, the value of a `render*`',
        'attribute, and the action names accepted by `onClick`, `onChange` and `onDone`.',
        '',
        '**This page is generated.** Editing it by hand is pointless — the contract test',
        `regenerates it and fails on any difference. Run \`${WRITE_COMMAND}\` after changing a`,
        `\`FIELD\` constant or a resolver \`case\`, and edit prose in \`${CURATION}\`.`,
        '',
        '## How a node is resolved',
        '',
        'A node\'s `view` is dispatched by `Render.Component` in',
        `\`${RESOLVER_FILES.mapper}\`: a \`switch\` handles the layout and display`,
        'views directly, and its `default` branch hands form fields to `renderField` in',
        `\`${RESOLVER_FILES.renderField}\`.`,
        '',
        'Two consequences worth knowing before authoring meta:',
        '',
        '- **An unknown `view` is not an error.** It reaches `renderField`\'s `default`,',
        '  which renders `PlaceholderField`: a red box showing the `view` name followed by',
        '  "field does not exist!" in place of the node. Every `view` in the second table',
        '  below behaves the same way — the constant exists, but nothing dispatches it.',
        '- **An unknown `render*` value is not an error either.** `Render.Method` falls',
        '  back to rendering the value as plain text, so a misspelled renderer name looks',
        '  like a deliberately unformatted value.',
        '',
        `## Views — \`view\` (${views.length})`,
        '',
        `### Resolved (${resolved.length})`,
        '',
        row(['`view`', 'Constant', 'Resolves to', 'Dispatched by', 'Description']),
        row(['---', '---', '---', '---', '---']),
        ...resolved.map(view => row([
            `\`${view.value}\``,
            `\`FIELD.TYPE.${view.key}\``,
            `\`${view.resolvesTo}\``,
            [...view.resolvedIn, ...(view.viaInputType ? ['`Input` `type`'] : [])].join(', '),
            describe(view),
        ])),
        '',
        `### Declared, but no resolver case (${unresolved.length})`,
        '',
        'A node using one of these renders the "field does not exist!" placeholder.',
        'They are listed because the constants are exported and reachable, so meta',
        'authors and IDE tooling do see them.',
        '',
        row(['`view`', 'Constant', 'Declared in', 'Description']),
        row(['---', '---', '---', '---']),
        ...unresolved.map(view => row([
            `\`${view.value}\``,
            `\`FIELD.TYPE.${view.key}\``,
            `\`${shortPath(view.file)}\``,
            describe(view),
        ])),
        '',
        `## Value renderers — \`render*\` (${renderers.length})`,
        '',
        'Used as the value of any attribute whose name starts with `render`',
        '(`renderCell`, `renderItem`, `renderLabel`, …). All of these are wired in',
        '`Render.Method`; anything else falls back to plain text.',
        '',
        row(['`render*` value', 'Constant', 'Description']),
        row(['---', '---', '---']),
        ...renderers.map(renderer => row([
            `\`${renderer.value}\``,
            `\`FIELD.RENDER.${renderer.key}\``,
            describe(renderer),
        ])),
        '',
        `## Actions — \`onClick\` / \`onChange\` / \`onDone\` (${actions.length})`,
        '',
        'Given as a string (`"submit"`, or `"setState,active.tab"` to append arguments)',
        'or as an object (`{name, args, mapArgs, onDone}`). Resolved through `FIELD.FUNC`.',
        'A name that is not below stays an unresolved string rather than raising.',
        '',
        row(['Action', 'Constant', 'Registered in', 'Description']),
        row(['---', '---', '---', '---']),
        ...actions.map(action => row([
            `\`${action.value}\``,
            `\`FIELD.ACTION.${action.key}\``,
            `\`${shortPath(action.registeredIn)}\``,
            describe(action),
        ])),
        '',
        '## What this page does and does not guarantee',
        '',
        'Guaranteed by the generator and its contract test: the three inventories are',
        'complete, every string matches its constant, and the resolved/unresolved split',
        'matches the resolver source. Add or delete a constant or a `case` and the check',
        'fails until the page is regenerated.',
        '',
        'Not guaranteed: the descriptions. They are curated prose, so a change to what a',
        'view *renders* — as opposed to whether it resolves — will not fail anything. That',
        'gap closes when the resolver becomes a registry table (UPGRADE-PLAN §9.3); until',
        'then, treat the prose as reviewed documentation rather than a machine-checked fact.',
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

module.exports = { buildReference, renderMarkdown, readConstants, readResolver, resolverFacts, OUTPUT_FILE, WRITE_COMMAND }

if (require.main === module) {
    try {
        process.exitCode = main(process.argv.slice(2))
    } catch (error) {
        console.error(`${GENERATOR}: ${error.message}`)
        process.exitCode = 1
    }
}
