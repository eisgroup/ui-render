/** @jest-environment node */
/**
 * `_envs.ts` AS A BUNDLER LEAVES IT.
 *
 * Every other `_envs` suite runs the source against Node's real `process.env`, where `ENV.NODE_ENV` and
 * `process.env.NODE_ENV` are the same read -- so none of them can tell the two apart, and that is exactly the
 * difference that ships. A bundler substitutes the LITERAL member expression `process.env.NODE_ENV` (webpack's
 * `mode`, DefinePlugin, esbuild/Vite `define`) and stubs what is left of `process.env` (dotenv-webpack makes it
 * "MISSING_ENV_VAR", the `typeof process` guard then yields `{}`). Code that reads `ENV.NODE_ENV` gets a property
 * of that stub: undefined, so every mode flag is false in a browser.
 *
 * This suite applies that rewrite with a tiny babel visitor, evaluates the result in a realm with NO `process`,
 * and asserts the flags the bundler was told to produce. scripts/test-env-flags.js proves the same thing against
 * the real webpack configs; this is the fast unit-level half of it.
 */
const fs = require('fs')
const path = require('path')
const vm = require('vm')
const babel = require('@babel/core')

const SOURCE = path.resolve(__dirname, '../_envs.ts')

/** A bundler's define step in miniature: each defined key becomes a literal, the rest of `process.env` a stub. */
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

function bundle (nodeEnv, extraDefines = {}) {
    const { code } = babel.transformSync(fs.readFileSync(SOURCE, 'utf8'), {
        filename: SOURCE,
        // babel.config.js still supplies the presets; these two only stop @babel/core querying a stale
        // browserslist DB for top-level targets it does not use (the warning is noise inside a test body).
        targets: { node: 'current' },
        browserslistConfigFile: false,
        // Comments dropped so the "no process.env left" check below reads code, not the prose explaining it.
        comments: false,
        plugins: [mimicBundlerDefine({ NODE_ENV: nodeEnv, ...extraDefines })],
    })
    return code
}

/** Evaluate the rewritten module the way a browser would run it: a `window`, and no `process` at all. */
function evaluateInBrowserRealm (code) {
    const realm = vm.createContext({ window: {} })
    const typeofProcess = vm.runInContext('typeof process', realm)
    const module = { exports: {} }
    const dependencies = { './constants': require('../constants') }
    const localRequire = request => {
        if (!(request in dependencies)) throw new Error(`_envs.ts gained an import this suite does not provide: ${request}`)
        return dependencies[request]
    }
    vm.runInContext(`(function (exports, require, module) {\n${code}\n})`, realm)(module.exports, localRequire, module)
    return { subject: module.exports, typeofProcess }
}

describe('_envs after a bundler has rewritten process.env', () => {
    it('the rewrite leaves no process.env behind, so the realm below really has nothing to fall back on', () => {
        expect(fs.readFileSync(SOURCE, 'utf8')).toMatch(/process\.env/) // not vacuous: there was something to rewrite
        expect(bundle('production')).not.toMatch(/process\.env/)
    })

    it.each([
        ['production', { __PROD__: true, __DEV__: false }],
        ['development', { __PROD__: false, __DEV__: true }],
    ])('a bundle built for NODE_ENV=%s reports that mode with no process global', (nodeEnv, flags) => {
        const { subject, typeofProcess } = evaluateInBrowserRealm(bundle(nodeEnv))

        expect(typeofProcess).toBe('undefined')
        expect(subject.NODE_ENV).toBe(nodeEnv)
        expect(subject).toMatchObject(flags)
        // The rest of the module still takes its no-process fallbacks.
        expect(subject.ENV).toEqual({})
        expect(subject.HOMEPAGE).toBeUndefined()
    })

    it('takes the homepage a bundler defines, and leaves it undefined when nothing defines it', () => {
        expect(evaluateInBrowserRealm(bundle('production', { REACT_APP_HOMEPAGE: '/ui-render' })).subject.HOMEPAGE)
            .toBe('/ui-render')
        expect(evaluateInBrowserRealm(bundle('production', { REACT_APP_HOMEPAGE: '' })).subject.HOMEPAGE).toBe('')
        expect(evaluateInBrowserRealm(bundle('production')).subject.HOMEPAGE).toBeUndefined()
    })
})
