// Force form module to load before rules.js cycle
import '../../../modules/form/utils'
import { withDataKind } from '../rules'

describe('withDataKind decorator', () => {
    class MockClass {}
    withDataKind(MockClass)

    function makeInstance (meta = {}, dataKindPath) {
        const inst = { props: { meta } }
        if (dataKindPath !== undefined) inst.dataKindPath = dataKindPath
        return inst
    }

    it('exposes getDataKindPath / register / unregister / getDataKind on the class prototype', () => {
        expect(typeof MockClass.prototype.getDataKindPath).toBe('function')
        expect(typeof MockClass.prototype.registerDataKind).toBe('function')
        expect(typeof MockClass.prototype.unregisterDataKind).toBe('function')
        expect(typeof MockClass.prototype.getDataKind).toBe('function')
    })

    it('registerDataKind stores instance under {kind, scope, index}', () => {
        const parent = new MockClass()
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
        const parent = new MockClass()
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
        const parent = new MockClass()
        expect(() => parent.unregisterDataKind(null, 'k', 0)).not.toThrow()
    })

    it('unregisterDataKind is a no-op when dataKind registry has not been initialized', () => {
        const parent = new MockClass()
        const child = makeInstance({})
        // parent.dataKind not yet set
        expect(() => parent.unregisterDataKind(child, 'k', 0)).not.toThrow()
    })

    it('getDataKind without scope falls back to the first registered scope', () => {
        const parent = new MockClass()
        const child = makeInstance({})
        parent.registerDataKind(child, 'period', 0)
        // Even without form data, getDataKind returns [] (empty) rather than throwing
        expect(Array.isArray(parent.getDataKind('period'))).toBe(true)
    })

    it('getDataKind with an explicit scope uses it', () => {
        const parent = new MockClass()
        expect(Array.isArray(parent.getDataKind('period', 'explicit-scope'))).toBe(true)
    })

    it('getDataKind returns empty array for unknown kind', () => {
        const parent = new MockClass()
        expect(parent.getDataKind('unknownKind')).toEqual([])
    })
})
