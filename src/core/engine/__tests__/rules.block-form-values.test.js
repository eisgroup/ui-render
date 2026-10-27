/**
 * A `useForm` BLOCK THAT HOLDS THE WHOLE DOCUMENT IS READ WITH ITS EDITS (2026-10-27).
 * =============================================================================================
 *
 * A `Data` view with `useForm` starts its form from the values its `name` or `data` selects, and from the document's
 * values when they select none (`docs/SUPPORTED-VIEWS.md`). Such a block's form and the document's own form then both
 * hold the whole document, and the merge of the forms (`mergeData` in `formData.ts`) took the first of them to register,
 * the block's, children mounting first, as the one the others are merged over. The document's own form, which holds
 * every value as it started, came over it and took back each edit made in the block. Measured on master (5456ef03):
 * - an edit of a field in the block, or of a cell of a table in it, was not in `getFormData`, a `showIf` reading it did
 *   not follow it, and a submit sent the table's rows as they started;
 * - made the other way round, the block's copy taken back an edit of the document's own form instead.
 *
 * A submit of the document sends its own form's values and the tables' rows: a block's field outside a table is not
 * sent, by design (`engine/Data.tsx`), and these tests leave that alone.
 */
import React from 'react'
import { act, cleanup, fireEvent, render, screen } from '@testing-library/react'
import '@testing-library/jest-dom'
import { getIn } from 'final-form'
import UIRender from '../rules'
import { formsStorage } from '../../state/formRegistry'
import { cloneDeep } from '../../utils'
import { AppContext, ConfigContext, initialAppState, initialConfigState } from '../../contexts'

const popup = { ...initialAppState, setPopupState: () => {} }

afterEach(() => {
    cleanup()
    formsStorage.clear()
})

/** Mounts the meta on the data; the host records what `getFormData` reads, and what each submit sends. */
function mount (meta, data) {
    const host = { reader: null, submitted: [] }
    render(
        <ConfigContext.Provider value={initialConfigState}>
            <AppContext.Provider value={popup}>
                <UIRender meta={meta} data={cloneDeep(data)} initialValues={cloneDeep(data)}
                    getFormData={function (reader) { host.reader = reader }}
                    onSubmit={function (submitted) { host.submitted.push(cloneDeep(submitted)) }}/>
            </AppContext.Provider>
        </ConfigContext.Provider>
    )
    return host
}

const field = name => document.querySelector(`[name="${name}"]`)

const type = (name, value) => {
    const input = field(name)
    fireEvent.focus(input)
    fireEvent.change(input, { target: { value } })
    fireEvent.blur(input)
}

const click = name => act(async () => {
    fireEvent.click(screen.getByRole('button', { name }))
    await new Promise(resolve => setTimeout(resolve, 0))
})

const KIND = 'dataKind.items[0].kind'
const data = { title: 'T', dataKind: { items: [{ kind: 'a' }, { kind: 'x' }] } }

/** A table of `dataKind.items`, whose rows have a form of their own with `useForm`, or share the form they are in. */
const table = (useForm = false) => ({
    view: 'Table',
    name: 'dataKind.items',
    headers: [{ id: 'kind', label: 'Kind' }],
    renderItemCells: {
        view: 'Data', kind: 'items', embedded: true, ...useForm && { useForm: true },
        meta: { view: 'TableCells', items: [{ view: 'Input', name: 'kind', type: 'text' }] },
    },
})

/** A node that shows while the field `name` holds `value`. */
const showsWhile = (name, value) => ({ view: 'Text', children: `${name} is ${value}`, showIf: { name, equal: value } })

/** A `useForm` block of `items`, which selects no values: its form starts from the document's. */
const block = (items, more) => ({ view: 'Data', kind: 'block', useForm: true, ...more, meta: { view: 'Col', items } })

const submit = { view: 'Button', children: 'Submit', onClick: 'submit' }

describe('a `useForm` block that holds the whole document', () => {
    const meta = {
        view: 'Col',
        items: [
            block([
                { view: 'Input', name: 'title', type: 'text' },
                showsWhile('title', 'U'),
                table(),
                showsWhile(KIND, 'b'),
                { view: 'Button', children: 'Save block', onClick: 'submit' },
            ]),
            submit,
        ],
    }

    it('has an edit of its field in getFormData and a `showIf`', () => {
        const host = mount(meta, data)
        type('title', 'U')
        expect(getIn(host.reader(), 'title')).toBe('U')
        expect(screen.queryByText('title is U')).toBeInTheDocument()
    })

    it('has an edit of a cell of its table in getFormData, a `showIf` and a submit', async () => {
        const host = mount(meta, data)
        type(KIND, 'b')
        expect(host.reader().dataKind.items).toEqual([{ kind: 'b' }, { kind: 'x' }])
        expect(screen.queryByText(`${KIND} is b`)).toBeInTheDocument()
        await click('Submit')
        expect(host.submitted.map(sent => sent.dataKind.items)).toEqual([[{ kind: 'b' }, { kind: 'x' }]])
    })

    it('reads an edit set back after the document\'s submit, and sends it in the next', async () => {
        const host = mount(meta, data)
        type(KIND, 'b')
        await click('Submit')
        type(KIND, 'a')
        expect(getIn(host.reader(), KIND)).toBe('a')
        expect(screen.queryByText(`${KIND} is b`)).not.toBeInTheDocument()
        await click('Submit')
        expect(host.submitted.map(sent => getIn(sent, KIND))).toEqual(['b', 'a'])
    })

    it('reads an edit set back after its own submit, and the document\'s submit sends it', async () => {
        const host = mount(meta, data)
        type(KIND, 'b')
        await click('Save block')
        expect(getIn(host.reader(), KIND)).toBe('b')
        type(KIND, 'a')
        expect(getIn(host.reader(), KIND)).toBe('a')
        await click('Submit')
        expect(getIn(host.submitted[host.submitted.length - 1], KIND)).toBe('a')
    })
})

describe('a field of the document\'s own form beside a `useForm` block that holds the whole document', () => {
    const meta = {
        view: 'Col',
        items: [
            { view: 'Input', name: 'title', type: 'text' },
            showsWhile('title', 'U'),
            block([table(), showsWhile(KIND, 'b')]),
            submit,
        ],
    }

    it('keeps its edit, and the block\'s cell keeps its own, in getFormData, the `showIf`s and a submit', async () => {
        const host = mount(meta, data)
        type('title', 'U')
        type(KIND, 'b')
        expect(host.reader()).toEqual({ title: 'U', dataKind: { items: [{ kind: 'b' }, { kind: 'x' }] } })
        expect(screen.queryByText('title is U')).toBeInTheDocument()
        expect(screen.queryByText(`${KIND} is b`)).toBeInTheDocument()
        await click('Submit')
        expect(host.submitted).toEqual([{ title: 'U', dataKind: { items: [{ kind: 'b' }, { kind: 'x' }] } }])
    })
})

describe('a `useForm` block whose `name` selects nothing in the data', () => {
    const meta = { view: 'Col', items: [block([table(), showsWhile(KIND, 'b')], { name: 'section' }), submit] }

    it('has an edit of a cell of its table in getFormData, a `showIf` and a submit', async () => {
        const host = mount(meta, data)
        type(KIND, 'b')
        expect(getIn(host.reader(), KIND)).toBe('b')
        expect(screen.queryByText(`${KIND} is b`)).toBeInTheDocument()
        await click('Submit')
        expect(getIn(host.submitted[0], KIND)).toBe('b')
    })
})

describe('a `useForm` block that holds the whole document, shown after an edit of the document\'s own form', () => {
    const meta = {
        view: 'Col',
        items: [
            { view: 'Input', name: 'title', type: 'text' },
            { view: 'Input', name: 'more', type: 'text' },
            { ...block([table()]), showIf: { name: 'more', equal: 'yes' } },
            submit,
        ],
    }

    it('leaves the edit in getFormData', () => {
        const host = mount(meta, data)
        type('title', 'U')
        type('more', 'yes')
        expect(field(KIND)).not.toBeNull()
        expect(getIn(host.reader(), 'title')).toBe('U')
    })
})

describe('a table of `useForm` rows in a `useForm` block that holds the whole document', () => {
    const meta = {
        view: 'Col',
        items: [block([table(true), showsWhile(KIND, 'b'), { view: 'Button', children: 'Save block', onClick: 'submit' }]), submit],
    }

    it('has a row\'s edit in getFormData, a `showIf` and a submit', async () => {
        const host = mount(meta, data)
        type(KIND, 'b')
        expect(getIn(host.reader(), KIND)).toBe('b')
        expect(screen.queryByText(`${KIND} is b`)).toBeInTheDocument()
        await click('Submit')
        expect(getIn(host.submitted[0], KIND)).toBe('b')
    })

    it('reads a row\'s edit set back after the block\'s submit, and after the document\'s', async () => {
        const host = mount(meta, data)
        type(KIND, 'b')
        await click('Save block')
        type(KIND, 'a')
        expect(getIn(host.reader(), KIND)).toBe('a')
        type(KIND, 'b')
        await click('Submit')
        type(KIND, 'a')
        expect(getIn(host.reader(), KIND)).toBe('a')
        await click('Submit')
        expect(getIn(host.submitted[host.submitted.length - 1], KIND)).toBe('a')
    })
})
