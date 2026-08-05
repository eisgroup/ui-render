import { formatDuration, formatTime, toHours } from '../time'

describe('formatDuration migration contract', () => {
    const units = [
        ['year', 'years', 'y', 31557600000],
        ['month', 'months', 'mo', 2629800000],
        ['week', 'weeks', 'w', 604800000],
        ['day', 'days', 'd', 86400000],
        ['hour', 'hours', 'h', 3600000],
        ['minute', 'minutes', 'm', 60000],
        ['second', 'seconds', 's', 1000],
        ['millisecond', 'milliseconds', 'ms', 1],
    ]

    it.each(units)('uses singular and short labels for %s', (singular, plural, short, milliseconds) => {
        expect(formatDuration(milliseconds)).toBe(`1 ${singular}`)
        expect(formatDuration(milliseconds, { shorten: true })).toBe(`1 ${short}`)
    })

    it.each(units)('uses the plural label for %s', (singular, plural, short, milliseconds) => {
        expect(formatDuration(milliseconds * 2)).toBe(`2 ${plural}`)
    })

    it('keeps the fractional final unit when rounding is disabled', () => {
        expect(formatDuration(1500, { largest: 1, round: false })).toBe('1.5 seconds')
        expect(formatDuration(1500, { largest: 1 })).toBe('2 seconds')
        expect(formatDuration(5430, { largest: 2, round: false })).toBe('5 seconds, 430 milliseconds')
    })

    it('rounds only the final displayed unit when largest truncates the result', () => {
        const milliseconds = 3600000 + (30 * 60000) + (31 * 1000)

        expect(formatDuration(milliseconds, { largest: 2 })).toBe('1 hour, 31 minutes')
        expect(formatDuration(milliseconds, { largest: 2, round: false })).toBe('1 hour, 30.516666666666666 minutes')
    })

    it('supports custom decimal, delimiter, and spacer strings', () => {
        expect(formatDuration(1500, {
            largest: 1,
            round: false,
            decimal: ',',
            delimiter: '/',
            spacer: '_',
        })).toBe('1,5_seconds')
        expect(formatDuration(61000, { delimiter: '/', spacer: '' })).toBe('1minute/1second')
    })

    it('preserves the sign for negative integer and fractional durations', () => {
        expect(formatDuration(-61001)).toBe('-1 minute, 1 second, 1 millisecond')
        expect(formatDuration(-0.25, { round: false })).toBe('-0.25 milliseconds')
    })

    it('rounds sub-millisecond values or falls back to zero', () => {
        expect(formatDuration(0.5)).toBe('1 millisecond')
        expect(formatDuration(0.49)).toBe('0 seconds')
        expect(formatDuration(0.49, { shorten: true })).toBe('0 s')
        expect(formatDuration(-0)).toBe('0 seconds')
    })

    it.each([0, -1, Number.NaN, Number.POSITIVE_INFINITY])(
        'ignores an invalid largest value of %s',
        largest => {
            expect(formatDuration(61001, { largest })).toBe('1 minute, 1 second, 1 millisecond')
        },
    )

    it.each([Number.NaN, Number.POSITIVE_INFINITY, Number.NEGATIVE_INFINITY, 'not-a-number', undefined])(
        'returns a stable zero value for a non-finite duration of %s',
        milliseconds => {
            expect(formatDuration(milliseconds)).toBe('0 seconds')
            expect(formatDuration(milliseconds, { shorten: true, spacer: '' })).toBe('0s')
        },
    )

    it('retains numeric coercion used by the public API', () => {
        expect(formatDuration('1500')).toBe('1 second, 500 milliseconds')
        expect(formatDuration(null)).toBe('0 seconds')
    })
})

describe('formatDuration.shortEnglish migration contract', () => {
    it('always overrides a conflicting shorten option', () => {
        expect(formatDuration.shortEnglish(61000, { shorten: false })).toBe('1 m, 1 s')
    })

    it('forwards all other formatting options', () => {
        expect(formatDuration.shortEnglish(1500, {
            largest: 1,
            round: false,
            decimal: ',',
            spacer: '',
        })).toBe('1,5s')
        expect(formatDuration.shortEnglish(0, { spacer: '' })).toBe('0s')
    })

    it('accepts an explicit null options value', () => {
        expect(formatDuration.shortEnglish(1000, null)).toBe('1 s')
    })
})

describe('formatTime migration contract', () => {
    it('uses the full documented default format', () => {
        const time = new Date(2024, 5, 15, 14, 30)

        expect(formatTime(time)).toBe('Sat, 15 Jun - 02:30 pm')
    })

    it('supports deterministic custom Moment format tokens', () => {
        const time = new Date(2024, 5, 15, 14, 30, 45, 123)

        expect(formatTime(time, 'YYYY-MM-DD HH:mm:ss.SSS')).toBe('2024-06-15 14:30:45.123')
        expect(formatTime(time, '[quarter:]Q [day:]DD')).toBe('quarter:2 day:15')
    })

    it('accepts millisecond timestamps without interpreting them as Unix seconds', () => {
        expect(formatTime(0, 'x')).toBe('0')
        expect(formatTime(1718451045123, 'x')).toBe('1718451045123')
    })

    it('returns the Moment invalid-date sentinel for invalid values', () => {
        expect(formatTime(Number.NaN, 'YYYY-MM-DD')).toBe('Invalid date')
        expect(formatTime(null, 'YYYY-MM-DD')).toBe('Invalid date')
    })
})

describe('toHours migration contract', () => {
    it.each([
        [0, '12 am'],
        [9, '9 am'],
        [12, '12 pm'],
        [23, '11 pm'],
    ])('formats local hour %i using the 12-hour clock', (hour, expected) => {
        expect(toHours(new Date(2024, 5, 15, hour, 59))).toBe(expected)
    })

    it('accepts a numeric timestamp and returns invalid values unchanged by the wrapper', () => {
        const timestamp = new Date(2024, 5, 15, 22, 30).getTime()

        expect(toHours(timestamp)).toBe('10 pm')
        expect(toHours(Number.NaN)).toBe('Invalid date')
    })
})
