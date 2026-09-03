import React from 'react'
import Tooltip from './Tooltip'
import classNames from '../utils/classNames'
import { ENGINE_PROPS, FIELD_ONLY_PROPS, omitProps } from './domProps'

/**
 * THE HOVER TOOLTIP — in-house since §9.7-F1 step 2 part 3, no `semantic-ui-react`.
 * =============================================================================================
 *
 * WHAT WAS REPLACED, AND WHY IT WAS A FIX RATHER THAN A TRADE
 * -----------------------------------------------------------------------------
 * This file used to be 24 lines around `semantic-ui-react`'s `Popup`. Measured in real Chrome on
 * the production build (`e2e/`, §9.7-F1 step 2 part 2): at EVERY use site a meta can declare, the
 * bubble rendered at the document origin — ~730 px from its trigger on `buttonIcon`, 2538-3006 px
 * on `all` — with no `data-popper-placement` anywhere, and every open raised an uncaught
 * `TypeError` from popper's flip modifier. Cause: SUIR clones the trigger with a `ref`, and of
 * everything a meta can declare NOTHING can hold one (`mapper.js` uses the plain `Row`, `Button`
 * is a `React.memo(function Button)`; only `Dropzone` and the unused `RowRef` export are ref-able),
 * so popper's reference element was `null` and `getClippingParents(null)` threw before a single
 * coordinate was written. On top of that the bubble portaled into `document.body`, outside
 * `.ui-render`, so not one of the 13 scoped `.ui.popup` rules could paint it.
 *
 * So there was no working positioning to lose. This is the same inline `<span>` the product has
 * shipped for years through `components/Tooltip.js` (`Slider`, `modules/upload/views/Upload.js`,
 * `withFormSetup`'s validation tooltip — 5 snapshot-gated bubbles in the corpus), plus the
 * JavaScript the CSS cannot express.
 *
 * WHY THERE IS JAVASCRIPT AT ALL, WHEN `tooltip.less` REVEALS ON `*:hover > &`
 * -----------------------------------------------------------------------------
 * Because that rule has NO delay and cannot be given one. The reveal block sets
 * `animation-delay: @speed-base`, but the later `.fade-in` block it extends sets the `animation`
 * SHORTHAND, which resets `animation-delay` to `0s` — measured computed style on hover:
 * `animationDelay: "0s"`, `display: flex` at t=0. Reaching for `transition-delay` instead would
 * mean editing a rule shared with `Slider`, `Upload` and the validation tooltip. The 500 ms is a
 * deliberate UX decision ("avoiding an accidental popup when the user is already familiar with the
 * UI") pinned to the millisecond in three suites, so it stays in JavaScript.
 *
 * THE CRUX: THE BUBBLE IS MOUNTED ONLY WHILE OPEN.
 * A bubble that is in the DOM is revealed by `*:hover > .tooltip` regardless of what this
 * component thinks, instantly, and no class can defeat that at equal specificity. A node that does
 * not exist cannot be matched by any rule — so mount-on-open is what makes the delay, focus-open,
 * Escape and click-outside possible at all, and it is also why a closed tooltip still adds no text
 * to the accessibility tree and no `role` to the corpus role census.
 *
 * WHAT CHANGED FOR A USER
 * -----------------------------------------------------------------------------
 *   FIXED    the bubble is positioned next to its trigger, painted by our own CSS, and opening it
 *            raises nothing.
 *   REMOVED  click-to-open, and A TAP DOES NOT OPEN IT EITHER. SUIR ran `on: ['click', 'hover']`;
 *            every tooltipped node in the corpus already owns its `onClick`, so one gesture fired
 *            both the action and the tooltip, and the tooltip arrived after the action had run.
 *            Dropped deliberately, and recorded in `docs/SUPPORTED-PROPS.md` under `dropped.on` —
 *            the CHANGELOG itself is step 5's debt, so that row IS the record.
 *
 *            REMOVING THE GESTURE WAS NOT ENOUGH, and both remaining routes were found in a real
 *            browser rather than by reasoning. Clicking a `<button>` FOCUSES it, and focus-open
 *            then showed the bubble instantly; a TAP synthesises the compatibility mouse sequence
 *            with nothing following to move the pointer away, so the emulated hover stuck and the
 *            bubble appeared 500 ms after every tap. Hence the two guards below, which read the
 *            pointer rather than the gesture.
 *
 *            CONSEQUENCE, stated because it is a real cost: a touch-only device now has no way to
 *            see a tooltip at all. Same trade as the desktop change — the tooltip is
 *            supplementary, the node's action is not — and the reason a tooltip must never be the
 *            only place information lives.
 *   ADDED    focus opens it and blur closes it, the bubble carries `role="tooltip"` and the
 *            trigger points at it with `aria-describedby`. With click gone and hover unavailable to
 *            a keyboard there would otherwise be NO keyboard path to the content, so this is a
 *            consequence of the removal above rather than a separate feature.
 *   LOST     flip, viewport-edge handling and the 250 px wrap, plus clipping by an `overflow:
 *            hidden` ancestor. The first two never ran on any meta path (see above); the wrap and
 *            the clipping are real losses, and `docs/SUPPORTED-PROPS.md` records them.
 *   UNCHANGED  the bubble is still not hoverable — the pointer moving onto it closes the tooltip,
 *            exactly as SUIR behaved without `hoverable`. Not an oversight and not fixable here:
 *            the bubble must keep `pointer-events: none` or it sits under the pointer and the
 *            tooltip flickers, which means the pointer over the bubble is really over whatever is
 *            behind it. Hoverable text and a non-interactive bubble are mutually exclusive.
 *
 * WHAT THIS COMPONENT DELIBERATELY DOES NOT DO: position anything. There is no measuring, no
 * portal and no coordinate arithmetic — `src/style/components/tooltip.less` owns all eight
 * placements, and the wrapper `<span class="tooltip-host">` is the positioned ancestor they resolve
 * against.
 *
 * WHICH MAKES THE HOST'S SIZE PART OF THIS COMPONENT'S CONTRACT, not a styling detail: every
 * placement is measured off the host's box, so the host has to be exactly its trigger's size.
 * `tooltip.less` gives it `width: fit-content` for that reason — without it the host is stretched
 * by any flex container it lands in (`inline-flex` is blockified to `flex` for a flex item, and
 * `align-items: stretch` does the rest) and the bubble drifts with it. Measured before the fix:
 * a 1222 px host around a 35 px button, bubble 559 px from its trigger. Do not "simplify"
 * `tooltip.less:.tooltip-host` — `css.tooltip-contract.test.js` and the browser leg both pin it.
 */

/**
 * The close delay `semantic-ui-react`'s `Portal` applied, kept to the millisecond because
 * `TooltipPop.behavior.test.js` and the browser leg both pin it: the bubble must survive a pointer
 * that clips the edge of the trigger on its way somewhere else.
 */
const CLOSE_DELAY = 70

/**
 * The placement words `tooltip.less` understands, in the order `Tooltip.js` composes them.
 * `position` is parsed rather than validated: semantic-ui-react's vocabulary spelled the four
 * sides with a second word (`top center`, `left center`), and those extra words map onto nothing
 * here, so they are ignored instead of rejected.
 */
const PLACEMENTS = ['top', 'bottom', 'right', 'left']

/**
 * Props `semantic-ui-react`'s `Popup` / `Portal` handled that this implementation deliberately
 * does not. `docs/SUPPORTED-PROPS.md` carries the reason per prop; the short version is that not
 * one of them occurs on a tooltip node in the demo corpus or in any audited consumer meta, and the
 * four that DID have an effect describe machinery that is gone (`mountNode` and `popper` are
 * portal plumbing, `pinned` and `offset` configure popper).
 *
 * Stripped rather than left to ride the rest spread, for the reason step 1 recorded on `Table`:
 * a string-valued one lands on the bubble as a lowercase attribute (`size="mini"`), which is the
 * junk the DOM contract's tripwires exist to keep out, while a camelCase one draws a React
 * unknown-prop warning that says nothing useful. Stripping SILENTLY would be worse than either —
 * a consumer whose meta still says `on: ['hover']` would never learn it stopped doing anything.
 * So: strip, and say so once per prop in development.
 */
const DROPPED_PROPS = [
    'as', 'basic', 'closeOnDocumentClick', 'closeOnEscape', 'defaultOpen', 'flowing', 'header',
    'hideOnScroll', 'hoverable', 'mountNode', 'mouseLeaveDelay', 'offset', 'on', 'pinned', 'popper',
    'size', 'trigger', 'wide',
]

const warnedDropped = new Set()

/** `props` without the dropped names, warning once per name in development. */
function dropUnsupported (props) {
    const kept = {}
    Object.keys(props).forEach(key => {
        if (DROPPED_PROPS.indexOf(key) === -1) {
            kept[key] = props[key]
            return
        }
        // `process.env.NODE_ENV` is what the build replaces, so this whole branch is dead code
        // in a production bundle.
        if (process.env.NODE_ENV !== 'production' && !warnedDropped.has(key)) {
            warnedDropped.add(key)
            console.warn(
                `[ui-render] Tooltip: \`${key}\` is no longer supported and is ignored.`
                + ' semantic-ui-react handled it; the in-house tooltip does not, because nothing in'
                + ' the product or in any audited meta used it and the machinery behind it (the'
                + ' portal, popper) is gone. See docs/SUPPORTED-PROPS.md.'
            )
        }
    })
    return kept
}

/**
 * Per-instance bubble id source. A module counter rather than `uuid()` (36 characters of
 * `Math.random` in a render path) and rather than a meta-derived path (a `Tooltip` node has no
 * `name`, and the corpus already repeats real ids across sibling table rows, so a derived id would
 * be ambiguous). Deterministic snapshots are not at risk: the bubble exists only while open, and
 * every snapshot in the repo is taken at mount.
 */
let sequence = 0

/** `'top left'` -> `{top: true, bottom: false, right: false, left: true}`. */
function placementOf (position) {
    const words = String(position).split(/\s+/)
    const flags = {}
    PLACEMENTS.forEach(word => { flags[word] = words.indexOf(word) !== -1 })
    return flags
}

/**
 * Tooltip that opens on hover after a delay, and on focus.
 *
 * @param {*} [title] - tooltip body; a function is called and its result rendered
 * @param {*} [children] - the trigger, rendered untouched apart from `aria-describedby`
 * @param {Number} [delay] - milliseconds before a hover opens it
 * @param {Boolean} [inverted] - dark colour scheme
 * @param {*} [content] - tooltip body, winning over `title` (`mapper.js` maps `label` to this)
 * @param {String} [position] - any of `top`/`bottom`/`left`/`right`, or a corner pair
 * @param {Boolean} [open] - controlled open state; the component's own triggers stop deciding
 * @param {Boolean} [disabled] - render the trigger and never a bubble
 * @param {String} [className] - added to the bubble, last
 * @param {String} [classWrap] - added to the wrapper `<span>`
 * @param {String} [id] - the bubble's id, and what `aria-describedby` points at
 * @param {Function} [onOpen] - called on each open
 * @param {Function} [onClose] - called on each close
 * @returns {Object} - React element
 */
export default function TooltipPop ({
    title,
    children,
    // Default parameter rather than `TooltipPop.defaultProps`: React 18.3 warns on defaultProps for
    // function components and React 19 removes the support.
    // Improves UX by avoiding an accidental popup when the user is already familiar with the UI.
    delay = 500,
    inverted,
    content,
    position = 'top',
    open,
    disabled,
    className,
    classWrap,
    id,
    onOpen,
    onClose,
    ...props
}) {
    const [visible, setVisible] = React.useState(false)
    // Lazy initialiser, so the counter advances once per mounted instance rather than per render.
    const [generatedId] = React.useState(() => `ui-render-tooltip-${sequence += 1}`)
    const host = React.useRef(null)
    const timer = React.useRef(null)
    // The state the callbacks have been told about. `visible` cannot answer that question inside an
    // event handler, because a handler closes over the value from ITS render.
    const reported = React.useRef(false)
    // The pointer's type, and whether the focus about to arrive was caused by one. See the
    // `onPointerEnter`/`onPointerDown` handlers below.
    const fromPointer = React.useRef(false)
    const fromTouch = React.useRef(false)

    // Only a cleanup, and it reads a ref rather than a closure so `exhaustive-deps` stays quiet
    // with an empty dependency list: a pending open must not fire against a detached tree.
    React.useEffect(() => () => {
        if (timer.current != null) clearTimeout(timer.current)
    }, [])

    const cancel = () => {
        if (timer.current == null) return
        clearTimeout(timer.current)
        timer.current = null
    }

    const change = next => {
        cancel()
        if (reported.current === next) return
        reported.current = next
        setVisible(next)
        const report = next ? onOpen : onClose
        // `typeof` rather than the house `isFunction`, which rejects a cross-realm function — a
        // callback handed in by a consuming app is exactly that.
        if (typeof report === 'function') report()
    }

    const schedule = (next, ms) => {
        cancel()
        timer.current = setTimeout(() => change(next), ms)
    }

    // `disabled` wins over everything, including a caller-driven `open`, because that is what
    // semantic-ui-react did by not rendering its `Portal` at all.
    const controlled = open !== undefined
    const isOpen = !disabled && (controlled ? Boolean(open) : visible)
    const bubbleId = id == null ? generatedId : id

    /**
     * The two dismissal paths that need no pointer, attached ONLY while open — accessibility, not
     * polish: without them a keyboard user can open the bubble and never close it. Both listen on
     * `document`, which is what makes Escape work with focus in an unrelated native input (the case
     * only a browser can answer, pinned in `e2e/keyboard-a11y.pw.js`).
     *
     * The dismiss callback is reached through a ref so this effect depends on `isOpen` alone and
     * does not re-subscribe on every render.
     */
    const dismissRef = React.useRef(null)
    dismissRef.current = () => change(false)
    React.useEffect(() => {
        if (!isOpen) return undefined
        const dismiss = event => {
            if (event.type === 'keydown' && event.key !== 'Escape') return
            // A click INSIDE the host is not "outside" — including one on the bubble, which lives
            // in the host. Semantic behaved the same way and `TooltipPop.behavior.test.js` pins it.
            if (event.type === 'click' && host.current != null && host.current.contains(event.target)) return
            dismissRef.current()
        }
        document.addEventListener('keydown', dismiss)
        document.addEventListener('click', dismiss)
        return () => {
            document.removeEventListener('keydown', dismiss)
            document.removeEventListener('click', dismiss)
        }
    }, [isOpen])

    // `mapper.js` maps a `view: "Tooltip"` node's `label` to `content` while `Render.js` passes
    // `title`, so both names are live and `content` wins — the precedence the wrapper had, where
    // the rest spread landed after `content={title}`.
    let body = content === undefined ? title : content
    // A FUNCTION body is legal and one meta shape relies on it (the workaround for
    // Semantic-Org/Semantic-UI-React#4029). Call it and render the result; SUIR reached the same
    // output through a shorthand path it had already deprecated.
    if (typeof body === 'function') body = body()

    const supported = dropUnsupported(props)

    /**
     * The trigger, rendered as given. Nothing is cloned for a ref — which is what was broken — and
     * nothing is injected into it: measured, a bubble placed INSIDE the trigger joins its
     * accessible name ("ResetRemove Changes") and cannot exist at all for a childless trigger.
     * The one prop added is the ARIA relationship, and only while there is a bubble to point at,
     * so no `aria-describedby` in this product ever dangles.
     *
     * A non-element trigger — the array `mapper.js` builds from `items`, or a text child — renders
     * as-is and gets no relationship. That the `items` form renders at all is new: SUIR ran
     * `React.Children.only` on it, threw, and the engine drew its error diagnostic INSTEAD of the
     * trigger, so an author lost the button too.
     */
    const trigger = isOpen && React.isValidElement(children)
        ? React.cloneElement(children, { 'aria-describedby': bubbleId })
        : children

    /**
     * `{...handlers}` rather than four attributes so a `disabled` tooltip attaches nothing at all.
     * `onMouseEnter`/`onMouseLeave` only — adding `onMouseOver`/`onMouseOut` as well would make
     * every gesture fire twice. React synthesises all four from events dispatched on the inner
     * trigger, so a handler on this wrapper sees them.
     */
    const handlers = disabled ? null : {
        // A TAP MUST NOT OPEN IT EITHER, and this is the handler that makes that true. A touch tap
        // synthesises the compatibility mouse sequence — `mouseover`/`mouseenter`, then the click —
        // and nothing follows to move the pointer away, so the emulated hover sticks and the bubble
        // appeared 500 ms after every tap. The click gesture was gone and the collision was not:
        // the node's action ran, then its tooltip arrived on top of the result. Measured only in
        // the `chromium-touch` project — a probe in the plain project cannot see it, because
        // `tap()` there degrades to a bare `touchstart`.
        //
        // Pointer events precede their compatibility mouse events, so the type is always known by
        // the time `onMouseEnter` runs. jsdom fires `mouseEnter` with no `pointerenter` before it,
        // which leaves the flag false and keeps every existing hover test meaningful.
        onPointerEnter: event => { fromTouch.current = event.pointerType === 'touch' },
        onMouseEnter: () => { if (!fromTouch.current) schedule(true, delay) },
        onMouseLeave: () => {
            fromTouch.current = false
            schedule(false, CLOSE_DELAY)
        },
        // Focus opens it ONLY when focus did not arrive from a pointer. Without this guard the
        // removal of click-to-open does not actually remove it: clicking a `<button>` focuses it,
        // focus opened the bubble, and the gesture served the node's own action AND the tooltip
        // again — instantly, which is the precise behaviour the removal was for. Measured in
        // Chrome: a bare mouse-down/up on `#buttonIcon` showed the bubble with no dwell at all.
        //
        // `pointerdown` fires before `focus`, so the flag is always set in time. `:focus-visible`
        // would express this natively but is not a thing a React handler can ask about portably,
        // and jsdom does not implement it — this way the guard is testable in both legs.
        onPointerDown: () => { fromPointer.current = true },
        onFocus: () => { if (!fromPointer.current) change(true) },
        onBlur: () => {
            fromPointer.current = false
            change(false)
        },
    }

    return (
        <span ref={host} className={classNames('tooltip-host', classWrap)} {...handlers}>
            {trigger}
            {isOpen && (
                <Tooltip
                    // DOM boundary (see ./domProps): the rest bag reaches a generic `<span>`, so both
                    // lists apply. `Tooltip.js` filters again on its own spread; applying it here as
                    // well is what makes this component's boundary derivable from its own source.
                    {...omitProps(supported, ENGINE_PROPS, FIELD_ONLY_PROPS)}
                    {...placementOf(position)}
                    show
                    // On the BUBBLE, never as a default inside `Tooltip.js`: that file is shared with
                    // `Slider`'s five always-mounted bubbles, `Upload` and the validation tooltip, and
                    // a default `role` there would put five `tooltip` roles into the corpus census.
                    role="tooltip"
                    id={bubbleId}
                    className={classNames({ inverted }, className)}
                >{body}</Tooltip>
            )}
        </span>
    )
}
