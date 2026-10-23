/**
 * A DATE FIELD IN THE HOST'S LANGUAGE, IN A DOCUMENT MOUNTED AS A HOST MOUNTS IT (2026-10-23).
 * =============================================================================================
 *
 * The month and day names of a date field, in its calendar and in a date whose format names the month, are moment's,
 * in the locale the host's `locale` names, else its `language` (`core/components/calendarLocale.ts`). moment is the
 * host's, and so is its locale data: this host loads `moment/locale/de` and `moment/locale/ar`, as a host imports them.
 * Until 2026-10-23 they were English whatever the host set. `date-field-language.unloaded.test.js` is a host that loads
 * no German.
 *
 * rc-picker opens and closes its calendar with timers, and React 16, 17 and 19 report each step that lands outside
 * `act`: the timers are fake, every step runs inside one, and the document unmounts before the real timers come back.
 */
import React from 'react'
import { act, fireEvent, render } from '@testing-library/react'
import '@testing-library/jest-dom'
import moment from 'moment'
import 'moment/locale/de'
import 'moment/locale/ar'
import UIRender from '../main'

// A locale moment loads becomes its global one. A host may keep another: these tests set it where they need one.
moment.locale('en')

const meta = { view: 'Input', type: 'date', name: 'start', label: 'Start' }
const data = { start: '2024-03-15' }

/**
 * Renders a document of the date field above with `props`, opens its calendar and hands `check` the calendar, the
 * field's input and what the document's `getFormData` reads.
 */
function withCalendar (props, check) {
    jest.useFakeTimers()
    try {
        let getData = () => undefined
        const view = render(
            <UIRender meta={meta} data={data} initialValues={data} getFormData={get => { getData = get }} {...props}/>
        )
        const input = view.container.querySelector('.ui-render-picker input')
        act(() => {
            fireEvent.mouseDown(input)
            fireEvent.click(input)
        })
        act(() => { jest.runAllTimers() })
        check(document.querySelector('.ui-render-picker-dropdown'), input, () => getData())
        view.unmount()
        act(() => { jest.runAllTimers() })
    } finally {
        jest.useRealTimers()
    }
}

const textsOf = elements => Array.from(elements, element => element.textContent)
const monthOf = calendar => calendar.querySelector('.ui-render-picker-month-btn').textContent
const weekDaysOf = calendar => textsOf(calendar.querySelectorAll('.ui-render-picker-content thead th'))

const GERMAN_WEEK = ['Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa', 'So']
const ENGLISH_WEEK = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa']

describe('a date field\'s month and day names', () => {
    it('are those of the moment locale the host\'s `locale` names, a week starting as that locale starts one', () => {
        withCalendar({ locale: 'de-DE' }, calendar => {
            expect(monthOf(calendar)).toBe('März')
            expect(weekDaysOf(calendar)).toEqual(GERMAN_WEEK)

            fireEvent.click(calendar.querySelector('.ui-render-picker-month-btn'))
            expect(textsOf(calendar.querySelectorAll('.ui-render-picker-month-panel .ui-render-picker-cell'))).toEqual([
                'Jan.', 'Feb.', 'März', 'Apr.', 'Mai', 'Juni', 'Juli', 'Aug.', 'Sep.', 'Okt.', 'Nov.', 'Dez.',
            ])
        })
    })

    it('name the month in a date whose format names it', () => {
        withCalendar({ locale: 'de-DE', dateFormat: 'DD MMMM YYYY' }, (calendar, input) => {
            expect(input).toHaveValue('15 März 2024')
        })
    })

    it('are those of the moment locale the host\'s `language` names, where it gives no `locale`', () => {
        withCalendar({ language: 'de', dateFormat: 'DD MMM YYYY' }, (calendar, input) => {
            expect(monthOf(calendar)).toBe('März')
            expect(input).toHaveValue('15 März 2024')
        })
    })

    it('follow the document\'s props, not moment\'s global locale', () => {
        // moment's global locale is one for the page, where each document has props of its own.
        moment.locale('de')
        try {
            withCalendar({ dateFormat: 'DD MMM YYYY' }, (calendar, input) => {
                expect(monthOf(calendar)).toBe('Mar')
                expect(weekDaysOf(calendar)).toEqual(ENGLISH_WEEK)
                expect(input).toHaveValue('15 Mar 2024')
            })
        } finally {
            moment.locale('en')
        }
    })

    it('are English for a host that sets neither, as they were', () => {
        withCalendar({ dateFormat: 'DD MMMM YYYY' }, (calendar, input) => {
            expect(monthOf(calendar)).toBe('Mar')
            expect(weekDaysOf(calendar)).toEqual(ENGLISH_WEEK)
            expect(input).toHaveValue('15 March 2024')
        })
    })
})

describe('a date picked in a date field', () => {
    /** Picks the 20th of the month the calendar shows: its days in view, in order. */
    const pickThe20th = calendar => {
        fireEvent.click(calendar.querySelectorAll('td.ui-render-picker-cell-in-view')[19])
        act(() => { jest.runAllTimers() })
    }

    it('is handed on in English digits from a locale that writes others, which the field shows', () => {
        withCalendar({ locale: 'ar-EG', dateFormat: 'DD-MM-YYYY' }, (calendar, input, formData) => {
            expect(input).toHaveValue('١٥-٠٣-٢٠٢٤')
            pickThe20th(calendar)
            expect(input).toHaveValue('٢٠-٠٣-٢٠٢٤')
            expect(formData()).toEqual({ start: '2024-03-20' })
        })
    })

    it('is handed on in English digits where moment\'s global locale writes others', () => {
        // The calendar's days are moments in the global locale. Until 2026-10-23 such a date was handed on as it wrote
        // itself, `٢٠٢٤-٠٣-٢٠`, and that is what the data held.
        moment.locale('ar')
        try {
            withCalendar({ dateFormat: 'DD-MM-YYYY' }, (calendar, input, formData) => {
                pickThe20th(calendar)
                expect(input).toHaveValue('20-03-2024')
                expect(formData()).toEqual({ start: '2024-03-20' })
            })
        } finally {
            moment.locale('en')
        }
    })
})
