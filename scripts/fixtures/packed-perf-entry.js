// Bundled by scripts/test-packed-perf.js inside the throwaway host, as an application that imports eis-ui-render
// bundles it. The page renders one of the documents below, named by its `?scenario=`, for e2e/perf/scenarios.perf.js
// to measure what an edit costs there. Each is a shape a host renders, at a size where a render cascade shows.
const React = require('react')
const UIRender = require('eis-ui-render')
// The host React's root API (./packed-mount-root.js): the check runs on this repository's React.
const mount = require('./packed-mount')

const ROWS = 200
const range = count => Array.from({ length: count }, (_, i) => i)
const records = [{ id: 'a', name: 'A' }, { id: 'b', name: 'B' }, { id: 'c', name: 'C' }]
const choices = [{ text: 'A', value: 'a' }, { text: 'B', value: 'b' }, { text: 'C', value: 'c' }]
const periodField = name => ({
    view: 'Input',
    name,
    type: 'date',
    validate: 'required',
    verify: { dataKind: 'period', validate: [{ name: 'notWithinRange', args: ['startDate', 'endDate'] }] },
})

const SCENARIOS = {
    // A period table: each row's dates checked against every other row's.
    periods: () => ({
        meta: {
            view: 'Table',
            name: 'dataKind.period',
            headers: [{ id: 'startDate', label: 'Start Date' }, { id: 'endDate', label: 'End Date' }],
            renderItemCells: {
                view: 'Data',
                kind: 'period',
                embedded: true,
                meta: { view: 'TableCells', items: [periodField('startDate'), periodField('endDate')] },
            },
        },
        data: { dataKind: { period: range(ROWS).map(i => ({ startDate: `${2000 + i}-01-01`, endDate: `${2000 + i}-06-30` })) } },
    }),
    // A Select column with mapped options, beside a text column.
    selectTable: () => ({
        meta: {
            view: 'Table',
            name: 'rows',
            headers: [
                { id: 'kind', label: 'Kind', renderCell: { view: 'Select', name: 'kind', options: records, mapOptions: { text: 'name', value: 'id' } } },
                { id: 'note', label: 'Note', renderCell: { view: 'Input', name: 'note' } },
            ],
        },
        data: { rows: range(ROWS).map(i => ({ kind: i % 2 ? 'a' : 'b', note: `note ${i}` })) },
    }),
    // A form of 100 named Selects, each writing its pick into the document's state, and a text field.
    selectForm: () => ({
        meta: {
            view: 'Col',
            items: [
                ...range(100).map(i => ({ view: 'Select', name: `choice${i}`, label: `Choice ${i}`, options: choices })),
                { view: 'Input', name: 'other', label: 'Other' },
            ],
        },
        data: { other: 'text', ...Object.fromEntries(range(100).map(i => [`choice${i}`, 'a'])) },
    }),
    // Two tabs, the second a 200-row table of a required text column and a bounded number column, which mounts and
    // unmounts with its tab.
    tabs: () => ({
        meta: {
            view: 'Tabs',
            items: [
                { tab: 'Summary', content: { view: 'Text', children: 'Nothing to edit here' } },
                {
                    tab: 'Rows',
                    content: {
                        view: 'Table',
                        name: 'rows',
                        headers: [
                            { id: 'note', label: 'Note', renderCell: { view: 'Input', name: 'note', validate: 'required' } },
                            { id: 'qty', label: 'Qty', renderCell: { view: 'Input', type: 'number', name: 'qty', min: 0, max: 100000 } },
                        ],
                    },
                },
            ],
        },
        data: { rows: range(ROWS).map(i => ({ note: `note ${i}`, qty: i })) },
    }),
    // A column of number fields with bounds, beside a text column.
    numberTable: () => ({
        meta: {
            view: 'Table',
            name: 'rows',
            headers: [
                { id: 'qty', label: 'Qty', renderCell: { view: 'Input', type: 'number', name: 'qty', min: 0, max: 100000 } },
                { id: 'note', label: 'Note', renderCell: { view: 'Input', name: 'note' } },
            ],
        },
        data: { rows: range(ROWS).map(i => ({ qty: i, note: `note ${i}` })) },
    }),
}

const name = new URLSearchParams(window.location.search).get('scenario')
const scenario = SCENARIOS[name]
if (!scenario) throw new Error(`No scenario named ${JSON.stringify(name)}: one of ${Object.keys(SCENARIOS).join(', ')}`)
const { meta, data } = scenario()
// A form field takes its value from `initialValues`, as a host's form does.
mount(React.createElement(UIRender, { meta, data, initialValues: data, onSubmit: () => {} }), document.getElementById('host'))
document.body.dataset.scenario = name
