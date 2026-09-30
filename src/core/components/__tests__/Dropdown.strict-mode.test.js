/**
 * THE DROPDOWN UNDER StrictMode SHOWS WHAT IT SHOWS WITHOUT IT.
 * =============================================================================================
 *
 * Found by §9.3 step 7's pass over the corpus under StrictMode: seven examples rendered their
 * dropdowns with the placeholder instead of a selection. The dropdown syncs its value from the
 * parent in an effect that skipped its first run through a mount flag in a ref. StrictMode runs a
 * mount's effects twice, and on the second run the flag was already cleared, so the effect
 * replaced the default selection, the first option, with no selection at all.
 */
import React from 'react'
import { render } from '@testing-library/react'
import '@testing-library/jest-dom'
import { ConfigContext, initialConfigState } from '../../contexts/ConfigContext'
import { Dropdown } from '../Dropdown'

const OPTIONS = [
    { text: 'Option A', value: 'a' },
    { text: 'Option B', value: 'b' },
]

const displayed = container => container.querySelector('.text').textContent.trim()

function renderDropdown (props, { strict }) {
    const Wrapper = strict ? React.StrictMode : React.Fragment
    return render(
        <Wrapper>
            <ConfigContext.Provider value={initialConfigState}>
                <Dropdown options={OPTIONS} name="region" onChange={() => {}} {...props}/>
            </ConfigContext.Provider>
        </Wrapper>
    )
}

describe('a dropdown under StrictMode', () => {
    it('shows its first option when the parent gives it no value, as it does without StrictMode', () => {
        const { container: plain } = renderDropdown({}, { strict: false })
        const { container: strict } = renderDropdown({}, { strict: true })

        expect(displayed(plain)).toBe('Option A')
        expect(displayed(strict)).toBe('Option A')
    })

    it('shows the value the parent gives it, and follows it when it changes', () => {
        const { container, rerender } = renderDropdown({ value: 'b' }, { strict: true })
        expect(displayed(container)).toBe('Option B')

        rerender(
            <React.StrictMode>
                <ConfigContext.Provider value={initialConfigState}>
                    <Dropdown options={OPTIONS} name="region" onChange={() => {}} value="a"/>
                </ConfigContext.Provider>
            </React.StrictMode>
        )

        expect(displayed(container)).toBe('Option A')
    })
})
