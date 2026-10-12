import { readsUnchanged, stateReadsOf } from '../metaStateReads'
import { FIELD } from '../../modules/variables'

describe('stateReadsOf', () => {
    it('collects the state keys the templates in names read, at any depth and in any path form', () => {
        const meta = {
            view: 'Col',
            items: [
                { view: 'Input', name: 'amounts.{state.pick,first}' },
                { view: 'Select', name: 'product', options: { name: 'Catalog.{state.category,0}.Products' } },
                { view: 'Text', name: '{state.filters.country}' },
                { view: 'Text', name: '{state.rows[0].label}' },
            ],
        }
        expect(stateReadsOf(meta)).toEqual({ keys: ['pick', 'category', 'filters', 'rows'], seeded: [] })
    })

    it('reads nothing of the state for data, a row\'s index and value, and a handler\'s arguments', () => {
        const meta = { view: 'Col', items: [{ name: '{data.title}' }, { name: 'rows[{index}].{value}' }, { name: '{0.payload.ip}' }] }
        expect(stateReadsOf(meta)).toEqual({ keys: [], seeded: [] })
    })

    it('may read anything for the whole state, or a template of anything else of the instance', () => {
        expect([
            stateReadsOf({ name: '{state}' }),
            stateReadsOf({ name: '{props.title}' }),
            stateReadsOf({ items: [{ name: 'a.{dataKind.rows}' }] }),
        ]).toEqual([undefined, undefined, undefined])
    })

    it('collects the Selects whose state is seeded, and leaves a nested document\'s meta to it', () => {
        const meta = {
            view: 'Col',
            items: [
                { view: FIELD.TYPE.SELECT, name: 'country', onChange: `${FIELD.ACTION.SET_STATE},country` },
                { view: FIELD.TYPE.DROPDOWN, name: 'city', onChange: `${FIELD.ACTION.SET_STATE},city` },
                { view: FIELD.TYPE.SELECT, name: 'mine', onChange: 'submit' },
                { view: 'Data', meta: { view: 'Input', name: '{state.nested}' } },
            ],
        }
        expect(stateReadsOf(meta)).toEqual({ keys: [], seeded: ['country', 'city'] })
    })
})

describe('readsUnchanged', () => {
    const reads = { keys: ['pick'], seeded: ['country'] }
    const before = { meta: {}, data: {}, currencyCode: 'USD', pick: 'a', country: '0', canSave: false }

    it('holds across a state that changes only what the meta did not read', () => {
        expect(readsUnchanged(reads, before, { ...before, canSave: true, country: '1', other: 1 })).toBe(true)
    })

    it('fails for another meta, data, currency, value read, or a seeded key gone empty', () => {
        expect([
            readsUnchanged(reads, before, { ...before, meta: {} }),
            readsUnchanged(reads, before, { ...before, data: {} }),
            readsUnchanged(reads, before, { ...before, currencyCode: 'EUR' }),
            readsUnchanged(reads, before, { ...before, pick: 'b' }),
            readsUnchanged(reads, before, { ...before, country: null }),
        ]).toEqual([false, false, false, false, false])
    })
})
