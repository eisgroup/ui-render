/**
 * A DATE FIELD'S CALENDAR, IN THE HOST'S LANGUAGE (2026-10-23).
 * =============================================================================================
 *
 * rc-picker's texts are built-in phrases, asked of the document's translator, and its month and day names are
 * moment's, in the locale the host's `locale` names, else its `language`, else English (`../calendarLocale`). Until
 * 2026-10-23 the calendar was rc-picker's `en_US` whatever the host set.
 */
import React, { useEffect } from 'react'
import { render } from '@testing-library/react'
import moment from 'moment'
import 'moment/locale/de'
import 'moment/locale/de-at'
import 'moment/locale/fr'
import enUs from 'rc-picker/lib/locale/en_US'
import { dateLocaleOf, useCalendarLocale } from '../calendarLocale'

// A locale moment loads becomes its global one, in a host as here.
moment.locale('en')

describe('the moment locale of a date field', () => {
    it.each([
        ['a language tag', 'de-DE', undefined, 'de'],
        ['a Java-style tag', 'de_DE', undefined, 'de'],
        ['a tag in capitals', 'DE-DE', undefined, 'de'],
        ['a region moment has a locale of its own for', 'de-AT', undefined, 'de-at'],
        ['English, for which moment has no `en-us`', 'en-US', undefined, 'en'],
        ['the language where no locale is given', undefined, 'de', 'de'],
        ['the language where moment has no locale for the locale given', 'qaa-QA', 'fr', 'fr'],
        ['the locale over the language', 'fr-FR', 'de', 'fr'],
        ['English where neither is given', undefined, undefined, 'en'],
        ['English where moment has a locale for neither', 'qaa-QA', 'qab', 'en'],
    ])('is %s', (_, locale, language, expected) => {
        expect(dateLocaleOf(locale, language)).toBe(expected)
    })

    it('is English, not moment\'s global locale, where moment has none for the host\'s', () => {
        // moment's own fallback is its global locale, which the host may have set for something else.
        moment.locale('fr')
        try {
            expect(dateLocaleOf('qaa-QA', 'qab')).toBe('en')
            expect(moment.locale()).toBe('fr')
        } finally {
            moment.locale('en')
        }
    })
})

/** Renders `useCalendarLocale` and hands each locale it returns to `seen`, once per render. */
function Calendar ({ translate, dateLocale, seen }) {
    const locale = useCalendarLocale(translate, dateLocale)
    useEffect(() => { seen(locale) })
    return null
}

/** The locales a calendar is handed over its renders with each of `propsList`. */
function localesOver (...propsList) {
    const locales = []
    const seen = locale => locales.push(locale)
    const { rerender } = render(<Calendar {...propsList[0]} seen={seen}/>)
    propsList.slice(1).forEach(props => rerender(<Calendar {...props} seen={seen}/>))
    return locales
}

// A host's translator: it returns what it has no translation for as it was given.
const GERMAN = {
    'ui-render:CALENDAR_OK': 'Übernehmen',
    'ui-render:CHOOSE_A_DECADE': 'Jahrzehnt wählen',
    'ui-render:CHOOSE_A_MONTH': 'Monat wählen',
    'ui-render:CHOOSE_A_YEAR': 'Jahr wählen',
    'ui-render:LAST_YEAR': 'Voriges Jahr (Strg + links)',
    'ui-render:NEXT_MONTH': 'Nächster Monat (Bild ab)',
    'ui-render:NEXT_YEAR': 'Nächstes Jahr (Strg + rechts)',
    'ui-render:NOW': 'Jetzt',
    'ui-render:PREVIOUS_MONTH': 'Voriger Monat (Bild auf)',
    'ui-render:TODAY': 'Heute',
    'ui-render:WEEK': 'Woche',
}
const german = value => (value in GERMAN ? GERMAN[value] : value)
const echo = value => value

describe('the locale of a date field\'s calendar', () => {
    it('is rc-picker\'s English one, with moment\'s English names, for a host with no translation', () => {
        const [locale] = localesOver({ translate: echo, dateLocale: 'en' })
        expect(locale).toEqual({ ...enUs, locale: 'en' })
    })

    it('has each text the calendar shows in the language of the translator, and the names of the moment locale', () => {
        const [locale] = localesOver({ translate: german, dateLocale: 'de' })
        expect(locale).toEqual({
            ...enUs,
            locale: 'de',
            today: 'Heute',
            now: 'Jetzt',
            ok: 'Übernehmen',
            week: 'Woche',
            monthSelect: 'Monat wählen',
            yearSelect: 'Jahr wählen',
            decadeSelect: 'Jahrzehnt wählen',
            previousMonth: 'Voriger Monat (Bild auf)',
            nextMonth: 'Nächster Monat (Bild ab)',
            previousYear: 'Voriges Jahr (Strg + links)',
            nextYear: 'Nächstes Jahr (Strg + rechts)',
        })
    })

    it('asks the translator for each text by its key', () => {
        const asked = []
        localesOver({ translate: value => { asked.push(value); return value }, dateLocale: 'en' })
        expect(asked).toEqual([
            'ui-render:TODAY', 'ui-render:NOW', 'ui-render:CALENDAR_OK', 'ui-render:WEEK', 'ui-render:CHOOSE_A_MONTH',
            'ui-render:CHOOSE_A_YEAR', 'ui-render:CHOOSE_A_DECADE', 'ui-render:PREVIOUS_MONTH', 'ui-render:NEXT_MONTH',
            'ui-render:LAST_YEAR', 'ui-render:NEXT_YEAR',
        ])
    })

    it('is one object while its texts and its names stay the same, from another translator too', () => {
        // rc-picker keeps what it makes of its locale by identity.
        const [first, second, third] = localesOver(
            { translate: german, dateLocale: 'de' },
            { translate: german, dateLocale: 'de' },
            { translate: value => german(value), dateLocale: 'de' },
        )
        expect(second).toBe(first)
        expect(third).toBe(first)
    })

    it('is another once a text changes, behind the same translator', () => {
        // An i18n that changes its language keeps its translate function: the texts are asked for at every render.
        let language = 'en'
        const translate = value => (language === 'de' ? german(value) : value)
        const locales = []
        const seen = locale => locales.push(locale)
        const { rerender } = render(<Calendar translate={translate} dateLocale="en" seen={seen}/>)
        language = 'de'
        rerender(<Calendar translate={translate} dateLocale="en" seen={seen}/>)

        expect(locales[1]).not.toBe(locales[0])
        expect(locales[0].today).toBe('Today')
        expect(locales[1].today).toBe('Heute')
    })

    it('is another once the moment locale changes', () => {
        const [first, second] = localesOver({ translate: echo, dateLocale: 'en' }, { translate: echo, dateLocale: 'de' })
        expect(second).not.toBe(first)
        expect(second).toEqual({ ...enUs, locale: 'de' })
    })
})
