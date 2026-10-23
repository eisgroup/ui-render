import { useMemo } from 'react'
import moment from 'moment'
import enUs from 'rc-picker/lib/locale/en_US'
import type { PickerProps } from 'rc-picker'
import type { Moment } from 'moment'
import type { Translate } from '../utils/_envs'
import { phrase } from '../utils/phrases'

/** What rc-picker takes as its `locale`: its texts, and the moment locale it reads and writes dates in. */
export type CalendarLocale = NonNullable<PickerProps<Moment>['locale']>

/**
 * The moment locale that moment has loaded for the language tag `tag`, `de` for `de-DE`, or none. moment reads
 * `de-de` as `de-de`, else `de`; where it has neither, it falls back to its global locale, which no setting of the
 * widget's names, and so that one is none here.
 */
function loadedLocaleOf (tag: string | undefined): string | undefined {
    if (!tag) return undefined
    const wanted = tag.toLowerCase().replace(/_/g, '-')
    const read = moment().locale(wanted).locale()
    return wanted === read || wanted.startsWith(`${read}-`) ? read : undefined
}

/**
 * The moment locale a date field writes month and day names in, and starts its weeks by: the one the host's
 * `locale` names, `de` for `de-DE`, else the one its `language` names, else English. moment is the host's, and so
 * is its locale data: a locale the host has not loaded is passed over, and without one the names stay English.
 */
export function dateLocaleOf (locale: string | undefined, language: string | undefined): string {
    return loadedLocaleOf(locale) || loadedLocaleOf(language) || 'en'
}

/**
 * rc-picker's locale for a calendar: its texts in the language of `translate`, the document's translator, each a
 * built-in phrase, and its month and day names in the moment locale `dateLocale` (`dateLocaleOf`). rc-picker reads
 * the names from moment, and keeps what it makes of its locale by identity, so this is one object while all of them
 * stay the same. The texts are asked for at every render, as every built-in phrase is where it shows.
 *
 * Its locale's other texts, such as `Clear`, `Back to today` and `Last decade`, rc-picker 4.11 shows nowhere: they
 * stay as `en_US` has them.
 */
export function useCalendarLocale (translate: Translate, dateLocale: string): CalendarLocale {
    const today = phrase(translate, 'TODAY')
    const now = phrase(translate, 'NOW')
    const ok = phrase(translate, 'CALENDAR_OK')
    const week = phrase(translate, 'WEEK')
    const monthSelect = phrase(translate, 'CHOOSE_A_MONTH')
    const yearSelect = phrase(translate, 'CHOOSE_A_YEAR')
    const decadeSelect = phrase(translate, 'CHOOSE_A_DECADE')
    const previousMonth = phrase(translate, 'PREVIOUS_MONTH')
    const nextMonth = phrase(translate, 'NEXT_MONTH')
    const previousYear = phrase(translate, 'LAST_YEAR')
    const nextYear = phrase(translate, 'NEXT_YEAR')
    return useMemo(() => ({
        ...enUs,
        locale: dateLocale,
        today, now, ok, week, monthSelect, yearSelect, decadeSelect, previousMonth, nextMonth, previousYear, nextYear,
    }), [dateLocale, today, now, ok, week, monthSelect, yearSelect, decadeSelect, previousMonth, nextMonth, previousYear, nextYear])
}
