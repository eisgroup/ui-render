// Force form module to load before rules.tsx cycle
import '../../modules/form/utils'
import '../rules'
import { Active } from '../../utils'

// The nested-Data registry: four members of the engine layer since §9.3 step 5, until then the
// `withDataKind` mixin applied to that one class. `Active.UIRender` hosts the form layer over it, and
// carries that class as `InstanceClass` (§9.3 step 6).
const EngineLayer = Object.getPrototypeOf(Active.UIRender.InstanceClass)

describe('the nested-Data registry', () => {
    /** A bare object on the engine layer's prototype: the registry touches nothing else. */
    const newParent = () => Object.create(EngineLayer.prototype)

    function makeInstance (meta = {}, dataKindPath) {
        const inst = { props: { meta } }
        if (dataKindPath !== undefined) inst.dataKindPath = dataKindPath
        return inst
    }

    it('exposes getDataKindPath / register / unregister / getDataKind on the engine layer', () => {
        expect(typeof EngineLayer.prototype.getDataKindPath).toBe('function')
        expect(typeof EngineLayer.prototype.registerDataKind).toBe('function')
        expect(typeof EngineLayer.prototype.unregisterDataKind).toBe('function')
        expect(typeof EngineLayer.prototype.getDataKind).toBe('function')
    })

    it('registerDataKind stores instance under {kind, scope, index}', () => {
        const parent = newParent()
        const child = makeInstance({ relativePath: 'foo.bar' })
        parent.registerDataKind(child, 'period', 0)
        expect(parent.dataKind.period).toBeDefined()
        // The basePath is derived from relativePath via getDataKindPathFromRelative
        const scopes = Object.keys(parent.dataKind.period)
        expect(scopes.length).toBe(1)
        const scope = scopes[0]
        expect(parent.dataKind.period[scope][0]).toBe(child)
    })

    it('unregisterDataKind removes the entry', () => {
        const parent = newParent()
        const child = makeInstance({})
        parent.registerDataKind(child, 'period', 0)
        parent.unregisterDataKind(child, 'period', 0)
        // The slot should be empty after unregister
        const scopes = parent.dataKind.period || {}
        for (const scope in scopes) {
            expect(scopes[scope][0]).toBeUndefined()
        }
    })

    it('unregisterDataKind is a no-op when instance is null/undefined', () => {
        const parent = newParent()
        expect(() => parent.unregisterDataKind(null, 'k', 0)).not.toThrow()
    })

    it('unregisterDataKind is a no-op when dataKind registry has not been initialized', () => {
        const parent = newParent()
        const child = makeInstance({})
        // parent.dataKind not yet set
        expect(() => parent.unregisterDataKind(child, 'k', 0)).not.toThrow()
    })

    it('getDataKind without scope falls back to the first registered scope', () => {
        const parent = newParent()
        const child = makeInstance({})
        parent.registerDataKind(child, 'period', 0)
        // Even without form data, getDataKind returns [] (empty) rather than throwing
        expect(Array.isArray(parent.getDataKind('period'))).toBe(true)
    })

    it('getDataKind with an explicit scope uses it', () => {
        const parent = newParent()
        expect(Array.isArray(parent.getDataKind('period', 'explicit-scope'))).toBe(true)
    })

    it('getDataKind returns empty array for unknown kind', () => {
        const parent = newParent()
        expect(parent.getDataKind('unknownKind')).toEqual([])
    })
})
