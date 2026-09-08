/**
 * THE LISTBOX'S OWN CONTRACT — markup, and the keyboard matrix that had to be built.
 * =============================================================================================
 *
 * `Dropdown.gate.test.js` gates the WRAPPER through the engine's eyes. This file gates the inner
 * control directly, because that is where §9.7-F1 step 3 part 2's new code lives and because the
 * keyboard half of it has no predecessor to compare against: `Home`, `End`, `PageUp`, `PageDown`
 * and typeahead were measured ABSENT from `semantic-ui-react`'s dropdown, so there is no "does it
 * still work" question to ask — only "does it work".
 *
 * The three deliberate behaviour changes are each asserted against what the library did, stated in
 * the test name, so a reader sees the difference rather than having to know it: arrows move without
 * committing (the library committed as it moved), focus does not open the list (the library opened
 * on Tab), and Escape reports nothing (the library had already reported, so Escape could not
 * restore).
 */
import React from 'react'
import { fireEvent, render } from '@testing-library/react'
import '@testing-library/jest-dom'
import Listbox from '../Listbox'

const OPTIONS = [
    { text: 'Alpha', value: 'a' },
    { text: 'Beta', value: 'b' },
    { text: 'Gamma', value: 'c' },
]

/** Plain functions, never `jest.fn()` — `isFunction()` in this codebase rejects cross-realm ones. */
const drive = (props = {}) => {
    const changes = []
    const closes = []
    const view = render(
        <Listbox
            options={OPTIONS}
            onChange={(event, data) => changes.push(data.value)}
            onClose={() => closes.push('closed')}
            {...props}
        />
    )
    const control = view.container.querySelector('[role="listbox"]')
    return {
        ...view,
        control,
        changes,
        closes,
        text: () => control.querySelector('.text').textContent,
        options: () => Array.from(control.querySelectorAll('[role="option"]')).map(o => o.textContent),
        cursor: () => {
            const at = control.querySelector('[role="option"].selected')
            return at ? at.textContent : null
        },
        committed: () => {
            const at = control.querySelector('[role="option"][aria-selected="true"]')
            return at ? at.textContent : null
        },
        press: key => fireEvent.keyDown(control, { key }),
    }
}

describe('what the listbox renders', () => {
    it('emits the class tokens the CSS contract measures, closed and open', () => {
        const { control } = drive()

        expect(control.className.split(' ').sort().join(' ')).toBe('dropdown selection ui')

        fireEvent.click(control)

        expect(control.className.split(' ').sort().join(' ')).toBe('active dropdown selection ui visible')
        expect(control.querySelector('.menu').className.split(' ').sort().join(' '))
            .toBe('menu transition visible')
        expect(control.querySelector('i').className).toBe('icon dropdown')
    })

    it('shows the placeholder until something is selected, then the option', () => {
        const { text, rerender } = drive({ placeholder: 'Pick one' })
        expect(text()).toBe('Pick one')

        rerender(<Listbox options={OPTIONS} value="b" placeholder="Pick one" onChange={() => {}}/>)
        expect(text()).toBe('Beta')
    })

    it('mounts the options only when open, unless `lazyLoad` is off', () => {
        const lazy = drive()
        expect(lazy.options()).toEqual([])
        fireEvent.click(lazy.control)
        expect(lazy.options()).toEqual(['Alpha', 'Beta', 'Gamma'])

        const eager = drive({ lazyLoad: false })
        expect(eager.options()).toEqual(['Alpha', 'Beta', 'Gamma'])
    })

    it('marks the committed option with `active` and `aria-selected`', () => {
        const { control, committed } = drive({ value: 'b' })
        fireEvent.click(control)

        expect(committed()).toBe('Beta')
        expect(control.querySelector('[role="option"].active').textContent).toBe('Beta')
    })
})

describe('opening and closing', () => {
    it('opens on click and closes on a second click', () => {
        const { control, closes } = drive()

        fireEvent.click(control)
        expect(control).toHaveAttribute('aria-expanded', 'true')

        fireEvent.click(control)
        expect(control).toHaveAttribute('aria-expanded', 'false')
        expect(closes).toEqual(['closed'])
    })

    it('opens on Enter and on Space, but NOT on focus — the library opened on Tab', () => {
        const { control, press } = drive()

        fireEvent.focus(control)
        expect(control).toHaveAttribute('aria-expanded', 'false')

        press('Enter')
        expect(control).toHaveAttribute('aria-expanded', 'true')

        press('Escape')
        press(' ')
        expect(control).toHaveAttribute('aria-expanded', 'true')
    })

    it('closes on Escape and reports NOTHING — the library had already committed by then', () => {
        const { control, press, changes, closes } = drive({ value: 'a' })

        press('Enter')
        press('ArrowDown')
        press('Escape')

        expect(control).toHaveAttribute('aria-expanded', 'false')
        expect(changes).toEqual([])
        expect(closes).toEqual(['closed'])
    })

    it('closes on a press outside itself', () => {
        const { control, closes } = drive()
        fireEvent.click(control)

        fireEvent.mouseDown(document.body)

        expect(control).toHaveAttribute('aria-expanded', 'false')
        expect(closes).toEqual(['closed'])
    })

    it('is neither reachable nor openable when disabled', () => {
        const { control, press, options } = drive({ disabled: true })

        expect(control).toHaveAttribute('tabindex', '-1')
        fireEvent.click(control)
        press('Enter')

        expect(control).toHaveAttribute('aria-expanded', 'false')
        expect(options()).toEqual([])
    })
})

describe('the keyboard matrix, which had no predecessor', () => {
    it('moves the cursor with the arrows WITHOUT committing — the library committed as it moved', () => {
        const { press, cursor, changes, text } = drive({ value: 'a' })

        press('Enter')
        expect(cursor()).toBe('Alpha')

        press('ArrowDown')
        expect(cursor()).toBe('Beta')
        // The whole point: the value has not moved and the host has not been told.
        expect(changes).toEqual([])
        expect(text()).toBe('Alpha')

        press('ArrowUp')
        expect(cursor()).toBe('Alpha')
    })

    it('commits the cursor on Enter', () => {
        const { press, changes } = drive({ value: 'a' })

        press('Enter')
        press('ArrowDown')
        press('ArrowDown')
        press('Enter')

        expect(changes).toEqual(['c'])
    })

    it('jumps to the first and last option with Home and End — measured absent before', () => {
        const { press, cursor } = drive({ value: 'b' })

        press('Enter')
        press('End')
        expect(cursor()).toBe('Gamma')

        press('Home')
        expect(cursor()).toBe('Alpha')
    })

    /**
     * WRAPS, and an earlier draft of this component deliberately did not — on the reasoning that
     * holding ArrowDown is how a user finds the bottom of a long list. A real argument, but not
     * one that justifies changing behaviour the product already had and that
     * `UIRender.listbox-behavior` pinned as its contract. Reverted, and pinned here too so the
     * next person with the same idea sees that it was considered.
     */
    it('wraps at the ends, as the library did', () => {
        const { press, cursor } = drive({ value: 'c' })

        press('Enter')
        press('ArrowDown')
        expect(cursor()).toBe('Alpha')

        press('ArrowUp')
        expect(cursor()).toBe('Gamma')
    })

    it('opens on ArrowDown from closed, advancing one step in the same press', () => {
        const { control, press, cursor } = drive({ value: 'a' })

        press('ArrowDown')

        expect(control).toHaveAttribute('aria-expanded', 'true')
        expect(cursor()).toBe('Beta')
    })

    it('points at the cursor with `aria-activedescendant`, which the library never set', () => {
        const { control, press } = drive({ value: 'a' })

        expect(control).not.toHaveAttribute('aria-activedescendant')

        press('Enter')
        press('ArrowDown')

        const at = control.getAttribute('aria-activedescendant')
        expect(at).toBeTruthy()
        expect(document.getElementById(at).textContent).toBe('Beta')
        // `aria-selected` still marks the COMMITTED value, which is the whole reason the cursor
        // needs an attribute of its own now that navigating no longer commits.
        expect(control.querySelector('[aria-selected="true"]').textContent).toBe('Alpha')
    })

    it('moves by a page with PageDown and PageUp, clamped to the ends', () => {
        const { press, cursor } = drive({ value: 'a' })

        press('Enter')
        press('PageDown')
        expect(cursor()).toBe('Gamma')

        press('PageUp')
        expect(cursor()).toBe('Alpha')
    })

    it('finds an option by typing its first letters — measured absent before', () => {
        const { press, cursor } = drive({ value: 'a' })

        press('Enter')
        press('g')
        expect(cursor()).toBe('Gamma')
    })

    it('builds a PREFIX from successive different characters, rather than searching per key', () => {
        const { press, cursor } = drive({
            value: 'a',
            options: [
                { text: 'Gamma', value: 'a' },
                { text: 'Grape', value: 'b' },
                { text: 'Beta', value: 'c' },
            ],
        })

        press('Enter')
        press('g')
        press('r')

        // "gr" — not a fresh search for "r", which would have found nothing and stayed put.
        expect(cursor()).toBe('Grape')
    })

    it('starts a fresh search once the prefix window has elapsed', () => {
        jest.useFakeTimers()
        try {
            const { press, cursor } = drive({ value: 'a' })

            press('Enter')
            press('g')
            expect(cursor()).toBe('Gamma')

            // Past the reset window, so this is a new search and not the prefix "gb".
            jest.advanceTimersByTime(1000)
            press('b')
            expect(cursor()).toBe('Beta')
        } finally {
            jest.useRealTimers()
        }
    })

    it('walks through options that share a letter when the same letter is repeated', () => {
        const { press, cursor } = drive({
            value: 'a',
            options: [
                { text: 'Alpha', value: 'a' },
                { text: 'Almond', value: 'b' },
                { text: 'Beta', value: 'c' },
            ],
        })

        press('Enter')
        press('a')
        expect(cursor()).toBe('Almond')

        press('a')
        expect(cursor()).toBe('Alpha')
    })

    it('skips a disabled option rather than landing on it', () => {
        const { press, cursor, changes } = drive({
            value: 'a',
            options: [
                { text: 'Alpha', value: 'a' },
                { text: 'Beta', value: 'b', disabled: true },
                { text: 'Gamma', value: 'c' },
            ],
        })

        press('Enter')
        press('ArrowDown')
        expect(cursor()).toBe('Gamma')

        press('Enter')
        expect(changes).toEqual(['c'])
    })

    it('does not commit a disabled option that is clicked', () => {
        const { control, changes } = drive({
            options: [{ text: 'Alpha', value: 'a', disabled: true }],
        })

        fireEvent.click(control)
        fireEvent.click(control.querySelector('[role="option"]'))

        expect(changes).toEqual([])
    })

    describe('the edges the coverage floor found', () => {
        /**
         * Every test here exists because `jest --coverage` named a line this suite never reached.
         * They are kept as behaviour, not as coverage padding: each one states an outcome a
         * consumer could hit, and the file's siblings (`Table.js`, `TooltipPop.js`) hold the same
         * 100% floor for the same reason — a fresh in-house component with unexercised branches is
         * a component whose edges nobody has decided about.
         */
        it('has nowhere to put a cursor when every option is disabled', () => {
            const allDisabled = [
                { text: 'Alpha', value: 'a', disabled: true },
                { text: 'Beta', value: 'b', disabled: true },
            ]
            const { control, cursor, press, changes } = drive({ options: allDisabled })

            fireEvent.click(control)
            press('End')
            expect(cursor()).toBeNull()
            press('Home')
            expect(cursor()).toBeNull()
            press('ArrowDown')
            expect(cursor()).toBeNull()

            // And Enter cannot commit what does not exist.
            press('Enter')
            expect(changes).toEqual([])
        })

        it('opens upward-navigating from closed too, not only with ArrowDown', () => {
            const { control, cursor, press } = drive({ value: 'b' })

            press('ArrowUp')

            expect(control).toHaveAttribute('aria-expanded', 'true')
            expect(cursor()).toBe('Alpha')
        })

        it('seeds the cursor from the selection when the list is opened by click', () => {
            // This is what makes the keyboard start from the committed value rather than from the
            // top of the list, and it is why three `cursor === -1 ? selectedIndex : cursor`
            // expressions could be removed from the key handler: by the time it runs, the cursor
            // has already been seeded.
            const { control, cursor, press, changes } = drive({ value: 'b' })

            fireEvent.click(control)
            expect(cursor()).toBe('Beta')

            press('ArrowDown')
            expect(cursor()).toBe('Gamma')

            press('Enter')
            expect(changes).toEqual(['c'])
        })

        it('starts typeahead from that seeded cursor, so a letter moves to the NEXT match', () => {
            const { control, cursor, press } = drive({ value: 'b' })

            fireEvent.click(control)
            press('g')

            expect(cursor()).toBe('Gamma')
        })

        it('reports opening and closing through `onOpen`', () => {
            const opens = []
            const view = render(
                <Listbox options={OPTIONS} onOpen={() => opens.push('opened')}/>
            )
            const control = view.container.querySelector('[role="listbox"]')

            fireEvent.click(control)
            expect(opens).toEqual(['opened'])

            fireEvent.click(control)
            fireEvent.keyDown(control, { key: 'ArrowDown' })
            expect(opens).toEqual(['opened', 'opened'])
        })

        it('ignores a mousedown inside itself, which is what keeps a click from closing twice', () => {
            const { control, closes } = drive()

            fireEvent.click(control)
            fireEvent.mouseDown(control)

            expect(control).toHaveAttribute('aria-expanded', 'true')
            expect(closes).toEqual([])
        })

        it('prevents default on an option mousedown, so the control keeps focus', () => {
            const { control } = drive()
            fireEvent.click(control)

            const option = control.querySelector('[role="option"]')
            const prevented = !fireEvent.mouseDown(option)

            expect(prevented).toBe(true)
        })

        it('typeahead skips disabled options and reports no match rather than guessing', () => {
            const { control, cursor, press } = drive({
                options: [
                    { text: 'Alpha', value: 'a' },
                    { text: 'Beta', value: 'b', disabled: true },
                ],
            })

            fireEvent.click(control)
            press('b')
            expect(cursor()).toBeNull()

            press('z')
            expect(cursor()).toBeNull()
        })

        it('reads the label from `text` alone, in the trigger and in typeahead alike', () => {
            // Pinned because the two used to disagree: `typeaheadFor` fell back to `option.value`
            // when `text` was absent and the trigger did not, so a caller in that state would have
            // seen an empty trigger and a control that matched on the value. `Dropdown.js`
            // guarantees `text` (required propType, and every sanitiser branch emits one), so the
            // fallback was unreachable as well as inconsistent — one rule now.
            const { control, options, text, press, cursor } = drive({
                options: [{ text: 'zeta', value: 'z' }, { text: '', value: 'blank' }],
                value: 'z',
            })

            expect(text()).toBe('zeta')
            fireEvent.click(control)
            expect(options()).toEqual(['zeta', ''])

            // Matching on the VALUE finds nothing, which is the half that used to differ.
            press('b')
            expect(cursor()).toBe('zeta')
        })

        it('renders `content` in place of `text`, in the trigger and in the list', () => {
            const { control, text, options } = drive({
                options: [{ text: 'Alpha', value: 'a', content: 'Alpha, in full' }],
                value: 'a',
            })

            expect(text()).toBe('Alpha, in full')
            fireEvent.click(control)
            expect(options()).toEqual(['Alpha, in full'])
        })

        it('keys options by `key` when one is given', () => {
            // Not observable in the DOM by design — React keys are not attributes — so this
            // asserts the render succeeds and stays stable across a reorder, which is what a key
            // is FOR: without it, React would reuse the wrong node.
            const keyed = [
                { text: 'Alpha', value: 'a', key: 'k-a' },
                { text: 'Beta', value: 'b', key: 'k-b' },
            ]
            const { control, options, rerender } = drive({ options: keyed, lazyLoad: false })

            expect(options()).toEqual(['Alpha', 'Beta'])
            rerender(<Listbox options={[keyed[1], keyed[0]]} lazyLoad={false}/>)
            expect(options()).toEqual(['Beta', 'Alpha'])
            expect(control.querySelectorAll('[role="option"]')).toHaveLength(2)
        })

        it('commits without an `onChange`, and does not throw doing it', () => {
            // The prop is optional, and every call site in the product supplies one — but a
            // component that crashes when an optional callback is absent is a trap for the next one.
            const view = render(<Listbox options={OPTIONS} value="a"/>)
            const control = view.container.querySelector('[role="listbox"]')

            fireEvent.click(control)
            fireEvent.keyDown(control, { key: 'ArrowDown' })
            fireEvent.keyDown(control, { key: 'Enter' })

            expect(control).toHaveAttribute('aria-expanded', 'false')
        })

        it('leaves a closed control alone on Escape and on a printable key', () => {
            // Escape must not be swallowed while closed — a dialog or a form above may be
            // listening for it — and typeahead is an OPEN-list feature, so a letter typed at a
            // closed control does nothing rather than opening it silently.
            const { control, press } = drive()

            // `fireEvent` returns false when the handler called preventDefault(); true here means
            // Escape was not consumed, so it keeps bubbling to whatever is listening above.
            const escape = fireEvent.keyDown(control, { key: 'Escape' })
            expect(escape).toBe(true)
            expect(control).toHaveAttribute('aria-expanded', 'false')

            press('a')
            expect(control).toHaveAttribute('aria-expanded', 'false')
        })

        it('renders with no options prop at all', () => {
            const view = render(<Listbox/>)
            const control = view.container.querySelector('[role="listbox"]')

            fireEvent.click(control)

            expect(control).toHaveAttribute('aria-expanded', 'true')
            expect(control.querySelectorAll('[role="option"]')).toHaveLength(0)
        })
    })

    describe('option ids', () => {
        /**
         * FOUND BY THE 38-EXAMPLE DOM BASELINE, not here, and worth recording as the reason this
         * describe exists. `aria-activedescendant` has to name an option by `id`, and the prefix is
         * a per-mount counter; `mapper.js` passes `lazyLoad={false}` for `view: "Dropdown"`, so the
         * options are in the CLOSED DOM. The baseline renders every example twice and compares the
         * two renders, and that comparison failed with `ui-render-listbox-1-0` against
         * `ui-render-listbox-2-0` — a snapshot that would have churned on every unrelated change
         * to the corpus. The fix is that a closed control emits no option id at all.
         */
        it('emits none while closed, even with the options mounted', () => {
            const { control } = drive({ lazyLoad: false })

            expect(control.querySelectorAll('[role="option"]')).toHaveLength(3)
            expect([...control.querySelectorAll('[role="option"]')].map(option => option.id))
                .toEqual(['', '', ''])
            expect(control).not.toHaveAttribute('aria-activedescendant')
        })

        it('renders identically twice, which is what the corpus baseline requires', () => {
            const first = render(<Listbox options={OPTIONS} lazyLoad={false}/>)
            const second = render(<Listbox options={OPTIONS} lazyLoad={false}/>)

            expect(first.container.innerHTML).toBe(second.container.innerHTML)
        })

        it('emits them once open, so the cursor can be addressed', () => {
            const { control } = drive({ lazyLoad: false })

            fireEvent.keyDown(control, { key: 'ArrowDown', keyCode: 40 })

            const cursorId = control.getAttribute('aria-activedescendant')
            expect(cursorId).toBeTruthy()
            expect(document.getElementById(cursorId)).toHaveAttribute('role', 'option')
        })
    })
})
