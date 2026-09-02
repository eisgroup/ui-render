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

/** The exact class string `TooltipPop` emits, per resolved placement. [R] */
const BUBBLE_CLASS = {
    // The only placement anything in production requests, and the literal already pinned by
    // `TooltipPop.test.js`. [R]
    topLeft: 'ui top left inverted popup transition visible',
    // Popper's RESOLVED placement after a vertical flip. Only reachable with a ref-able trigger. [R]
    bottomLeft: 'ui bottom left inverted popup transition visible',
    // ...and after a horizontal one. [R]
    topRight: 'ui top right inverted popup transition visible',
}

/** What the corpus — i.e. everything a meta can declare — actually does. */
const CORPUS = {
    /**
     * [R->I] No coordinates are written: popper's wrapper keeps its initial `left: 0px; top: 0px`
     * and never receives a transform. This is the defect, stated in the most scroll-independent
     * form available, because the resulting viewport rect depends on how far the page is scrolled.
     */
    WRAPPER_HAS_NO_COORDINATES: true,
    /**
     * [R->I] ...and therefore the bubble is nowhere near its trigger. A deliberately loose
     * threshold: the measured distances were 729 px (`buttonIcon`) and 2538-3006 px (`all`), and
     * the point is "not adjacent", not a pixel value. After part 2 this must be small.
     */
    MIN_CENTRE_DISTANCE_PX: 500,
    /** [R->I] Exactly one uncaught error per open, from popper's clipping-parent lookup. */
    PAGE_ERRORS_PER_OPEN: 1,
    PAGE_ERROR_PATTERN: /getComputedStyle/,
    /**
     * [R] Popper writes no `data-popper-*` attribute at all — not even when it positions correctly
     * (verified on the harness). Corrects a plausible-sounding assumption: the resolved placement
     * is readable ONLY from the className, which is why the flip contract is a class assertion.
     */
    POPPER_DATA_ATTRIBUTE_COUNT: 0,
    /** [R->I] The bubble portals to `document.body`, outside `.ui-render`, so none of the 13 scoped popup rules can reach it. */
    PORTAL_PARENT_TAG: 'BODY',
    INSIDE_UI_RENDER: false,
    /**
     * [R->I] Consequence of the above, measured as computed style rather than selector matching —
     * the gap `css.tooltip-contract.test.js` explicitly cannot close. Every one of these is what
     * "unstyled" means concretely.
     */
    PAINT: {
        backgroundColor: 'rgba(0, 0, 0, 0)',
        borderTopWidth: '0px',
        paddingTop: '0px',
        boxShadow: 'none',
        maxWidth: 'none',
        zIndex: 'auto',
        beforeContent: 'none',
    },
    /** [R->I] No screen-reader wiring whatsoever. An accessibility defect, not a contract to preserve. */
    A11Y: {
        triggerAriaDescribedBy: null,
        roleTooltipCount: 0,
        bubbleId: null,
    },
    /** [I] The bubble's own inner structure — `div.content` — which `UIRender.overlay-behavior` reads through visible text. */
    CONTENT_CHILD_CLASS: 'content',
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
    PLACEMENT_WORKS: {
        top: true,
        bottom: true,
        left: true,
        right: true,
        'top-left': false,
        'top-right': false,
        'bottom-left': false,
        'bottom-right': false,
    },
    /** [R->I] The corner placements that overlap their own host instead of sitting beside it. */
    PLACEMENTS_OVERLAPPING_HOST: ['top-left', 'top-right'],
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
    /** [R] `on: ['click', 'hover']` means one tap fires both paths; the second tap closes. */
    FIRST_TAP: 'opens',
    SECOND_TAP: 'closes',
}

/**
 * Keyboard and a11y — the bones §9.5 asks for now and step 3's `Dropdown` matrix reuses.
 * Everything about the TOOLTIP here is a defect, recorded as the current state rather than as a
 * contract. Step 2 part 1 verified in jsdom that switching `on` to `['hover', 'focus']` closes the
 * gap immediately, and `tooltip.less:30` already reveals the inline bubble on `*:focus > &`.
 */
const KEYBOARD = {
    /** [I] The trigger is reachable by Tab and is in DOM order between the two inputs. */
    TRIGGER_IS_TAB_REACHABLE: true,
    /** [R->I] Focus does not open it: `on` is `['click', 'hover']`, so there is no keyboard path to the content at all. */
    FOCUS_OPENS: false,
    /** [R->I] No `role="tooltip"`, no `aria-describedby`, no id to point at. */
    A11Y_WIRED: false,
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
