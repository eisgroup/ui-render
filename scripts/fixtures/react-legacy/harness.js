/**
 * Worker-side setup shared by the legacy-React legs (`jest.react16.config.js`, `jest.react17.config.js`).
 * Called once per worker, for every suite, from the thin per-leg entry points beside this file; the version
 * a leg expects comes from ./floors.js.
 *
 * 1. VERSION SELF-CHECK. Without it these legs have a failure mode that looks exactly like success: if the
 *    moduleNameMapper stops applying -- a rule dropped, a pattern edited, the fixture install gone -- the
 *    suite runs on the repository's React 18 and reports green, and nobody learns that the declared peer
 *    range is no longer covered. Asserting the version that actually loaded turns that into a failure in
 *    every suite. Same idea as assertReactTypesMajor() in scripts/test-public-types.js and the
 *    PACKED_CONSUMER_EXPECT_REACT check in scripts/fixtures/packed-consumer.js.
 *
 *    THIS FILE MUST NOT MOVE INTO scripts/fixtures/react16-floor/ OR scripts/fixtures/react17-floor/. Node
 *    resolves `require('react')` from the requiring file's own directory upwards, so a copy of this file
 *    sitting beside a fixture's nested node_modules would load the old React by location even with the
 *    mapping removed -- the check would pass while the suite under test ran on 18. Keeping the harness here,
 *    with no node_modules between it and the repository root, is what makes the assertion meaningful, and
 *    assertHarnessNotShadowed() in ./jest-config.js fails the run if that ever stops holding.
 *
 * 2. legacyRoot. @testing-library/react 16.3.2 defaults to createRoot and picks the implementation per
 *    render call:
 *      dist/pure.js:236   legacyRoot = false,
 *      dist/pure.js:264   const createRootImpl = legacyRoot ? createLegacyRoot : createConcurrentRoot;
 *    `legacyRoot` is a RENDER OPTION and configure() cannot set it -- dist/config.js keeps only
 *    `reactStrictMode` for RTL and forwards the rest to @testing-library/dom, which ignores it. But
 *    dist/pure.js publishes both entry points as plain writable properties:
 *      dist/pure.js:41   exports.render = render;
 *      dist/pure.js:42   exports.renderHook = renderHook;
 *    and dist/index.js re-exports them through live getters, so re-binding them here is enough. Babel
 *    compiles `render(...)` in the tests to `(0, _react.render)(...)` -- a fresh property read per call, not
 *    an import-time snapshot -- so already-written tests pick the patch up with no edits.
 *    renderHook has to be patched separately: it calls the module-local `render` binding rather than the
 *    export (dist/pure.js:336), and forwards its own `renderOptions`, so the flag has to go into those.
 *    Requiring dist/pure.js rather than dist/index.js is deliberate: index.js is what registers
 *    `afterEach(cleanup)`, and loading it from setup must not pre-empt that.
 *    The legacy guard at dist/pure.js:248 and :321 accepts the flag because React 16 and 17 both have
 *    ReactDOM.render; RTL's `react ^18 || ^19` peer range is a declaration, not a functional block.
 *
 * Written against @testing-library/react 16.3.2. An RTL bump can break the patch -- but loudly: either the
 * rebinding throws, or `legacyRoot` stops being read and react-dom-client.js's throwing stub fires. Neither
 * can produce a false green.
 */
function installLegacyReactHarness (floor) {
    const React = require('react')
    const ReactDOM = require('react-dom')

    const wrongVersion = (name, actual) => new Error(
        `the ${floor.name} harness loaded ${name} ${actual}; expected ${floor.react}.`
        + ` Run it with \`${floor.script}\` -- bare \`jest\` uses the installed React 18.`
    )

    if (React.version !== floor.react) throw wrongVersion('react', React.version)
    // Checked independently of `react`, not derived from it: a half-applied mapping (react moved, react-dom
    // not, or the two on different majors) would otherwise surface as an unrelated hook or invariant error
    // deep inside a component. Fail here instead, naming the actual cause.
    if (ReactDOM.version !== floor.react) throw wrongVersion('react-dom', ReactDOM.version)

    if (typeof ReactDOM.render !== 'function' || typeof ReactDOM.unmountComponentAtNode !== 'function') {
        throw new Error(
            `react-dom resolved without the legacy render API; the ${floor.name} mapping is wrong`
        )
    }
    // react-dom 16 and 17 drive both `scheduler` and `scheduler/tracing`, on different scheduler lines;
    // scheduler 0.23 (react-dom 18's copy) removed tracing, so a wrong resolution here fails much later and
    // much more obscurely.
    const schedulerVersion = require('scheduler/package.json').version
    if (!schedulerVersion.startsWith(floor.schedulerLine)) {
        throw new Error(
            `the ${floor.name} harness resolved scheduler ${schedulerVersion};`
            + ` expected ${floor.schedulerLine}x`
        )
    }

    const pure = require('@testing-library/react/dist/pure.js')

    for (const name of ['render', 'renderHook']) {
        const original = pure[name]
        if (typeof original !== 'function') {
            throw new Error(`@testing-library/react/dist/pure.js no longer exports ${name} as a function`)
        }
        // legacyRoot goes last: on React 16/17 an explicit `legacyRoot: false` cannot work, so it is
        // overridden.
        pure[name] = (subject, options = {}) => original(subject, { ...options, legacyRoot: true })
    }
}

module.exports = installLegacyReactHarness
