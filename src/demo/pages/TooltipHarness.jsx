import React from 'react'
import Tooltip from '../../core/components/Tooltip'
import TooltipPop from '../../core/components/TooltipPop'

/**
 * TOOLTIP HARNESS — unlisted demo route, driven only by e2e/harness.tooltip.pw.js
 * =============================================================================================
 *
 * WHY IT EXISTS. The tracked example corpus contains exactly ONE tooltip location (two
 * declarations in the `Factors` tab of `_meta.js`) plus the one-step `buttonIcon` trigger, and six
 * of the ten §9.5 gaps need geometry neither can produce:
 *
 *   - flip / overflow need a trigger deliberately parked at a viewport edge;
 *   - stacking needs a positioned neighbour where the bubble lands;
 *   - clipping needs a controlled `overflow: hidden` box whose size is known;
 *   - scroll repositioning needs a scroll container the test owns;
 *   - and all of the above need a trigger that can HOLD A REF.
 *
 * That last one is the reason this page renders `TooltipPop` directly instead of through a meta.
 * semantic-ui-react clones the trigger with a `ref`, and of everything reachable from meta only
 * `Dropzone` and the named `RowRef` export can hold one — `mapper.js` uses the plain `Row`, and
 * `Button` is a `React.memo(function Button)`. So from meta the reference element is always `null`,
 * popper's clipping-parent lookup throws, and NO coordinates are ever written (see
 * e2e/reference.js, CORPUS.PAGE_ERRORS_PER_OPEN). Feeding the same component a plain `<button>` is the only way
 * to observe popper's positioning at all, and the contrast between this page and the corpus page
 * IS the diagnosis rather than a workaround for it.
 *
 * WHY IT LIVES HERE, under src/demo/:
 *   - `jest.config.js` `collectCoverageFrom` is `src/core/**` + `src/library/**`, so a file here
 *     costs nothing against the coverage thresholds;
 *   - `package.json#files` ships only `dist/`, `static/`, the schema and metadata, so it never
 *     reaches the npm tarball and `test:pack:budget` is untouched;
 *   - one static server serves this page and the corpus pages, so the leg needs one build.
 *   It IS covered by `npm run lint:js` (`eslint src`), so it has to stay lint-clean.
 *
 * NOT LINKED FROM `NavTabs`, deliberately: this is a measuring instrument, not documentation, and
 * the published demo should not grow a page that only makes sense next to a spec file.
 *
 * ONE SECTION PER PAGE LOAD, selected by `?section=`. This is not tidiness, it is a correctness
 * fix that the first measurement forced: with every section on one scrolling page, `.app` is
 * `overflow: hidden` so the harness needed its own `overflow: auto` root, and popper then computed
 * coordinates 124 px away from the trigger — a nested-scroll-container artefact of the HARNESS
 * that would have been recorded as a fact about the PRODUCT. Every section now fits inside the
 * 1280x800 viewport `playwright.config.js` fixes, nothing scrolls unless a section is about
 * scrolling, and `?section=` changes the search string so each navigation is a real reload rather
 * than a same-document hash change React Router would not see.
 *
 * GEOMETRY IS PART OF THE CONTRACT. Inline styles rather than classes, because the harness must
 * measure the tooltip, not the app stylesheet — and every trigger is deliberately parked AWAY from
 * the document origin. That is not tidiness either: the shipped bubble renders at (0, 0), which is
 * indistinguishable from "positioned correctly" whenever the trigger happens to sit near the
 * origin, so a harness with triggers at the top-left would manufacture a false pass.
 */

// `position: fixed` over the whole viewport, not `height: 100%`: `.app__content` has no resolved
// height, so a percentage-height root collapses to 0 and every measurement reads "hidden". Owning
// the viewport also makes each section's `position: absolute` coordinates viewport coordinates,
// which is the whole point of a measuring instrument. A fixed root does NOT create a containing
// block for fixed descendants, so the flip/overflow triggers and the fixed-probe stay
// viewport-relative and `.app`'s `overflow: hidden` still cannot reach them.
const ROOT = {
    position: 'fixed',
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    overflow: 'hidden',
    background: '#fff',
    fontFamily: 'sans-serif',
    fontSize: 13,
}

const NOTE = { position: 'absolute', left: 16, top: 12, margin: 0, color: '#555', maxWidth: 640 }

const BOX = { border: '1px solid #888', background: '#fff' }

// A tooltip whose text is unique per site, so a spec never has to guess which bubble it found.
function Pop ({ label, id, style, children }) {
    return (
        <TooltipPop title={label} inverted>
            <button type="button" data-harness-trigger={id} style={style}>{children}</button>
        </TooltipPop>
    )
}

/**
 * 1. POSITIONED AT ALL. A ref-able trigger parked 320 px right and 300 px down, so "adjacent to
 * the trigger" and "at the document origin" cannot be confused.
 */
const plain = (
    <>
        <p style={NOTE}>plain: is the bubble positioned next to a ref-able trigger?</p>
        <Pop id="plain" label="Plain trigger bubble" style={{ position: 'absolute', left: 320, top: 300 }}>
            Plain trigger
        </Pop>
    </>
)

/**
 * 2. FLIP. The trigger sits 8 px below the viewport top, where the requested `top left` placement
 * cannot fit. Popper's flip modifier is `enabled: !pinned` and the emitted className carries its
 * RESOLVED placement, so a flip is observable in the class string. `position: fixed` rather than
 * absolute on purpose: it also proves no ancestor transform/filter traps fixed positioning inside
 * `.ui-render`, which part 2 needs to know before it chooses between an inline bubble and a fixed
 * one.
 */
const flip = (
    <>
        <p style={{ ...NOTE, top: 120 }}>flip: no room above, so `top left` must resolve elsewhere.</p>
        <Pop id="flip" label="Top edge bubble" style={{ position: 'fixed', left: 420, top: 8, zIndex: 3 }}>
            Top edge
        </Pop>
    </>
)

/**
 * 3. OVERFLOW / SHIFT. Trigger hard against the right edge with a long label. `preventOverflow` is
 * `enabled: !!offset` and nothing sets `offset`, so the measured expectation is that the bubble is
 * NOT clamped back into view — "flip yes, shift no".
 */
const overflow = (
    <>
        <p style={NOTE}>overflow: right edge, long label. Is the bubble clamped back into view?</p>
        <Pop
            id="overflow"
            label="A deliberately long right edge bubble label that cannot fit"
            style={{ position: 'fixed', right: 6, top: 300, zIndex: 3 }}
        >
            Right edge
        </Pop>
    </>
)

/**
 * 4. CLIPPING. A 220x56 `overflow: hidden` box. The portaled bubble escapes it; an inline bubble
 * does not — which is why the in-house `Tooltip` is mounted in the SAME box, forced open with
 * `show`, as the control. This is the one section whose result is a direct argument about part 2's
 * shape rather than a record of part 1's.
 */
const clip = (
    <>
        <p style={NOTE}>clip: portaled bubble vs inline bubble inside one `overflow: hidden` box.</p>
        <div
            data-harness="clip"
            style={{ ...BOX, position: 'absolute', left: 300, top: 220, width: 220, height: 56, overflow: 'hidden' }}
        >
            {/*
              `top: 4` inside a 56 px box on purpose: a `top left` bubble then lands ABOVE the box's
              own top edge, so "the portal escapes the clip" is a containment comparison rather than
              a coincidence. At `top: 30` the bubble happened to land inside the box and the
              measurement proved nothing.
            */}
            <Pop id="clipped" label="Clipped box bubble" style={{ position: 'absolute', left: 12, top: 4 }}>
                In clip box
            </Pop>
            {/*
              `top`, not `top left`: the corner placements are BROKEN (reference.js finding 4), and a
              clipping measurement must not ride on a second defect. A 40 px block host near the
              box's right edge puts the centred bubble past it.
            */}
            <span
                style={{ position: 'absolute', left: 150, top: 34, width: 40, display: 'block' }}
                data-harness="clip-inline-host"
            >
                <Tooltip top show className="harness-inline-clipped">Inline clipped bubble</Tooltip>
            </span>
        </div>
    </>
)

/**
 * 5. SCROLL REPOSITION. Popper's `eventsEnabled` is on. Scrolling this container with the bubble
 * open is the only way to see whether the coordinates follow the trigger.
 */
const scroll = (
    <>
        <p style={NOTE}>scroll: does an open bubble follow its trigger when the container scrolls?</p>
        <div
            data-harness="scroll"
            style={{ ...BOX, position: 'absolute', left: 300, top: 220, width: 320, height: 160, overflow: 'auto' }}
        >
            <div style={{ height: 100 }} />
            <Pop id="scrolled" label="Scrolled bubble">In scroll box</Pop>
            <div style={{ height: 400 }} />
        </div>
    </>
)

/**
 * 6. STACKING. A positioned neighbour at `z-index: 6` covering the strip just above the trigger,
 * i.e. exactly where a `top left` bubble lands. `elementFromPoint` at the bubble's own centre
 * answers "who paints on top" without any pixel baseline.
 */
const stack = (
    <>
        <p style={NOTE}>stack: a z-index 6 neighbour sits where a `top left` bubble lands.</p>
        <div
            data-harness="stack-neighbour"
            style={{
                position: 'absolute',
                left: 280,
                top: 268,
                width: 420,
                height: 56,
                zIndex: 6,
                background: 'rgb(255, 230, 120)',
                border: '1px solid #cc9',
            }}
        >
            positioned neighbour, z-index 6
        </div>
        <Pop id="stacked" label="Stacked bubble" style={{ position: 'absolute', left: 300, top: 330 }}>
            Under neighbour
        </Pop>
        {/*
          The in-house `Tooltip` under the SAME neighbour, so part 2 gets the comparison it actually
          needs: a portaled bubble at `z-index: auto` in `document.body` versus an inline bubble at
          `z-index: 9` inside `.ui-render`. Which of those beats host content at `z-index: 6` is a
          fact about stacking CONTEXTS, not about the tooltips, and it decides whether converging on
          the inline component costs anything visible.
        */}
        {/* `top` for the same reason as the clip section: a working placement, so the bubble
            actually lands under the neighbour and the paint-order answer means something. */}
        <span
            data-harness="stack-inline-host"
            style={{ position: 'absolute', left: 760, top: 330, width: 90, display: 'block' }}
        >
            inline anchor
            <Tooltip top show className="harness-inline-stacked">Inline stacked bubble</Tooltip>
        </span>
        <div
            data-harness="stack-inline-neighbour"
            style={{
                position: 'absolute',
                left: 740,
                top: 268,
                width: 300,
                height: 56,
                zIndex: 6,
                background: 'rgb(255, 230, 120)',
                border: '1px solid #cc9',
            }}
        >
            neighbour, z-index 6
        </div>
    </>
)

/**
 * 7. THE CONVERGENCE TARGET. `components/Tooltip.js` — inline `<span>`, no portal, no positioning
 * JS — is what part 2 converges on, and today it is exercised only by the `slider` example. Three
 * shapes: forced open, hover-revealed (`*:hover > &` in tooltip.less), and inside a `.button`
 * (which tooltip.less restyles). Recorded as the INVARIANT part 2 must not regress; nothing else
 * in the repo gates it in a browser.
 */
const inline = (
    <>
        <p style={NOTE}>inline: the in-house `Tooltip`, which part 2 converges on.</p>
        <span data-harness="inline-shown-host" style={{ position: 'absolute', left: 320, top: 300 }}>
            anchor (forced open)
            <Tooltip top left show className="harness-inline-shown">Inline shown bubble</Tooltip>
        </span>
        <span data-harness="inline-hover-host" style={{ position: 'absolute', left: 700, top: 300 }}>
            anchor (hover)
            <Tooltip top left className="harness-inline-hover">Inline hover bubble</Tooltip>
        </span>
        <button
            type="button"
            data-harness="inline-button-host"
            className="button"
            style={{ position: 'absolute', left: 320, top: 450 }}
        >
            button anchor
            <Tooltip bottom show className="harness-inline-button">Inline button bubble</Tooltip>
        </button>
    </>
)

/**
 * 8. KEYBOARD / A11Y BONES. Two native inputs bracket the trigger so Tab order, focus-opens and
 * Escape-from-an-unrelated-element are all measurable. §9.5 records that the current tooltip gives
 * the trigger no `aria-describedby`, no `role="tooltip"` and does not open on focus. That is
 * captured here as a DEFECT, not as a contract — see e2e/reference.js. The same helpers serve
 * step 3's `Dropdown` matrix, which is most of why this section exists before it is needed.
 */
const keyboard = (
    <>
        <p style={NOTE}>keyboard: Tab order, focus-opens, Escape.</p>
        <div style={{ position: 'absolute', left: 300, top: 300 }}>
            <label>
                before
                <input data-harness="kbd-before" type="text" style={{ marginLeft: 8 }} />
            </label>
            <span style={{ margin: '0 16px' }}>
                <Pop id="keyboard" label="Keyboard bubble">Keyboard trigger</Pop>
            </span>
            <label>
                after
                <input data-harness="kbd-after" type="text" style={{ marginLeft: 8 }} />
            </label>
        </div>
    </>
)

/**
 * 8. THE IN-HOUSE PLACEMENT VOCABULARY. `tooltip.less` carries eight placement class combinations
 * and §9.7-F1 step 2 treats that vocabulary as an asset the replacement inherits. Whether all eight
 * actually WORK is a layout fact, so it has never been checked: jsdom resolves no cascade and no
 * over-constrained absolute positioning. Eight identical 60x20 block hosts, one placement each, so
 * the spec can report the vocabulary as a table instead of a claim.
 */
const PLACEMENTS = [
    ['top', { top: true }],
    ['bottom', { bottom: true }],
    ['left', { left: true }],
    ['right', { right: true }],
    ['top-left', { top: true, left: true }],
    ['top-right', { top: true, right: true }],
    ['bottom-left', { bottom: true, left: true }],
    ['bottom-right', { bottom: true, right: true }],
]

const placements = (
    <>
        <p style={NOTE}>placements: all eight `tooltip.less` combinations, identical hosts.</p>
        {PLACEMENTS.map(([name, flags], i) => (
            <span
                key={name}
                data-harness={`place-${name}`}
                style={{
                    position: 'absolute',
                    left: [220, 500, 780, 1040][i % 4],
                    top: i < 4 ? 260 : 540,
                    width: 60,
                    height: 20,
                    background: '#eee',
                    display: 'block',
                }}
            >
                {name}
                <Tooltip {...flags} show className={`harness-place-${name}`}>{`${name} bubble`}</Tooltip>
            </span>
        ))}
    </>
)

const SECTIONS = { plain, flip, overflow, clip, scroll, stack, inline, placements, keyboard }

const TooltipHarness = () => {
    // Every section change is a full page load (the search string changes), so reading `location`
    // at render is enough and no router subscription is needed. `Examples.jsx` reads
    // `window.location.hash` the same way.
    const search = (typeof window !== 'undefined' && window.location.search) || ''
    const requested = (/[?&]section=([\w-]+)/.exec(search) || [])[1]
    const section = SECTIONS[requested]

    return (
        <div data-harness="root" data-harness-section={requested || 'index'} style={ROOT}>
            {section || (
                <ul style={{ ...NOTE, position: 'static', padding: 16 }}>
                    {Object.keys(SECTIONS).map((name) => (
                        <li key={name}><a href={`?section=${name}`}>{name}</a></li>
                    ))}
                </ul>
            )}
            {/* A control for "is `position: fixed` viewport-relative inside `.ui-render`". */}
            <div
                data-harness="fixed-probe"
                style={{ position: 'fixed', left: 24, bottom: 24, width: 10, height: 10 }}
            />
        </div>
    )
}

export default TooltipHarness
