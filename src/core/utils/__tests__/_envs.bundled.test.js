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
 * This suite applies that rewrite with a tiny babel visitor (scripts/fixtures/bundler-define.mjs), evaluates the
 * result in a realm with NO `process`, and asserts the flags the bundler was told to produce.
 * scripts/test-env-flags.js proves the same thing against the real webpack configs; this is the fast unit-level
 * half of it.
 */
const fs = require('fs')
const path = require('path')
const vm = require('vm')
const { execFileSync } = require('child_process')

const ROOT = path.resolve(__dirname, '../../../..')
const SOURCE = path.resolve(__dirname, '../_envs.ts')
const DEFINE = path.join(ROOT, 'scripts/fixtures/bundler-define.mjs')

/** Every set of defines the tests below compile `_envs.ts` with. */
const VARIANTS = [
    { NODE_ENV: 'production' },
    { NODE_ENV: 'development' },
    { NODE_ENV: 'production', REACT_APP_HOMEPAGE: '/ui-render' },
    { NODE_ENV: 'production', REACT_APP_HOMEPAGE: '' },
]

let compiled

// One Node process compiles them all, and outside jest: Babel 8 is ES modules only, which jest's module registry
// cannot load (the script says more).
beforeAll(() => {
    const variants = Object.fromEntries(VARIANTS.map(defines => [JSON.stringify(defines), defines]))
    compiled = JSON.parse(execFileSync(process.execPath, [DEFINE, SOURCE, JSON.stringify(variants)], { cwd: ROOT, encoding: 'utf8' }))
})

function bundle (nodeEnv, extraDefines = {}) {
    const key = JSON.stringify({ NODE_ENV: nodeEnv, ...extraDefines })
    if (!(key in compiled)) throw new Error(`no variant compiled for ${key}: add it to VARIANTS`)
    return compiled[key]
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
