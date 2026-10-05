import React from 'react'
import classNames from '../utils/classNames'
import { ENGINE_PROPS, FIELD_ONLY_PROPS, omitProps } from './domProps'

/**
 * THE LISTBOX — in-house since §9.7-F1 step 3 part 2, no `semantic-ui-react`.
 * =============================================================================================
 *
 * WHAT THIS IS AND IS NOT. It is the inner control `components/Dropdown.tsx` renders: the part that
 * shows a selection, opens a list, and reports what a user picked. It is NOT the wrapper — option
 * sanitisation, the cascading reset, translation, the `(value, name, event)` callback signatures
 * and the form plumbing all stay where they are, untouched, because the swap was only ever about
 * the element at the bottom of that file.
 *
 * WHY IT IS HAND-ROLLED. The plan recommended `downshift`; the maintainers chose zero new
 * dependencies, and the reason is the step that follows this one: §9.7-F1 step 3½ removes
 * `semantic-ui-react` from `dependencies` precisely so its React peer range stops capping the
 * host's React, and "we removed one library and added another" is a poor answer to that.
 * `downshift` was measured first and would NOT have re-created that problem (its peer is
 * `react: '>=16.12.0'`, upper bound open) — it was rejected on dependency direction, not on a
 * defect. See UPGRADE-PLAN §9.7-F1 step 3.
 *
 * WHAT MADE IT TRACTABLE. `search`, `multiple` and `allowAdditions` were REMOVED from the public
 * API first, because nothing declares them — no tracked meta, and nothing in the consumer-only
 * attribute record. Those three are the bulk of what the library was doing and precisely where the
 * plan warned that hand-rolled implementations leak.
 *
 * THREE BEHAVIOUR CHANGES, ALL DELIBERATE, all measured against the library first:
 *
 *   ARROWS MOVE, ENTER COMMITS. `semantic-ui-react` defaults `selectOnNavigation` to true, so
 *   every ArrowDown COMMITTED the value it moved to — which is why Escape could not restore the
 *   previous one: there was nothing to restore to, the change had already been reported. Here the
 *   arrows move a cursor, `Enter` commits it, and `Escape` closes without reporting anything.
 *   That is the WAI-ARIA listbox contract and it makes Escape mean what it says.
 *
 *   FOCUS DOES NOT OPEN THE LIST. Measured in Chrome: tabbing to the old control opened it, with
 *   `aria-expanded="true"` before the user had asked for anything. A listbox opens on Enter,
 *   Space, or a click.
 *
 *   HOME, END AND TYPEAHEAD EXIST. Measured absent: `grep` over the whole library module never
 *   reads those keys, and typing a letter did nothing. They are part of the listbox contract, so
 *   they are here — this is the half of the keyboard matrix that had to be BUILT rather than
 *   ported, and the half no previous test covered.
 *
 * THE COMBOBOX PATTERN, AND WHY IT IS THE `.text` THAT TAKES FOCUS. The control follows WAI-ARIA's
 * select-only combobox: the element that takes focus is a `combobox` (`aria-haspopup`, `aria-expanded`,
 * `aria-controls` and `aria-activedescendant` on it, the field's label as its name), and the options sit
 * in a `listbox` BESIDE it. Beside, not inside, and this was measured: with the dropdown itself as the
 * combobox, Chromium folded the open list into its value, which read "Gold Gold" for a selected "Gold".
 * So the combobox is `> .text`, the part that shows the selection, and the dropdown is only the box that
 * holds it, its icon and its list: it keeps the class string, the handlers and every prop except
 * `aria-*`, which belongs where focus is. It has focus WITHIN it now rather than ON it, which is why
 * `dropdown.overrides` and `input.less` repeat each of its focus styles for `:focus-within`.
 *
 * THE CLASS STRING IS A CONTRACT, NOT DECORATION. `css.dropdown-contract.test.js` measures what
 * each token is worth in scoped CSS rules: `ui` and `dropdown` are worth all 13 rules that reach
 * the control and `selection` 12; the icon needs BOTH `icon` and `dropdown` on the same element;
 * `menu` carries 11 of the menu's 14 and `transition` 4; `item` 6 of an option's 7. Change any of
 * them and that many rules stop applying — which is why they are emitted here even though the
 * names are Semantic's.
 */

/** An option as the listbox renders it: `content` if set, else `text`, which typeahead matches. */
export type ListboxOption = {
    text?: React.ReactNode
    value?: unknown
    key?: React.Key | null
    content?: React.ReactNode
    disabled?: boolean
    [key: string]: unknown
}

/** What closes the list: an option's click or key, a click outside, or none, from the trigger. */
export type ListboxCloseEvent = React.SyntheticEvent | MouseEvent | undefined

/** The named props are read here. `aria-*` goes to the combobox, and the rest onto the dropdown. */
export type ListboxProps = {
    options?: ListboxOption[]
    value?: unknown
    placeholder?: React.ReactNode
    error?: boolean
    disabled?: boolean
    selection?: boolean
    compact?: boolean
    upward?: boolean
    lazyLoad?: boolean
    className?: string
    icon?: React.ReactNode
    onChange?: (event: React.SyntheticEvent, data: { value: unknown }) => void
    onClose?: (event: ListboxCloseEvent) => void
    onOpen?: () => void
    [key: string]: unknown
}

/** Keys that move the cursor, and by how much. `null` means "compute from the option count". */
const CURSOR_KEYS: Partial<Record<string, number | null>> = {
    ArrowDown: 1,
    ArrowUp: -1,
    Home: null,
    End: null,
    PageDown: 5,
    PageUp: -5,
}

/** How long a typed prefix stays open for the next keystroke to extend it. */
const TYPEAHEAD_RESET_MS = 700

const isSelectable = (option: ListboxOption | undefined) => option && !option.disabled

/** Per-instance option-id source. See `idPrefix`. */
let sequence = 0

/** The index the cursor should land on for a key, or -1 when the key does not move it. */
function cursorFor (key: string, current: number, options: ListboxOption[]): number {
    const step = CURSOR_KEYS[key]
    if (step === undefined) return -1
    const last = options.length - 1
    if (key === 'Home') return options.findIndex(isSelectable)
    if (key === 'End') {
        for (let i = last; i >= 0; i -= 1) if (isSelectable(options[i])) return i
        return -1
    }
    // WRAPS at the ends, and skips disabled options rather than landing on them. An earlier draft
    // stopped at the ends instead, on the reasoning that holding ArrowDown is how a user finds the
    // bottom of a long list — a real argument, but not one that justifies changing behaviour the
    // product already had. `UIRender.listbox-behavior` pinned wrapping as the contract, and the
    // swap's job is to keep it where there is no defect to fix.
    const count = options.length
    let next = current
    // Casts, not guards: the two `null` steps are Home's and End's, which returned above.
    for (let moved = 0; moved < Math.abs(step as number); moved += 1) {
        let candidate = next
        let guard = 0
        do {
            candidate = (candidate + ((step as number) > 0 ? 1 : -1) + count) % count
            guard += 1
        } while (!isSelectable(options[candidate]) && guard <= count)
        if (guard > count) return -1
        next = candidate
    }
    return next
}

/**
 * The index a typed prefix selects.
 *
 * Two rules, both from the WAI-ARIA Authoring Practices, and they pull in opposite directions:
 *   - successive DIFFERENT characters build a prefix, so "ga" finds "Gamma" and not "Alpha";
 *   - the SAME character repeated cycles through the options starting with it, so pressing "a"
 *     twice moves from "Alpha" to "Almond" rather than searching for "aa" and finding nothing.
 * The second is what a user does when they cannot remember the rest of the word, and without it a
 * repeated letter looks broken.
 */
function typeaheadFor (prefix: string, current: number, options: ListboxOption[]): number {
    const repeated = prefix.length > 1 && /^(.)\1*$/.test(prefix)
    const needle = (repeated ? prefix[0] : prefix).toLowerCase()
    const order: number[] = []
    for (let i = 1; i <= options.length; i += 1) order.push((current + i) % options.length)
    if (prefix.length > 1 && !repeated) order.unshift(current)
    // Only a GROWING prefix may stay where it is: typing "al" after "a" must not jump off "Alpha"
    // just because the search starts after the cursor. A single character moves to the NEXT match,
    // which is what the APG asks for and what a user pressing one letter expects; a repeated
    // character cycles, so it starts after the cursor too.
    const match = order.find(i => {
        const option = options[i]
        if (!isSelectable(option)) return false
        // `text` and nothing else. An earlier draft fell back to `option.value` when `text` was
        // absent, which the only caller does not produce: `Dropdown.tsx` takes an object option as
        // one with `text`, and every branch of its option sanitiser produces one
        // (`optionsLabel` produces `{text: '', content}`). `Listbox` is not exported from the
        // library, so that caller is the whole world — and the fallback disagreed with the trigger,
        // which renders `text` alone, so the two would have matched on different strings.
        return String(option.text).toLowerCase().startsWith(needle)
    })
    return match === undefined ? -1 : match
}

export default function Listbox ({
    options = [],
    value,
    placeholder,
    error,
    disabled,
    selection = true,
    compact,
    upward,
    lazyLoad = true,
    className,
    icon,
    onChange,
    onClose,
    onOpen,
    ...props
}: ListboxProps) {
    const [open, setOpen] = React.useState(false)
    /**
     * Per-instance id prefix for the options, so the control can point at the cursor with
     * `aria-activedescendant`. That attribute is on `e2e/reference.js`'s list of combobox wiring
     * this control did NOT have, and it is what makes the keyboard cursor announceable at all:
     * `aria-selected` marks the committed VALUE, and with navigation no longer committing (see the
     * header) the two are no longer the same option. A counter rather than `uuid()` — 36 characters
     * of `Math.random` in a render path. The ids are emitted only while OPEN, which is what makes
     * them safe in a snapshot: an earlier draft of this comment claimed "the options only exist
     * while open", and that is false — `lazyLoad={false}` on the `view: "Dropdown"` path mounts
     * them closed. See the `id` attribute below.
     */
    const [idPrefix] = React.useState(() => `ui-render-listbox-${sequence += 1}`)
    // The keyboard cursor, which is NOT the selection: it moves with the arrows and commits only on
    // Enter. -1 means "no cursor yet", so opening puts it on the selected option.
    const [cursor, setCursor] = React.useState(-1)
    const host = React.useRef<HTMLDivElement>(null)
    const control = React.useRef<HTMLDivElement>(null)
    const typed = React.useRef({ prefix: '', at: 0 })

    const selectedIndex = options.findIndex(option => String(option.value) === String(value))
    const selected = selectedIndex === -1 ? undefined : options[selectedIndex]

    const close = (event?: ListboxCloseEvent) => {
        setOpen(false)
        setCursor(-1)
        if (typeof onClose === 'function') onClose(event)
    }

    const openWith = () => {
        if (disabled) return
        setOpen(true)
        setCursor(selectedIndex)
        if (typeof onOpen === 'function') onOpen()
    }

    const commit = (event: React.SyntheticEvent, index: number) => {
        const option = options[index]
        if (!isSelectable(option)) return
        if (typeof onChange === 'function') onChange(event, { value: option.value })
        close(event)
    }

    /**
     * Closing on an outside click, from a listener attached only while open — the same shape the
     * tooltip uses. `mousedown` rather than `click`, so a press that starts outside closes the list
     * before it can also land on whatever is underneath.
     */
    React.useEffect(() => {
        if (!open) return undefined
        const dismiss = (event: MouseEvent) => {
            // A cast, not a guard: a mousedown's target is a node.
            if (host.current && host.current.contains(event.target as Node)) return
            close(event)
        }
        document.addEventListener('mousedown', dismiss)
        return () => document.removeEventListener('mousedown', dismiss)
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [open])

    const onKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
        if (disabled) return
        const { key } = event

        if (key === 'Escape') {
            if (open) {
                event.preventDefault()
                // Nothing is reported: the arrows moved a cursor, not the value, so there is
                // nothing to restore and nothing to undo.
                close(event)
            }
            return
        }

        if (!open) {
            // Enter, Space and the arrows open it; Tab does not, and neither does focus.
            if (key === 'Enter' || key === ' ') {
                event.preventDefault()
                openWith()
                return
            }
            if (key === 'ArrowDown' || key === 'ArrowUp') {
                event.preventDefault()
                // ArrowDown on a CLOSED control opens it and advances one step in the same press,
                // which is the behaviour `UIRender.listbox-behavior` pinned. Computed here rather
                // than deferred, because the cursor state is not yet the selected index.
                setOpen(true)
                setCursor(cursorFor(key, selectedIndex, options))
                if (typeof onOpen === 'function') onOpen()
            }
            return
        }

        if (key === 'Enter' || key === ' ') {
            event.preventDefault()
            commit(event, cursor)
            return
        }

        // `cursor`, not `cursor === -1 ? selectedIndex : cursor` as three earlier expressions here
        // read. The fallback could never fire: `openWith` seeds the cursor from the selection and
        // the open-on-arrow branch above computes it explicitly, so while the list is open the
        // cursor is `-1` only when `selectedIndex` is `-1` as well. The one path that does leave a
        // `-1` cursor open — every option disabled — behaved identically either way, because
        // `cursorFor` returns `-1` and `commit` rejects an unselectable option.
        const next = cursorFor(key, cursor, options)
        if (next !== -1) {
            event.preventDefault()
            setCursor(next)
            return
        }

        // Typeahead: a single printable character, with no modifier, extends the prefix.
        if (key.length === 1 && !event.ctrlKey && !event.metaKey && !event.altKey) {
            const now = typed.current
            const fresh = Date.now() - now.at > TYPEAHEAD_RESET_MS
            const prefix = (fresh ? '' : now.prefix) + key
            typed.current = { prefix, at: Date.now() }
            const match = typeaheadFor(prefix, cursor, options)
            if (match !== -1) {
                event.preventDefault()
                setCursor(match)
            }
        }
    }

    const showOptions = open || !lazyLoad

    // `aria-*` describes the control, so it goes where focus is; everything else stays on the dropdown,
    // where it always landed. The list is named after the control, as the pattern asks.
    const passthrough = omitProps(props, ENGINE_PROPS, FIELD_ONLY_PROPS)
    const ariaProps: Record<string, unknown> = {}
    const dropdownProps: Record<string, unknown> = {}
    Object.keys(passthrough).forEach(key => {
        (key.startsWith('aria-') ? ariaProps : dropdownProps)[key] = passthrough[key]
    })

    return (
        <div
            ref={host}
            // `ui` and `dropdown` are worth every scoped rule that reaches this element, and
            // `selection` all but one — see the file header and `css.dropdown-contract.test.js`.
            className={classNames('ui', { active: open, visible: open, error, disabled, compact, upward },
                { selection }, 'dropdown', className)}
            // A click anywhere on the dropdown, its icon and its padding included, focuses the control
            // as it did when the dropdown was the control: the keyboard must work after a click.
            onClick={() => {
                if (!disabled && control.current) control.current.focus()
                return open ? close() : openWith()
            }}
            onKeyDown={onKeyDown}
            {...dropdownProps}
        >
            {/* `divider` is Semantic's name for "this is the selection display", and it is worth
                two of this node's six rules. It is the combobox too: see the file header. */}
            <div
                ref={control}
                role="combobox"
                aria-haspopup="listbox"
                aria-expanded={open ? 'true' : 'false'}
                aria-controls={open ? idPrefix : undefined}
                aria-activedescendant={open && cursor !== -1 ? `${idPrefix}-${cursor}` : undefined}
                // A `role="combobox"` div cannot carry the native `disabled` attribute, so being
                // unavailable has to be SAID: `aria-disabled` for assistive technology, `tabIndex={-1}`
                // for the tab order, and the guards in `openWith`/`onKeyDown` for the behaviour. The
                // library said all three, and `readonly` fields in the corpus rely on it.
                aria-disabled={disabled ? 'true' : undefined}
                tabIndex={disabled ? -1 : 0}
                className={classNames('text', 'divider', { default: !selected })}
                {...ariaProps}
            >
                {selected ? (selected.content != null ? selected.content : selected.text) : placeholder}
            </div>
            {icon != null ? icon : <i aria-hidden="true" className="icon dropdown"/>}
            {/* The id exists only while open, as the options' do, so `aria-controls` never dangles. */}
            <div
                id={open ? idPrefix : undefined}
                role="listbox"
                aria-label={ariaProps['aria-label'] as string | undefined}
                aria-labelledby={ariaProps['aria-labelledby'] as string | undefined}
                className={classNames('menu', 'transition', { visible: open })}
            >
                {showOptions && options.map((option, index) => (
                    <div
                        key={option.key != null ? option.key : String(option.value)}
                        // ONLY WHILE OPEN, and this is not a micro-optimisation: `mapper.tsx` passes
                        // `lazyLoad={false}` for `view: "Dropdown"`, so these options sit in the
                        // CLOSED DOM, and the prefix is a per-mount counter. The 38-example DOM
                        // baseline renders every example twice and compares the two, which is what
                        // caught it: the same example produced `ui-render-listbox-1-0` and
                        // `ui-render-listbox-2-0`. A cursor only exists while the list is open, so
                        // the id it is addressed by can too — and a closed control emits no id at
                        // all rather than an unstable one.
                        id={open ? `${idPrefix}-${index}` : undefined}
                        role="option"
                        aria-selected={index === selectedIndex ? 'true' : 'false'}
                        aria-disabled={option.disabled ? 'true' : undefined}
                        className={classNames('item', {
                            selected: index === cursor,
                            active: index === selectedIndex,
                            disabled: option.disabled,
                        })}
                        onMouseDown={event => event.preventDefault()}
                        onClick={event => {
                            event.stopPropagation()
                            commit(event, index)
                        }}
                    >
                        {option.content != null ? option.content : option.text}
                    </div>
                ))}
            </div>
        </div>
    )
}

Listbox.displayName = 'Listbox'
