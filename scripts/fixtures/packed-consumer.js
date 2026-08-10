// Runs inside a throwaway consumer that has only react, react-dom and moment available, so anything the
// bundle needs but the tarball forgot to ship fails here instead of in a host application.
const React = require('react')
const ReactDOMServer = require('react-dom/server')
const UIRender = require('eis-ui-render')

if (typeof UIRender !== 'function') {
    throw new Error(`the published package must export a callable component; received ${typeof UIRender}`)
}

const html = ReactDOMServer.renderToString(React.createElement(UIRender, {
    meta: { view: 'Text', children: 'packed tarball smoke' },
    data: {},
}))

for (const expected of ['packed tarball smoke', 'ui-render']) {
    if (!html.includes(expected)) {
        throw new Error(`rendered markup from the packed bundle is missing ${JSON.stringify(expected)}`)
    }
}

process.stdout.write('ok\n')
