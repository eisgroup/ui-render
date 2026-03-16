import { toOpenLConfig, initSelectStatesFromData } from '../rules'

describe('toOpenLConfig', () => {
    it('assigns setState onChange to Select by default', () => {
        const meta = { view: 'Select', name: 'optionX', options: { name: 'options' } }
        toOpenLConfig(meta)
        expect(meta.onChange).toBe('setState,optionX')
    })

    it('assigns setState onChange to Dropdown by default', () => {
        const meta = { view: 'Dropdown', name: 'optionX', options: { name: 'options' } }
        toOpenLConfig(meta)
        expect(meta.onChange).toBe('setState,optionX')
    })

    it('does not override explicit onChange for Select', () => {
        const meta = { view: 'Select', name: 'optionX', onChange: 'customHandler', options: { name: 'options' } }
        toOpenLConfig(meta)
        expect(meta.onChange).toBe('customHandler')
    })

    it('does not override explicit onChange for Dropdown', () => {
        const meta = { view: 'Dropdown', name: 'optionX', onChange: 'customHandler', options: { name: 'options' } }
        toOpenLConfig(meta)
        expect(meta.onChange).toBe('customHandler')
    })

    it('does not assign onChange when name is null', () => {
        const meta = { view: 'Select', name: null, options: { name: 'options' } }
        toOpenLConfig(meta)
        expect(meta.onChange).toBeUndefined()
    })

    it('defaults mapOptions.value to {index} for Select', () => {
        const meta = { view: 'Select', name: 'optionX', options: { name: 'options' } }
        toOpenLConfig(meta)
        expect(meta.mapOptions.value).toBe('{index}')
    })

    it('defaults mapOptions.value to {index} for Dropdown', () => {
        const meta = { view: 'Dropdown', name: 'optionX', options: { name: 'options' } }
        toOpenLConfig(meta)
        expect(meta.mapOptions.value).toBe('{index}')
    })

    it('preserves existing mapOptions.value when defined', () => {
        const meta = {
            view: 'Select',
            name: 'optionX',
            options: { name: 'options' },
            mapOptions: { text: 'label', value: 'id' },
        }
        toOpenLConfig(meta)
        expect(meta.mapOptions.value).toBe('id')
    })

    it('processes nested items recursively', () => {
        const child = { view: 'Select', name: 'categoryX', options: { name: 'categories' } }
        const meta = { view: 'VerticalLayout', items: [child] }
        toOpenLConfig(meta)
        expect(child.onChange).toBe('setState,categoryX')
        expect(child.mapOptions.value).toBe('{index}')
    })

    it('processes items array recursively', () => {
        const child = { view: 'Dropdown', name: 'optionX', options: { name: 'options' } }
        const meta = { view: 'HorizontalLayout', items: [{ view: 'Row', items: [child] }] }
        toOpenLConfig(meta)
        expect(child.onChange).toBe('setState,optionX')
    })

    it('converts string options to object with name', () => {
        const meta = { view: 'Select', name: 'optionX', options: 'myOptions' }
        toOpenLConfig(meta)
        expect(meta.options).toEqual({ name: 'myOptions' })
    })

    it('converts styles attribute to className', () => {
        const meta = { view: 'Row', styles: 'my-class' }
        toOpenLConfig(meta)
        expect(meta.className).toBe('my-class')
        expect(meta.styles).toBeUndefined()
    })

    it('creates mapOptions when mapOptions is a string', () => {
        const meta = { view: 'Select', name: 'optionX', options: { name: 'opts' }, mapOptions: 'label' }
        toOpenLConfig(meta)
        expect(meta.mapOptions).toEqual({ text: 'label', value: '{index}' })
    })

    it('creates mapOptions when mapOptions is undefined', () => {
        const meta = { view: 'Select', name: 'optionX', options: { name: 'opts' } }
        toOpenLConfig(meta)
        expect(meta.mapOptions).toEqual({ text: undefined, value: '{index}' })
    })
})

describe('initSelectStatesFromData', () => {
    let instance

    beforeEach(() => {
        instance = { state: {} }
    })

    it('seeds state for index-based Select from initial data', () => {
        const meta = {
            view: 'Select',
            name: 'region',
            onChange: 'setState,region',
            mapOptions: { text: 'label', value: '{index}' },
            options: { name: 'regions' },
        }
        const data = { region: '2', regions: [{ label: 'A' }, { label: 'B' }, { label: 'C' }] }
        initSelectStatesFromData(meta, data, instance)
        expect(instance.state.region).toBe('2')
    })

    it('seeds state for stable-value Select by finding matching index', () => {
        const meta = {
            view: 'Select',
            name: 'region',
            onChange: 'setState,region',
            mapOptions: { text: 'label', value: 'code' },
            options: { name: 'regions' },
        }
        const data = {
            region: 'EU',
            regions: [{ label: 'US', code: 'US' }, { label: 'Europe', code: 'EU' }, { label: 'Asia', code: 'AS' }],
        }
        initSelectStatesFromData(meta, data, instance)
        expect(instance.state.region).toBe('1')
    })

    it('does not overwrite existing state', () => {
        instance.state.region = '5'
        const meta = {
            view: 'Select',
            name: 'region',
            onChange: 'setState,region',
            mapOptions: { text: 'label', value: '{index}' },
            options: { name: 'regions' },
        }
        const data = { region: '2', regions: [{ label: 'A' }, { label: 'B' }, { label: 'C' }] }
        initSelectStatesFromData(meta, data, instance)
        expect(instance.state.region).toBe('5')
    })

    it('ignores Select without onChange starting with setState', () => {
        const meta = {
            view: 'Select',
            name: 'region',
            onChange: 'customHandler',
            mapOptions: { text: 'label', value: '{index}' },
            options: { name: 'regions' },
        }
        const data = { region: '1' }
        initSelectStatesFromData(meta, data, instance)
        expect(instance.state.region).toBeUndefined()
    })

    it('does nothing when data value is empty string', () => {
        const meta = {
            view: 'Select',
            name: 'region',
            onChange: 'setState,region',
            mapOptions: { text: 'label', value: '{index}' },
            options: { name: 'regions' },
        }
        const data = { region: '' }
        initSelectStatesFromData(meta, data, instance)
        expect(instance.state.region).toBeUndefined()
    })

    it('does nothing when data value is null', () => {
        const meta = {
            view: 'Select',
            name: 'region',
            onChange: 'setState,region',
            mapOptions: { text: 'label', value: '{index}' },
            options: { name: 'regions' },
        }
        const data = { region: null }
        initSelectStatesFromData(meta, data, instance)
        expect(instance.state.region).toBeUndefined()
    })

    it('handles Dropdown the same as Select', () => {
        const meta = {
            view: 'Dropdown',
            name: 'category',
            onChange: 'setState,category',
            mapOptions: { text: 'label', value: '{index}' },
            options: { name: 'categories' },
        }
        const data = { category: '1', categories: [{ label: 'A' }, { label: 'B' }] }
        initSelectStatesFromData(meta, data, instance)
        expect(instance.state.category).toBe('1')
    })

    it('recurses into items array', () => {
        const meta = {
            view: 'Row',
            items: [
                {
                    view: 'Select',
                    name: 'region',
                    onChange: 'setState,region',
                    mapOptions: { text: 'label', value: '{index}' },
                    options: { name: 'regions' },
                },
            ],
        }
        const data = { region: '1', regions: [{ label: 'A' }, { label: 'B' }] }
        initSelectStatesFromData(meta, data, instance)
        expect(instance.state.region).toBe('1')
    })

    it('recurses into renderItem', () => {
        const meta = {
            view: 'Table',
            renderItem: {
                items: [
                    {
                        view: 'Select',
                        name: 'region',
                        onChange: 'setState,region',
                        mapOptions: { text: 'label', value: '{index}' },
                        options: { name: 'regions' },
                    },
                ],
            },
        }
        const data = { region: '1', regions: [{ label: 'A' }, { label: 'B' }] }
        initSelectStatesFromData(meta, data, instance)
        expect(instance.state.region).toBe('1')
    })

    it('builds context path from non-select container names', () => {
        const meta = {
            view: 'Row',
            name: 'details',
            items: [
                {
                    view: 'Select',
                    name: 'region',
                    onChange: 'setState,region',
                    mapOptions: { text: 'label', value: '{index}' },
                    options: { name: 'regions' },
                },
            ],
        }
        const data = {
            details: {
                region: '0',
                regions: [{ label: 'A' }, { label: 'B' }],
            },
        }
        initSelectStatesFromData(meta, data, instance)
        expect(instance.state.region).toBe('0')
    })

    it('handles null meta gracefully', () => {
        expect(() => initSelectStatesFromData(null, {}, instance)).not.toThrow()
    })

    it('handles array meta', () => {
        const metas = [
            {
                view: 'Select',
                name: 'a',
                onChange: 'setState,a',
                mapOptions: { text: 'label', value: '{index}' },
                options: { name: 'opts' },
            },
            {
                view: 'Select',
                name: 'b',
                onChange: 'setState,b',
                mapOptions: { text: 'label', value: '{index}' },
                options: { name: 'opts' },
            },
        ]
        const data = { a: '1', b: '2', opts: [{ label: 'X' }, { label: 'Y' }, { label: 'Z' }] }
        initSelectStatesFromData(metas, data, instance)
        expect(instance.state.a).toBe('1')
        expect(instance.state.b).toBe('2')
    })

    it('does not set state for stable-value when no match found', () => {
        const meta = {
            view: 'Select',
            name: 'region',
            onChange: 'setState,region',
            mapOptions: { text: 'label', value: 'code' },
            options: { name: 'regions' },
        }
        const data = {
            region: 'UNKNOWN',
            regions: [{ label: 'US', code: 'US' }, { label: 'Europe', code: 'EU' }],
        }
        initSelectStatesFromData(meta, data, instance)
        expect(instance.state.region).toBeUndefined()
    })

    it('handles string options (not object)', () => {
        const meta = {
            view: 'Select',
            name: 'region',
            onChange: 'setState,region',
            mapOptions: { text: 'label', value: 'code' },
            options: 'regions',
        }
        const data = {
            region: 'EU',
            regions: [{ label: 'US', code: 'US' }, { label: 'EU', code: 'EU' }],
        }
        initSelectStatesFromData(meta, data, instance)
        expect(instance.state.region).toBe('1')
    })
})
