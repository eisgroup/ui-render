/**
 * THE ENGINE DOES NOT MUTATE THE CLASS IT DECORATES (§9.3 step 5).
 * =============================================================================================
 *
 * `Decorator` used to write thirteen methods, five getters and a state shape straight onto
 * `Class.prototype` — the class `rules.tsx` had just declared, patched in place as a side effect of
 * importing the module. Two things follow from that, and this file pins both of them shut.
 *
 * The exported `UIRender` was a different object before and after the import, so nothing could
 * reason about the class as written; and the lifecycle layer had no identity of its own, which is
 * what §9.3 step 5 means by "visible in the component tree".
 *
 * The layer is now a subclass. The class handed to `Decorator` is left exactly as written.
 *
 * The layer's own bodies are written as class members, `config` and the four nested-Data registry
 * methods included; those were the `withDataKind` mixin, assigned onto the prototype after the
 * class. Only `state` is still assigned there, because the form layer builds its own from it (see
 * `Decorator` in `rules.tsx`).
 *
 * THE FORM MODULE STOPPED PATCHING IT IN TURN. `withFormSetup` used to write the form members onto
 * this layer's prototype and replace its `UNSAFE_componentWillReceiveProps` and
 * `componentWillUnmount`; it now builds a subclass of its own over it. That subclass is what the
 * form wrapper renders and what nested documents render — `engine/Data.tsx` reads it from
 * `Active.UIRender` to avoid a circular import — so the chain is the declared class, this layer,
 * then the form layer.
 */
import '../../modules/form/utils'
import UIRenderDefault, { UIRender } from '../rules'
import { Active } from '../../utils'

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

/** Everything `withFormSetup` installs. It used to land on the engine layer's own prototype. */
const FORM_MEMBERS = [
    'form',
    'handleSubmit',
    'canSave',
    'formValues',
    'registeredValues',
    'changedValues',
    'changedAndRegisteredValues',
    'validationErrors',
    'validationErrorsTooltip',
    'handleChangeInput',
    'syncInputChanges',
]
/**
 * The lifecycle methods the form layer has over the engine layer's, reached through `super`. The
 * engine layer has a `componentWillUnmount` and a `componentDidUpdate` of its own. Its
 * `deriveFromProps` is the declared class's: the props sync that was `UNSAFE_componentWillReceiveProps`
 * until §9.3 step 6, which the form layer reaches all the same. What that call carries is pinned by
 * behaviour: the prop-change tests in `UIRender.smoke` and `rules.instance-contract` fail when the form
 * layer drops it.
 */
const WRAPPED_LIFECYCLE = ['deriveFromProps', 'componentDidUpdate', 'componentWillUnmount']

// The class of what nested documents render, and the class it is built on. Since §9.3 step 6 what
// they render is the document's host, which carries the class it hosts as `InstanceClass`.
const FormLayer = Active.UIRender.InstanceClass
const EngineLayer = Object.getPrototypeOf(FormLayer)

describe('the lifecycle layer is a class of its own', () => {
    it('leaves the declared class untouched', () => {
        for (const name of INSTALLED_METHODS) {
            expect(UIRender.prototype[name]).toBeUndefined()
        }
        for (const name of [...INSTALLED_GETTERS, ...FORM_MEMBERS]) {
            expect(Object.getOwnPropertyDescriptor(UIRender.prototype, name)).toBeUndefined()
        }
    })

    it('installs everything on the layer instead', () => {
        for (const name of INSTALLED_METHODS) {
            expect(typeof EngineLayer.prototype[name]).toBe('function')
        }
        for (const name of INSTALLED_GETTERS) {
            expect(Object.getOwnPropertyDescriptor(EngineLayer.prototype, name)).toBeDefined()
        }
    })

    it('writes every member of either layer in its class body, leaving only `state` assigned', () => {
        // A class member is not enumerable and an assignment is, so this is what tells the two apart.
        // The nested-Data registry was the last thing assigned onto the engine layer after its class,
        // by the `withDataKind` mixin; `state` is assigned on purpose (see `Decorator` in `rules.tsx`).
        for (const Layer of [EngineLayer, FormLayer]) {
            const assigned = Object.getOwnPropertyNames(Layer.prototype)
                .filter(name => Object.getOwnPropertyDescriptor(Layer.prototype, name).enumerable)
            expect({ layer: Layer.name, assigned }).toEqual({ layer: Layer.name, assigned: ['state'] })
        }
    })

    it('makes the layer a subclass of the declared class, not a replacement', () => {
        expect(EngineLayer.name).toBe('UIRenderLifecycle')
        expect(Object.getPrototypeOf(EngineLayer)).toBe(UIRender)
        expect(EngineLayer.prototype).toBeInstanceOf(UIRender)
    })

    it('keeps the default export wrapping the layer', () => {
        // The default export is the layers inside the form wrapper; what the wrapper renders is also
        // what a nested document renders on its own, which is why `Data.tsx` needs it separately.
        // The wrapper is a memoised function since §9.3 step 6, so it is not a function itself.
        expect(UIRenderDefault).not.toBe(Active.UIRender)
        expect(UIRenderDefault.WrappedComponent).toBe(Active.UIRender)
        expect(Active.UIRender.InstanceClass).toBe(FormLayer)
    })
})

describe('the form layer is a class of its own over it', () => {
    it('is what nested documents render, built on the engine layer', () => {
        expect(FormLayer.name).toBe('UIRenderLifecycleWithFormSetup')
        expect(Object.getPrototypeOf(FormLayer)).toBe(EngineLayer)
    })

    it('carries the form members itself, leaving the engine layer without them', () => {
        for (const name of FORM_MEMBERS) {
            expect(Object.getOwnPropertyDescriptor(FormLayer.prototype, name)).toBeDefined()
            expect(Object.getOwnPropertyDescriptor(EngineLayer.prototype, name)).toBeUndefined()
        }
    })

    it('wraps the engine layer\'s lifecycle through `super` instead of replacing it', () => {
        for (const name of WRAPPED_LIFECYCLE) {
            expect(Object.prototype.hasOwnProperty.call(FormLayer.prototype, name)).toBe(true)
            expect(typeof EngineLayer.prototype[name]).toBe('function')
            expect(FormLayer.prototype[name]).not.toBe(EngineLayer.prototype[name])
        }
        expect(Object.prototype.hasOwnProperty.call(EngineLayer.prototype, 'componentWillUnmount')).toBe(true)
        expect(Object.prototype.hasOwnProperty.call(EngineLayer.prototype, 'componentDidUpdate')).toBe(true)
        expect(EngineLayer.prototype.deriveFromProps).toBe(UIRender.prototype.deriveFromProps)
    })

    it('builds its state shape from the engine layer\'s, leaving that as it was', () => {
        expect(EngineLayer.prototype.state).not.toHaveProperty('canSave')
        expect(FormLayer.prototype.state).toEqual({ canSave: false, ...EngineLayer.prototype.state })
    })
})
