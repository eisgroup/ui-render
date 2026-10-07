// A bundler's define step in miniature, for src/core/utils/__tests__/_envs.bundled.test.js: Babel compiles a
// module with babel.config.js, and a small visitor turns each defined `process.env.X` into its literal and what is
// left of `process.env` into an empty object, as webpack's DefinePlugin and dotenv-webpack leave them.
//
// It runs in a Node process of its own. Babel 8 is published as ES modules only, which Node can require and
// jest's module registry cannot, short of running every suite with --experimental-vm-modules.
//
// Usage: node bundler-define.mjs SOURCE VARIANTS, where VARIANTS is JSON naming each variant's defines. It
// prints the same names, as JSON, each mapped to the code compiled with that variant's defines.
import { readFileSync } from 'node:fs'
import { transformSync } from '@babel/core'

/** Each defined key becomes a literal, the rest of `process.env` a stub. */
function mimicBundlerDefine (defines) {
    return ({ types: t }) => ({
        name: 'mimic-bundler-define',
        visitor: {
            // Traversal is top-down, so `process.env.X` is seen whole before its inner `process.env`.
            MemberExpression (memberPath) {
                const defined = Object.keys(defines).find(key => memberPath.matchesPattern(`process.env.${key}`))
                if (defined) {
                    memberPath.replaceWith(t.stringLiteral(defines[defined]))
                } else if (memberPath.matchesPattern('process.env')) {
                    memberPath.replaceWith(t.objectExpression([]))
                }
            },
        },
    })
}

const [source, variants] = process.argv.slice(2)
const code = readFileSync(source, 'utf8')
const compiled = {}
for (const [name, defines] of Object.entries(JSON.parse(variants))) {
    compiled[name] = transformSync(code, {
        filename: source,
        // CommonJS out, which the suite evaluates: Babel 8 assumes a caller it is not told about runs ES modules.
        caller: { name: 'bundler-define', supportsStaticESM: false },
        // babel.config.js still supplies the presets; these two only stop @babel/core querying a stale
        // browserslist DB for top-level targets it does not use.
        targets: { node: 'current' },
        browserslistConfigFile: false,
        // Comments dropped so the suite's "no process.env left" check reads code, not the prose explaining it.
        comments: false,
        plugins: [mimicBundlerDefine(defines)],
    }).code
}
process.stdout.write(JSON.stringify(compiled))
