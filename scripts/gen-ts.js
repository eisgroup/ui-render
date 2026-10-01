/**
 * `npm run gen-ts`: writes the package's declarations FROM THE SOURCE (UPGRADE-PLAN §9.6-E4).
 *
 * Until E4 they were written by hand, in `src/library/types`, beside a component that did not use
 * them. Now the component is typed with the contract, and this script publishes what the compiler
 * says about the two:
 *
 *   1. tsc emits the declarations of the program rooted at `src/library/main.tsx`
 *      (`tsconfig.build.json`) into a staging directory. That is the whole engine; two files of it
 *      are published.
 *   2. `dist/contract.d.ts` is `src/library/contract.ts`'s declaration, as tsc wrote it.
 *   3. `dist/index.d.ts` is written from `main.tsx`'s: the function it exports by default, renamed
 *      `UIRender`; a namespace re-exporting every type of the contract under `UIRender.*`; and
 *      `export = UIRender`. `export =` is what a CommonJS consumer's default is, since the UMD exports
 *      the function itself, and the source cannot say it: Babel, which compiles the source, rejects it.
 *   4. Every other `dist/*.d.ts` is deleted. webpack keeps declaration files across its clean
 *      (`clean.keep`), so one the source no longer produces would otherwise ship.
 *
 * Each step refuses what would publish something it should not:
 *   - an import other than `react` and the contract, because a host's compiler must resolve it;
 *   - a value exported by the contract, because the runtime exports nothing but the component;
 *   - a default export that is not a function, because a namespace of types merges with a function
 *     and not with a `const`;
 *   - anything else in `main.tsx`'s declaration, because it would not be published and should not be
 *     exported.
 */
const fs = require('fs')
const path = require('path')
const { spawnSync } = require('child_process')
const ts = require('typescript')

const ROOT = path.resolve(__dirname, '..')
const DIST = path.join(ROOT, 'dist')
const CONFIG = path.join(ROOT, 'tsconfig.build.json')
const TSC = require.resolve('typescript/bin/tsc')

/** The two declarations published, by their path in the staging directory and their name in dist/. */
const ENTRY = { staged: 'library/main.d.ts', published: 'index.d.ts' }
const CONTRACT = { staged: 'library/contract.d.ts', published: 'contract.d.ts', specifier: './contract' }
/** The only package a published declaration may import: the peer every host already has. */
const PEER = 'react'
const PUBLISHED_NAME = 'UIRender'

function fail (message) {
    throw new Error(`gen-ts: ${message}`)
}

/** The staging directory, read from the config so the two cannot disagree. */
function stagingDirectory () {
    const { config, error } = ts.readConfigFile(CONFIG, ts.sys.readFile)
    if (error) fail(ts.flattenDiagnosticMessageText(error.messageText, '\n'))
    const { options } = ts.parseJsonConfigFileContent(config, ts.sys, ROOT, undefined, CONFIG)
    if (!options.outDir) fail('tsconfig.build.json sets no outDir')
    return options.outDir
}

function emit (staging) {
    fs.rmSync(staging, { recursive: true, force: true })
    const result = spawnSync(process.execPath, [TSC, '--project', CONFIG], { cwd: ROOT, encoding: 'utf8' })
    if (result.status !== 0) {
        process.stdout.write(result.stdout)
        process.stderr.write(result.stderr)
        fail(`tsc --project tsconfig.build.json exited ${result.status}`)
    }
}

function parse (file) {
    if (!fs.existsSync(file)) fail(`tsc wrote no ${path.relative(ROOT, file)}`)
    return ts.createSourceFile(file, fs.readFileSync(file, 'utf8'), ts.ScriptTarget.Latest, true)
}

const modifiersOf = node => (ts.canHaveModifiers(node) && ts.getModifiers(node)) || []
const isExported = node => modifiersOf(node).some(modifier => modifier.kind === ts.SyntaxKind.ExportKeyword)
/** A node's kind by its own name: `ts.SyntaxKind[kind]` can answer with a range marker, `FirstStatement`. */
const kindName = kind => Object.keys(ts.SyntaxKind).find(key => ts.SyntaxKind[key] === kind && !/^(First|Last)/.test(key)) || String(kind)
const describe = (sourceFile, node) => `${kindName(node.kind)} at ${path.basename(sourceFile.fileName)}:` +
    `${sourceFile.getLineAndCharacterOfPosition(node.getStart(sourceFile)).line + 1}`

/** The names the contract exports. Types only: interfaces and type aliases, nothing else at all. */
function contractExports (contract) {
    const names = []
    for (const statement of contract.statements) {
        if (ts.isImportDeclaration(statement)) {
            const specifier = statement.moduleSpecifier.text
            if (specifier !== PEER) fail(`the contract imports '${specifier}'; it may import '${PEER}' only`)
        } else if ((ts.isInterfaceDeclaration(statement) || ts.isTypeAliasDeclaration(statement)) && isExported(statement)) {
            names.push(statement.name.text)
        } else {
            fail(`the contract may declare exported types only; found ${describe(contract, statement)}. ` +
                'The runtime exports nothing but the component, so a value published here would not exist.')
        }
    }
    if (!names.length) fail('the contract exports no types')
    return names
}

/**
 * What `main.tsx`'s declaration holds: its imports, rewritten for dist/, and the declaration of its
 * default export, renamed. The JSDoc above that declaration is kept: it is the component's.
 */
function entryParts (entry) {
    const imports = []
    let exported
    const functions = []
    for (const statement of entry.statements) {
        if (ts.isImportDeclaration(statement)) {
            const specifier = statement.moduleSpecifier.text
            const clause = statement.importClause
            if (specifier === PEER) {
                // A default import of `react` compiles only with `esModuleInterop`, which a host need
                // not have; React's own types are `export =`. The namespace form works for every host.
                const local = clause && (clause.name || (clause.namedBindings && ts.isNamespaceImport(clause.namedBindings) && clause.namedBindings.name))
                if (!local || (clause.namedBindings && !ts.isNamespaceImport(clause.namedBindings))) {
                    fail(`main.tsx's declaration imports '${PEER}' as something other than one name`)
                }
                imports.push(`import * as ${local.text} from '${PEER}';`)
            } else if (specifier === CONTRACT.specifier) {
                imports.push(statement.getText(entry))
            } else {
                fail(`main.tsx's published declaration imports '${specifier}'. It may import '${PEER}' and ` +
                    `'${CONTRACT.specifier}' only, so a type it uses in its signature must come from the contract.`)
            }
        } else if (ts.isExportAssignment(statement) && !statement.isExportEquals && ts.isIdentifier(statement.expression)) {
            exported = statement.expression.text
        } else if (ts.isFunctionDeclaration(statement) && statement.name && !isExported(statement)) {
            functions.push(statement)
        } else {
            fail(`main.tsx's declaration may hold its imports and its default export only; found ${describe(entry, statement)}`)
        }
    }
    if (!exported) fail('main.tsx has no `export default` of a named declaration')
    const declarations = functions.filter(declaration => declaration.name.text === exported)
    if (!declarations.length) fail(`main.tsx's default export, \`${exported}\`, is not a function declaration`)
    if (declarations.length !== functions.length) fail('main.tsx declares functions it does not export by default')

    const text = entry.getFullText()
    const renamed = declarations.map(declaration => {
        const start = declaration.getFullStart()
        const nameStart = declaration.name.getStart(entry)
        return (text.slice(start, nameStart) + PUBLISHED_NAME + text.slice(declaration.name.getEnd(), declaration.getEnd()))
            .replace(/^\s*\n/, '')
    })
    return { imports, declarations: renamed }
}

function writeIndex ({ imports, declarations }, typeNames) {
    return [
        '// Written by scripts/gen-ts.js from src/library/main.tsx and src/library/contract.ts (§9.6-E4).',
        '// Do not edit: change the source, then run `npm run gen-ts`.',
        ...imports,
        `import * as Contract from '${CONTRACT.specifier}';`,
        ...declarations,
        '/** The published types, as `UIRender.<Name>`, and as named imports with `esModuleInterop`. */',
        `declare namespace ${PUBLISHED_NAME} {`,
        ...typeNames.map(name => `    export import ${name} = Contract.${name};`),
        '}',
        `export = ${PUBLISHED_NAME};`,
        '',
    ].join('\n')
}

function main () {
    const staging = stagingDirectory()
    emit(staging)

    const contractFile = path.join(staging, CONTRACT.staged)
    const typeNames = contractExports(parse(contractFile))
    const index = writeIndex(entryParts(parse(path.join(staging, ENTRY.staged))), typeNames)

    fs.mkdirSync(DIST, { recursive: true })
    const written = new Set([ENTRY.published, CONTRACT.published])
    for (const file of fs.readdirSync(DIST)) {
        if (file.endsWith('.d.ts') && !written.has(file)) fs.rmSync(path.join(DIST, file))
    }
    fs.writeFileSync(path.join(DIST, ENTRY.published), index)
    fs.copyFileSync(contractFile, path.join(DIST, CONTRACT.published))
    console.log(`gen-ts: dist/${ENTRY.published} and dist/${CONTRACT.published}, ${typeNames.length} published types`)
}

if (require.main === module) {
    try {
        main()
    } catch (error) {
        console.error(error.message)
        process.exitCode = 1
    }
}

module.exports = { contractExports, entryParts, writeIndex }
