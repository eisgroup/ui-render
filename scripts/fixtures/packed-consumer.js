// Runs inside a throwaway consumer that has only react, react-dom and moment available, so anything the
// bundle needs but the tarball forgot to ship fails here instead of in a host application.
const React = require('react')
const ReactDOM = require('react-dom')
const ReactDOMServer = require('react-dom/server')
const UIRender = require('eis-ui-render')

// The harness can point the externals at a React this repository does not have installed (peer-range
// matrix), so prove the copy that actually loaded is the intended one -- a resolution slip would otherwise
// report a pass earned by whatever React the repository happens to hold.
const expected = process.env.PACKED_CONSUMER_EXPECT_REACT
if (expected && React.version !== expected) {
    throw new Error(`expected the consumer to load React ${expected}; it loaded ${React.version}`)
}

if (typeof UIRender !== 'function') {
    throw new Error(`the published package must export a callable component; received ${typeof UIRender}`)
}

/**
 * `react-dom/server.renderToString` is the one render entry every supported major shares: React 16 and 17
 * have no `react-dom/client`, and React 19 dropped `react-dom.render`.
 */
function render (meta, data) {
    return ReactDOMServer.renderToString(React.createElement(UIRender, { meta, data }))
}

function assertMarkup (label, html, expectedFragments) {
    for (const fragment of expectedFragments) {
        if (!html.includes(fragment)) {
            throw new Error(`${label} markup from the packed bundle is missing ${JSON.stringify(fragment)}`)
        }
    }
}

assertMarkup('minimal', render({ view: 'Text', children: 'packed tarball smoke' }, {}), [
    'packed tarball smoke',
    'ui-render',
])

/**
 * A single Text node proves only that the bundle loads. This tree reaches the parts a host actually depends
 * on -- nested layout, the form-bound Input, a semantic-ui Dropdown, a paginated Table and a value formatter
 * -- so a React major that breaks the render engine rather than the module graph cannot pass silently.
 */
const deepMeta = {
    view: 'Column',
    styles: 'padding',
    items: [
        { view: 'Text', label: 'packed tarball smoke' },
        {
            view: 'Text',
            label: { name: 'rows.0.rate' },
            renderLabel: { name: 'Float', decimals: 4 },
        },
        {
            view: 'Input',
            name: 'rows.0.amount',
            label: 'Amount',
            type: 'number',
            format: 'integer',
            validate: 'required',
            required: true,
        },
        { view: 'Dropdown', name: 'group', options: 'groups', mapOptions: 'groupID' },
        { view: 'Checkbox', name: 'flag', label: 'A flag' },
        {
            view: 'Table',
            name: 'rows',
            usePagination: true,
            rowsPerPage: 2,
            headers: [{ id: 'id', label: '#' }, { id: 'title', label: 'Title' }],
        },
        { view: 'Button', label: 'Submit', onClick: 'submit' },
    ],
}
const deepData = {
    rows: [{ id: 1, title: 'first row', amount: 1200, rate: 0.123456789 }, { id: 2, title: 'second row' }],
    groups: [{ groupID: 'a' }],
    group: 'a',
    flag: true,
}

assertMarkup('composed', render(deepMeta, deepData), [
    'packed tarball smoke',
    '<label for="rows.0.amount">Amount</label>',   // form-bound Input reached react-final-form
    'ui selection dropdown',                       // semantic-ui component rendered from the bundle
    '<table',                                      // Table view
    'first row',                                   // data resolved through the meta name path
    '.1235',                                       // the Float formatter ran (decimals are split into a span)
    'Submit',
])

process.stdout.write(`loaded react ${React.version} / react-dom ${ReactDOM.version}\n`)
process.stdout.write('ok\n')
