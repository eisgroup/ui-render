/**
 * A DATE FIELD FOR A HOST THAT LOADS NO MOMENT LOCALE FOR ITS LANGUAGE (2026-10-23).
 * =============================================================================================
 *
 * moment's locale data is the host's to load: where it has not loaded the locale its `locale` or its `language` names,
 * the month and day names stay English, and nothing reports an error (`date-field-language.test.js` is the host that
 * loads it). In a bundle, moment finds no locale it was not given. Under jest it would read one from `node_modules`
 * when asked for it, so here moment cannot find `de`, as in such a bundle.
 */
import React from 'react'
import { act, fireEvent, render } from '@testing-library/react'
import '@testing-library/jest-dom'
import moment from 'moment'
import 'moment/locale/fr'
import UIRender from '../main'

jest.mock('moment/locale/de', () => {
    throw new Error('Cannot find module \'moment/locale/de\'')
})

moment.locale('en')

const meta = { view: 'Input', type: 'date', name: 'start', label: 'Start' }
const data = { start: '2024-03-15' }

/** The month the opened calendar of a document of the field above shows, with `props`, and the field's text. */
function shownWith (props) {
    jest.useFakeTimers()
    try {
        const view = render(<UIRender meta={meta} data={data} initialValues={data} dateFormat="DD MMMM YYYY" {...props}/>)
        const input = view.container.querySelector('.ui-render-picker input')
        act(() => {
            fireEvent.mouseDown(input)
            fireEvent.click(input)
        })
        act(() => { jest.runAllTimers() })
        const shown = {
            month: document.querySelector('.ui-render-picker-month-btn').textContent,
            weekDays: Array.from(document.querySelectorAll('.ui-render-picker-content thead th'), th => th.textContent),
            text: input.value,
        }
        view.unmount()
        act(() => { jest.runAllTimers() })
        return shown
    } finally {
        jest.useRealTimers()
    }
}

const ENGLISH = { month: 'Mar', weekDays: ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'], text: '15 March 2024' }

describe('a date field whose host has not loaded the moment locale it names', () => {
    it('shows English month and day names for its `locale`, and its `language`', () => {
        expect(shownWith({ locale: 'de-DE' })).toEqual(ENGLISH)
        expect(shownWith({ language: 'de' })).toEqual(ENGLISH)
    })

    it('shows them in English, not in moment\'s global locale', () => {
        // moment's own fallback for a locale it has not loaded is its global locale.
        moment.locale('fr')
        try {
            expect(shownWith({ locale: 'de-DE' })).toEqual(ENGLISH)
        } finally {
            moment.locale('en')
        }
    })
})
