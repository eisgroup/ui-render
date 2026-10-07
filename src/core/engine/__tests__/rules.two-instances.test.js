/**
 * TWO UIRender INSTANCES ON ONE PAGE (§9.3 step 3, risk R14).
 * =============================================================================================
 *
 * The engine keeps instance-bound values in module globals, so a host that mounts two documents on
 * one page has them overwriting each other. `Active.translate` is the one this file pins: it is
 * assigned in the constructor and was read back during render, so the LAST instance constructed
 * owned it for everybody.
 *
 * MOUNTING ALONE DOES NOT SHOW IT, and that is why this file exists rather than a simpler one.
 * React constructs and renders each sibling in turn, so at mount every instance reads the global it
 * has just written and the output looks correct. The defect appears on the first RE-RENDER: by then
 * the other instance has overwritten the global, and the re-rendering one translates with its
 * sibling's function — permanently, since it never writes the global again.
 *
 * Measured on the code this replaced: mount gave "A:hello" + "B:hello", and the re-render turned the
 * first into "B:hello".
 */
import React from 'react'
import { fireEvent, render } from '@testing-library/react'
import '@testing-library/jest-dom'
import '../../modules/form/utils'
import UIRender from '../rules'
import { AppContext, ConfigContext, initialAppState, initialConfigState } from '../../contexts'

const wrap = ui => (
    <ConfigContext.Provider value={initialConfigState}>
        <AppContext.Provider value={{ ...initialAppState, setPopupState: () => {} }}>{ui}</AppContext.Provider>
    </ConfigContext.Provider>
)

const meta = { view: 'Text', label: 'hello' }

const twoInstances = extraOnFirst => wrap(
    <div>
        <div data-testid="first"><UIRender meta={meta} data={{}} translate={v => `A:${v}`} {...extraOnFirst}/></div>
        <div data-testid="second"><UIRender meta={meta} data={{}} translate={v => `B:${v}`}/></div>
    </div>
)

const textOf = (view, id) => view.getByTestId(id).textContent

describe('two instances on one page keep their own translator', () => {
    it('at mount', () => {
        const view = render(twoInstances())

        expect(textOf(view, 'first')).toBe('A:hello')
        expect(textOf(view, 'second')).toBe('B:hello')
    })

    it('after the first one re-renders — the case a mount-only test cannot see', () => {
        const view = render(twoInstances())

        // Any prop change will do; `embedded` only swaps the outer container.
        view.rerender(twoInstances({ embedded: true }))

        expect(textOf(view, 'first')).toBe('A:hello')
        expect(textOf(view, 'second')).toBe('B:hello')
    })

    it('after the second one re-renders', () => {
        const view = render(twoInstances())

        view.rerender(wrap(
            <div>
                <div data-testid="first"><UIRender meta={meta} data={{}} translate={v => `A:${v}`}/></div>
                <div data-testid="second"><UIRender meta={meta} data={{}} translate={v => `B:${v}`} embedded/></div>
            </div>
        ))

        expect(textOf(view, 'first')).toBe('A:hello')
        expect(textOf(view, 'second')).toBe('B:hello')
    })

    it('an instance given no translator still renders its label', () => {
        // The fallback path: no `translate` prop, no parent to inherit from, so the module global is
        // what is left. It must not throw or blank the label.
        const view = render(wrap(<div data-testid="only"><UIRender meta={meta} data={{}}/></div>))

        expect(textOf(view, 'only')).toContain('hello')
    })
})

describe('two instances on one page keep their own form data', () => {
    // Every document read every form on the page until 2026-10-06, so each of two independent
    // documents found the other's fields in its `getFormData`, and in its `showIf` and upload data.
    // Measured on the previous code: the first read {"alpha":"A1","beta":"B2"}, and so did the second.
    it('each reads its own fields, and none of the other one', () => {
        const readers = {}
        const document = (name, value) => (
            <UIRender form meta={{ view: 'Input', name, label: name }} data={{ [name]: value }}
                      initialValues={{ [name]: value }} getFormData={read => { readers[name] = read }}/>
        )
        const view = render(wrap(<div>{document('alpha', 'A1')}{document('beta', 'B1')}</div>))
        const [, second] = view.container.querySelectorAll('input')
        fireEvent.change(second, { target: { value: 'B2' } })

        expect(readers.alpha()).toEqual({ alpha: 'A1' })
        expect(readers.beta()).toEqual({ beta: 'B2' })
    })
})
