/**
 * SHARED HARNESS FOR THE BEHAVIOURAL CONTRACT LAYER ============================
 *
 * UPGRADE-PLAN §9.5, contract-test layer (2). Layer (1) (the full-DOM snapshots)
 * has its own private harness in `examples.dom-contract.test.js` because it must
 * stay a single, deliberately dumb code path. Layer (2) is spread over several
 * suites — the manifest-wide census, and the per-view behavioural contracts for
 * the `semantic-ui-react` wrappers §9.7-F1 replaces (two left after step 1) — so the mount itself
 * lives here rather than being copied five times.
 *
 * Everything this module exports is markup-agnostic on purpose: it mounts the
 * engine and cleans up after it, and it never reaches into rendered markup. The
 * assertions are the suites' job, and they are written against roles, accessible
 * names, visible text and form values only — never CSS classes or element shape —
 * so that they survive the F1 rewrites, where the DOM changes by design and the
 * layer-(1) snapshots are regenerated.
 * -----------------------------------------------------------------------------
 */
import React from 'react'
import { render } from '@testing-library/react'
import { AppContext, ConfigContext, initialAppState, initialConfigState } from '../../core/contexts'
import { storedTouched } from '../../core/modules/form/utils'
import UIRender, { clearErrorsMap, formsStorage } from '../../core/pages/main/rules'
import { AppProvider } from '../../core/providers/AppProvider'

/**
 * Plain functions, never `jest.fn()`: `isFunction()` in core/utils rejects
 * cross-realm functions, so a jest mock is treated as a non-function by the
 * engine and the prop is silently dropped.
 */
const noop = () => {}
const identity = value => value

const apiCalls = {
    updateExperienceData: () => Promise.resolve({}),
    downloadFile: () => Promise.resolve({}),
    uploadFile: () => Promise.resolve({}),
}

/**
 * The engine keeps per-form state in module globals (UPGRADE-PLAN §2.6-5). Two
 * mounts in one process therefore see each other's leftovers unless this runs
 * between them.
 */
export const clearEngineGlobals = () => {
    formsStorage.clear()
    clearErrorsMap()
    Object.keys(storedTouched).forEach(key => delete storedTouched[key])
}

/**
 * Mount one manifest example with the maximal host prop set — the same set the
 * layer-(1) harness and the registry suite use, so "every example" keeps meaning
 * one thing across all three.
 *
 * @param {{id: String, meta: Object, data: Object}} example - manifest entry
 * @param {Object} [overrides] - extra/replacement props for `UIRender`
 * @returns {Object} RTL render result, plus `getFormData()` once the engine has
 *   handed over its reader (undefined until then).
 */
export const mountExample = (example, overrides = {}) => {
    clearEngineGlobals()
    let readFormData
    const result = render(
        <ConfigContext.Provider value={initialConfigState}>
            <AppContext.Provider
                value={{ ...initialAppState, setPopupState: noop, togglePopupState: noop }}
            >
                <UIRender
                    data={example.data}
                    meta={example.meta}
                    initialValues={example.data}
                    form={{ id: 'example' }}
                    onSubmit={noop}
                    translate={identity}
                    apiCalls={apiCalls}
                    getFormData={getter => { readFormData = getter }}
                    {...overrides}
                />
            </AppContext.Provider>
        </ConfigContext.Provider>
    )
    return { ...result, getFormData: () => (readFormData ? readFormData() : undefined) }
}

/**
 * Mount an inline meta/data pair. Used where the manifest carries no example for
 * a contract clause — `readonly` on a Select, a `Tooltip` node, a `Popup`
 * template — so the clause is still expressed as meta rather than as a component
 * call, which is the level §9.5 asks layer (2) to gate.
 */
export const mountMeta = (meta, data = {}, overrides = {}) =>
    mountExample({ meta, data }, overrides)

/**
 * Mount an inline meta with the REAL `AppProvider`, so the modal-popup round trip
 * runs through the provider's own state instead of a stubbed `setPopupState`.
 * The portal root is a host-page obligation (`AppWrapper.js` renders it for the
 * library, `App.jsx` for the demo) and `Popup.js` resolves it by a global id, so
 * the caller must create it — see `withPopupRoot`.
 */
export const mountMetaWithAppState = (meta, data = {}, overrides = {}) => {
    clearEngineGlobals()
    return render(
        <AppProvider>
            <UIRender
                data={data}
                meta={meta}
                initialValues={data}
                translate={identity}
                apiCalls={apiCalls}
                {...overrides}
            />
        </AppProvider>
    )
}

/**
 * Create and remove the fixed-id node `Popup.js` portals into. Without it the
 * first popup open throws "Target container is not a DOM element" — the same
 * single-global-root limit UPGRADE-PLAN §2.6-5 / R14 records.
 *
 * @returns {Function} teardown
 */
export const withPopupRoot = () => {
    const root = document.createElement('div')
    root.id = 'render-popup-root'
    document.body.appendChild(root)
    return () => { if (root.parentNode) root.parentNode.removeChild(root) }
}

export { apiCalls, identity, noop }
