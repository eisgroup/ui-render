/**
 * A `showIf` THAT READS A FIELD OF ANOTHER FORM OF ITS DOCUMENT TREE (2026-10-26).
 * =============================================================================================
 *
 * A `Data` block with `useForm` is a document with a form of its own, and a document renders on changes of its own
 * form only. So a node beside such a block whose `showIf` reads the block's field, or a node in another block, did
 * not render on a change of it. Measured on the published 0.34.3, on React 16.14 and 18.3: the node followed the
 * field for a host that renders again on `onDataChanged`, through the context `AppProvider` made anew on each render,
 * and never for a host that renders once. Its context values are made once from 2026-10-23, and then the node
 * followed it for no host. It follows the other forms of its tree itself now (`engine/showIfFollowsForm.ts`).
 */
import React from 'react'
import { act, fireEvent, render, screen } from '@testing-library/react'
import UIRender from '../main'

const HOSTS = [
    ['a host that renders once', 'once'],
    ['a host that renders again on `onDataChanged`', 'again'],
    ['a host that renders again on `onDataChanged` with the same props', 'same'],
]

beforeEach(() => jest.useFakeTimers())
afterEach(() => jest.useRealTimers())

/** The document, mounted by a host that renders as `renders` says. */
function mount (meta, data, renders) {
    function Host () {
        const [, setChanges] = React.useState(0)
        const same = React.useCallback(() => setChanges(count => count + 1), [])
        const onDataChanged = renders === 'same' ? same : () => { if (renders === 'again') setChanges(count => count + 1) }
        return <UIRender meta={meta} data={data} initialValues={data} onDataChanged={onDataChanged}/>
    }
    render(<Host/>)
    act(() => { jest.runOnlyPendingTimers() })
}

/** Types `value` into the field named `name`, and leaves it. */
function type (name, value) {
    const input = document.querySelector(`input[name="${name}"]`)
    act(() => { fireEvent.focus(input) })
    act(() => { fireEvent.change(input, { target: { value } }) })
    act(() => { jest.runOnlyPendingTimers() })
    act(() => { fireEvent.blur(input) })
    act(() => { jest.runOnlyPendingTimers() })
}

const gated = { view: 'Text', children: 'Gated', showIf: { name: 'inner', relativeData: false } }
const block = { view: 'Data', useForm: true, meta: { view: 'Col', items: [{ view: 'Input', name: 'inner', label: 'Inner' }] } }
const gatedShown = () => screen.queryByText('Gated') !== null

describe.each(HOSTS)('for %s', (_, renders) => {
    it('a node beside a `useForm` block shows and hides as the block\'s field its `showIf` reads changes', () => {
        mount({ view: 'Col', items: [block, gated] }, {}, renders)
        expect(gatedShown()).toBe(false)

        type('inner', 'yes')
        expect(gatedShown()).toBe(true)

        type('inner', '')
        expect(gatedShown()).toBe(false)
    })

    it('a node in a `useForm` block shows and hides as a field of another block changes', () => {
        const reader = { view: 'Data', useForm: true, meta: { view: 'Col', items: [gated] } }
        mount({ view: 'Col', items: [block, reader] }, {}, renders)
        expect(gatedShown()).toBe(false)

        type('inner', 'yes')
        expect(gatedShown()).toBe(true)

        type('inner', '')
        expect(gatedShown()).toBe(false)
    })

    it('a node decides again without the field of a `useForm` block that goes', () => {
        const shut = { ...block, showIf: { name: 'open', relativeData: false } }
        mount({ view: 'Col', items: [{ view: 'Input', name: 'open', label: 'Open' }, shut, gated] }, { open: 'yes' }, renders)
        type('inner', 'yes')
        expect(gatedShown()).toBe(true)

        // The block goes, and its form with it: nothing holds the field any more.
        type('open', '')
        expect(screen.queryByLabelText('Inner')).toBeNull()
        expect(gatedShown()).toBe(false)
    })
})
