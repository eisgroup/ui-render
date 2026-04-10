import { toOpenLConfig, initSelectStatesFromData, getDataKindPathFromRelative, withDataKind } from '../rules'

describe('getDataKindPathFromRelative', () => {
    it('returns empty string for root-level dataKind path (no parent before .dataKind.kind)', () => {
        expect(getDataKindPathFromRelative('dataKind.period', 'period')).toBe('')
    })

    it('returns parent object path for a single nested dataKind table', () => {
        expect(getDataKindPathFromRelative(
            'experienceRatingInputs.dataKind.experiencePeriods',
            'experiencePeriods'
        )).toBe('experienceRatingInputs')
    })

    it('uses the last .dataKind.kind segment when the same kind key appears twice (nested)', () => {
        const path = 'root.dataKind.experiencePeriods.0.inner.dataKind.experiencePeriods'
        expect(getDataKindPathFromRelative(path, 'experiencePeriods')).toBe(
            'root.dataKind.experiencePeriods.0.inner'
        )
    })

    it('resolves a second-level dataKind with a different kind key', () => {
        const path = 'root.dataKind.phases.0.dataKind.lineItems'
        expect(getDataKindPathFromRelative(path, 'lineItems')).toBe('root.dataKind.phases.0')
    })

    it('returns empty when the suffix is not present', () => {
        expect(getDataKindPathFromRelative('some.path.without.marker', 'k')).toBe('')
    })

    it('returns empty for undefined relativePath', () => {
        expect(getDataKindPathFromRelative(undefined, 'period')).toBe('')
    })

    it('returns empty for null relativePath', () => {
        expect(getDataKindPathFromRelative(null, 'period')).toBe('')
    })

    it('returns empty for empty string relativePath', () => {
        expect(getDataKindPathFromRelative('', 'period')).toBe('')
    })

    it('returns empty for undefined kind', () => {
        expect(getDataKindPathFromRelative('some.dataKind.foo', undefined)).toBe('')
    })

    it('returns empty for null kind', () => {
        expect(getDataKindPathFromRelative('some.dataKind.foo', null)).toBe('')
    })

    it('returns empty for empty string kind', () => {
        expect(getDataKindPathFromRelative('some.dataKind.foo', '')).toBe('')
    })

    it('returns empty when relativePath starts with dataKind but for a different kind', () => {
        expect(getDataKindPathFromRelative('dataKind.otherKind', 'period')).toBe('')
    })
})

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

    it('defaults to first option when data value is empty string', () => {
        const meta = {
            view: 'Select',
            name: 'region',
            onChange: 'setState,region',
            mapOptions: { text: 'label', value: '{index}' },
            options: { name: 'regions' },
        }
        const data = { region: '' }
        initSelectStatesFromData(meta, data, instance)
        expect(instance.state.region).toBe('0')
    })

    it('defaults to first option when data value is null', () => {
        const meta = {
            view: 'Select',
            name: 'region',
            onChange: 'setState,region',
            mapOptions: { text: 'label', value: '{index}' },
            options: { name: 'regions' },
        }
        const data = { region: null }
        initSelectStatesFromData(meta, data, instance)
        expect(instance.state.region).toBe('0')
    })

    it('defaults to first option when value is not present in data', () => {
        const meta = {
            view: 'Dropdown',
            name: 'department',
            onChange: 'setState,department',
            mapOptions: { text: 'label', value: '{index}' },
            options: { name: 'departments' },
        }
        const data = {
            departments: [{ label: 'Engineering' }, { label: 'Design' }],
        }
        initSelectStatesFromData(meta, data, instance)
        expect(instance.state.department).toBe('0')
    })

    it('does NOT default for stable-value Select when value is missing', () => {
        const meta = {
            view: 'Select',
            name: 'region',
            onChange: 'setState,region',
            mapOptions: { text: 'label', value: 'code' },
            options: { name: 'regions' },
        }
        const data = {
            regions: [{ label: 'US', code: 'US' }, { label: 'EU', code: 'EU' }],
        }
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

describe('withDataKind', () => {
    let ParentClass, parent

    function makeChild (relativePath) {
        return { props: { meta: { relativePath } } }
    }

    beforeEach(() => {
        ParentClass = class {}
        withDataKind(ParentClass)
        parent = new ParentClass()
    })

    describe('registerDataKind', () => {
        it('registers child at root scope when dataKindPath is empty', () => {
            const child = makeChild('dataKind.phases')
            parent.registerDataKind(child, 'phases', 0)

            expect(child.dataKindPath).toBe('')
            expect(parent.dataKind.phases[''][0]).toBe(child)
        })

        it('registers child at nested scope based on dataKindPath', () => {
            const child = makeChild('experienceRatingInputs.dataKind.experiencePeriods')
            parent.registerDataKind(child, 'experiencePeriods', 0)

            expect(child.dataKindPath).toBe('experienceRatingInputs')
            expect(parent.dataKind.experiencePeriods['experienceRatingInputs'][0]).toBe(child)
        })

        it('scopes children by dataKindPath — no collision for 2-level nesting', () => {
            const child_p0_l0 = makeChild('dataKind.phases.0.dataKind.lineItems')
            const child_p0_l1 = makeChild('dataKind.phases.0.dataKind.lineItems')
            const child_p1_l0 = makeChild('dataKind.phases.1.dataKind.lineItems')

            parent.registerDataKind(child_p0_l0, 'lineItems', 0)
            parent.registerDataKind(child_p0_l1, 'lineItems', 1)
            parent.registerDataKind(child_p1_l0, 'lineItems', 0)

            // All three are preserved — no overwrite
            expect(parent.dataKind.lineItems['dataKind.phases.0'][0]).toBe(child_p0_l0)
            expect(parent.dataKind.lineItems['dataKind.phases.0'][1]).toBe(child_p0_l1)
            expect(parent.dataKind.lineItems['dataKind.phases.1'][0]).toBe(child_p1_l0)

            expect(child_p0_l0.dataKindPath).toBe('dataKind.phases.0')
            expect(child_p1_l0.dataKindPath).toBe('dataKind.phases.1')
        })

        it('handles missing meta gracefully', () => {
            const child = { props: {} }
            parent.registerDataKind(child, 'items', 0)

            expect(child.dataKindPath).toBe('')
            expect(parent.dataKind.items[''][0]).toBe(child)
        })
    })

    describe('unregisterDataKind', () => {
        it('removes child from the correct scope', () => {
            const child = makeChild('dataKind.phases.0.dataKind.lineItems')
            parent.registerDataKind(child, 'lineItems', 0)
            parent.unregisterDataKind(child, 'lineItems', 0)

            expect(parent.dataKind.lineItems['dataKind.phases.0'][0]).toBeUndefined()
            expect(child.dataKindPath).toBeUndefined()
        })

        it('does not remove child from wrong scope', () => {
            const child_p0 = makeChild('dataKind.phases.0.dataKind.lineItems')
            const child_p1 = makeChild('dataKind.phases.1.dataKind.lineItems')
            parent.registerDataKind(child_p0, 'lineItems', 0)
            parent.registerDataKind(child_p1, 'lineItems', 0)

            parent.unregisterDataKind(child_p0, 'lineItems', 0)

            // child_p1 is still registered
            expect(parent.dataKind.lineItems['dataKind.phases.1'][0]).toBe(child_p1)
        })

        it('handles null instance gracefully', () => {
            expect(() => parent.unregisterDataKind(null, 'items', 0)).not.toThrow()
        })
    })

    describe('getDataKindPath', () => {
        it('delegates to getDataKindPathFromRelative', () => {
            expect(parent.getDataKindPath('a.dataKind.b', 'b')).toBe('a')
        })
    })
})
