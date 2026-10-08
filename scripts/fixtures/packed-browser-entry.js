// Bundled by scripts/test-packed-browser.js inside the throwaway host, as an application that imports
// eis-ui-render bundles it: the host's own React renders the published bundle.
const React = require('react')
const { createRoot } = require('react-dom/client')
const UIRender = require('eis-ui-render')
const { deepMeta, deepData } = require('./packed-meta')

createRoot(document.getElementById('host')).render(React.createElement(UIRender, { meta: deepMeta, data: deepData }))
