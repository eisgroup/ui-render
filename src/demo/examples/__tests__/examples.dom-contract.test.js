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
 * pinning a number on each buys maintenance burden rather than signal — every one of
 * them is a facet of the same root cause as the `data="[object Object]"` entry, so
 * that entry's count already moves when the leak is addressed:
 *
 *   - Lowercase engine-internal props reaching DOM elements. Unlike camelCase ones,
 *     React emits no unknown-prop warning for these, so the registry suite's console
 *     allowlist cannot see them either: bare `view=` (15), `index=` (34), bare
 *     `label=` (6), `symbol=` (23), and meta `_comment=` text rendered into HTML (2).
 *   - Duplicate real ids within one document — three sibling table rows repeat the
 *     same field ids, and each `<label for=…>` can therefore only ever resolve to the
 *     first. The pie chart emits each of its six gradient defs twice.
 */
const KNOWN_DOM_DEFECTS = [
    {
        marker: 'id="undefined"',
        count: 12,
        cause: 'src/core/components/Expand.js:135 renders id={String(id)}, so an Expand view with no'
            + ' `id` in its meta emits the literal attribute id="undefined". Multiple Expands in one'
            + ' document therefore share a duplicate, meaningless id.',
    },
    {
        marker: 'undefined-last',
        count: 20,
        cause: 'src/core/pages/main/components/TableView.js:215 runs `className += "-last"`'
            + ' unconditionally for a non-sticky neighbour, appending to an undefined className. The'
            + ' junk token reaches the DOM through cn("left", classNameHeader) at TableView.js:246;'
            + ' the "-last" suffix is only meaningful on the "sticky" class.',
    },
    {
        marker: 'currencycode="USD"',
        count: 331,
        cause: 'src/core/ui-render/Render.js:126 passes currencyCode to every rendered node, and it'
            + ' reaches the DOM through the {...props} spread at src/core/components/View.js:34. This is'
            + ' the most prolific leak in the baseline and the only lowercase one React does warn about,'
            + ' so it is also allowlisted in Examples.registry-and-rendering.test.js. The changelog'
            + ' records two earlier partial fixes for it, which is why it gets a counted tripwire:'
            + ' a central strip is unsafe (List.js and the Tabs branch of mapper.js consume it).',
    },
    {
        marker: 'data="[object Object]"',
        count: 40,
        cause: 'the Render.Method renderers in src/core/pages/main/mapper.js destructure only the'
            + ' render-config keys they use and forward `...props` to renderFloat, which spreads them'
            + ' onto <Text> (src/core/components/renders.js:149) and from there onto a <span>'
            + ' (src/core/components/Text.js:47). Engine-internal props leak as DOM attributes —'
            + ' including the whole `data` object, serialised as "[object Object]", plus `_data` and'
            + ' the renderer selector `name`.',
    },
]

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

    it('still emits aria-describedby references that resolve to nothing', () => {
        if (renderedDom.size !== snapshotExamples().length) {
            throw new Error(
                `this check needs every example rendered (have ${renderedDom.size} of`
                + ` ${snapshotExamples().length}). Run this suite whole.`
            )
        }

        // Input.js:125, InputNumber.js:202 and InputDate.js:108 set aria-describedby
        // unconditionally, but the element carrying the target id is rendered only when there is an
        // error or info message (Input.js:145, InputNumber.js:250, InputDate.js:124). So every
        // reference in the baseline points at an id that exists nowhere in its document — an axe
        // `aria-valid-attr-value` violation, pinned here rather than blessed silently by the
        // snapshots. Fixing it means making the attribute conditional too, which changes rendered
        // output for consumers, so it needs its own change: expect this to fail then, and delete it.
        const referenced = []
        const declared = new Set()
        for (const dom of renderedDom.values()) {
            for (const [, value] of dom.matchAll(/aria-describedby="([^"]*)"/g)) {
                referenced.push(...value.split(/\s+/).filter(Boolean))
            }
            for (const [, value] of dom.matchAll(/\sid="([^"]*)"/g)) declared.add(value)
        }

        expect(referenced).toHaveLength(57)
        expect(referenced.filter(id => declared.has(id))).toEqual([])
    })

    it.each(KNOWN_DOM_DEFECTS)('still emits the known defect $marker $count times', ({ marker, count }) => {
        // The ledger counts across the whole example set, so it is only meaningful
        // once every snapshot above has run. Fail with the reason rather than with a
        // mystery count, which is what a filtered (`-t`) run would otherwise produce.
        if (renderedDom.size !== snapshotExamples().length) {
            throw new Error(
                `the defect ledger needs every example rendered (have ${renderedDom.size} of`
                + ` ${snapshotExamples().length}). Run this suite whole; a filtered run cannot count`
                + ' defect occurrences.'
            )
        }

        const occurrences = [...renderedDom.values()]
            .reduce((total, dom) => total + dom.split(marker).length - 1, 0)
        expect(occurrences).toBe(count)
    })
})
