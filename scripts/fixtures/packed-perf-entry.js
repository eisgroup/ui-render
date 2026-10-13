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
// A 200-row table of a required text column and a bounded number column, and its rows.
const rowsTable = {
    view: 'Table',
    name: 'rows',
    headers: [
        { id: 'note', label: 'Note', renderCell: { view: 'Input', name: 'note', validate: 'required' } },
        { id: 'qty', label: 'Qty', renderCell: { view: 'Input', type: 'number', name: 'qty', min: 0, max: 100000 } },
    ],
}
const tableRows = () => ({ rows: range(ROWS).map(i => ({ note: `note ${i}`, qty: i })) })
// 200 required fields beside it, which every field that comes or goes used to validate, each.
const besideFields = range(ROWS).map(i => ({ view: 'Input', name: `field${i}`, label: `Field ${i}`, validate: 'required' }))
const besideValues = () => Object.fromEntries(range(ROWS).map(i => [`field${i}`, `value ${i}`]))
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
    // Two tabs, the second the 200-row table, which mounts and unmounts with its tab.
    tabs: () => ({
        meta: {
            view: 'Tabs',
            items: [
                { tab: 'Summary', content: { view: 'Text', children: 'Nothing to edit here' } },
                { tab: 'Rows', content: rowsTable },
            ],
        },
        data: tableRows(),
    }),
    // The 200-row table, which a `showIf` shows and hides, beside 200 required fields.
    reveal: () => ({
        meta: {
            view: 'Col',
            items: [{ view: 'Input', name: 'show', label: 'Show' }, ...besideFields, { ...rowsTable, showIf: { name: 'show', equal: 'yes' } }],
        },
        data: { show: 'no', ...besideValues(), ...tableRows() },
    }),
    // A popup that holds the 200-row table, beside 200 required fields.
    popup: () => ({
        meta: {
            view: 'Col',
            items: [
                { view: 'Button', children: 'Open rows', onClick: { name: 'popupOpen', args: ['rows'] } },
                ...besideFields,
                { view: 'Popup', id: 'rows', title: 'Rows', items: [rowsTable] },
            ],
        },
        data: { ...besideValues(), ...tableRows() },
    }),
    // An Expand that holds the 200-row table, beside 200 required fields. Its content goes when its animation ends.
    expand: () => ({
        meta: { view: 'Col', items: [...besideFields, { view: 'Expand', title: 'Rows', items: [rowsTable] }] },
        data: { ...besideValues(), ...tableRows() },
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
