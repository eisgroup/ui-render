/**
 * The pinned facts of the per-React Jest legs (docs/UPGRADE-PLAN.md §8, "CI coverage of the declared
 * peer range"): one record per React in `peerDependencies` that the default suite does not run on -- the
 * 16.14 floor and 17 below the installed 18, and 19 above it. The directory is still called react-legacy,
 * after the first two.
 *
 * Everything a leg claims about its React lives here and nowhere else. That matters because the claim is
 * asserted twice on purpose -- once in the parent process by ./jest-config.js, once inside every worker by
 * ./harness.js -- and two copies of a version string are two chances for the assertions to disagree and
 * stop meaning anything.
 *
 * `fixturePackage` and `fixtureDir` are both spelled out rather than derived from each other: the npm
 * package name carries a dash the directory name does not (`react-16-floor` vs `react16-floor`).
 */
module.exports = {
    react16: {
        name: 'React 16.14 floor',
        // devDependency linked to the directory below; see ./jest-config.js for why it must be a `file:`
        // mini-package and not an aliased devDependency.
        fixturePackage: 'react-16-floor',
        fixtureDir: 'scripts/fixtures/react16-floor',
        setupFile: 'setup-react16.js',
        react: '16.14.0',
        // A line rather than an exact version: react-dom pins only `scheduler@^0.19.1`, and the fact worth
        // asserting is the line, because `scheduler/tracing` -- which react-dom 16 and 17 both require --
        // was dropped in scheduler 0.23 (react-dom 18's copy).
        schedulerLine: '0.19.',
        cacheDirectory: '<rootDir>/node_modules/.cache/jest-react-16',
        script: 'npm run test:react16',
        // React 16 and 17 have no `react-dom/client` and no concurrent root, so these legs render through
        // the legacy root: ./harness.js patches RTL into it and ./jest-config.js stubs the missing entry.
        legacyRoot: true,
    },
    react17: {
        name: 'React 17.0.2',
        fixturePackage: 'react-17-floor',
        fixtureDir: 'scripts/fixtures/react17-floor',
        setupFile: 'setup-react17.js',
        react: '17.0.2',
        // react-dom 17.0.2 depends on `scheduler@^0.20.2`, a different line from 16's -- which is why each
        // leg resolves scheduler from its own react-dom rather than from the repository root.
        schedulerLine: '0.20.',
        cacheDirectory: '<rootDir>/node_modules/.cache/jest-react-17',
        script: 'npm run test:react17',
        legacyRoot: true,
    },
    react19: {
        name: 'React 19.3.0',
        fixturePackage: 'react-19',
        fixtureDir: 'scripts/fixtures/react19',
        setupFile: 'setup-react19.js',
        react: '19.3.0',
        // react-dom 19.3.0 depends on `scheduler@^0.28.0`.
        schedulerLine: '0.28.',
        cacheDirectory: '<rootDir>/node_modules/.cache/jest-react-19',
        script: 'npm run test:react19',
        // The other way round from 16 and 17: React 19 removed the legacy root (`ReactDOM.render` is gone)
        // and ships `react-dom/client`, so this leg renders as the default suite does, through createRoot,
        // with neither the RTL patch nor the stub.
        legacyRoot: false,
    },
}
