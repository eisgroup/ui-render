/**
 * A DROPDOWN'S COMPLETED STATE — the `done` class the stylesheet selects on.
 * =============================================================================================
 *
 * `input.less` keeps a `float` dropdown's label above the selected value, and hides a multiple
 * selection's border, on `.input--wrapper.done`. The wrapper never set it from the value: it read
 * `props.value` after `value` had been taken out of the rest bag, so `done` was false whatever was
 * selected, and a `float` label sat over the very selection it named. That predates the
 * modernization; the code it came in with already had it.
 */
import React from 'react'
import { render } from '@testing-library/react'
import '@testing-library/jest-dom'
import { ConfigContext, initialConfigState } from '../../contexts/ConfigContext'
import { Dropdown } from '../Dropdown'

const OPTIONS = [
    { text: 'Option A', value: 'a' },
    { text: 'Zero', value: 0 },
]

const wrapperOf = props => {
    const { container } = render(
        <ConfigContext.Provider value={initialConfigState}>
            <Dropdown options={OPTIONS} name="region" label="Region" float onChange={() => {}} {...props}/>
        </ConfigContext.Provider>
    )
    return container.querySelector('.input--wrapper')
}

describe("a dropdown's completed state", () => {
    it('is set when the field has a value, so a float label stays above it', () => {
        expect(wrapperOf({ value: 'a' })).toHaveClass('done')
    })

    it('counts 0 as a value', () => {
        expect(wrapperOf({ value: 0 })).toHaveClass('done')
    })

    it.each([
        ['no value', undefined],
        ['null', null],
        ['an empty string', ''],
        ['an empty selection', []],
    ])('is not set for %s', (_, value) => {
        expect(wrapperOf({ value })).not.toHaveClass('done')
    })

    it('is not set while the field shows an error', () => {
        expect(wrapperOf({ value: 'a', error: 'Required' })).not.toHaveClass('done')
    })

    it('leaves an explicit `done` from the caller as it is', () => {
        expect(wrapperOf({ done: true })).toHaveClass('done')
        expect(wrapperOf({ value: 'a', done: false })).not.toHaveClass('done')
    })
})
