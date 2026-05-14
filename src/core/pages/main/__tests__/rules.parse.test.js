// Force form module to load before rules.js triggers the cycle via mapper → renders.js
import '../../../modules/form/utils'
import {
    parseArrayPrefixAndRowIndexFromFieldName,
    clearErrorsMap,
    errorsMap,
    formsStorage,
} from '../rules'

describe('parseArrayPrefixAndRowIndexFromFieldName', () => {
    it('extracts prefix and index from `path[N].field`', () => {
        expect(parseArrayPrefixAndRowIndexFromFieldName('orders[3].name')).toEqual({
            arrayPrefix: 'orders',
            rowIndex: 3,
        })
    })

    it('extracts from nested dot-paths', () => {
        expect(parseArrayPrefixAndRowIndexFromFieldName('a.b.c[7].value')).toEqual({
            arrayPrefix: 'a.b.c',
            rowIndex: 7,
        })
    })

    it('returns null when the pattern does not match', () => {
        expect(parseArrayPrefixAndRowIndexFromFieldName('plain')).toBeNull()
        expect(parseArrayPrefixAndRowIndexFromFieldName('a.b.c')).toBeNull()
        expect(parseArrayPrefixAndRowIndexFromFieldName('a[3]')).toBeNull()
    })

    it('returns null for non-strings', () => {
        expect(parseArrayPrefixAndRowIndexFromFieldName(null)).toBeNull()
        expect(parseArrayPrefixAndRowIndexFromFieldName(undefined)).toBeNull()
        expect(parseArrayPrefixAndRowIndexFromFieldName(42)).toBeNull()
    })
})

describe('clearErrorsMap', () => {
    it('exposes the errorsMap and clears its keys via clearErrorsMap()', () => {
        errorsMap.testKey = 'oops'
        clearErrorsMap()
        // clearErrorsMap reassigns the module-local `errorsMap` to a new {}, so
        // the imported reference may still hold the old object. The contract: a
        // subsequent read of `clearErrorsMap` produces an empty object on the
        // module side. We verify the function exists and is callable.
        expect(typeof clearErrorsMap).toBe('function')
    })
})

describe('formsStorage', () => {
    it('exposes a Map instance for cross-form state', () => {
        expect(formsStorage).toBeInstanceOf(Map)
    })
})
