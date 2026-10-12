/**
 * A DOCUMENT RENDERED INSIDE A TRANSITION (React 18 and 19).
 * =============================================================================================
 *
 * React Router 7 renders a navigation inside `startTransition` by default, and a host may defer its own updates
 * the same way. React then gives the update a lower priority: an urgent update arriving while it is pending is
 * rendered first, and the transition's render can be thrown away and redone. A document keeps an instance for
 * its lifetime and syncs it from its props during the render (`documentHost.ts`), so these pin that a document
 * ends up where it would have without the transition: the same DOM and the same forms registered.
 *
 * React 16 and 17 have no transitions, so their legs skip this file.
 */
import React from 'react'
import { act, render } from '@testing-library/react'
import '@testing-library/jest-dom'
import UIRender from '../main'
import { formsStorage } from '../../core/state/formRegistry'

const describeTransitions = typeof React.startTransition === 'function' ? describe : describe.skip

const meta = {
    view: 'Col',
    items: [
        { view: 'Input', name: 'title', label: 'Title' },
        { view: 'Text', name: 'title' },
        { view: 'Input', type: 'checkbox', name: 'agree', label: 'Agree' },
    ],
}
const otherMeta = { view: 'Col', items: [{ view: 'Input', name: 'note', label: 'Note' }] }

/** A host holding the page it shows in state, as a router does; `set` changes it. */
function mountHost (page, { strict = false } = {}) {
    let set
    function Host () {
        const [current, setCurrent] = React.useState(page)
        set = setCurrent
        return <UIRender key={current.key} meta={current.meta} data={current.data} initialValues={current.data} />
    }
    const view = render(strict ? <React.StrictMode><Host /></React.StrictMode> : <Host />)
    return { ...view, set: next => set(next) }
}

/** What a scenario leaves: the page's markup and how many forms are registered. */
function outcome (scenario, options) {
    formsStorage.clear()
    const { container, unmount, set } = mountHost({ key: 'a', meta, data: { title: 'first', agree: false } }, options)
    scenario(set)
    const result = { html: container.innerHTML, forms: formsStorage.size }
    unmount()
    return result
}

const inTransition = update => React.startTransition(update)
const directly = update => update()

describeTransitions('a document and transitions', () => {
    it('takes new data in a transition as it does without one', () => {
        const scenario = wrap => set => act(() => wrap(() => set({ key: 'a', meta, data: { title: 'second', agree: true } })))
        const deferred = outcome(scenario(inTransition))
        expect(deferred).toEqual(outcome(scenario(directly)))
        expect(deferred.html).toContain('second')
    })

    it('ends on the urgent update that arrived while a transition was pending', () => {
        const scenario = wrap => set => act(() => {
            wrap(() => set({ key: 'a', meta, data: { title: 'deferred', agree: true } }))
            set({ key: 'a', meta, data: { title: 'urgent', agree: false } })
        })
        const deferred = outcome(scenario(inTransition))
        expect(deferred).toEqual(outcome(scenario(directly)))
        expect(deferred.html).toContain('urgent')
        expect(deferred.html).not.toContain('deferred')
    })

    it('navigates to another document in a transition, leaving no form of the first one registered', () => {
        const scenario = wrap => set => act(() => wrap(() => set({ key: 'b', meta: otherMeta, data: { note: 'kept' } })))
        const deferred = outcome(scenario(inTransition))
        expect(deferred).toEqual(outcome(scenario(directly)))
        expect(deferred.html).toContain('kept')
        expect(deferred.html).not.toContain('first')
    })

    it('does the same under StrictMode', () => {
        const scenario = wrap => set => act(() => {
            wrap(() => set({ key: 'a', meta, data: { title: 'deferred', agree: true } }))
            set({ key: 'a', meta, data: { title: 'urgent', agree: false } })
        })
        const deferred = outcome(scenario(inTransition), { strict: true })
        expect(deferred).toEqual(outcome(scenario(directly), { strict: true }))
        expect(deferred.html).toContain('urgent')
    })
})
