// Force form module to load before rules.js cycle
import '../../../modules/form/utils'
import { transformConfig, toOpenLConfig, initSelectStatesFromData } from '../rules'
import { FIELD } from '../../../modules/variables'

describe('transformConfig', () => {
    it('strips null values and runs OpenL transforms', () => {
        const meta = { view: 'Row', items: [{ view: 'Text' }], dropMe: null }
        const out = transformConfig(meta)
        expect(out.dropMe).toBeUndefined()
        expect(out.view).toBe('Row')
    })

    it('returns an empty object when meta is undefined/null', () => {
        expect(transformConfig()).toEqual({})
        expect(transformConfig(null)).toEqual({})
    })
})

describe('toOpenLConfig', () => {
    it('auto-attaches setState onChange to a Dropdown without onChange', () => {
        const meta = { view: FIELD.TYPE.DROPDOWN, name: 'fruit', options: 'fruitList' }
        const out = toOpenLConfig(meta)
        expect(out.onChange).toMatch(/^setState,fruit/)
        // options string becomes {name}
        expect(out.options).toEqual({ name: 'fruitList' })
    })

    it('does not override existing onChange', () => {
        const meta = { view: FIELD.TYPE.DROPDOWN, name: 'fruit', onChange: 'doIt' }
        const out = toOpenLConfig(meta)
        expect(out.onChange).toBe('doIt')
    })

    it('defaults Table.headers[0].renderCell to Expand when renderItem is present', () => {
        const meta = {
            view: FIELD.TYPE.TABLE,
            renderItem: () => null,
            headers: [{ id: 'name' }],
        }
        const out = toOpenLConfig(meta)
        expect(out.headers[0].renderCell).toMatchObject({
            view: FIELD.TYPE.EXPAND,
            name: '{value}',
        })
    })

    it('converts styles attribute to className recursively', () => {
        const meta = {
            view: 'Row',
            styles: 'fancy-row',
            items: [{ view: 'Text', styles: 'fancy-text' }],
        }
        const out = toOpenLConfig(meta)
        expect(out.className).toBe('fancy-row')
        expect(out.styles).toBeUndefined()
        expect(out.items[0].className).toBe('fancy-text')
    })

    it('recurses into list children', () => {
        const meta = { view: 'Row', items: [{ view: 'Text', styles: 'a' }] }
        const out = toOpenLConfig(meta)
        expect(out.items[0].className).toBe('a')
    })
})

describe('initSelectStatesFromData', () => {
    it('seeds instance.state from index-based mapping', () => {
        const meta = {
            view: FIELD.TYPE.SELECT,
            name: 'fruit',
            onChange: 'setState,fruit',
        }
        const instance = { state: {} }
        initSelectStatesFromData(meta, { fruit: 2 }, instance)
        expect(instance.state.fruit).toBe('2')
    })

    it('seeds instance.state from stable-value mapping', () => {
        const meta = {
            view: FIELD.TYPE.SELECT,
            name: 'fruit',
            onChange: 'setState,fruit',
            options: 'fruitList',
            mapOptions: { text: 'label', value: 'id' },
        }
        const instance = { state: {} }
        const data = {
            fruit: 'banana',
            fruitList: [{ id: 'apple', label: 'A' }, { id: 'banana', label: 'B' }],
        }
        initSelectStatesFromData(meta, data, instance)
        expect(instance.state.fruit).toBe('1') // banana is at index 1
    })

    it('does nothing for non-Select fields', () => {
        const meta = { view: 'Input', name: 'x' }
        const instance = { state: {} }
        initSelectStatesFromData(meta, { x: 5 }, instance)
        expect(instance.state).toEqual({})
    })

    it('recurses through arrays of meta', () => {
        const list = [
            { view: FIELD.TYPE.SELECT, name: 'a', onChange: 'setState,a' },
            { view: FIELD.TYPE.SELECT, name: 'b', onChange: 'setState,b' },
        ]
        const instance = { state: {} }
        initSelectStatesFromData(list, { a: 1, b: 2 }, instance)
        expect(instance.state.a).toBe('1')
        expect(instance.state.b).toBe('2')
    })

    it('does not overwrite an existing state value', () => {
        const meta = {
            view: FIELD.TYPE.SELECT,
            name: 'x',
            onChange: 'setState,x',
        }
        const instance = { state: { x: 'preset' } }
        initSelectStatesFromData(meta, { x: 0 }, instance)
        expect(instance.state.x).toBe('preset')
    })

    it('handles null meta gracefully', () => {
        const instance = { state: {} }
        expect(() => initSelectStatesFromData(null, {}, instance)).not.toThrow()
    })
})
