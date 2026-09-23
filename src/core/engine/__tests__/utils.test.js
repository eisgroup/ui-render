import {
    changeOptionOrderForSelectFields,
    replaceDeep,
    mapErrorObjectToUIFormat,
    convertFieldNameToTitleCaseText,
    getDateStringFromDateObject,
    normalizeIncomingData,
} from '../utils'

describe('changeOptionOrderForSelectFields', () => {
    it('reorders data for index-based Select', () => {
        const data = {
            optionSelection: '1',
            options: [
                { optionName: 'Option A' },
                { optionName: 'Option B' },
                { optionName: 'Option C' },
            ],
        }
        const meta = {
            view: 'Select',
            name: 'optionSelection',
            mapOptions: { text: 'optionName', value: '{index}' },
        }
        const result = changeOptionOrderForSelectFields(data, meta)
        expect(result.options[0].optionName).toBe('Option B')
        expect(result.optionSelection).toBeUndefined()
    })

    it('does NOT reorder for non-index Select (stable value)', () => {
        const data = {
            optionSelection: 'Option B',
            options: [
                { optionName: 'Option A' },
                { optionName: 'Option B' },
                { optionName: 'Option C' },
            ],
        }
        const meta = {
            view: 'Select',
            name: 'optionSelection',
            mapOptions: { text: 'optionName', value: 'optionName' },
        }
        const result = changeOptionOrderForSelectFields(data, meta)
        expect(result.options[0].optionName).toBe('Option A')
        expect(result.optionSelection).toBe('Option B')
    })

    it('processes nested items recursively', () => {
        const data = {
            categorySelection: '1',
            categories: [
                { categoryName: 'Basic' },
                { categoryName: 'Standard' },
            ],
        }
        const meta = {
            view: 'VerticalLayout',
            items: [
                {
                    view: 'Select',
                    name: 'categorySelection',
                    mapOptions: { text: 'categoryName', value: '{index}' },
                },
            ],
        }
        const result = changeOptionOrderForSelectFields(data, meta)
        expect(result.categories[0].categoryName).toBe('Standard')
        expect(result.categorySelection).toBeUndefined()
    })

    it('processes renderItem.items recursively', () => {
        const data = {
            selection: '0',
            items: [
                { name: 'A' },
                { name: 'B' },
            ],
        }
        const meta = {
            view: 'Table',
            renderItem: {
                items: [
                    {
                        view: 'Select',
                        name: 'selection',
                        mapOptions: { text: 'name', value: '{index}' },
                    },
                ],
            },
        }
        const result = changeOptionOrderForSelectFields(data, meta)
        // selection '0' means first item, moving it to front is a no-op
        expect(result.items[0].name).toBe('A')
    })

    it('returns data unchanged when meta is null', () => {
        const data = { foo: 'bar' }
        const result = changeOptionOrderForSelectFields(data, null)
        expect(result).toEqual({ foo: 'bar' })
    })

    it('handles non-string select value (number)', () => {
        const data = {
            optionSelection: 1,
            options: [{ optionName: 'A' }, { optionName: 'B' }],
        }
        const meta = {
            view: 'Select',
            name: 'optionSelection',
            mapOptions: { text: 'optionName', value: '{index}' },
        }
        const result = changeOptionOrderForSelectFields(data, meta)
        // non-string value should not trigger reorder
        expect(result.options[0].optionName).toBe('A')
        expect(result.optionSelection).toBe(1)
    })
})

describe('replaceDeep', () => {
    it('replaces a key in a flat object', () => {
        const obj = { status: 'draft', name: 'Test' }
        replaceDeep(obj, 'status', 'published')
        expect(obj.status).toBe('published')
    })

    it('replaces a key in nested objects', () => {
        const obj = { a: { b: { status: 'old' } } }
        replaceDeep(obj, 'status', 'new')
        expect(obj.a.b.status).toBe('new')
    })

    it('replaces a key in arrays of objects', () => {
        const arr = [{ status: 'a' }, { status: 'b' }]
        replaceDeep(arr, 'status', 'replaced')
        expect(arr[0].status).toBe('replaced')
        expect(arr[1].status).toBe('replaced')
    })

    it('does nothing when key is not present', () => {
        const obj = { name: 'Test' }
        replaceDeep(obj, 'missing', 'value')
        expect(obj).toEqual({ name: 'Test' })
    })

    it('handles mixed nested arrays and objects', () => {
        const obj = {
            items: [
                { nested: { flag: true } },
                { flag: false },
            ],
        }
        replaceDeep(obj, 'flag', 'updated')
        expect(obj.items[0].nested.flag).toBe('updated')
        expect(obj.items[1].flag).toBe('updated')
    })
})

describe('mapErrorObjectToUIFormat', () => {
    it('converts flat errors to UI format', () => {
        const errors = { fieldA: 'Field A is required', fieldB: 'Invalid value' }
        const result = mapErrorObjectToUIFormat(errors)
        expect(result).toEqual({
            fieldA: { messages: [{ text: 'Field A is required' }] },
            fieldB: { messages: [{ text: 'Invalid value' }] },
        })
    })

    it('returns empty object for empty input', () => {
        expect(mapErrorObjectToUIFormat({})).toEqual({})
    })

    it('handles single error', () => {
        const result = mapErrorObjectToUIFormat({ email: 'Invalid email' })
        expect(result.email.messages).toHaveLength(1)
        expect(result.email.messages[0].text).toBe('Invalid email')
    })
})

describe('convertFieldNameToTitleCaseText', () => {
    it('converts camelCase to title case', () => {
        expect(convertFieldNameToTitleCaseText('firstName')).toBe('First Name')
    })

    it('handles dot-separated path (uses last segment)', () => {
        expect(convertFieldNameToTitleCaseText('user.profile.firstName')).toBe('First Name')
    })

    it('handles single word', () => {
        expect(convertFieldNameToTitleCaseText('name')).toBe('Name')
    })

    it('handles already capitalized', () => {
        expect(convertFieldNameToTitleCaseText('Name')).toBe('Name')
    })

    it('handles multiple consecutive uppercase letters', () => {
        expect(convertFieldNameToTitleCaseText('startDateUTC')).toBe('Start Date U T C')
    })
})

describe('getDateStringFromDateObject', () => {
    it('formats a date as YYYY-MM-DD', () => {
        const date = new Date(Date.UTC(2026, 2, 16)) // March 16, 2026
        expect(getDateStringFromDateObject(date)).toBe('2026-03-16')
    })

    it('pads single-digit month and day', () => {
        const date = new Date(Date.UTC(2026, 0, 5)) // January 5, 2026
        expect(getDateStringFromDateObject(date)).toBe('2026-01-05')
    })

    it('handles end of year', () => {
        const date = new Date(Date.UTC(2026, 11, 31)) // December 31, 2026
        expect(getDateStringFromDateObject(date)).toBe('2026-12-31')
    })

    it('handles year with fewer than 4 digits', () => {
        const date = new Date(Date.UTC(99, 0, 1))
        date.setUTCFullYear(99) // year 99 AD
        const result = getDateStringFromDateObject(date)
        expect(result).toBe('0099-01-01')
    })
})

describe('normalizeIncomingData', () => {
    it('returns null/undefined as is', () => {
        expect(normalizeIncomingData(null)).toBeNull()
        expect(normalizeIncomingData(undefined)).toBeUndefined()
    })

    it('strips time part from ISO 8601 date strings', () => {
        expect(normalizeIncomingData('2026-03-16T14:30:00.000Z')).toBe('2026-03-16')
    })

    it('returns non-ISO strings unchanged', () => {
        expect(normalizeIncomingData('hello')).toBe('hello')
    })

    it('returns numbers unchanged', () => {
        expect(normalizeIncomingData(42)).toBe(42)
        expect(normalizeIncomingData(0)).toBe(0)
    })

    it('converts Date objects to YYYY-MM-DD', () => {
        const date = new Date(Date.UTC(2026, 2, 16))
        expect(normalizeIncomingData(date)).toBe('2026-03-16')
    })

    it('normalizes arrays recursively', () => {
        const input = ['2026-03-16T00:00:00.000Z', 'plain', 42]
        const result = normalizeIncomingData(input)
        expect(result).toEqual(['2026-03-16', 'plain', 42])
    })

    it('normalizes nested objects recursively', () => {
        const input = {
            startDate: '2026-01-01T00:00:00.000Z',
            name: 'Test',
            count: 10,
        }
        const result = normalizeIncomingData(input)
        expect(result).toEqual({
            startDate: '2026-01-01',
            name: 'Test',
            count: 10,
        })
    })

    it('returns empty object as is', () => {
        expect(normalizeIncomingData({})).toEqual({})
    })

    it('handles deeply nested structures', () => {
        const input = {
            level1: {
                items: [
                    { date: '2026-06-15T10:00:00.000Z', value: 99 },
                ],
            },
        }
        const result = normalizeIncomingData(input)
        expect(result.level1.items[0].date).toBe('2026-06-15')
        expect(result.level1.items[0].value).toBe(99)
    })
})
