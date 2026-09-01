/**
 * FULL-DOM CONTRACT SNAPSHOTS =================================================
 *
 * UPGRADE-PLAN §9.5, contract-test layer (1): a full-DOM snapshot of every
 * example in the canonical manifest. These gate the *pure* refactors (§9.2/§9.3),
 * where the rendered DOM must not change at all. They are deliberately dumb and
 * total; the markup-*independent* behavioural assertions that gate §9.7-F1 (where
 * the DOM changes on purpose) are layer (2) and live in the per-component suites.
 *
 * HOW AND WHEN TO REGENERATE
 * -----------------------------------------------------------------------------
 *   npx jest src/demo/examples/__tests__/examples.dom-contract.test.js -u
 *
 * Regenerate ONLY when the DOM change is the intended product of the commit —
 * a component's markup was deliberately restructured, an example's meta/data was
 * edited, or an example was added or removed. Then read the diff: every changed
 * line is a change your users see. A `-u` run that produces a diff you cannot
 * explain line by line is a bug you are about to bake in as expected output.
 *
 * NEVER `-u` to make a red pure refactor (§9.2/§9.3) go green: for those commits a
 * diff here is the finding, and the whole reason this layer exists.
 *
 * WHAT IS AND IS NOT NORMALISED
 * -----------------------------------------------------------------------------
 * Attribute ORDER is normalised (sorted) by ../../testing/serializeDom — it is a
 * React implementation detail, and React 19 orders `<input>` attributes
 * differently from 16/17/18. Nothing else is: no id masking, no date or timestamp
 * scrubbing, no whitespace collapsing, because measurement showed none is needed
 * and every masked value is a value this layer stops gating. Verified on this
 * example set, all 38, `TZ=UTC`:
 *   - stable across two renders in one process (asserted on every run below);
 *   - identical under TZ=UTC, Pacific/Kiritimati (+14) and Pacific/Honolulu (-10);
 *   - identical with the system clock moved to 2031 — no example formats "now";
 *   - byte-identical on React 16.14.0, 17.0.2, 18.3.1 and 19.2.8 once attribute
 *     order is canonical, so ONE snapshot file serves every leg of the matrix
 *     (`npx jest`, `npm run test:react16`, `npm run test:react17`, and the
 *     react-19-advisory CI job).
 * If a future example needs masking, prefer excluding it via the manifest's
 * `noSnapshot` flag with a reason over loosening the serialiser for all 38.
 *
 * Portals are not covered: nothing in this library renders into a portal at mount
 * time (measured — `document.body` holds only the RTL container), and popups open
 * on interaction, which is layer (2)'s job.
 * -----------------------------------------------------------------------------
 */
import React from 'react'
import { render } from '@testing-library/react'
import { ConfigContext, initialConfigState, AppContext, initialAppState } from '../../../core/contexts'
import { storedTouched } from '../../../core/modules/form/utils'
import UIRender, { clearErrorsMap, formsStorage } from '../../../core/pages/main/rules'
import { serializeDom } from '../../testing/serializeDom'
import { snapshotExamples } from '../manifest'

// Plain functions, not jest.fn(): isFunction() in core/utils rejects cross-realm
// functions, so a jest mock would be treated as a non-function here.
const noop = () => {}
const translate = value => value
const apiCalls = {
    updateExperienceData: () => Promise.resolve({}),
    downloadFile: () => Promise.resolve({}),
    uploadFile: () => Promise.resolve({}),
}

const clearGlobalRegistries = () => {
    formsStorage.clear()
    clearErrorsMap()
    Object.keys(storedTouched).forEach(key => delete storedTouched[key])
}

/**
 * One prop set for all 38, deliberately the maximal one (the same the registry
 * suite uses) rather than mirroring the demo's per-example `hostApi` branch: it
 * keeps this harness a single code path and exercises `translate`/`apiCalls` on
 * every example. Which examples the *demo* mounts with host-integration props is
 * pinned by manifest.contract.test.js instead.
 */
const renderExample = ({ data, meta }) => {
    clearGlobalRegistries()
    const { container, unmount } = render(
        <ConfigContext.Provider value={initialConfigState}>
            <AppContext.Provider
                value={{ ...initialAppState, setPopupState: noop, togglePopupState: noop }}
            >
                <UIRender
                    data={data}
                    meta={meta}
                    initialValues={data}
                    form={{ id: 'example' }}
                    onSubmit={noop}
                    translate={translate}
                    apiCalls={apiCalls}
                />
            </AppContext.Provider>
        </ConfigContext.Provider>
    )
    const dom = serializeDom(container)
    unmount()
    clearGlobalRegistries()
    return dom
}

/**
 * KNOWN DOM DEFECTS THE SNAPSHOTS CURRENTLY ENCODE
 * -----------------------------------------------------------------------------
 * A baseline snapshot records the DOM as it is, defects included. Rather than let
 * that bless them silently, every defect found while establishing this baseline
 * is counted here with its cause. Each is pre-existing and none is fixed by the
 * commit that introduced this layer: fixing them changes rendered output for
 * consumers, so each needs its own change with its own review.
 *
 * When you fix one, this ledger fails with a count that dropped — that is the
 * signal to update the entry (or delete it) and to regenerate the snapshots. If a
 * count *rises*, a new instance of a known defect just shipped.
 *
 * SCOPE: this list is the set of defects given a *counted tripwire*, not the full
 * inventory of what the baseline encodes. The snapshot diff is the guard for the
 * rest. Counted entries are the ones worth a number: prolific, or with a history of
 * partial fixes. Also present in the baseline, deliberately left uncounted because
 * pinning a number on each buys maintenance burden rather than signal:
 *
 *   - Duplicate real ids within one document — three sibling table rows repeat the
 *     same field ids, and each `<label for=…>` can therefore only ever resolve to the
 *     first. The pie chart emits each of its six gradient defs twice.
 *
 * Everything this ledger once counted is now FIXED and guarded at zero below instead:
 * the engine-internal props (`view`, `index`, `label`, `symbol`, `_comment`, `data`,
 * `_data` and 108 of the 165 `name`) in FIXED_PROP_LEAKS, and the two markup defects
 * (`id="undefined"`, the `-last` junk classes) in FIXED_MARKUP_JUNK. Three claims made
 * here while they were live were wrong, and are recorded so the numbers are not
 * re-derived from the same mistakes:
 *   - they were NOT all "a facet of the same root cause as the data=… entry". There
 *     were four independent causes: the Render.Method options bag (`transforms.js`,
 *     which is where `data`/`_data`/`symbol` and 40 `name` came from), meta keys no
 *     view consumes reaching View/Row/Text, a component building DOM props from a raw
 *     untransformed meta node (`LocalDraftTableRow` → `view`), and components that
 *     need `name` but spread it onto a non-form element.
 *   - `index=` was stated as 34. There were 8. The number came from an unprefixed grep,
 *     which also matches `tabindex=` — but that is 8 + 31 = 39, not 34, so the 34 was
 *     measured against an earlier snapshot than the one it was written next to, and no
 *     version in git history yields it. The lesson is the mechanism, not the arithmetic:
 *     a RAW marker matches substrings (`'index='` hits `tabindex=`, `'label='` hits
 *     `aria-label=`, `'data='` would hit `data-testid=`). Markers here are therefore
 *     space-prefixed, and a new entry must be too.
 *   - `undefined-last` was counted as 20 and treated as the whole of that defect. The
 *     real total was 210: TableView appended `-last` to every cell whose neighbour is
 *     not sticky, so a cell with NO className produced `undefined-last` (20) and one
 *     with an EMPTY className produced the bare class `-last` (190). Counting one
 *     spelling of a defect measures the spelling, not the defect — which is the same
 *     mistake as the `index=` count above, in a different direction.
 *
 * A NOTE ON WHAT THIS CORPUS CANNOT SEE, since it misled twice: the 38 examples are a
 * regression net, not an audit. They contain zero `sticky` classes, so neither the
 * `-last` bug nor its fix could be judged here — that is covered directly in
 * `pages/main/components/__tests__/TableView.test.js`. Seven leaking DOM boundaries
 * were likewise invisible because no example passes an engine prop to a slider or an
 * icon; see the audit note in `components/domProps.js`.
 */
// The ledger is empty: every defect the first baseline encoded has been fixed. Kept as the
// place a NEW one goes -- record it with a count and a cause rather than letting `-u` bless it.
const KNOWN_DOM_DEFECTS = []

/**
 * ENGINE-INTERNAL PROPS THAT MAY NEVER REACH THE DOM AGAIN
 * -----------------------------------------------------------------------------
 * The inverse of the ledger above: markers whose count must stay at ZERO. Each was a
 * measured leak in the first baseline (`data` 40 — the deleted `data="[object Object]"`
 * ledger entry — `_data` 40, `symbol` 23, `view` 15, `index` 8, `label` 6, `_comment` 2)
 * and each is now filtered at the DOM boundary by src/core/components/domProps.js, with
 * `_comment` additionally dropped at source by metaToProps.
 *
 * Why a corpus-wide tripwire and not just the snapshots: this family came back four
 * times, one prop at a time, because each fix lived in one component. React emits no
 * unknown-prop warning for a lowercase attribute, so nothing in the console reports a
 * relapse and the registry suite's allowlist cannot see it either — only a count can.
 *
 * Markers are SPACE-PREFIXED on purpose; see the note in the header above. Attributes
 * are serialised one element per line with a space before each, so ' view=' matches an
 * attribute and cannot match `viewBox=`, `tabindex=` or `aria-label=`.
 */
const FIXED_PROP_LEAKS = [' view=', ' index=', ' label=', ' symbol=', ' _comment=', ' data=', ' _data=']

/**
 * Junk the engine used to render that was not a prop leak, so it needs its own zero list.
 *   `id="undefined"`  -- Expand rendered `id={String(id)}` and `id` is optional in meta, so
 *                       several Expands in one document shared the literal id "undefined";
 *                       a `<label for>` could then only ever resolve to the first.
 *   `undefined-last`  -- TableView appended `-last` to EVERY cell whose right-hand neighbour
 *                       is not sticky. `-last` only means anything on `sticky`
 *                       (`table.less` draws `td.sticky-last::after`), so on a cell with no
 *                       className it produced the class `undefined-last`.
 *   `"-last"`         -- the same bug on a cell whose className was the empty string. The
 *                       original ledger counted only the `undefined` form and so measured 20
 *                       where the real total was 210; this marker is why the other 190 are
 *                       now guarded too.
 */
const FIXED_MARKUP_JUNK = ['id="undefined"', 'undefined-last', 'class="-last"']

/**
 * `name` cannot go to zero and must not: it is the react-final-form field registration
 * path that a form control carries on the DOM. 165 of them were rendered in the first
 * baseline and 108 were leaks, on <table>, on Semantic's dropdown <div>, on the upload
 * dropzone, and on every View/Row/Text that happened to carry a data binding. What is
 * pinned is the invariant instead of the absence: every `name` in the corpus sits on a
 * form control, and there are 57 of them.
 */
// `tags` is the set of elements on which a bound `name` is legitimate, not the set the
// corpus happens to render today: `InputNative` renders <textarea> and (via Select)
// <select> with a name, and `Button` deliberately keeps it because <button name> is
// valid. Listing only 'input' would fail the first example that used a textarea while
// the code was behaving as designed.
const BOUND_NAME_ATTRIBUTES = { count: 57, tags: ['input', 'textarea', 'select', 'button'] }

describe('demo example full-DOM contract', () => {
    let consoleError
    const originalFetch = global.fetch
    // Filled by the test.each below and asserted by the defect ledger afterwards,
    // so the ledger costs no extra renders.
    const renderedDom = new Map()

    beforeEach(() => {
        // The allowlisted development warnings are asserted by
        // Examples.registry-and-rendering.test.js; silence them here so a snapshot
        // failure is not buried in warning output.
        consoleError = jest.spyOn(console, 'error').mockImplementation(noop)
        global.fetch = () => Promise.resolve({ json: () => Promise.resolve({}) })
    })

    afterEach(() => {
        consoleError.mockRestore()
        if (originalFetch === undefined) delete global.fetch
        else global.fetch = originalFetch
    })

    test.each(snapshotExamples().map(example => [example.id, example]))(
        '%s renders a stable, non-empty DOM matching its snapshot',
        (id, example) => {
            const dom = renderExample(example)

            // Rendered twice on purpose. A snapshot that only ever renders once
            // cannot tell "the DOM changed" from "the DOM is not deterministic",
            // and the second kind of failure would otherwise surface as a random
            // red build long after the example that introduced it landed.
            expect(renderExample(example)).toBe(dom)

            // Floor checks, so that `-u` cannot quietly bless a broken render as
            // the new contract: an example that stops rendering produces a short
            // or empty serialisation, which is a defect, not a new expectation.
            expect(dom).toContain('ui__render')
            expect(dom.length).toBeGreaterThan(200)

            renderedDom.set(id, dom)
            expect(dom).toMatchSnapshot()
        }
    )

    it('emits no aria-describedby reference that resolves to nothing', () => {
        if (renderedDom.size !== snapshotExamples().length) {
            throw new Error(
                `this check needs every example rendered (have ${renderedDom.size} of`
                + ` ${snapshotExamples().length}). Run this suite whole.`
            )
        }

        // Input.js, InputNumber.js and InputDate.js used to set aria-describedby
        // unconditionally while rendering the element that carries the target id only when
        // there is an error or info message — so all 57 references in the first baseline
        // pointed at an id that existed nowhere in its document (an axe
        // `aria-valid-attr-value` violation). The attribute is now conditional on the same
        // value as the element, and this asserts the invariant across the whole corpus.
        //
        // None of the 38 examples mounts with a validation message, so the corpus currently
        // holds ZERO references — which still catches a regression: restoring the
        // unconditional attribute puts 57 dangling references back and fails this test. The
        // positive direction (the attribute appears, and resolves, as soon as there is a
        // message) is covered per component by
        // src/core/components/__tests__/inputs.aria-describedby.test.js.
        const dangling = []
        for (const [id, dom] of renderedDom) {
            const declared = new Set()
            for (const [, value] of dom.matchAll(/\sid="([^"]*)"/g)) declared.add(value)
            for (const [, value] of dom.matchAll(/aria-describedby="([^"]*)"/g)) {
                value.split(/\s+/).filter(Boolean)
                    .filter(reference => !declared.has(reference))
                    .forEach(reference => dangling.push(`${id}: ${reference}`))
            }
        }

        expect(dangling).toEqual([])
    })

    const requireWholeCorpus = (what) => {
        if (renderedDom.size !== snapshotExamples().length) {
            throw new Error(
                `${what} needs every example rendered (have ${renderedDom.size} of`
                + ` ${snapshotExamples().length}). Run this suite whole; a filtered run cannot count`
                + ' attribute occurrences.'
            )
        }
    }

    const countAcrossCorpus = (marker) => [...renderedDom.values()]
        .reduce((total, dom) => total + dom.split(marker).length - 1, 0)

    it.each(FIXED_MARKUP_JUNK)('never re-emits the fixed markup junk %s', (marker) => {
        requireWholeCorpus('the fixed-junk tripwire')

        // These were never prop leaks, so the domProps boundary cannot catch a regression:
        // `id="undefined"` is a String(undefined) in Expand, and the `-last` forms are
        // TableView marking a sticky run on cells that are not in one.
        expect(countAcrossCorpus(marker)).toBe(0)
    })

    it.each(FIXED_PROP_LEAKS)('never re-emits the fixed prop leak %s', (marker) => {
        requireWholeCorpus('the fixed-leak tripwire')

        // A rise from zero means an engine-internal prop is reaching DOM elements again.
        // Do not add a destructure to whichever component surfaced it — put the prop in
        // ENGINE_PROPS in src/core/components/domProps.js, which is the boundary.
        expect(countAcrossCorpus(marker)).toBe(0)
    })

    it('emits `name` only on a form control, and only where a field binds', () => {
        requireWholeCorpus('the name-attribute invariant')

        const offenders = []
        let total = 0
        for (const [id, dom] of renderedDom) {
            for (const line of dom.split('\n')) {
                const occurrences = line.split(' name=').length - 1
                if (!occurrences) continue
                total += occurrences
                const tag = (line.match(/<([a-zA-Z][^\s/>]*)/) || [])[1]
                if (BOUND_NAME_ATTRIBUTES.tags.indexOf(tag) === -1) {
                    offenders.push(`${id}: <${tag}> ${line.trim()}`)
                }
            }
        }

        // `name` on anything but a form control is the leak, not the binding. Fix it by
        // applying FIELD_ONLY_PROPS at that component's DOM boundary — never by stripping
        // `name` upstream, which silently unbinds every form field.
        expect(offenders).toEqual([])
        expect(total).toBe(BOUND_NAME_ATTRIBUTES.count)
    })

    // One test rather than `it.each`, because the ledger is currently empty and `it.each([])`
    // throws. An empty ledger is the goal state, not a reason to delete the guard.
    it('still emits every defect the ledger records, at its recorded count', () => {
        if (!KNOWN_DOM_DEFECTS.length) return

        // The ledger counts across the whole example set, so it is only meaningful
        // once every snapshot above has run. Fail with the reason rather than with a
        // mystery count, which is what a filtered (`-t`) run would otherwise produce.
        requireWholeCorpus('the defect ledger')

        // Compared as objects so a failure names the marker instead of just two numbers.
        expect(KNOWN_DOM_DEFECTS.map(({ marker }) => ({ marker, occurrences: countAcrossCorpus(marker) })))
            .toEqual(KNOWN_DOM_DEFECTS.map(({ marker, count }) => ({ marker, occurrences: count })))
    })
})
