/**
 * THE MEASURED REFERENCE — what semantic-ui-react's `Popup` and the in-house `Tooltip` actually do
 * in real Chrome, on the production demo build, as of §9.7-F1 step 2 part 2.
 * =============================================================================================
 *
 * This file is the point of the whole browser leg. It runs BEFORE the `TooltipPop` replacement, so
 * every value here is a measurement of the CURRENT product, and the specs assert against these
 * constants rather than against inline literals. When part 2 lands, the diff to THIS FILE is the
 * reviewable record of what the replacement changed and what it left alone.
 *
 * EVERY FACT CARRIES ONE OF THREE TAGS. A suite that failed wholesale on the planned replacement
 * would be a tripwire on the plan, not a gate, so the distinction is structural rather than a
 * comment convention:
 *
 *   [R]    REFERENCE. Current behaviour, captured for comparison. The replacement is EXPECTED to
 *          change it. Changing it is not a regression and needs no ceremony beyond editing the
 *          value here.
 *   [I]    INVARIANT. Must hold before and after. Breaking one is a regression and the spec says so
 *          in its failure message.
 *   [R->I] DEFECT, pinned at its broken value so this suite is GREEN today. Part 2 flips it to the
 *          invariant, and that flip is the evidence it fixed something. Exactly the pattern
 *          `FIXED_PROP_LEAKS`, `KNOWN_DOM_DEFECTS` and `NAMELESS_CONTROLS` already use in jest.
 *
 * ---------------------------------------------------------------------------------------------
 * FIVE FINDINGS THIS LEG PRODUCED THAT NO JEST SUITE COULD, AND THAT CORRECT §9.5 / §9.7-F1
 * ---------------------------------------------------------------------------------------------
 *
 * 1. THE SHIPPED TOOLTIP IS NOT MERELY UNSTYLED, IT IS UNPOSITIONED — and it throws.
 *    At every use site reachable from meta, opening a tooltip leaves popper's wrapper at
 *    `left: 0px; top: 0px` with `transform: none`, i.e. NO coordinates are ever written, and raises
 *    exactly one uncaught `TypeError: Failed to execute 'getComputedStyle' on 'Window'` per open,
 *    from popper's clipping-parent lookup inside the flip modifier.
 *    Mechanism: semantic-ui-react clones the trigger with a `ref`, and of everything a meta can
 *    declare, NOTHING can hold one — `mapper.js` uses the plain `Row`, `Button` is a
 *    `React.memo(function Button)`, and the only ref-able components in `src/core` are `Dropzone`
 *    and the named `RowRef` export, which no `view` maps to. So popper's reference element is
 *    `null`. Feeding the same component a plain `<button>` (the harness) positions correctly and
 *    raises nothing, which is what makes this a diagnosis rather than a guess.
 *    §9.5 says jsdom is useless here because "Popper computes `left: 0px; top: 0px` in every case".
 *    Real Chrome computes THE SAME THING at the real use sites — so the naive browser assertion
 *    proves nothing jsdom did not. What discriminates is whether coordinates were written at all,
 *    proximity to the trigger, and the page-error count.
 *
 * 2. "FLIP IS ACTIVE AND OBSERVABLE" is true of the CONFIG and false of the RUNNING PRODUCT.
 *    Flip is the modifier that crashes. With a ref-able trigger it is observable and it works on
 *    BOTH axes: at the top edge `top left` resolves to `bottom left`, and at the right edge it
 *    resolves to `top right` — which keeps the bubble inside the viewport. So §9.7-F1 step 2's
 *    "flip yes, shift no" understates what is there: horizontal overflow IS handled, by flip
 *    changing the alignment variation rather than by `preventOverflow`.
 *
 * 3. EVERY SCROLL ANYWHERE IN THE DOCUMENT CLOSES THE BUBBLE. Not `closeOnTriggerMouseLeave` — a
 *    synthetic `window` `scroll` event with no pointer movement and no layout change closes it and
 *    it reopens ~50 ms later, a flicker. Upstream cause, read out of the installed source:
 *    `Popup.js` never destructures the `hideOnScroll` PROP, so the local `var hideOnScroll =
 *    function...` shadows it and `hideOnScroll && <EventStack name="scroll" target="window"/>` is
 *    ALWAYS truthy; `@semantic-ui-react/event-stack` subscribes with `capture: true`, so a nested
 *    container's non-bubbling scroll reaches it too. Consequence for part 2: popper's
 *    `eventsEnabled` scroll repositioning is UNREACHABLE in this product, so the replacement owes
 *    nothing there. §9.5's "`eventsEnabled` is on today and its effect is invisible" is right for
 *    the wrong reason.
 *
 * 4. THE CONVERGENCE TARGET HAS ITS OWN POSITIONING DEFECT, and it is in the exact placement the
 *    replacement would use. `tooltip.less` carries eight placement class combinations and the plan
 *    treats that vocabulary as an asset the in-house `Tooltip` brings with it. Measured: FOUR of
 *    the eight work. `top`, `bottom`, `left` and `right` place the bubble clear of its host.
 *    `top left` and `top right` land ON TOP OF the host, and `bottom left` / `bottom right`
 *    silently degrade to plain `left` / `right`. Cause: `.tooltip.left` and `.tooltip.right` set
 *    `top: 50%` at the same specificity as `.tooltip.top`/`.tooltip.bottom`, so a corner class
 *    string matches both and the axis rule loses — either over-constrained (`top left`) or on
 *    source order (`bottom left`). `top left` is the ONLY placement `TooltipPop` uses in
 *    production, so converging on `Tooltip` without touching `tooltip.less` would ship a bubble
 *    sitting on its own trigger. Invisible to jsdom, which resolves no cascade and no layout.
 *
 * 5. CLIPPING IS THE ONE REAL COST OF GOING INLINE, AND IT IS NOW DEMONSTRATED RATHER THAN
 *    PREDICTED. In one 220x56 `overflow: hidden` box the portaled bubble renders 9 px ABOVE the
 *    box's top edge and is hit-testable there; the inline bubble overflows the box by 66 px and is
 *    NOT hit-testable outside it. Both halves measured on the same page, in the same box.
 */

/**
 * The exact class string `TooltipPop` emits. [I] since §9.7-F1 step 2 part 3 — one string, because
 * the placement words are the REQUESTED position now, not popper's resolved one, so there is no
 * flip to rewrite them.
 *
 * WHY `top` AND NOT `top left`, WHICH IS WHAT THE WRAPPER EMITTED: item 4 of the header above
 * measured `tooltip.less`'s corner placements as broken — `top left` and `top right` land ON TOP OF
 * the host. `top left` was semantic-ui-react's own default rather than anything a meta asked for,
 * so the replacement defaults to `top`, which is one of the four that work. That is a deliberate
 * divergence: a bubble centred above its trigger instead of left-aligned above it, and a working
 * placement instead of one sitting on its own trigger.
 */
const BUBBLE_CLASS = {
    top: 'tooltip no-wrap top show inverted',
}

/** What the corpus — i.e. everything a meta can declare — actually does. */
const CORPUS = {
    /**
     * [I] The bubble is adjacent to its trigger. Measured centre-to-centre: 40 px at `buttonIcon`
     * and 40 px at the deep `all`/Factors site, against 729 px and 2538-3006 px before the step —
     * the defect this replaced. A loose ceiling, because the point is "adjacent", not a pixel
     * value; the bubble is 40 px tall, so a centre 40 px above a 40 px trigger is flush with it.
     */
    MAX_CENTRE_DISTANCE_PX: 120,
    /**
     * [I] Nothing throws. This was 1 uncaught `TypeError` PER OPEN from popper's clipping-parent
     * lookup, at every use site a meta can declare, because SUIR cloned the trigger with a `ref`
     * and nothing a meta can declare can hold one. There is no popper and no ref to fail.
     */
    PAGE_ERRORS_PER_OPEN: 0,
    /**
     * [I] Still 0, for a new reason: there is no popper at all. Kept because the value is the same
     * either way, which makes it a poor gate on its own — the placement assertion is the class
     * string, and the geometry assertion is the distance above.
     */
    POPPER_DATA_ATTRIBUTE_COUNT: 0,
    /**
     * [I] The bubble is a SIBLING of the trigger inside `.ui-render`, not a portal into
     * `document.body`. This is what makes our own CSS reach it: prefixwrap scopes every rule under
     * `.ui-render`, so the 13 popup rules could never paint a bubble that portaled outside it.
     */
    PORTAL_PARENT_TAG: null,
    INSIDE_UI_RENDER: true,
    /**
     * [I] Painted, measured as computed style rather than selector matching — the gap
     * `css.tooltip-contract.test.js` explicitly cannot close. Every value here was the "unstyled"
     * default before the step: transparent background, no border, no padding, `z-index: auto`.
     */
    PAINT: {
        display: 'flex',
        position: 'absolute',
        backgroundColor: 'rgb(41, 38, 56)',
        borderTopWidth: '1px',
        paddingTop: '12px',
        boxShadow: 'none',
        maxWidth: 'none',
        zIndex: '9',
        beforeContent: 'none',
    },
    /**
     * [I] `pointer-events: none`, and it is load-bearing twice over: without it the bubble sits
     * under the pointer, Playwright reports the trigger as unhoverable, and `mouseleave` fires on
     * the host so the tooltip flickers. It is also why the bubble is NOT hoverable — see
     * TRAVEL_ONTO_BUBBLE_CLOSES.
     */
    POINTER_EVENTS: 'none',
    /**
     * [I] Full screen-reader wiring, where there was none: no `role`, no `id`, no
     * `aria-describedby` anywhere. Added BECAUSE click-to-open was dropped — with click gone and
     * hover unavailable to a keyboard, this and focus-open are the only path to the content.
     * `triggerAriaDescribedBy` is asserted EQUAL to the bubble's own id rather than to a literal:
     * the id is a per-instance counter, and a wiring test that hard-codes it pins the counter
     * instead of the wiring.
     */
    A11Y: {
        roleTooltipCount: 1,
        bubbleRole: 'tooltip',
    },
    /**
     * [I] No wrapper element inside the bubble: the body is the bubble's own children. SUIR added a
     * `div.content` for a string or number body and NOT for an element or a function one — a
     * conditional structure `UIRender.overlay-behavior.test.js` had to read through visible text.
     */
    CHILD_ELEMENT_COUNT: 0,
    /**
     * [I] A click does not open the tooltip, by ANY route — this is the user-visible half of
     * dropping `on: ['click', 'hover']`. The browser leg is what makes it a real gate: focus-open
     * was added for keyboard access, clicking a `<button>` focuses it, and so the bubble opened
     * instantly on click again until `onPointerDown` suppressed that one focus. jsdom cannot find
     * that, because nothing there focuses on click.
     */
    CLICK_OPENS: false,
    /** [I] A touch tap does not open it either — same route, same guard. Was `[R]` "one tap opens". */
    TAP_OPENS: false,
    /**
     * [I] Keyboard focus DOES open it, with no delay, and Escape closes it. The Escape case is
     * answerable only in a browser: the listener is on `document`, so it must work with focus in
     * an unrelated native input, and jsdom has no native focus semantics.
     */
    FOCUS_OPENS: true,
    /**
     * [R] The pointer travelling from the trigger onto the bubble CLOSES it — unchanged from the
     * wrapper, which behaved this way because nothing passed `hoverable`. Not a defect that
     * survived by accident: with `pointer-events: none` the pointer over the bubble is really over
     * whatever is behind it, `mouseleave` fires on the host, and it closes. Hoverable text and a
     * non-interactive bubble are mutually exclusive, and the bubble stays non-interactive.
     */
    TRAVEL_ONTO_BUBBLE_CLOSES: true,
    /**
     * [R] The 500 ms open delay, unchanged and deliberately slower than Semantic's 50 ms.
     * Obligation 1 of the step. Measured in Chrome: nothing is in the DOM at all until it elapses,
     * because the bubble is mounted only while open — which is also what makes the delay possible,
     * since a bubble that IS in the DOM is revealed instantly by `*:hover > .tooltip`.
     */
    OPEN_DELAY_MS: 500,
}

/** Interaction timing, in milliseconds. Windows rather than boundaries, so the leg is not a stopwatch. */
const TIMING = {
    /** [I] Ours, over semantic-ui-react's 50 ms default (`TooltipPop.js`, `delay = 500`). Closed at 300 ms, open by 1200 ms. */
    OPEN_DELAY_MS: 500,
    STILL_CLOSED_AT_MS: 300,
    OPEN_BY_MS: 1200,
    /** [I] `TooltipPop.behavior.test.js` pins 70 ms with fake timers; 400 ms of real time is comfortably past it. */
    CLOSED_AFTER_LEAVE_BY_MS: 400,
    /** [I] Leaving before the open delay elapses cancels the pending open. */
    CANCEL_AFTER_MS: 200,
    /** [R] `on: ['click', 'hover']` — click opens with no delay at all. */
    CLICK_OPENS_WITHIN_MS: 500,
    /** [R] The `hideOnScroll` flicker of finding 3: gone almost immediately, back ~50 ms later. */
    SCROLL_CLOSES_WITHIN_MS: 250,
    SCROLL_REOPENS_BY_MS: 900,
}

/** Which dismissal paths work today. All [I] unless noted. */
const DISMISSAL = {
    pointerLeavesTrigger: 'closes',
    /**
     * [R] The `hoverable: false` defect: the pointer travelling off the trigger and onto the bubble
     * closes it, so the bubble's own content can never be reached, hovered or selected. Recorded as
     * a REFERENCE, not an invariant — part 2 may legitimately make the bubble hoverable.
     */
    pointerMovesOntoBubble: 'closes',
    clickOutside: 'closes',
    secondClickOnTrigger: 'closes',
    escapeFromDocument: 'closes',
    /** [R] Finding 3. */
    anyScroll: 'closes',
}

/** The in-house `Tooltip` — `src/core/components/Tooltip.js`, what part 2 converges on. */
const INLINE = {
    /** [I] Closed: removed from layout entirely, and parked behind everything. */
    CLOSED_PAINT: { display: 'none', zIndex: '-1' },
    /**
     * [I] Open: painted. Values that the `fade-in` animation does not touch — deliberately NOT
     * `opacity`, which is a function of wall-clock time and of whether the tab was ever hidden.
     */
    OPEN_PAINT: { display: 'flex', position: 'absolute', backgroundColor: 'rgb(255, 255, 255)', zIndex: '9' },
    /** [I] The arrow is a `::after` pseudo-element with a real border, not `::before` as the popup's is. */
    ARROW_PSEUDO: '::after',
    /** [I] Revealed by hover through CSS alone (`*:hover > &`), with the same 0.5 s delay as `TooltipPop`'s 500 ms. */
    HOVER_REVEALS: true,
    /**
     * Finding 4 — the placement vocabulary, measured. `true` means the bubble is placed clear of its
     * host on the requested side.
     *   [I] for the four that work: part 2 must not regress them.
     *   [R->I] for the four corners: `top left`/`top right` land on the host and
     *          `bottom left`/`bottom right` degrade to `left`/`right`. `top left` is the placement
     *          the replacement needs, so part 2 owes a `tooltip.less` fix or an explicit decision
     *          to restrict the vocabulary.
     */
    /**
     * [I] EIGHT OF EIGHT since §9.7-F1 step 2 part 3. Two things moved this map, and only one of
     * them was CSS: the corner rules were genuinely broken and are fixed in `tooltip.less`, while
     * `top right` and `bottom right` were ALSO reported broken by an assertion that required every
     * corner to align to its host's LEFT edge — which a right corner cannot do. The right corners
     * were placing correctly the whole time. Kept as a map rather than collapsed to `true` so a
     * regression names the placement it broke.
     */
    PLACEMENT_WORKS: {
        top: true,
        bottom: true,
        left: true,
        right: true,
        'top-left': true,
        'top-right': true,
        'bottom-left': true,
        'bottom-right': true,
    },
    /** [I] No placement overlaps its own host any more. Was `top left` and `top right`. */
    PLACEMENTS_OVERLAPPING_HOST: [],
    /** [R] The five snapshot-gated bubbles in the `slider` example — the only production use site today. */
    SLIDER_TOOLTIP_COUNT: 5,
    SLIDER_CLASS: 'tooltip no-wrap top show',
    SLIDER_HOST_CLASS: 'app__slider__handle',
}

/** Layout facts about the widget itself, which decide what shape part 2 can take. */
const WIDGET = {
    /**
     * [I] `.ui-render` is `position: static; z-index: auto; isolation: auto` — the widget creates NO
     * stacking context of its own. So a bubble's paint order against host content is decided by the
     * host, and the only lever the widget has is its own `z-index`: the inline `Tooltip`'s `9` beats
     * host content at `z-index: 6`, and the portal's `auto` does not. That is a concrete argument
     * FOR converging on the inline component, and it is only measurable in a browser.
     */
    UI_RENDER_CREATES_STACKING_CONTEXT: false,
    UI_RENDER_STYLE: { position: 'static', zIndex: 'auto', isolation: 'auto' },
    /** [R] The portaled bubble's wrapper: positioned, but with no z-index of its own. */
    PORTAL_WRAPPER_Z_INDEX: 'auto',
    /** [I] `.app` is `position: relative; overflow: hidden` with no transform/filter/will-change... */
    APP_STYLE: { position: 'relative', transform: 'none', filter: 'none', willChange: 'auto' },
    /**
     * [I] ...so `position: fixed` inside `.ui-render` IS viewport-relative and escapes `.app`'s
     * clip. This is the open question part 2 needed answered before choosing between an inline
     * bubble (gets the scoped CSS, IS clipped) and a fixed one (gets the scoped CSS, is NOT
     * clipped). Verified by a fixed-position probe element on the harness page.
     */
    FIXED_ESCAPES_APP_CLIP: true,
    /**
     * [I] The corpus's own tooltip sits behind TEN clip/scroll ancestors, four of them inside the
     * widget. Pinned as a floor, not an equality, because it is a property of the `all` example's
     * layout rather than of the tooltip — the point is that this depth exists at a real use site
     * and an inline rewrite meets all ten of them.
     */
    MIN_CORPUS_CLIP_ANCESTORS: 8,
}

/** Touch, under an emulated `hasTouch` context. */
const TOUCH = {
    /**
     * [I] A TAP NO LONGER OPENS IT — the touch face of dropping click-to-open. Part 2 measured
     * `on: ['click', 'hover']` firing both paths on one tap, with a second tap closing; on a touch
     * device that made every tooltipped node's tooltip a competitor for its own action, with no
     * hover to fall back on.
     *
     * The consequence is stated plainly rather than sold as a win: on a touch-only device there is
     * now NO way to see a tooltip. That is the same trade desktop makes — the tooltip is
     * supplementary and the node's action is not — and it is why the content must never be the only
     * place information lives. Recorded here, in `docs/SUPPORTED-PROPS.md` under `dropped.on`, and
     * in UPGRADE-PLAN §9.7-F1 step 2.
     */
    FIRST_TAP: 'does nothing',
    SECOND_TAP: 'does nothing',
}

/**
 * Keyboard and a11y — the bones §9.5 asks for now and step 3's `Dropdown` matrix reuses.
 *
 * Every tooltip row here was a DEFECT in part 2 and is an invariant now. The two that flipped are
 * not independent improvements: click-to-open was dropped because it collided with every
 * tooltipped node's own action, and that removal is what MADE focus-open and the ARIA wiring
 * mandatory — with click gone and hover unavailable to a keyboard there would otherwise be no path
 * to the content at all.
 */
const KEYBOARD = {
    /** [I] The trigger is reachable by Tab and is in DOM order between the two inputs. */
    TRIGGER_IS_TAB_REACHABLE: true,
    /**
     * [I] FOCUS OPENS IT, with no delay — was `false`. The delay is a hover affordance (it exists
     * so a cursor crossing the control does not flash a bubble); arriving by Tab is deliberate, so
     * there is nothing to debounce.
     *
     * Focus that arrives FROM A POINTER is the exception and does not open it: clicking a
     * `<button>` focuses it, so without that guard dropping the click gesture would have changed
     * nothing a user sees. See `CORPUS.CLICK_OPENS`.
     */
    FOCUS_OPENS: true,
    /** [I] `role="tooltip"` on the bubble, an `id` to point at, and `aria-describedby` on the trigger. Was `false`. */
    A11Y_WIRED: true,
    /** [I] Escape closes an open bubble even when focus sits in an unrelated native input. */
    ESCAPE_CLOSES_FROM_UNRELATED_ELEMENT: true,
}

/**
 * THE `Dropdown` BONES FOR STEP 3, measured on the corpus `dropdown` example.
 *
 * §9.5 makes a keyboard/a11y matrix mandatory for step 3, which is the largest step in F1, and the
 * expensive half of that matrix is the harness and the helpers — both of which exist now. This is
 * the starting state written down so step 3 begins from a measurement rather than a blank page.
 * NOTHING here is ticked against step 3: the matrix itself is step 3's work, and this leg was built
 * for step 2.
 *
 * All [R] unless marked. The tags matter more here than anywhere else, because a WAI-ARIA combobox
 * replacement is SUPPOSED to change most of these.
 */
const DROPDOWN = {
    /** [R] The class string step 4's CSS contract is keyed on. */
    LISTBOX_CLASS: 'ui selection dropdown',
    /** [R] Per rendered dropdown, in the `dropdown` example. */
    ROLES: { listbox: 1, alert: 1, option: 2 },
    /**
     * [R] The options are in the DOM whether the list is open or closed — "open" is a CSS state, not
     * presence. Any replacement that mounts options on open changes what a screen reader enumerates,
     * so this is the single most load-bearing fact for step 3's a11y comparison.
     */
    OPTIONS_PRESENT_WHEN_CLOSED: true,
    /** [I] Reachable by Tab (`tabindex=0`) and `aria-expanded` tracks the open state honestly. */
    TAB_REACHABLE: true,
    ARIA_EXPANDED_CLOSED: 'false',
    ARIA_EXPANDED_OPEN: 'true',
    /**
     * [R->I] `role="alert" aria-live` carrying the selected value — SUIR's way of announcing a
     * selection. §9.5 records that every `alert` in the corpus role census is one dropdown and that
     * all of them should go to ZERO at step 3, so this is the number that will prove it.
     */
    ALERT_ANNOUNCES_SELECTED_VALUE: true,
    /**
     * [R->I] The combobox wiring a WAI-ARIA listbox owes and this one does not have. Pinned as a
     * defect inventory: step 3's replacement should shrink this list, and a shrink is the diff that
     * shows it.
     */
    MISSING_ARIA: ['aria-activedescendant', 'aria-controls', 'aria-haspopup', 'aria-labelledby', 'aria-label'],
}

module.exports = { BUBBLE_CLASS, CORPUS, TIMING, DISMISSAL, INLINE, WIDGET, TOUCH, KEYBOARD, DROPDOWN }
