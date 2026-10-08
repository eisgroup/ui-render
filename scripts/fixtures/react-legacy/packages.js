const path = require('path')

/**
 * Where one fixture's React lives, checked against the versions ./floors.js pins. Two consumers map it in:
 * ./jest-config.js, through `moduleNameMapper`, for the per-React jest legs; and webpack.demo.config.mjs,
 * through aliases, for the browser leg on React 19 (`REACT_FIXTURE`). Its own module, and free of jest, so
 * the demo build can load it without loading jest's configuration. It sits beside the harness for the
 * reason ./jest-config.js gives: outside the fixture packages, so their nested node_modules cannot shadow it.
 */
const ROOT = path.resolve(__dirname, '..', '..', '..')

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

/** The directories of a fixture's react, react-dom and scheduler. */
function fixturePackages (floor) {
    const fixture = fixtureRoot(floor)
    const react = floorPackage(floor, 'react', floor.react, fixture)
    const reactDom = floorPackage(floor, 'react-dom', floor.react, fixture)
    // react-dom 16 and 17 require both `scheduler` and `scheduler/tracing`, on different scheduler lines
    // (0.19 and 0.20); scheduler 0.23 (react-dom 18's copy) dropped tracing, and react-dom 19 is on 0.28.
    // Resolving this from react-dom's own directory rather than the repository root is what keeps the legs
    // from sharing a scheduler.
    const scheduler = floorPackage(floor, 'scheduler', floor.schedulerLine, reactDom)
    return { react, reactDom, scheduler }
}

module.exports = { fixturePackages }
