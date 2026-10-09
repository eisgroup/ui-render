// Bundled by scripts/test-packed-browser.js inside the throwaway host, as an application that imports
// eis-ui-render bundles it: the host's own React renders the published bundle.
const React = require('react')
const UIRender = require('eis-ui-render')
// The host React's root API: `createRoot` on 18 and 19, `ReactDOM.render` on 16 and 17 (./packed-mount-*.js).
const mount = require('./packed-mount')
const { deepMeta, deepData, listMeta, listData, tallMeta, popupMeta } = require('./packed-meta')

mount(React.createElement(UIRender, { meta: deepMeta, data: deepData }), document.getElementById('host'))
// A form field takes its value from `initialValues`, as a host's form does; `data` alone leaves it empty.
mount(React.createElement(UIRender, { meta: listMeta, data: listData, initialValues: listData }), document.getElementById('list'))
mount(React.createElement(UIRender, { meta: tallMeta, data: {} }), document.getElementById('tall'))
mount(React.createElement(UIRender, { meta: popupMeta, data: {}, initialValues: {} }), document.getElementById('popup'))
