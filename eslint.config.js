/**
 * THE LINT CONFIGURATION, ESLint 9's flat config (`npm run lint:js`, which runs it with
 * `--max-warnings 0`).
 *
 * It was `eslintConfig` in `package.json` until 2026-10-06, on ESLint 8, extending
 * `eslint-config-react-app`. ESLint 8 is out of support, and `eslint-config-react-app` was never
 * ported to ESLint 9 (its own peer is `eslint@^8`), so its rules are carried over here as they were:
 * the same rules at the same levels, with the plugins they come from installed directly. Left out are
 * the three `flowtype/*` rules, for a syntax nothing in `src` uses. ESLint 10 is out as well, but
 * `eslint-plugin-react`, `-import` and `-jsx-a11y` declare peers up to 9, the line still maintained.
 *
 * Two defaults changed in ESLint 9 and are pinned to what ESLint 8 did, so the move changes no
 * verdict: `no-unused-vars` ignores an unused `catch` binding (`caughtErrors: 'none'`), and
 * `no-useless-computed-key` leaves class members alone (`enforceForClassMembers: false`).
 *
 * One rule is stricter than it was: `react-hooks/exhaustive-deps` checks the effects of the hooks this
 * code defines as well, `useBeforePaintEffect` and `useCommitEffect` (a layout effect in a browser, a
 * plain one on the server). Their dependencies went unchecked; it found one effect to restate.
 *
 * ESLint 9 also reports an `eslint-disable` comment that suppresses nothing, which ESLint 8 did not:
 * 81 such comments were deleted with the move, 74 of them a `no-undef` before `global`, which the
 * `node` globals have always defined, and 4 more for rules nothing enables.
 *
 * CommonJS on purpose: `scripts/__tests__/wrapper-prop-reference.contract.test.js` requires this file
 * to check that the import guard below is still configured.
 */
const confusingBrowserGlobals = require('confusing-browser-globals')
const globals = require('globals')
const importPlugin = require('eslint-plugin-import')
const jsxA11y = require('eslint-plugin-jsx-a11y')
const react = require('eslint-plugin-react')
const reactHooks = require('eslint-plugin-react-hooks')
const tseslint = require('typescript-eslint')

/** `no-unused-vars` as `eslint-config-react-app` set it, and ESLint 8's default for `catch`. */
const UNUSED_VARS = ['warn', { args: 'none', ignoreRestSiblings: true, caughtErrors: 'none' }]
const UNUSED_EXPRESSIONS = ['error', { allowShortCircuit: true, allowTernary: true, allowTaggedTemplates: true }]

/** `eslint-config-react-app`'s rules (`index.js`, `base.js`), apart from `flowtype/*`. */
const REACT_APP_RULES = {
    'array-callback-return': 'warn',
    'default-case': ['warn', { commentPattern: '^no default$' }],
    'dot-location': ['warn', 'property'],
    eqeqeq: ['warn', 'smart'],
    'new-parens': 'warn',
    'no-array-constructor': 'warn',
    'no-caller': 'warn',
    'no-cond-assign': ['warn', 'except-parens'],
    'no-const-assign': 'warn',
    'no-control-regex': 'warn',
    'no-delete-var': 'warn',
    'no-dupe-args': 'warn',
    'no-dupe-class-members': 'warn',
    'no-dupe-keys': 'warn',
    'no-duplicate-case': 'warn',
    'no-empty-character-class': 'warn',
    'no-empty-pattern': 'warn',
    'no-eval': 'warn',
    'no-ex-assign': 'warn',
    'no-extend-native': 'warn',
    'no-extra-bind': 'warn',
    'no-extra-label': 'warn',
    'no-fallthrough': 'warn',
    'no-func-assign': 'warn',
    'no-implied-eval': 'warn',
    'no-invalid-regexp': 'warn',
    'no-iterator': 'warn',
    'no-label-var': 'warn',
    'no-labels': ['warn', { allowLoop: true, allowSwitch: false }],
    'no-lone-blocks': 'warn',
    'no-loop-func': 'warn',
    'no-mixed-operators': ['warn', {
        groups: [
            ['&', '|', '^', '~', '<<', '>>', '>>>'],
            ['==', '!=', '===', '!==', '>', '>=', '<', '<='],
            ['&&', '||'],
            ['in', 'instanceof'],
        ],
        allowSamePrecedence: false,
    }],
    'no-multi-str': 'warn',
    'no-global-assign': 'warn',
    'no-unsafe-negation': 'warn',
    'no-new-func': 'warn',
    'no-new-object': 'warn',
    'no-new-symbol': 'warn',
    'no-new-wrappers': 'warn',
    'no-obj-calls': 'warn',
    'no-octal': 'warn',
    'no-octal-escape': 'warn',
    'no-redeclare': 'warn',
    'no-regex-spaces': 'warn',
    'no-restricted-syntax': ['warn', 'WithStatement'],
    'no-script-url': 'warn',
    'no-self-assign': 'warn',
    'no-self-compare': 'warn',
    'no-sequences': 'warn',
    'no-shadow-restricted-names': 'warn',
    'no-sparse-arrays': 'warn',
    'no-template-curly-in-string': 'warn',
    'no-this-before-super': 'warn',
    'no-throw-literal': 'warn',
    'no-undef': 'error',
    'no-restricted-globals': ['error', ...confusingBrowserGlobals],
    'no-unreachable': 'warn',
    'no-unused-expressions': UNUSED_EXPRESSIONS,
    'no-unused-labels': 'warn',
    'no-unused-vars': UNUSED_VARS,
    'no-use-before-define': ['warn', { functions: false, classes: false, variables: false }],
    'no-useless-computed-key': ['warn', { enforceForClassMembers: false }],
    'no-useless-concat': 'warn',
    'no-useless-constructor': 'warn',
    'no-useless-escape': 'warn',
    'no-useless-rename': ['warn', { ignoreDestructuring: false, ignoreImport: false, ignoreExport: false }],
    'no-with': 'warn',
    'no-whitespace-before-property': 'warn',
    'react-hooks/exhaustive-deps': ['warn', { additionalHooks: '^(useBeforePaintEffect|useCommitEffect)$' }],
    'require-yield': 'warn',
    'rest-spread-spacing': ['warn', 'never'],
    strict: ['warn', 'never'],
    'unicode-bom': ['warn', 'never'],
    'use-isnan': 'warn',
    'valid-typeof': 'warn',
    'no-restricted-properties': ['error',
        {
            object: 'require',
            property: 'ensure',
            message: 'Please use import() instead. More info: https://facebook.github.io/create-react-app/docs/code-splitting',
        },
        {
            object: 'System',
            property: 'import',
            message: 'Please use import() instead. More info: https://facebook.github.io/create-react-app/docs/code-splitting',
        },
    ],
    'getter-return': 'warn',

    'import/first': 'error',
    'import/no-amd': 'error',
    'import/no-anonymous-default-export': 'warn',
    'import/no-webpack-loader-syntax': 'error',

    'react/jsx-uses-vars': 'warn',
    'react/jsx-uses-react': 'warn',
    'react/forbid-foreign-prop-types': ['warn', { allowInPropTypes: true }],
    'react/jsx-no-comment-textnodes': 'warn',
    'react/jsx-no-duplicate-props': 'warn',
    'react/jsx-no-target-blank': 'warn',
    'react/jsx-no-undef': 'error',
    'react/jsx-pascal-case': ['warn', { allowAllCaps: true, ignore: [] }],
    'react/no-danger-with-children': 'warn',
    'react/no-direct-mutation-state': 'warn',
    'react/no-is-mounted': 'warn',
    'react/no-typos': 'error',
    'react/require-render-return': 'error',
    'react/style-prop-object': 'warn',

    'jsx-a11y/alt-text': 'warn',
    'jsx-a11y/anchor-has-content': 'warn',
    'jsx-a11y/anchor-is-valid': ['warn', { aspects: ['noHref', 'invalidHref'] }],
    'jsx-a11y/aria-activedescendant-has-tabindex': 'warn',
    'jsx-a11y/aria-props': 'warn',
    'jsx-a11y/aria-proptypes': 'warn',
    'jsx-a11y/aria-role': ['warn', { ignoreNonDOM: true }],
    'jsx-a11y/aria-unsupported-elements': 'warn',
    'jsx-a11y/heading-has-content': 'warn',
    'jsx-a11y/iframe-has-title': 'warn',
    'jsx-a11y/img-redundant-alt': 'warn',
    'jsx-a11y/no-access-key': 'warn',
    'jsx-a11y/no-distracting-elements': 'warn',
    'jsx-a11y/no-redundant-roles': 'warn',
    'jsx-a11y/role-has-required-aria-props': 'warn',
    'jsx-a11y/role-supports-aria-props': 'warn',
    'jsx-a11y/scope': 'warn',

    'react-hooks/rules-of-hooks': 'error',
}

/**
 * The React Compiler's rules, which eslint-plugin-react-hooks 7 adds to its presets, at the presets' levels.
 * On since 2026-10-08, the owners' call, after what they found was fixed: 18 findings in `Dropdown`,
 * `InputNumber`, `PieChart`, `InputDate`, `src/library/main.tsx` and a test. Two are suppressed where the
 * comment says why the rule is wrong there.
 *
 * `react-hooks/refs` stays off until its findings are fixed: 83 reads and writes of a ref during a render,
 * 53 of them in `TableView` and `Tabs`.
 */
const REACT_COMPILER_RULES = {
    'react-hooks/static-components': 'error',
    'react-hooks/use-memo': 'error',
    'react-hooks/void-use-memo': 'error',
    'react-hooks/preserve-manual-memoization': 'error',
    'react-hooks/incompatible-library': 'warn',
    'react-hooks/immutability': 'error',
    'react-hooks/globals': 'error',
    'react-hooks/set-state-in-effect': 'error',
    'react-hooks/error-boundaries': 'error',
    'react-hooks/purity': 'error',
    'react-hooks/set-state-in-render': 'error',
    'react-hooks/unsupported-syntax': 'warn',
    'react-hooks/config': 'error',
    'react-hooks/gating': 'error',
}

/** `eslint-config-react-app`'s TypeScript override: tsc covers some rules, typescript-eslint others. */
const REACT_APP_TYPESCRIPT_RULES = {
    'default-case': 'off',
    'no-dupe-class-members': 'off',
    'no-undef': 'off',
    '@typescript-eslint/consistent-type-assertions': 'warn',
    'no-array-constructor': 'off',
    '@typescript-eslint/no-array-constructor': 'warn',
    'no-redeclare': 'off',
    '@typescript-eslint/no-redeclare': 'warn',
    'no-use-before-define': 'off',
    '@typescript-eslint/no-use-before-define': ['warn', { functions: false, classes: false, variables: false, typedefs: false }],
    'no-unused-expressions': 'off',
    '@typescript-eslint/no-unused-expressions': UNUSED_EXPRESSIONS,
    'no-unused-vars': 'off',
    '@typescript-eslint/no-unused-vars': UNUSED_VARS,
    'no-useless-constructor': 'off',
    '@typescript-eslint/no-useless-constructor': 'warn',
}

// THE IMPORT GUARD (UPGRADE-PLAN §9.7-F1, §9.6-E5 and §9.9-H5), as it was in `package.json`.
const LAYERS = '(§9.9-H5; `state` since §9.3 step 2): `utils` imports nothing above it; `state` may import'
    + ' `utils`; `components` may import `state`/`utils`; `modules` may import `components`/`state`/`utils`;'
    + ' the engine may import anything in core; core never imports the demo. See docs/UPGRADE-PLAN.md §9.9-H5.'
const SEMANTIC = 'semantic-ui-react is not a dependency of this project: the exit completed at UPGRADE-PLAN 9.7-F1'
    + ' step 3, and step 3 1/2 removed the package. Nothing in src may import it, including src/core/components,'
    + ' which used to be the one place that could. See docs/SUPPORTED-PROPS.md.'
const PROP_TYPES = 'prop-types is not a dependency of this project: UPGRADE-PLAN 9.6-E5 deleted every propTypes'
    + ' declaration and removed the package, and the TypeScript props types document what they declared. It is'
    + ' still installed, as a dependency of development packages, so an import would resolve and bundle it again.'
const PATHS = [{ name: 'semantic-ui-react', message: SEMANTIC }, { name: 'prop-types', message: PROP_TYPES }]
const SEMANTIC_DEEP = { group: ['semantic-ui-react/*'], message: SEMANTIC }
const NO_DEMO = { group: ['**/demo', '**/demo/**'], message: 'core must never import the demo — the dependency runs the other way. Layer direction ' + LAYERS }

/** A layer rule: what `from` may not import, with the message saying where it belongs instead. */
const layer = (target, message) => ({ group: [`**/${target}`, `**/${target}/**`], message })
const notAbove = (from, target) => layer(target, `core/${from} must not import core/${target}. Layer direction ${LAYERS}`)

/** One `no-restricted-imports` entry per layer, in the order ESLint applies them: a later match wins. */
const guard = (files, patterns) => ({ files, rules: { 'no-restricted-imports': ['error', { paths: PATHS, patterns }] } })

module.exports = [
    {
        files: ['src/**/*.{js,jsx,ts,tsx}'],
        languageOptions: {
            ecmaVersion: 'latest',
            sourceType: 'module',
            parserOptions: { ecmaFeatures: { jsx: true } },
            globals: { ...globals.browser, ...globals.commonjs, ...globals.jest, ...globals.node },
        },
        plugins: { import: importPlugin, 'jsx-a11y': jsxA11y, react, 'react-hooks': reactHooks },
        settings: { react: { version: 'detect' } },
        rules: { ...REACT_APP_RULES, ...REACT_COMPILER_RULES },
    },
    {
        files: ['src/**/*.{ts,tsx}'],
        languageOptions: {
            parser: tseslint.parser,
            parserOptions: { ecmaFeatures: { jsx: true }, warnOnUnsupportedTypeScriptVersion: true },
        },
        plugins: { '@typescript-eslint': tseslint.plugin },
        rules: REACT_APP_TYPESCRIPT_RULES,
    },

    guard(['src/**/*.js', 'src/**/*.jsx', 'src/**/*.ts', 'src/**/*.tsx'], ['semantic-ui-react/*']),
    guard(['src/core/**'], [SEMANTIC_DEEP, NO_DEMO]),
    guard(['src/core/modules/**'], [SEMANTIC_DEEP, NO_DEMO, layer('engine',
        'core/modules must not import core/engine. §9.3 step 2 removed the last two such imports, from'
        + ' modules/form/utils, by moving the registries both sides share into core/state: put a shared registry'
        + ' there. Layer direction ' + LAYERS)]),
    guard(['src/core/components/**'], [SEMANTIC_DEEP, NO_DEMO, layer('modules',
        'core/components must not import core/modules — put the shared value in core/utils instead, which is how'
        + ' the ISO_8601 regexes were resolved at H5. Layer direction ' + LAYERS), notAbove('components', 'engine')]),
    guard(['src/core/utils/**'], [SEMANTIC_DEEP, NO_DEMO, notAbove('utils', 'components'), notAbove('utils', 'modules'),
        notAbove('utils', 'engine'), layer('state',
            '`utils` imports nothing above it, and `state` is above it (§9.3 step 2). `state` holds the registries'
            + ' the layers above share (§9.3 step 2) and sits just above `utils`: it may import `utils` and nothing'
            + ' else. Putting a component, a module or the engine below it would recreate the `engine` <->'
            + ' `modules/form` cycle this layer exists to remove.')]),
    guard(['src/core/state/**'], [SEMANTIC_DEEP, NO_DEMO, notAbove('state', 'components'), notAbove('state', 'modules'),
        notAbove('state', 'engine')]),
    guard(['src/**/__tests__/**'], [SEMANTIC_DEEP]),
]
