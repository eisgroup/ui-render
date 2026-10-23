/**
 * Generates `docs/BUILT-IN-PHRASES.md`, the reference a host's translators work from: every text
 * UI Render writes itself, by the id a host's `translate` is asked for it under (`ui-render:<ID>`),
 * with its English text and where it shows.
 *
 * Everything on the page comes from `BUILT_IN_PHRASES` in `src/core/utils/phrases.ts`, the table the
 * widget falls back to when a host has no translation. The table is read as source text, since no
 * script can load the TypeScript it lives in, so each entry must read `ID: 'English text', // where it
 * shows`, and any other line in the table fails the generator rather than going unlisted.
 * `scripts/__tests__/phrase-reference.contract.test.js` checks the page, and checks what this script
 * parses against the real table, in each of the four jest legs.
 *
 * The published type `UIRenderPhraseId` (`src/library/contract.ts`) lists the same ids, and
 * `npm run typecheck` fails while the two differ (`src/library/contract.agreement.ts`).
 *
 * Usage (mirrors scripts/generate-view-reference.js):
 *   node scripts/generate-phrase-reference.js            # write the page
 *   node scripts/generate-phrase-reference.js --check    # report drift, exit 1, change nothing
 */
const fs = require('fs')
const path = require('path')

const ROOT = path.resolve(__dirname, '..')
const OUTPUT_FILE = 'docs/BUILT-IN-PHRASES.md'
const GENERATOR = 'scripts/generate-phrase-reference.js'
const SOURCE = 'src/core/utils/phrases.ts'
const WRITE_COMMAND = 'npm run docs:phrases'
const NAMESPACE = 'ui-render'

/** UPPER_SNAKE_CASE: no `:` or `.`, which an i18next-based host reads as the namespace and key separators. */
const ID = /^[A-Z][A-Z0-9]*(_[A-Z0-9]+)*$/
// The id is read in any case so that a lowercase one fails by name below. The comment is optional here
// for the same reason: an entry without one is read, and then refused.
const ENTRY_LINE = /^\s*([A-Za-z0-9_$]+)\s*:\s*'((?:[^'\\]|\\.)*)'\s*,\s*(?:\/\/\s*(.*?))?\s*$/
const COMMENT_LINE = /^\s*(\/\/.*)?$/

/**
 * The lines of the `BUILT_IN_PHRASES = {…} as const` object literal in `source`, each with its line
 * number in `source`.
 */
function tableLines (source) {
    const opening = source.match(/^export const BUILT_IN_PHRASES = \{$/m)
    if (!opening) {
        throw new Error(`${SOURCE}: no top-level \`export const BUILT_IN_PHRASES = {\` found.`
            + ` The table moved or changed shape: update ${GENERATOR} with it.`)
    }
    const from = opening.index + opening[0].length
    // Entries are indented, so the first line-initial `}` closes the literal.
    const to = source.indexOf('\n} as const', from)
    if (to === -1) throw new Error(`${SOURCE}: \`BUILT_IN_PHRASES\` is not closed by a line-initial \`} as const\`.`)
    // The first piece is what follows `{` on the opening line, so the pieces count from that line.
    const openingLine = source.slice(0, from).split('\n').length
    return source.slice(from, to).split('\n').map((text, index) => ({ text, number: openingLine + index }))
}

/**
 * The phrases of `source`, in the order it lists them. A line that is neither an entry nor a comment
 * throws, and so do an id that is not UPPER_SNAKE_CASE, an id listed twice, an empty text, and an entry
 * with no comment saying where it shows: translators need that to translate one word.
 */
function parsePhrases (source) {
    const phrases = []
    tableLines(source).forEach(({ text: line, number }) => {
        if (COMMENT_LINE.test(line)) return
        const at = `${SOURCE}:${number}`
        const match = line.match(ENTRY_LINE)
        if (!match) {
            throw new Error(`${at}: cannot read this entry of \`BUILT_IN_PHRASES\`: ${line.trim()}\n`
                + 'Every entry must read `ID: \'English text\', // where it shows`.'
                + ` Widen ENTRY_LINE in ${GENERATOR} deliberately; do not let an entry go unlisted.`)
        }
        const [, id, quoted, where] = match
        const text = quoted.replace(/\\(.)/g, '$1')
        if (!ID.test(id)) throw new Error(`${at}: \`${id}\` is not UPPER_SNAKE_CASE.`)
        if (phrases.some(phrase => phrase.id === id)) throw new Error(`${at}: \`${id}\` is listed twice.`)
        if (!text.trim()) throw new Error(`${at}: \`${id}\` has no English text.`)
        if (!where) throw new Error(`${at}: \`${id}\` has no comment saying where it shows.`)
        phrases.push({ id, text, where })
    })
    if (!phrases.length) throw new Error(`${SOURCE}: \`BUILT_IN_PHRASES\` parsed to no entries.`)
    return phrases
}

const readPhrases = () => parsePhrases(fs.readFileSync(path.join(ROOT, SOURCE), 'utf8'))

/** A table cell: a pipe would end it. */
const cell = text => text.replace(/\|/g, '\\|')

function renderMarkdown (phrases) {
    const sorted = [...phrases].sort((a, b) => (a.id < b.id ? -1 : 1))
    const lines = [
        '<!--',
        `  GENERATED FILE — DO NOT EDIT. Run \`${WRITE_COMMAND}\` to regenerate.`,
        `  The ids, English texts and places come from BUILT_IN_PHRASES in ${SOURCE}.`,
        `  Generator: ${GENERATOR}.`,
        '-->',
        '',
        '# Built-in phrases',
        '',
        'The texts UI Render writes itself, as opposed to the labels a `meta.json` gives it. Your `translate`',
        `prop is asked for each as \`${NAMESPACE}:<ID>\`: register a \`${NAMESPACE}\` namespace in your i18n, with the`,
        'ids below as its keys. The README\'s section "Translating the built-in texts (consumer)" shows an',
        'example.',
        '',
        `Where your \`translate\` answers with the key itself (\`${NAMESPACE}:TOTAL\`), with the key without its`,
        'namespace (`TOTAL`), or with an empty string, UI Render shows the English text below. Without a',
        `\`${NAMESPACE}\` namespace, every one of them shows in English.`,
        '',
        'A `{name}` in a text is a placeholder that UI Render fills after your translation comes back:',
        'keep it in single braces where your translation needs the value.',
        '',
        `**This page is generated.** Run \`${WRITE_COMMAND}\` after changing \`BUILT_IN_PHRASES\` in`,
        `\`${SOURCE}\`. The package's types list the same ids as \`UIRender.UIRenderPhraseId\`.`,
        '',
        `## Phrases (${sorted.length})`,
        '',
        '| Id | English text | Where it shows |',
        '| --- | --- | --- |',
        ...sorted.map(({ id, text, where }) => `| \`${id}\` | ${cell(text)} | ${cell(where)} |`),
        '',
    ]
    return lines.join('\n')
}

function main (argv) {
    const checkOnly = argv.includes('--check')
    const generated = renderMarkdown(readPhrases())
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

module.exports = { parsePhrases, readPhrases, renderMarkdown, OUTPUT_FILE, WRITE_COMMAND }

if (require.main === module) {
    try {
        process.exitCode = main(process.argv.slice(2))
    } catch (error) {
        console.error(`${GENERATOR}: ${error.message}`)
        process.exitCode = 1
    }
}
