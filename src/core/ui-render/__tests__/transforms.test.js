import { mapProps, getCurrencySymbol, relativePathFrom } from '../transforms'

describe('mapProps', () => {
    it('maps object mapper with {index} to string indices', () => {
        const data = [{ label: 'Item 1' }, { label: 'Item 2' }]
        const mapper = { text: 'label', value: '{index}' }
        const result = mapProps(data, mapper)
        expect(result).toEqual([
            { text: 'Item 1', value: '0' },
            { text: 'Item 2', value: '1' },
        ])
    })

    it('maps string mapper to extract by key path', () => {
        const data = [{ name: 'Alice' }, { name: 'Bob' }]
        const result = mapProps(data, 'name')
        expect(result).toEqual(['Alice', 'Bob'])
    })

    it('returns empty result for empty data', () => {
        const result = mapProps([], { text: 'label', value: '{index}' })
        expect(result).toEqual([])
    })

    it('falls back to item when key not found', () => {
        const data = [{ a: 1 }]
        const mapper = { text: 'nonExistent', value: '{index}' }
        const result = mapProps(data, mapper)
        expect(result).toEqual([{ text: { a: 1 }, value: '0' }])
    })
})

describe('getCurrencySymbol', () => {
    it('returns $ for USD', () => {
        expect(getCurrencySymbol('USD')).toBe('$')
    })

    it('returns € for EUR', () => {
        expect(getCurrencySymbol('EUR')).toBe('€')
    })

    it('returns £ for GBP', () => {
        expect(getCurrencySymbol('GBP')).toBe('£')
    })

    it('returns null for unknown currency', () => {
        expect(getCurrencySymbol('JPY')).toBeNull()
    })

    it('returns null for empty string', () => {
        expect(getCurrencySymbol('')).toBeNull()
    })

    it('returns null for undefined', () => {
        expect(getCurrencySymbol(undefined)).toBeNull()
    })

    it('returns null for null', () => {
        expect(getCurrencySymbol(null)).toBeNull()
    })
})

describe('relativePathFrom', () => {
    const meta = (name, relativeData) => ({ name, relativeData })

    it('joins list row path when relativeIndex is set', () => {
        expect(relativePathFrom(meta('lineItems', true), 'orders', 0)).toBe('orders.0.lineItems')
    })

    it('does not embed undefined when relativeIndex is missing (final-form setIn)', () => {
        const m = meta('parent.child.tableField', true)
        expect(relativePathFrom(m, 'parent.child', undefined)).toBe('parent.child.tableField')
    })

    it('prefixes short name when relativePath has no index', () => {
        const m = meta('rows', true)
        expect(relativePathFrom(m, 'section', undefined)).toBe('section.rows')
    })
})
