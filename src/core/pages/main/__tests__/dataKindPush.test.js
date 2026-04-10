import { get } from 'ui-utils-pack'
import { cloneDeep } from 'ui-utils-pack/object'
import {
    rowObjectForDataKindAppend,
    compactDataKindArrays,
    dataKindRowHasContent,
    validateNotWithinRangeDraftRow,
    pushDataKindRow,
    getDataKindPathFromRelative,
} from '../dataKindPush'

describe('rowObjectForDataKindAppend', () => {
    it('extracts one row from nested registeredFieldValues tree', () => {
        const registeredValues = {
            dataKind: {
                experiencePeriods: [
                    { periodName: 'A', weight: 0.5 },
                    undefined,
                    undefined,
                    { periodName: 'New', weight: 0.1, startDate: '2026-01-01' }
                ]
            }
        }
        expect(rowObjectForDataKindAppend(registeredValues, 'dataKind.experiencePeriods', 3)).toEqual({
            periodName: 'New',
            weight: 0.1,
            startDate: '2026-01-01'
        })
    })

    it('returns registeredValues when relativePath is missing', () => {
        const rv = { foo: 1 }
        expect(rowObjectForDataKindAppend(rv, undefined, 0)).toBe(rv)
        expect(rowObjectForDataKindAppend(rv, '', 0)).toBe(rv)
    })

    it('returns registeredValues when row slice is missing', () => {
        const rv = { dataKind: { experiencePeriods: [] } }
        expect(rowObjectForDataKindAppend(rv, 'dataKind.experiencePeriods', 0)).toBe(rv)
    })
})

describe('dataKindRowHasContent', () => {
    it('treats {} and all-undefined field objects as empty', () => {
        expect(dataKindRowHasContent({})).toBe(false)
        expect(dataKindRowHasContent({
            periodName: undefined,
            startDate: undefined,
            endDate: undefined,
            weight: undefined,
            numberOfMonths: undefined,
        })).toBe(false)
    })

    it('keeps rows with any real value', () => {
        expect(dataKindRowHasContent({ periodName: 'A' })).toBe(true)
        expect(dataKindRowHasContent({ numberOfMonths: 0 })).toBe(true)
    })
})

describe('validateNotWithinRangeDraftRow', () => {
    it('rejects equal start and end', () => {
        const err = validateNotWithinRangeDraftRow(
            { startDate: '2025-01-01', endDate: '2025-01-01' },
            [],
            'startDate',
            'endDate'
        )
        expect(err).toMatchObject({ startDate: expect.any(String), endDate: expect.any(String) })
    })

    it('rejects start after end', () => {
        const err = validateNotWithinRangeDraftRow(
            { startDate: '2025-12-31', endDate: '2025-01-01' },
            [],
            'startDate',
            'endDate'
        )
        expect(err.startDate).toBeTruthy()
        expect(err.endDate).toBeTruthy()
    })

    it('rejects overlap with an existing period', () => {
        const err = validateNotWithinRangeDraftRow(
            { startDate: '2025-06-01', endDate: '2025-06-30' },
            [{ startDate: '2025-01-01', endDate: '2025-12-31' }],
            'startDate',
            'endDate'
        )
        expect(err.startDate).toBe('Periods cannot overlap')
    })

    it('allows a non-overlapping period', () => {
        expect(
            validateNotWithinRangeDraftRow(
                { startDate: '2026-01-01', endDate: '2026-12-31' },
                [{ startDate: '2025-01-01', endDate: '2025-12-31' }],
                'startDate',
                'endDate'
            )
        ).toBeNull()
    })

    it('returns null when start or end is empty (required handles empties)', () => {
        expect(validateNotWithinRangeDraftRow({ startDate: '', endDate: '2025-12-31' }, [], 'startDate', 'endDate')).toBeNull()
        expect(validateNotWithinRangeDraftRow({ startDate: '2025-01-01', endDate: '' }, [], 'startDate', 'endDate')).toBeNull()
    })

    it('allows adjacent periods that do not overlap (end before next start)', () => {
        expect(
            validateNotWithinRangeDraftRow(
                { startDate: '2026-01-01', endDate: '2026-06-30' },
                [{ startDate: '2025-01-01', endDate: '2025-12-31' }],
                'startDate',
                'endDate'
            )
        ).toBeNull()
    })

    it('treats touching boundaries as overlap (inclusive)', () => {
        const err = validateNotWithinRangeDraftRow(
            { startDate: '2025-12-31', endDate: '2026-01-01' },
            [{ startDate: '2025-01-01', endDate: '2025-12-31' }],
            'startDate',
            'endDate'
        )
        expect(err).not.toBeNull()
    })

    it('ignores peer rows with missing date fields', () => {
        expect(
            validateNotWithinRangeDraftRow(
                { startDate: '2027-01-01', endDate: '2027-12-31' },
                [{ periodName: 'x' }, null, { startDate: '2025-01-01', endDate: '2025-12-31' }],
                'startDate',
                'endDate'
            )
        ).toBeNull()
    })
})

describe('pushDataKindRow', () => {
    const rowObject = { periodName: 'Draft', weight: 1 }

    function makeParent (json, formOverrides = {}) {
        const form = {
            mutators: {
                push: jest.fn((path, row) => {
                    expect(path).toBe('dataKind.experiencePeriods')
                    expect(row).toEqual(rowObject)
                    json.dataKind.experiencePeriods = [...json.dataKind.experiencePeriods, row]
                }),
            },
            getState: jest.fn(() => ({ values: cloneDeep(json) })),
            reset: jest.fn(),
            ...formOverrides,
        }
        const parentUIRender = {
            state: { data: { json } },
            props: { instance: { form } },
            setState: jest.fn((updater, cb) => {
                const next = updater({ data: { json: cloneDeep(json) } })
                parentUIRender.state.data.json = next.data.json
                if (cb) cb()
            }),
        }
        return { parentUIRender, form }
    }

    it('pushes via final-form mutator, syncs state from form values, and resets', () => {
        const json = {
            policy: 'P1',
            dataKind: {
                experiencePeriods: [{ periodName: 'Existing' }],
            },
        }
        const { parentUIRender, form } = makeParent(json)

        expect(
            pushDataKindRow({
                parentUIRender,
                meta: { relativePath: 'dataKind.experiencePeriods' },
                kind: 'experiencePeriods',
                rowObject,
                fallbackDataKindPath: '',
            })
        ).toBe(true)

        expect(form.mutators.push).toHaveBeenCalledTimes(1)
        expect(form.getState).toHaveBeenCalled()
        expect(parentUIRender.setState).toHaveBeenCalled()
        expect(form.reset).toHaveBeenCalled()
        const resetArg = form.reset.mock.calls[0][0]
        expect(resetArg.dataKind.experiencePeriods).toHaveLength(2)
        expect(resetArg.dataKind.experiencePeriods[1]).toEqual(rowObject)
    })

    it('initializes missing nested kind array when parent row has no nested dataKind yet', () => {
        const json = {
            dataKind: {
                phases: [
                    {
                        title: 'P',
                        budget: 1,
                    },
                ],
            },
        }
        const form = {
            mutators: {
                push: jest.fn((path, row) => {
                    expect(path).toBe('dataKind.phases.0.dataKind.lineItems')
                    expect(row).toEqual({ sku: 'x' })
                    const next = cloneDeep(json)
                    const arr = getLineItems(next)
                    arr.push(row)
                    json.dataKind = next.dataKind
                }),
            },
            getState: jest.fn(() => ({ values: cloneDeep(json) })),
            reset: jest.fn((next) => {
                Object.assign(json, next)
            }),
        }
        function getLineItems (root) {
            return get(root, 'dataKind.phases[0].dataKind.lineItems')
        }
        const parentUIRender = {
            state: { data: { json } },
            props: { instance: { form } },
            setState: jest.fn((updater) => {
                const next = updater({ data: { json: cloneDeep(json) } })
                parentUIRender.state.data.json = next.data.json
            }),
        }
        expect(getLineItems(json)).toBeUndefined()
        pushDataKindRow({
            parentUIRender,
            meta: { relativePath: 'dataKind.phases.0.dataKind.lineItems' },
            kind: 'lineItems',
            rowObject: { sku: 'x' },
            fallbackDataKindPath: '',
        })
        expect(form.reset).toHaveBeenCalled()
        const afterReset = form.reset.mock.calls[0][0]
        expect(getLineItems(afterReset)).toEqual([])
        expect(form.mutators.push).toHaveBeenCalled()
    })

    it('does not add dataKind when rowObject already has it', () => {
        const json = {
            dataKind: {
                experiencePeriods: [],
            },
        }
        const withNested = { periodName: 'P', dataKind: { lineItems: [{ sku: 'x' }] } }
        const form = {
            mutators: {
                push: jest.fn((path, row) => {
                    expect(path).toBe('dataKind.experiencePeriods')
                    expect(row).toBe(withNested)
                    json.dataKind.experiencePeriods = [...json.dataKind.experiencePeriods, row]
                }),
            },
            getState: jest.fn(() => ({ values: cloneDeep(json) })),
            reset: jest.fn(),
        }
        const parentUIRender = {
            state: { data: { json } },
            props: { instance: { form } },
            setState: jest.fn((updater, cb) => {
                const next = updater({ data: { json: cloneDeep(json) } })
                parentUIRender.state.data.json = next.data.json
                if (cb) cb()
            }),
        }
        pushDataKindRow({
            parentUIRender,
            meta: { relativePath: 'dataKind.experiencePeriods' },
            kind: 'experiencePeriods',
            rowObject: withNested,
            fallbackDataKindPath: '',
        })
        expect(form.mutators.push).toHaveBeenCalledWith('dataKind.experiencePeriods', withNested)
    })

    it('returns false when dataKind branch is missing', () => {
        const warn = jest.spyOn(console, 'warn').mockImplementation(() => {})
        const json = { policy: 'P1' }
        const { parentUIRender, form } = makeParent(json)
        expect(
            pushDataKindRow({
                parentUIRender,
                meta: { relativePath: 'dataKind.experiencePeriods' },
                kind: 'experiencePeriods',
                rowObject: {},
            })
        ).toBe(false)
        expect(form.mutators.push).not.toHaveBeenCalled()
        warn.mockRestore()
    })

    it('returns false when mutators.push is missing', () => {
        const warn = jest.spyOn(console, 'warn').mockImplementation(() => {})
        const json = { dataKind: { experiencePeriods: [] } }
        const parentUIRender = {
            state: { data: { json } },
            props: { instance: { form: {} } },
        }
        expect(
            pushDataKindRow({
                parentUIRender,
                meta: { relativePath: 'dataKind.experiencePeriods' },
                kind: 'experiencePeriods',
                rowObject: {},
            })
        ).toBe(false)
        warn.mockRestore()
    })

    it('uses fallbackDataKindPath when relativePath is empty', () => {
        const json = { dataKind: { lineItems: [{ id: 1 }] } }
        const { parentUIRender, form } = makeParent(json)
        form.mutators.push.mockImplementation((path, row) => {
            expect(path).toBe('dataKind.lineItems')
            json.dataKind.lineItems = [...json.dataKind.lineItems, row]
        })
        pushDataKindRow({
            parentUIRender,
            meta: { relativePath: '' },
            kind: 'lineItems',
            rowObject: { id: 2 },
            fallbackDataKindPath: '',
        })
        expect(form.mutators.push).toHaveBeenCalled()
    })
})

describe('getDataKindPathFromRelative (re-export contract)', () => {
    it('matches rules.js expectations for nested path', () => {
        expect(getDataKindPathFromRelative('experienceRatingInputs.dataKind.experiencePeriods', 'experiencePeriods')).toBe(
            'experienceRatingInputs'
        )
    })
})

describe('compactDataKindArrays', () => {
    it('removes empty objects and null from dataKind arrays', () => {
        const input = {
            policyNumber: 'X',
            dataKind: {
                experiencePeriods: [
                    { periodName: 'A', weight: 1 },
                    null,
                    {},
                    { periodName: 'B', weight: 2 },
                ],
            },
        }
        const out = compactDataKindArrays(input)
        expect(out.dataKind.experiencePeriods).toEqual([
            { periodName: 'A', weight: 1 },
            { periodName: 'B', weight: 2 },
        ])
        expect(input.dataKind.experiencePeriods).toHaveLength(4)
    })

    it('removes ghost rows that DevTools shows as {} (only undefined values)', () => {
        const input = {
            dataKind: {
                experiencePeriods: [
                    { periodName: 'Current Period', startDate: '2025-01-01', weight: 0.5 },
                    { periodName: '2nd Period', startDate: '2023-01-01', weight: 0.2 },
                    {
                        periodName: undefined,
                        startDate: undefined,
                        endDate: undefined,
                        weight: undefined,
                        numberOfMonths: undefined,
                    },
                ],
            },
        }
        const out = compactDataKindArrays(input)
        expect(out.dataKind.experiencePeriods).toHaveLength(2)
    })

    it('returns non-objects unchanged', () => {
        expect(compactDataKindArrays(null)).toBe(null)
    })

    it('compacts every array key under dataKind', () => {
        const input = {
            dataKind: {
                experiencePeriods: [{ a: 1 }, {}, null],
                otherKind: [{ x: 1 }, {}],
            },
        }
        const out = compactDataKindArrays(input)
        expect(out.dataKind.experiencePeriods).toEqual([{ a: 1 }])
        expect(out.dataKind.otherKind).toEqual([{ x: 1 }])
    })

    it('leaves dataKind intact when it is not an object', () => {
        const input = { dataKind: null }
        expect(compactDataKindArrays(input).dataKind).toBeNull()
    })
})
