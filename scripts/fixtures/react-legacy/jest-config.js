const path = require('path')

const base = require('../../../jest.config')

/**
 * Jest config factory for the legacy-React legs -- `jest.react16.config.js` (16.14, the declared floor) and
 * `jest.react17.config.js` (17.0.2, the middle of the range). Both are two-liners over this; the per-leg
 * facts live in ./floors.js. See docs/UPGRADE-PLAN.md §8, "CI coverage of the declared peer range".
 *
 * `peerDependencies` declares `^16.14.0 || ^17.0.0 || ^18.0.0`, but `npm ci` installs exactly one React, so
 * the default suite only ever exercises 18. Each leg runs the same suite against one older React without
 * touching the installed react/react-dom: the version lives in an install-only fixture package
 * (scripts/fixtures/react16-floor, scripts/fixtures/react17-floor) linked from the root devDependencies so
 * a plain `npm ci` installs it, and is mapped in here at resolve time.
 *
 * The harness code -- this file, ./harness.js, ./react-dom-client.js, the setup entry points -- deliberately
 * sits OUTSIDE those fixture packages, because Node resolves `require('react')` from the requiring file's
 * own directory upwards: code living next to a fixture's nested node_modules would load the old React by
 * location even with no mapping in force, and the version self-checks would then be incapable of detecting a
 * broken mapping. assertHarnessNotShadowed() below turns that reasoning into a check instead of a comment.
 *
 * Why a `file:` fixture and not aliased devDependencies (the trick react-types-16/react-types-17 use for
 * @types/react): react-dom@16.14.0 declares `peer react@^16.14.0` and react-dom@17.0.2 declares `peer
 * react@17.0.2` (exact), and npm resolves a root-level package's peer against the hoisted node_modules/react
 * -- which React 18 owns. Aliasing the directory name does not change that (`react-dom-17` still asks for
 * `react`), so `npm install` aborts with ERESOLVE and no `overrides` entry can fix it, because the peer must
 * be satisfied at the same level. @types/react has no peers, which is the only reason the type matrix gets
 * away with plain aliases. The fixture sidesteps it: npm nests react/react-dom/scheduler inside the fixture
 * directory, so nothing competes for the hoisted slot and no --legacy-peer-deps is needed (unlike
 * react-19-advisory).
 *
 * Run these legs through their npm scripts, never with bare `jest`: bare `jest` silently uses the installed
 * React 18 and reports green. ./harness.js asserts the loaded version inside every worker for that reason.
 */
const HARNESS_DIR = __dirname
const ROOT = path.resolve(HARNESS_DIR, '..', '..', '..')
// `<rootDir>/...` tokens are POSIX-style regardless of platform, so the separator is normalised here
// rather than interpolating whatever path.relative() produced.
const HARNESS_RELATIVE = path.relative(ROOT, HARNESS_DIR).split(path.sep).join('/')

function fixtureRoot (floor) {
    try {
        return path.dirname(require.resolve(`${floor.fixturePackage}/package.json`))
    } catch (error) {
        throw new Error(
            `${floor.fixturePackage} is not installed. It is a devDependency linked to ${floor.fixtureDir}`
            + ' -- run `npm ci` after pulling the legacy-React harness.',
            { cause: error }
        )
    }
}

/**
 * Same guard as assertReactTypesMajor() in scripts/test-public-types.js: a pinned slot must stay pinned.
 * Resolving from the fixture directory makes Node search that fixture's node_modules first and only then
 * the ancestors, so the version assertion is what stops a fallback to the repository's own React 18 -- in
 * the parent process, before jest starts, rather than as a resolver stack in a worker.
 */
function floorPackage (floor, name, expectedVersion, from) {
    const manifestPath = require.resolve(`${name}/package.json`, { paths: [from] })
    const { version } = require(manifestPath)
    if (!version.startsWith(expectedVersion)) {
        throw new Error(
            `the ${floor.name} leg resolved ${name} ${version} from ${path.relative(ROOT, from)};`
            + ` expected ${expectedVersion}. Run \`npm ci\` to restore the pinned fixture install.`
        )
    }
    return path.dirname(manifestPath)
}

/**
 * The invariant that makes every other assertion here meaningful: from the harness directory, a bare
 * `require('react')` must reach the REPOSITORY's React 18, so that a mapping which stopped applying lands on
 * the wrong version and trips ./harness.js. If the harness ever moves under a fixture package, that fallback
 * would silently land on the right version and the leg would report green on a dead mapping.
 */
function assertHarnessNotShadowed () {
    const resolved = require.resolve('react/package.json', { paths: [HARNESS_DIR] })
    const expected = path.join(ROOT, 'node_modules', 'react', 'package.json')
    if (resolved !== expected) {
        throw new Error(
            `the legacy-React harness in ${HARNESS_RELATIVE} resolves react from`
            + ` ${path.relative(ROOT, resolved)}, not the repository's own ${path.relative(ROOT, expected)}.`
            + ' A nested node_modules is shadowing it, which would leave the version self-checks unable to'
            + ' detect a broken moduleNameMapper. Move the harness back out of the fixture package.'
        )
    }
}

function legacyReactJestConfig (floor) {
    assertHarnessNotShadowed()

    const fixture = fixtureRoot(floor)
    const react = floorPackage(floor, 'react', floor.react, fixture)
    const reactDom = floorPackage(floor, 'react-dom', floor.react, fixture)
    // react-dom 16 and 17 require both `scheduler` and `scheduler/tracing`, on different scheduler lines
    // (0.19 and 0.20); scheduler 0.23 (react-dom 18's copy) dropped tracing. Resolving this from react-dom's
    // own directory rather than the repository root is what keeps the legs from sharing a scheduler.
    const scheduler = floorPackage(floor, 'scheduler', floor.schedulerLine, reactDom)

    return {
        ...base,
        // Resolution differs per leg, so each gets its own cache and `jest --clearCache` on one cannot
        // invalidate another. Mirrors scripts/test-public-types.js's node_modules/.cache use.
        cacheDirectory: floor.cacheDirectory,
        moduleNameMapper: {
            ...base.moduleNameMapper,
            // Neither React 16.14 nor 17.0.2 ships `react-dom/client`, yet @testing-library/react 16.3.2
            // requires it eagerly (dist/pure.js:45) even though these legs never call it. MUST precede the
            // `react-dom/*` rule below -- moduleNameMapper is first-match-wins in declaration order.
            '^react-dom/client$': `<rootDir>/${HARNESS_RELATIVE}/react-dom-client.js`,
            '^react$': react,
            '^react/(.*)$': `${react}/$1`,
            '^react-dom$': reactDom,
            '^react-dom/(.*)$': `${reactDom}/$1`,
            '^scheduler$': scheduler,
            '^scheduler/(.*)$': `${scheduler}/$1`,
        },
        // babel.config.js drops its `include: ['src']` restriction under NODE_ENV=test, and a fixture's
        // nested node_modules does not match the base pattern's `<rootDir>/node_modules/` prefix -- without
        // this entry babel-jest would transform react-dom's ~3 MB development build on every run.
        transformIgnorePatterns: [
            `<rootDir>/${floor.fixtureDir}/node_modules/`,
            ...base.transformIgnorePatterns,
        ],
        setupFilesAfterEnv: [
            ...(base.setupFilesAfterEnv || []),
            `<rootDir>/${HARNESS_RELATIVE}/${floor.setupFile}`,
        ],
        // The thresholds in jest.config.js are calibrated on the React 18 run. Coverage measured here is a
        // different measurement of the same source, so it is never gated from these legs.
        collectCoverage: false,
        coverageThreshold: {},
    }
}

module.exports = legacyReactJestConfig
