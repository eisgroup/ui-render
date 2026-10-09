/**
 * The tree both packed-tarball smokes render: ./packed-consumer.js on the server (scripts/test-packed-consumer.js)
 * and ./packed-browser-entry.js in Chromium (scripts/test-packed-browser.js). Each copies this file into its
 * throwaway host beside the entry that requires it.
 *
 * A single Text node proves only that the bundle loads. This tree reaches the parts a host actually depends
 * on -- nested layout, the form-bound Input, the Dropdown, a paginated Table and a value formatter
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

/**
 * The second document the browser smoke mounts, beside the first: a long select in an `inverted` container,
 * which is what the 2026-10-08 audit found the first in-house list getting wrong against 0.34.3. Its selection
 * opened out of view, the arrows walked the cursor out of view, focus leaving did not close it, and its options
 * were near-black on the inverted dark grey. A layout question, so only a browser can answer it.
 */
const listMeta = {
    view: 'Col',
    className: 'inverted',
    items: [
        {
            view: 'Input',
            type: 'select',
            name: 'pick',
            label: 'A long list',
            options: Array.from({ length: 40 }, (_, i) => ({ text: `Option ${i}`, value: `v${i}` })),
        },
        { view: 'Input', name: 'after', label: 'After the list' },
    ],
}
const listData = { pick: 'v30', after: '' }

/**
 * The third document, in a host container with a fixed height that scrolls: twelve fields, taller than it. In
 * 0.34.x the document was as tall as its content and the container scrolled to the last field; the wrapper's
 * page-layout rules made it as tall as the container instead, and clipped the rest (themes/_app.less).
 */
const tallMeta = {
    view: 'Col',
    items: Array.from({ length: 12 }, (_, i) => ({ view: 'Input', name: `field${i}`, label: `Field ${i}` })),
}

/**
 * The fourth document: what portals and timers do differently across Reacts, where React 16 and 17 delegate events
 * to the document and 18 and 19 to the root. A popup, which opens into the wrapper's popup root; a date field inside
 * it, whose calendar rc-picker portals into `<body>`, outside both; and a tooltip, which opens on hover after a delay.
 */
const popupMeta = {
    view: 'Col',
    items: [
        { view: 'Button', children: 'Open the popup', onClick: { name: 'popupOpen', args: ['packedPopup'] } },
        {
            view: 'Popup',
            id: 'packedPopup',
            title: 'A packed popup',
            items: [
                { view: 'Text', children: 'Inside the popup' },
                { view: 'Input', type: 'date', name: 'when', label: 'When' },
            ],
        },
        { view: 'Button', children: 'Has a tooltip', tooltip: 'The tooltip text' },
    ],
}

module.exports = { deepMeta, deepData, listMeta, listData, tallMeta, popupMeta }
