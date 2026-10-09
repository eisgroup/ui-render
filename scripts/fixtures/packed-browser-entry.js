// Bundled by scripts/test-packed-browser.js inside the throwaway host, as an application that imports
// eis-ui-render bundles it: the host's own React renders the published bundle.
const React = require('react')
const { createRoot } = require('react-dom/client')
const UIRender = require('eis-ui-render')
const { deepMeta, deepData, listMeta, listData, tallMeta } = require('./packed-meta')

createRoot(document.getElementById('host')).render(React.createElement(UIRender, { meta: deepMeta, data: deepData }))
// A form field takes its value from `initialValues`, as a host's form does; `data` alone leaves it empty.
createRoot(document.getElementById('list')).render(React.createElement(UIRender, { meta: listMeta, data: listData, initialValues: listData }))
createRoot(document.getElementById('tall')).render(React.createElement(UIRender, { meta: tallMeta, data: {} }))
