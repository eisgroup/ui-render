/**
 * `aria-describedby` MUST RESOLVE =============================================
 *
 * All three input components render the element that carries the help id only
 * when there is an `error` or an `info` message, but used to set
 * `aria-describedby` unconditionally. Every reference in a document without
 * validation messages therefore pointed at an id that existed nowhere — an axe
 * `aria-valid-attr-value` violation, and for a screen-reader user a described-by
 * relationship that announces nothing.
 *
 * The corpus-wide version of this invariant (every reference in all 38 rendered
 * examples resolves) lives in
 * src/demo/examples/__tests__/examples.dom-contract.test.js. This suite is the
 * positive half: the attribute must still appear, and still resolve, as soon as
 * there IS something to describe.
 * -----------------------------------------------------------------------------
 */
import React from 'react'
import { render } from '@testing-library/react'
import '@testing-library/jest-dom'
import Input from '../Input'
import InputNumber from '../InputNumber'
import InputDate from '../InputDate'
import { ConfigContext, initialConfigState } from '../../contexts/ConfigContext'

const wrap = ui => <ConfigContext.Provider value={initialConfigState}>{ui}</ConfigContext.Provider>

// rc-picker owns InputDate's control, so the described element is found by attribute
// rather than by role: one query works for a plain <input> and for the picker alike.
const described = container => container.querySelector('[aria-describedby]')

const cases = [
    ['Input', props => <Input name="street" {...props} />],
    ['InputNumber', props => <InputNumber name="street" {...props} />],
    ['InputDate', props => <InputDate name="street" {...props} />],
]

describe.each(cases)('%s aria-describedby', (name, element) => {
    it('sets no reference while there is nothing to describe', () => {
        const { container } = render(wrap(element({})))

        expect(described(container)).toBeNull()
        expect(container.querySelector('.field-help')).toBeNull()
    })

    it('references the error message once one is displayed', () => {
        const { container } = render(wrap(element({ error: 'Required' })))

        const control = described(container)
        expect(control).not.toBeNull()
        const help = container.querySelector(`#${CSS.escape(control.getAttribute('aria-describedby'))}`)
        expect(help).toHaveTextContent('Required')
    })

    it('references the info message when there is no error', () => {
        const { container } = render(wrap(element({ info: 'Street and number' })))

        const control = described(container)
        expect(control).not.toBeNull()
        const help = container.querySelector(`#${CSS.escape(control.getAttribute('aria-describedby'))}`)
        expect(help).toHaveTextContent('Street and number')
    })
})
