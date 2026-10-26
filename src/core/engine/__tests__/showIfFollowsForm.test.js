/**
 * WHEN A NODE THAT FOLLOWS THE FORMS DECIDES ITS `showIf` AGAIN (`engine/showIfFollowsForm.ts`), on a hook's own
 * terms. What a document does with it is in `src/library/__tests__/showif-other-form.test.js` and
 * `showif-follows-form.test.js`, and what it costs in `kept-show-if-budget.test.js`.
 */
import React, { useEffect } from 'react'
import { act, render } from '@testing-library/react'
import { useShowIfFollowsForm } from '../showIfFollowsForm'
import { tellTreeValues, treeValuesVersion } from '../../state/formRegistry'

/** A form as the hook reads one: its values, told to a subscriber as it subscribes and on every change. */
function fakeForm (values) {
    const subscribers = new Set()
    let current = values
    return {
        subscribe (subscriber) {
            subscribers.add(subscriber)
            subscriber({ values: current })
            return () => subscribers.delete(subscriber)
        },
        set (next) {
            current = next
            subscribers.forEach(subscriber => subscriber({ values: current }))
        },
    }
}

/** A node, as far as the hook sees one, which counts its commits. */
function Probe ({ form, tree, kept, path, rendered, renderedAt, decide, onCommit }) {
    useShowIfFollowsForm(form, tree, kept, path, rendered, renderedAt, decide)
    useEffect(() => onCommit())
    return null
}

/** What `decide` answers, set by a test, how often it is asked, and how often the node commits. */
function decider (answer) {
    const counts = { decisions: 0, commits: 0 }
    const state = { answer }
    const decide = () => {
        counts.decisions += 1
        return state.answer
    }
    return { counts, state, decide, onCommit: () => { counts.commits += 1 } }
}

it('decides by the value at the path `{state.x}` moved its `showIf` to, in its own form', () => {
    // Its own form told `on` at `flags.a`. `flags.b` reads `off`, and turns `on` as well: a change to decide again by.
    const form = fakeForm({ flags: { a: 'on', b: 'off' } })
    const { counts, state, decide, onCommit } = decider({ shown: true, value: 'on' })
    const props = { form, tree: undefined, kept: true, decide, onCommit }
    const { rerender } = render(<Probe {...props} path="flags.a" rendered={{ shown: true, value: 'on' }} renderedAt={0}/>)
    rerender(<Probe {...props} path="flags.b" rendered={{ shown: false, value: 'off' }} renderedAt={0}/>)
    const commits = counts.commits

    state.answer = { shown: true, value: 'on' }
    act(() => form.set({ flags: { a: 'on', b: 'on' } }))
    expect(counts).toEqual({ decisions: 1, commits: commits + 1 })
})

it('decides again on another form\'s change of the value it read, and on nothing else', () => {
    const tree = {}
    const own = fakeForm({})
    const other = {}
    const { counts, state, decide, onCommit } = decider({ shown: false, value: undefined })
    render(<Probe form={own} tree={tree} kept={false} path="inner" rendered={{ shown: false, value: undefined }}
        renderedAt={treeValuesVersion(tree)} decide={decide} onCommit={onCommit}/>)
    const commits = counts.commits

    // Its own form, which its document follows; a form that holds nothing at the path.
    act(() => tellTreeValues(tree, own, { inner: 'yes' }))
    act(() => tellTreeValues(tree, other, { note: 'x' }))
    expect(counts.decisions).toBe(0)

    state.answer = { shown: true, value: 'yes' }
    act(() => tellTreeValues(tree, other, { note: 'x', inner: 'yes' }))
    expect(counts).toEqual({ decisions: 1, commits: commits + 1 })

    // The same value, and then the value it decided by, in another form: the merge is what it was.
    act(() => tellTreeValues(tree, other, { note: 'y', inner: 'yes' }))
    act(() => tellTreeValues(tree, {}, { inner: 'yes' }))
    expect(counts.decisions).toBe(1)

    // The form goes, with the value.
    state.answer = { shown: false, value: undefined }
    act(() => tellTreeValues(tree, other, undefined))
    expect(counts).toEqual({ decisions: 2, commits: commits + 2 })
})

it('catches up as it commits with what its tree told after it rendered', () => {
    const tree = {}
    const before = treeValuesVersion(tree)
    tellTreeValues(tree, {}, { inner: 'yes' })
    const { counts, decide, onCommit } = decider({ shown: true, value: 'yes' })
    render(<Probe form={fakeForm({})} tree={tree} kept={false} path="inner" rendered={{ shown: false, value: undefined }}
        renderedAt={before} decide={decide} onCommit={onCommit}/>)
    expect(counts).toEqual({ decisions: 1, commits: 2 })

    // Rendered after it: nothing to catch up with.
    const later = decider({ shown: true, value: 'yes' })
    render(<Probe form={fakeForm({})} tree={tree} kept={false} path="inner" rendered={{ shown: false, value: undefined }}
        renderedAt={treeValuesVersion(tree)} decide={later.decide} onCommit={later.onCommit}/>)
    expect(later.counts).toEqual({ decisions: 0, commits: 1 })
})
