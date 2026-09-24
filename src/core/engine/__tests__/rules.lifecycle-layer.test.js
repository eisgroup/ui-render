/**
 * THE ENGINE DOES NOT MUTATE THE CLASS IT DECORATES (§9.3 step 5).
 * =============================================================================================
 *
 * `Decorator` used to write thirteen methods, five getters and a state shape straight onto
 * `Class.prototype` — the class `rules.js` had just declared, patched in place as a side effect of
 * importing the module. Two things follow from that, and this file pins both of them shut.
 *
 * The exported `UIRender` was a different object before and after the import, so nothing could
 * reason about the class as written; and the lifecycle layer had no identity of its own, which is
 * what §9.3 step 5 means by "visible in the component tree".
 *
 * The layer is now a subclass. The class handed to `Decorator` is left exactly as written, and the
 * layer is what nested documents render — `engine/Data.js` reads it from `Active.UIRender` to avoid
 * a circular import, so that registry is the layer's published name.
 *
 * NOT yet class syntax: the bodies are still installed on the subclass's prototype rather than
 * written as members. That is a separate change; what this one removes is the mutation escaping to
 * somebody else's class.
 */
// eslint-disable-next-line no-undef
if (typeof global.fetch === 'undefined') {
    // eslint-disable-next-line no-undef
    global.fetch = () => Promise.resolve({ json: () => Promise.resolve({}) })
}
import '../../modules/form/utils' // eslint-disable-line import/first
import UIRenderDefault, { UIRender } from '../rules' // eslint-disable-line import/first
import { Active } from '../../utils' // eslint-disable-line import/first

/** Everything `Decorator` installs, by the name it installs it under. */
const INSTALLED_METHODS = [
    'setStates',
    'resetForm',
    'popupAlert',
    'registerDataKind',
    'unregisterDataKind',
    'getDataKind',
    'getDataKindPath',
]
const INSTALLED_GETTERS = ['config', 'data', 'meta', 'hasData', 'hasMeta']

describe('the lifecycle layer is a class of its own', () => {
    it('leaves the declared class untouched', () => {
        for (const name of INSTALLED_METHODS) {
            expect(UIRender.prototype[name]).toBeUndefined()
        }
        for (const name of INSTALLED_GETTERS) {
            expect(Object.getOwnPropertyDescriptor(UIRender.prototype, name)).toBeUndefined()
        }
    })

    it('installs everything on the layer instead', () => {
        for (const name of INSTALLED_METHODS) {
            expect(typeof Active.UIRender.prototype[name]).toBe('function')
        }
        for (const name of INSTALLED_GETTERS) {
            expect(Object.getOwnPropertyDescriptor(Active.UIRender.prototype, name)).toBeDefined()
        }
    })

    it('makes the layer a subclass of the declared class, not a replacement', () => {
        expect(Object.getPrototypeOf(Active.UIRender)).toBe(UIRender)
        expect(Active.UIRender.prototype).toBeInstanceOf(UIRender)
    })

    it('keeps the default export wrapping the layer', () => {
        // The default export is the layer inside the form wrapper; the layer on its own is what a
        // nested document renders, which is why `Data.js` needs it separately.
        expect(typeof UIRenderDefault).toBe('function')
        expect(UIRenderDefault).not.toBe(Active.UIRender)
    })
})
