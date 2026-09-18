/**
 * Reads the vocabulary unions out of the PUBLISHED type surface, so the contract suite can compare
 * three things instead of two: the engine's live `FIELD` groups, `meta.schema.json`'s enums, and the
 * TypeScript a consumer actually gets.
 *
 * WHY PARSE RATHER THAN IMPORT. The types are types — there is no runtime value to read, and Jest
 * strips them before it ever sees the file. `typescript` is already a devDependency, so the compiler
 * API is the cheap, non-brittle way to ask the source what it declares. A regex over the text would
 * also "work" until the day someone reformats the union across lines.
 *
 * WHY THIS IS A CHECK AND NOT A GENERATOR. Deriving either artifact from the other destroys what the
 * other one is for: `'Row' | 'Col' | string` collapses to `string`, so a schema-generated type lists
 * 46 view names and accepts anything (the list is decorative); and a type-derived schema loses both
 * the suggested vocabularies and `metaVersion`'s pattern, which are the schema's whole value to a
 * host. So both are hand-authored and this is the link between them.
 */
const fs = require('fs')
const path = require('path')
const ts = require('typescript')

const TYPES_PATH = path.resolve(__dirname, '../../library/types/UIRender.tsx')

/** `(string & {})` — the branch that keeps a union open without collapsing its literals. */
const isOpenBranch = (node) => {
    // Written with parentheses in the source, so the AST node is a ParenthesizedType around the
    // intersection. Unwrap first: without this the detector silently reports every union as closed.
    while (ts.isParenthesizedTypeNode(node)) node = node.type
    return ts.isIntersectionTypeNode(node)
        && node.types.length === 2
        && node.types[0].kind === ts.SyntaxKind.StringKeyword
        && ts.isTypeLiteralNode(node.types[1])
        && node.types[1].members.length === 0
}

/**
 * Every `export type <Name> = 'a' | 'b' | … | (string & {})` in the published surface, as
 * `{ [name]: { literals: string[], isOpen: boolean } }`.
 */
function readVocabularyUnions (filePath = TYPES_PATH) {
    const source = ts.createSourceFile(
        filePath,
        fs.readFileSync(filePath, 'utf8'),
        ts.ScriptTarget.Latest,
        true,
        ts.ScriptKind.TSX,
    )

    const found = {}
    const visit = (node) => {
        if (ts.isTypeAliasDeclaration(node) && ts.isUnionTypeNode(node.type)) {
            const literals = []
            let isOpen = false
            for (const member of node.type.types) {
                if (ts.isLiteralTypeNode(member) && ts.isStringLiteral(member.literal)) {
                    literals.push(member.literal.text)
                } else if (isOpenBranch(member)) {
                    isOpen = true
                }
            }
            if (literals.length) found[node.name.text] = { literals: literals.sort(), isOpen }
        }
        ts.forEachChild(node, visit)
    }
    visit(source)
    return found
}

module.exports = { readVocabularyUnions, TYPES_PATH }
