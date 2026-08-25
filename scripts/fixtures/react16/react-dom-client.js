/**
 * `react-dom/client` stub for the React 16.14 floor harness (jest.react16.config.js).
 *
 * @testing-library/react 16.3.2 loads that entry point eagerly, at module scope:
 *
 *   dist/pure.js:45   var ReactDOMClient = _interopRequireWildcard(require("react-dom/client"));
 *
 * React 16 and 17 ship no such entry point -- the same fact scripts/fixtures/packed-consumer.js records
 * ("React 16 and 17 have no `react-dom/client`") -- so without this stub the require throws while
 * @testing-library/react is still being evaluated and every suite fails at import time, before a single
 * component renders. react-dom 18.3.1 declares an `exports` map with a "./client" entry; 16.14 has no
 * `exports` field at all, so on the floor this is a plain missing file.
 *
 * Nothing here is ever called: scripts/fixtures/react16/setup.js forces `legacyRoot: true`, which routes
 * RTL through createLegacyRoot (dist/pure.js:167) and ReactDOM.render. These throw rather than emulate a
 * concurrent root on purpose -- reimplementing React 18's root API on top of ReactDOM.render would make
 * the harness test our fake instead of RTL's own maintained legacy path, and it would do so silently. If
 * the legacyRoot patch ever stops applying, the harness must fail loudly instead.
 */
function unavailable (name) {
    return () => {
        throw new Error(
            `react-dom/client.${name} does not exist in React 16; this harness must render through the`
            + ' legacy root. scripts/fixtures/react16/setup.js forces `legacyRoot: true` -- if you are'
            + ' reading this, that patch stopped applying.'
        )
    }
}

module.exports = {
    createRoot: unavailable('createRoot'),
    hydrateRoot: unavailable('hydrateRoot'),
}
