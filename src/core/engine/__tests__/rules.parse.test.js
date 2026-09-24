// Force form module to load before rules.js reaches renders.js
import '../../modules/form/utils'
import {
    parseArrayPrefixAndRowIndexFromFieldName,
    formsStorage,
} from '../rules'
// The error maps are not the engine's to re-export any more: they live in the layer both the
// engine and the form module import (§9.3 step 2), and are per form since step 3.
import { clearErrorsFor, errorsFor } from '../../state/formRegistry'

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

describe('per-form error maps', () => {
    // This used to assert only that `clearErrorsMap` "exists and is callable", and said why: it
    // REPLACED the module's map, so the reference this file imported was the old object and the
    // clearing was unobservable from here. §9.3 step 3 made the map per form and cleared it by
    // deleting keys, so both halves of the contract can now actually be checked.
    it('clears the same object the caller is holding', () => {
        const form = {}
        const errors = errorsFor(form)
        errors.testKey = 'oops'

        clearErrorsFor(form)

        expect(errors).toEqual({})
        expect(errorsFor(form)).toBe(errors)
    })

    it('keeps the errors of one form out of another', () => {
        const first = {}
        const second = {}
        errorsFor(first).name = 'Name is Required'

        expect(errorsFor(second)).toEqual({})

        clearErrorsFor(second)
        expect(errorsFor(first)).toEqual({ name: 'Name is Required' })
    })
})

describe('formsStorage', () => {
    it('exposes a Map instance for cross-form state', () => {
        expect(formsStorage).toBeInstanceOf(Map)
    })
})
