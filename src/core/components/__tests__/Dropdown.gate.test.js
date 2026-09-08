/**
 * THE DROPDOWN GATE — what a user can observe, against the REAL `semantic-ui-react`.
 * =============================================================================================
 *
 * WHY THIS FILE EXISTS. §9.7-F1 step 3 replaces the `semantic-ui-react` `Dropdown` this component
 * wraps, and before this file there was no test a broken replacement had to fail. Measured on the
 * unmodified repo, not inferred: `Dropdown.behavior.test.js` opens with
 * `jest.mock('semantic-ui-react', () => ({Dropdown: jest.fn(() => null)}))`, and its tests pass
 * against an inner control that RENDERS NOTHING. `Dropdown.test.js` and `Dropdown.more.test.js`
 * do render the real library, but reach it through class names the rewrite is free to drop, and
 * between them they contained about one interaction — two of their tests asserted nothing at all
 * until part 1 rewrote them.
 *
 * So this file is deliberately narrow: only what a USER can observe, and only through handles a
 * replacement cannot avoid — the `listbox`/`option` roles, the displayed text, the callbacks, and
 * the absence of engine props on the DOM. No `.ui.dropdown` class assertions except the one the
 * loaded CSS genuinely selects on (`ui selection dropdown`, which `css.dropdown-contract` joins to
 * the stylesheet), and no assertions about the props object handed to the inner control — that
 * seam is what the swap deletes.
 *
 * THE ACCEPTANCE TEST FOR THIS FILE is that every test in it fails when the inner control renders
 * nothing. That was checked by stubbing it, one test at a time, before the file was committed.
 *
 * Values here are MEASURED, not chosen: each was read out of the rendered DOM first. In
 * particular a CLOSED dropdown mounts zero options, because the wrapper defaults to
 * `lazyLoad = true` — `mapper.js` passes `lazyLoad={false}` only for `view: "Dropdown"`, so the
 * two engine entry points differ here and `e2e/reference.js` records both.
 */
import React from 'react'
import { act, fireEvent, render } from '@testing-library/react'
import '@testing-library/jest-dom'
import { ConfigContext, initialConfigState } from '../../contexts/ConfigContext'
import { Dropdown } from '../Dropdown'

const OPTIONS = [
    { text: 'Option A', value: 'a' },
    { text: 'Option B', value: 'b' },
]

const withConfig = ui => (
    <ConfigContext.Provider value={initialConfigState}>{ui}</ConfigContext.Provider>
)

/** The control, by role — the one handle a listbox replacement cannot drop. */
const listbox = container => container.querySelector('[role="listbox"]')
const optionTexts = container => Array.from(container.querySelectorAll('[role="option"]'))
    .map(option => option.textContent.trim())
/** What the control shows as its current selection. */
const displayed = container => container.querySelector('.text').textContent.trim()

const open = container => { fireEvent.click(listbox(container)) }

describe('the dropdown a user sees', () => {
    it('renders one listbox, closed, showing the first option', () => {
        const { container } = render(withConfig(
            <Dropdown options={OPTIONS} name="region" onChange={() => {}}/>
        ))

        expect(container.querySelectorAll('[role="listbox"]')).toHaveLength(1)
        expect(listbox(container)).toHaveAttribute('aria-expanded', 'false')
        expect(listbox(container)).toHaveAttribute('tabindex', '0')
        // The first option is the wrapper's default selection, so it is what the control shows
        // before anyone touches it.
        expect(displayed(container)).toBe('Option A')
    })

    it('mounts the options only when opened, and says so on the control', () => {
        const { container } = render(withConfig(
            <Dropdown options={OPTIONS} name="region" onChange={() => {}}/>
        ))

        // Zero while closed: the wrapper's `lazyLoad = true` default. This is the majority
        // (`view: "Select"`) behaviour; `view: "Dropdown"` passes `lazyLoad={false}` and mounts
        // them up front. A replacement that changes either changes what a screen reader
        // enumerates, which is why both are recorded in `e2e/reference.js`.
        expect(optionTexts(container)).toEqual([])

        open(container)

        expect(optionTexts(container)).toEqual(['Option A', 'Option B'])
        expect(listbox(container)).toHaveAttribute('aria-expanded', 'true')
    })

    it('commits the option a user clicks, and reports it as (value, name, event)', () => {
        const calls = []
        // A plain function rather than `jest.fn()`: the house rule, since `isFunction()` in this
        // codebase rejects cross-realm functions.
        const { container } = render(withConfig(
            <Dropdown options={OPTIONS} name="region" onChange={(...args) => calls.push(args)}/>
        ))

        open(container)
        act(() => { fireEvent.click(container.querySelectorAll('[role="option"]')[1]) })

        expect(displayed(container)).toBe('Option B')
        expect(calls).toHaveLength(1)
        expect(calls[0].slice(0, 2)).toEqual(['b', 'region'])
        // The third argument is the originating DOM event.
        expect(calls[0][2]).toBeTruthy()
    })

    it('keeps engine props, `name` and `label` off the DOM while still reporting the name', () => {
        const calls = []
        const { container } = render(withConfig(
            <Dropdown options={OPTIONS} name="region" label="Region" view="Select" index={2}
                      onChange={(...args) => calls.push(args)}/>
        ))

        const attributes = Array.from(listbox(container).attributes).map(a => a.name)
        expect(attributes).not.toContain('view')
        expect(attributes).not.toContain('index')
        expect(attributes).not.toContain('name')
        expect(attributes).not.toContain('label')

        open(container)
        act(() => { fireEvent.click(container.querySelectorAll('[role="option"]')[1]) })

        // The name is stripped from the DOM but still reported — the strip happens after the
        // handler closures capture it, which is the part a replacement can silently break.
        expect(calls[0][1]).toBe('region')
    })

    it('renders `readonly` as a control a user cannot reach or open', () => {
        const { container } = render(withConfig(
            <Dropdown options={OPTIONS} name="region" readonly onChange={() => {}}/>
        ))

        expect(listbox(container)).toHaveAttribute('tabindex', '-1')
        expect(listbox(container).className).toContain('disabled')

        open(container)

        // A disabled control does not open.
        expect(optionTexts(container)).toEqual([])
    })

    /**
     * THE A11Y DEFECT INVENTORY, moved here from the browser leg's exclusive keeping. Both facts
     * were tagged `[R->I]` in `e2e/reference.js` as though only a browser could see them; the
     * step 3 part 1 audit measured both in jsdom, so they can be gated on every commit instead of
     * only in the `browser` CI job. The browser leg keeps them too — it is what proves the
     * accessibility TREE Chromium builds agrees with the attributes — but a replacement that
     * regresses them now fails much earlier.
     *
     * Pinned as CURRENT BEHAVIOUR, not as a contract to preserve: a WAI-ARIA listbox owes
     * `aria-activedescendant` and the rest, and this one has none of them. Step 3's replacement
     * should SHRINK the missing list, and the shrink is the diff that shows it.
     */
    /**
     * FLIPPED BY THE SWAP, and it is the outcome §9.5 predicted: it recorded that every `alert` in
     * the corpus role census is one dropdown and that "all of them should go to ZERO at step 3".
     * They have. The library announced a selection by writing it into a `role="alert" aria-live`
     * node — a workaround for a listbox whose cursor was not announceable — and the in-house
     * control does not need one: `aria-selected` marks the committed option and
     * `aria-activedescendant` points at the cursor, which is how a listbox is supposed to say both.
     *
     * `aria-activedescendant` appears only while open and only once there is a cursor, so a closed
     * control still carries none of the combobox attributes — which is why the absence list below
     * keeps four of its five names.
     */
    it('drops the `role="alert"` announcer, having made the cursor announceable instead', () => {
        const { container } = render(withConfig(
            <Dropdown options={OPTIONS} name="region" onChange={() => {}}/>
        ))

        expect(container.querySelectorAll('[role="alert"]')).toHaveLength(0)

        // Closed: no cursor, so nothing to point at yet.
        const present = ['aria-activedescendant', 'aria-controls', 'aria-haspopup', 'aria-labelledby', 'aria-label']
            .filter(attribute => listbox(container).hasAttribute(attribute))
        expect(present).toEqual([])

        // Open and move: the cursor is now announceable, which is what replaced the alert.
        open(container)
        fireEvent.keyDown(listbox(container), { key: 'ArrowDown' })
        expect(listbox(container)).toHaveAttribute('aria-activedescendant')
    })

    it('follows a cascading parent: new options, and the stale value replaced', () => {
        const calls = []
        const onChange = (...args) => calls.push(args.slice(0, 2))
        const { container, rerender } = render(withConfig(
            <Dropdown options={OPTIONS} value="b" name="region" onChange={onChange}/>
        ))
        expect(displayed(container)).toBe('Option B')

        act(() => {
            rerender(withConfig(
                <Dropdown options={[{ text: 'Option X', value: 'x' }]} value="b" name="region"
                          onChange={onChange}/>
            ))
        })

        // The host is TOLD to move to the surviving option — it is not moved silently, because the
        // form layer owns the value. That instruction is the cascading contract `rules.js` relies on.
        expect(calls).toEqual([['x', 'region']])
        open(container)
        expect(optionTexts(container)).toEqual(['Option X'])
    })
})
