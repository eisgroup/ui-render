const path = require('path')

const base = require('./jest.config')

/**
 * React 16.14 floor harness (docs/UPGRADE-PLAN.md §8, "CI coverage of the declared peer range").
 *
 * `peerDependencies` declares a 16.14 floor, but `npm ci` installs exactly one React, so the default
 * suite only ever exercises 18. This runs the same suite against 16.14 without touching the installed
 * react/react-dom: the floor lives in an install-only fixture package (scripts/fixtures/react16-floor),
 * linked from the root devDependencies as `react-16-floor` so a plain `npm ci` installs it, and mapped
 * in here at resolve time. The harness code (this file's setup and stub) deliberately sits OUTSIDE that
 * package, in scripts/fixtures/react16/, because Node resolves `require('react')` from the requiring
 * file's own directory upwards -- code living next to the fixture's nested node_modules would load
 * React 16 by location even with no mapping in force, and the version self-check below would then be
 * incapable of detecting a broken mapping.
 *
 * Why a `file:` fixture and not aliased devDependencies (the trick react-types-16/react-types-17 use for
 * @types/react): react-dom@16.14.0 declares `peer react@^16.14.0`, and npm resolves a root-level
 * package's peer against the hoisted node_modules/react -- which React 18 owns. Aliasing the directory
 * name does not change that (`react-dom-16` still asks for `react`), so `npm install` aborts with
 * ERESOLVE and no `overrides` entry can fix it, because the peer must be satisfied at the same level.
 * @types/react has no peers, which is the only reason the type matrix gets away with plain aliases.
 * The fixture sidesteps it: npm nests react/react-dom/scheduler 16 inside the fixture directory, so
 * nothing competes for the hoisted slot and no --legacy-peer-deps is needed (unlike react-19-advisory).
 *
 * Run it with `npm run test:react16`, never with bare `jest`: bare `jest` silently uses the installed
 * React 18 and reports green. scripts/fixtures/react16/setup.js asserts the loaded version inside every
 * worker for exactly that reason.
 */
const REACT_FLOOR = '16.14.0'
const SCHEDULER_FLOOR_LINE = '0.19.'
const FIXTURE_PACKAGE = 'react-16-floor'

function fixtureRoot () {
    try {
        return path.dirname(require.resolve(`${FIXTURE_PACKAGE}/package.json`))
    } catch (error) {
        throw new Error(
            `${FIXTURE_PACKAGE} is not installed. It is a devDependency linked to`
            + ' scripts/fixtures/react16-floor -- run `npm ci` after pulling the React 16 floor harness.',
            { cause: error }
        )
    }
}

/**
 * Same guard as assertReactTypesMajor() in scripts/test-public-types.js: a pinned slot must stay pinned.
 * Resolving from the fixture directory makes Node search scripts/fixtures/react16-floor/node_modules
 * first and only then the ancestors, so the version assertion is what stops a fallback to the
 * repository's own React 18 -- in the parent process, before jest starts, rather than as a resolver
 * stack in a worker.
 */
function floorPackage (name, expectedVersion, root) {
    const manifestPath = require.resolve(`${name}/package.json`, { paths: [root] })
    const { version } = require(manifestPath)
    if (!version.startsWith(expectedVersion)) {
        throw new Error(
            `scripts/fixtures/react16-floor resolved ${name} ${version}; the declared floor is`
            + ` ${expectedVersion}. Run \`npm ci\` to restore the pinned fixture install.`
        )
    }
    return path.dirname(manifestPath)
}

const fixture = fixtureRoot()
const react = floorPackage('react', REACT_FLOOR, fixture)
const reactDom = floorPackage('react-dom', REACT_FLOOR, fixture)
// react-dom 16 requires both `scheduler` and `scheduler/tracing`; scheduler 0.23 (react-dom 18's copy)
// dropped tracing, so resolving this from react-dom's own directory rather than the repository root is
// what keeps the two legs from sharing a scheduler.
const scheduler = floorPackage('scheduler', SCHEDULER_FLOOR_LINE, reactDom)

module.exports = {
    ...base,
    // Resolution differs from the default leg, so the two get their own caches and `jest --clearCache`
    // on one cannot invalidate the other. Mirrors scripts/test-public-types.js's node_modules/.cache use.
    cacheDirectory: '<rootDir>/node_modules/.cache/jest-react-16',
    moduleNameMapper: {
        ...base.moduleNameMapper,
        // React 16 and 17 have no `react-dom/client`, yet @testing-library/react 16.3.2 requires it
        // eagerly (dist/pure.js:45) even though this harness never calls it. MUST precede the
        // `react-dom/*` rule below -- moduleNameMapper is first-match-wins in declaration order.
        '^react-dom/client$': '<rootDir>/scripts/fixtures/react16/react-dom-client.js',
        '^react$': react,
        '^react/(.*)$': `${react}/$1`,
        '^react-dom$': reactDom,
        '^react-dom/(.*)$': `${reactDom}/$1`,
        '^scheduler$': scheduler,
        '^scheduler/(.*)$': `${scheduler}/$1`,
    },
    // babel.config.js drops its `include: ['src']` restriction under NODE_ENV=test, and the fixture's
    // nested node_modules does not match the base pattern's `<rootDir>/node_modules/` prefix -- without
    // this entry babel-jest would transform react-dom 16's ~3 MB development build on every run.
    transformIgnorePatterns: [
        '<rootDir>/scripts/fixtures/react16-floor/node_modules/',
        ...base.transformIgnorePatterns,
    ],
    setupFilesAfterEnv: [
        ...(base.setupFilesAfterEnv || []),
        '<rootDir>/scripts/fixtures/react16/setup.js',
    ],
    // The thresholds in jest.config.js are calibrated on the React 18 run. Coverage measured here is a
    // different measurement of the same source, so it is never gated from this leg.
    collectCoverage: false,
    coverageThreshold: {},
}
