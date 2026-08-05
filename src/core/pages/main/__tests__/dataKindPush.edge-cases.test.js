import { get } from '../../../utils'
import { cloneDeep } from '../../../utils/object'
import {
    compactDataKindArrays,
    dataKindRowHasContent,
    pushDataKindRow,
    rowObjectForDataKindAppend,
    validateNotWithinRangeDraftRow,
} from '../dataKindPush'

const periodKeys = ['startDate', 'endDate']

const validatePeriod = (draft, peers) => validateNotWithinRangeDraftRow(
    draft,
    peers,
    periodKeys[0],
    periodKeys[1]
)

afterEach(() => {
    jest.restoreAllMocks()
})

describe('dataKind row edge contracts', () => {
    it('does not extract malformed rows or use an invalid target index', () => {
        const registeredValues = {
            dataKind: {
                periods: [
                    ['not', 'a', 'row'],
                    'primitive row',
                    { label: 'Valid row' },
                ],
            },
        }

        expect(rowObjectForDataKindAppend(
            registeredValues,
            'dataKind.periods',
            undefined
        )).toBe(registeredValues)
        expect(rowObjectForDataKindAppend(
            registeredValues,
            'dataKind.periods',
            'not-a-number'
        )).toBe(registeredValues)
        expect(rowObjectForDataKindAppend(
            registeredValues,
            'dataKind.periods',
            0
        )).toBe(registeredValues)
        expect(rowObjectForDataKindAppend(
            registeredValues,
            'dataKind.periods',
            1
        )).toBe(registeredValues)
        expect(rowObjectForDataKindAppend(
            registeredValues,
            'dataKind.periods',
            2
        )).toEqual({ label: 'Valid row' })
    })

    it('classifies primitive, array, boolean, NaN, and nested row content', () => {
        expect(dataKindRowHasContent('legacy primitive')).toBe(true)
        expect(dataKindRowHasContent([])).toBe(false)
        expect(dataKindRowHasContent(['legacy value'])).toBe(true)
        expect(dataKindRowHasContent({ score: NaN })).toBe(false)
        expect(dataKindRowHasContent({ enabled: false })).toBe(true)
        expect(dataKindRowHasContent({ tags: [] })).toBe(false)
        expect(dataKindRowHasContent({ tags: [''] })).toBe(true)
        expect(dataKindRowHasContent({ nested: { value: null } })).toBe(false)
        expect(dataKindRowHasContent({ nested: { count: 0 } })).toBe(true)
    })

    it('compacts empty nested rows without changing non-array metadata or its input', () => {
        const input = {
            dataKind: {
                rows: [
                    {},
                    { nested: { value: null } },
                    { nested: { enabled: false } },
                    { tags: ['retained'] },
                ],
                metadata: { source: 'migration' },
                revision: 4,
            },
        }

        const result = compactDataKindArrays(input)

        expect(result).toEqual({
            dataKind: {
                rows: [
                    { nested: { enabled: false } },
                    { tags: ['retained'] },
                ],
                metadata: { source: 'migration' },
                revision: 4,
            },
        })
        expect(result).not.toBe(input)
        expect(result.dataKind).not.toBe(input.dataKind)
        expect(input.dataKind.rows).toHaveLength(4)
    })
})

describe('draft range validation edge contracts', () => {
    it('ignores a missing or malformed peer collection', () => {
        const draft = { startDate: '2026-01-01', endDate: '2026-12-31' }

        expect(validatePeriod(draft, null)).toBeNull()
        expect(validatePeriod(draft, { unexpected: 'object' })).toBeNull()
    })

    it('normalizes a reversed peer range before checking inclusive overlap', () => {
        const error = validatePeriod(
            { startDate: '2025-06-01', endDate: '2025-06-30' },
            [{ startDate: '2025-12-31', endDate: '2025-01-01' }]
        )

        expect(error).toEqual({
            startDate: 'Periods cannot overlap',
            endDate: 'Periods cannot overlap',
        })
    })
})

describe('pushDataKindRow defensive synchronization', () => {
    const rowObject = { sku: 'B', details: { quantity: 2 } }

    const callPush = (parentUIRender) => pushDataKindRow({
        parentUIRender,
        meta: null,
        kind: 'lineItems',
        rowObject,
        fallbackDataKindPath: 'portfolio.phases.0',
    })

    it('returns false for a missing parent/form API or invalid form values', () => {
        const warn = jest.spyOn(console, 'warn').mockImplementation(() => {})
        const push = jest.fn()
        const reset = jest.fn()
        const setState = jest.fn()
        const invalidParents = [
            undefined,
            { props: {}, setState },
            {
                props: { instance: { form: { mutators: { push }, reset } } },
                setState,
            },
            {
                props: {
                    instance: {
                        form: {
                            mutators: { push },
                            getState: () => null,
                            reset,
                        },
                    },
                },
                setState,
            },
            {
                props: {
                    instance: {
                        form: {
                            mutators: { push },
                            getState: () => ({ values: null }),
                            reset,
                        },
                    },
                },
                setState,
            },
        ]

        invalidParents.forEach(parent => expect(callPush(parent)).toBe(false))
        expect(push).not.toHaveBeenCalled()
        expect(warn).toHaveBeenCalled()
    })

    it('uses a nested fallback path and keeps form/reset state snapshots isolated', () => {
        const original = {
            portfolio: {
                phases: [
                    {
                        name: 'Phase 1',
                        dataKind: {
                            lineItems: [
                                { sku: 'A', details: { quantity: 1 } },
                            ],
                        },
                    },
                ],
            },
            audit: { revision: 7 },
        }
        let formValues = cloneDeep(original)
        const form = {
            mutators: {
                push: jest.fn((path, row) => {
                    const nextValues = cloneDeep(formValues)
                    get(nextValues, path).push(cloneDeep(row))
                    formValues = nextValues
                }),
            },
            getState: jest.fn(() => ({ values: formValues })),
            reset: jest.fn((values) => {
                // Deliberately retain the supplied object, as a form implementation may do.
                formValues = values
            }),
        }
        const parentUIRender = {
            state: { data: { json: cloneDeep(original) } },
            props: { instance: { form } },
            setState: jest.fn((updater, callback) => {
                const next = updater(parentUIRender.state)
                parentUIRender.state = {
                    ...parentUIRender.state,
                    ...next,
                }
                if (callback) callback()
            }),
        }

        expect(callPush(parentUIRender)).toBe(true)
        expect(form.mutators.push).toHaveBeenCalledWith(
            'portfolio.phases.0.dataKind.lineItems',
            rowObject
        )
        expect(get(original, 'portfolio.phases[0].dataKind.lineItems')).toEqual([
            { sku: 'A', details: { quantity: 1 } },
        ])
        expect(get(parentUIRender.state.data.json, 'portfolio.phases[0].dataKind.lineItems')).toEqual([
            { sku: 'A', details: { quantity: 1 } },
            rowObject,
        ])
        expect(parentUIRender.state.data.json.audit).toEqual({ revision: 7 })

        const resetSnapshot = form.reset.mock.calls[form.reset.mock.calls.length - 1][0]
        expect(resetSnapshot).not.toBe(parentUIRender.state.data.json)
        resetSnapshot.portfolio.phases[0].dataKind.lineItems[1].details.quantity = 999
        expect(get(
            parentUIRender.state.data.json,
            'portfolio.phases[0].dataKind.lineItems[1].details.quantity'
        )).toBe(2)
    })
})
