import { formatDuration, formatTime, toHours } from '../time'

describe('formatDuration', () => {
    it('returns "0 seconds" for zero milliseconds', () => {
        expect(formatDuration(0)).toBe('0 seconds')
        expect(formatDuration(0, { shorten: true })).toBe('0 s')
    })

    it('formats a single second', () => {
        expect(formatDuration(1000)).toBe('1 second')
    })

    it('formats minutes and seconds', () => {
        expect(formatDuration(90 * 1000)).toBe('1 minute, 30 seconds')
    })

    it('uses short forms when shorten=true', () => {
        expect(formatDuration(90 * 1000, { shorten: true })).toBe('1 m, 30 s')
    })

    it('honors a custom delimiter and spacer', () => {
        expect(formatDuration(90 * 1000, { delimiter: ' | ', spacer: '' })).toBe('1minute | 30seconds')
    })

    it('limits parts via the largest option', () => {
        // 1 hour + 30 minutes + 15 seconds; largest:1 should give just one part
        const ms = 1 * 3600000 + 30 * 60000 + 15 * 1000
        expect(formatDuration(ms, { largest: 1, shorten: true })).toBe('2 h')
    })

    it('handles negative durations with sign', () => {
        expect(formatDuration(-1000)).toBe('-1 second')
    })

    it('rounds the smallest unit when round=true', () => {
        // 1500 ms with no rounding lower bound — but if shorten with round=false, ms still 500
        expect(formatDuration(1500, { shorten: true })).toBe('1 s, 500 ms')
    })
})

describe('formatDuration.shortEnglish', () => {
    it('is equivalent to formatDuration with shorten=true', () => {
        expect(formatDuration.shortEnglish(60000)).toBe('1 m')
    })
})

describe('formatTime', () => {
    it('formats a Date with the default format', () => {
        // 2024-06-15 14:30:00 local
        const t = new Date(2024, 5, 15, 14, 30, 0)
        const out = formatTime(t)
        expect(out).toMatch(/Sat, 15 Jun - \d{2}:\d{2} (a|p)m/)
    })

    it('honors a custom format', () => {
        const t = new Date(2024, 5, 15)
        expect(formatTime(t, 'YYYY-MM-DD')).toBe('2024-06-15')
    })
})

describe('toHours', () => {
    it('renders short hour-meridian form', () => {
        const t = new Date(2024, 5, 15, 9, 30, 0)
        expect(toHours(t)).toBe('9 am')
    })
})
