/**
 * THE TEXTS THE WIDGET WRITES ITSELF, IN A DOCUMENT MOUNTED AS A HOST MOUNTS IT.
 * =============================================================================================
 *
 * Each built-in text is asked for as `ui-render:<ID>` (`src/core/utils/phrases.ts`). Every text below is
 * rendered three times: for a host whose i18n has the `ui-render` namespace, here in German; for a host
 * with no translation for it, whose `translate` answers a key with the key, as an i18next-based one does;
 * and for a host that passes no `translate`. The last two show the English these texts showed before, but
 * for two upload texts that were defects: the hover text "Upload File File", and a label in the English plural.
 *
 * Until 2026-10-23 every one of them was English whatever the host's language: a host's `translate` was
 * asked for some as their English words ("Select", "Ok", "Required"), and for the rest not at all.
 */
import React from 'react'
import { act, fireEvent, render, screen, waitFor, within } from '@testing-library/react'
import '@testing-library/jest-dom'
import UIRender from '../main'
import { Active } from '../../core/utils'
import Upload from '../../core/modules/upload/views/Upload'
import Modal from '../../core/engine/components/Modal'
import { AppContext, ConfigContext, initialAppState, initialConfigState } from '../../core/contexts'

const GERMAN = {
    // The labels of the metas below.
    Price: 'Preis',
    Report: 'Bericht',
    Title: 'Titel',
    // The built-in phrases.
    'ui-render:CALENDAR_OK': 'Übernehmen',
    'ui-render:CHOOSE_A_DECADE': 'Jahrzehnt wählen',
    'ui-render:CHOOSE_A_MONTH': 'Monat wählen',
    'ui-render:CHOOSE_A_YEAR': 'Jahr wählen',
    'ui-render:DOWNLOAD_FAILED': 'Herunterladen fehlgeschlagen!',
    'ui-render:ERROR': 'Fehler',
    'ui-render:FILE': 'Datei',
    'ui-render:FILES': 'Dateien',
    'ui-render:FILE_MUST_BE_UNDER': '{file} muss kleiner als {size} sein',
    'ui-render:FILE_UPLOAD_FAILED': 'Hochladen fehlgeschlagen!',
    'ui-render:INVALID_DATE': 'Ungültiges Datum',
    'ui-render:INVALID_EMAIL_ADDRESS': 'Ungültige E-Mail-Adresse',
    'ui-render:INVALID_URL': 'Ungültige URL',
    'ui-render:LAST_YEAR': 'Voriges Jahr (Strg + links)',
    'ui-render:MAXIMUM_FILE_SIZE_EXCEEDED': 'Datei zu groß!',
    'ui-render:MUST_BE_LESS_THAN_CHARACTERS': 'Höchstens {count} Zeichen',
    'ui-render:MUST_BE_MAXIMUM': 'Höchstens {max}',
    'ui-render:MUST_BE_MINIMUM': 'Mindestens {min}',
    'ui-render:NEXT_MONTH': 'Nächster Monat (Bild ab)',
    'ui-render:NEXT_PAGE': 'Nächste Seite',
    'ui-render:NEXT_YEAR': 'Nächstes Jahr (Strg + rechts)',
    'ui-render:NOW': 'Jetzt',
    'ui-render:OFF': 'AUS',
    'ui-render:OK': 'Verstanden',
    'ui-render:ON': 'AN',
    'ui-render:PAGE': 'Seite {page}',
    'ui-render:PAGINATION': 'Seitennavigation',
    'ui-render:POPUP': 'Dialog',
    'ui-render:POPUP_CONTENT_IS_EMPTY': 'Der Dialog ist leer',
    'ui-render:PREVIOUS_MONTH': 'Voriger Monat (Bild auf)',
    'ui-render:PREVIOUS_PAGE': 'Vorherige Seite',
    'ui-render:REQUIRED': 'Pflichtfeld',
    'ui-render:SELECT': 'Bitte wählen',
    'ui-render:SELECT_NAME': '{name} wählen',
    'ui-render:SELECT_OR_DROP': 'Auswählen oder ablegen',
    'ui-render:SLIDER_MAXIMUM': '{name}, Maximum',
    'ui-render:SLIDER_MINIMUM': '{name}, Minimum',
    'ui-render:TABLE_HAS_NO_DATA': 'Die Tabelle hat keine Daten!',
    'ui-render:TODAY': 'Heute',
    'ui-render:UPLOAD_FILE': '{file} hochladen',
    'ui-render:UPLOAD_FILES_ONLY': 'Nur {formats}-Dateien hochladen',
    'ui-render:UPLOAD_LABEL_FILE': '{label}-Datei hochladen',
    'ui-render:WEEK': 'Woche',
}
const german = value => (value in GERMAN ? GERMAN[value] : value)
// A host with no translation for a key answers with the key, as an i18next-based host translate does.
const echo = value => value

// What each host sees. German for the first; for the other two, the English the widget always showed.
const SEEN_IN_GERMAN = {
    downloadFailed: 'Herunterladen fehlgeschlagen!',
    error: 'Fehler',
    emptyPopup: 'Der Dialog ist leer',
    file: 'Datei',
    files: 'Dateien',
    fileTooLarge: 'Datei zu groß!',
    mustBeUnder: (file, size) => [file, 'muss kleiner als', size, 'sein'],
    uploadFailed: 'Hochladen fehlgeschlagen!',
    filesOnly: formats => ['Nur', formats, '-Dateien hochladen'],
    invalidDate: 'Ungültiges Datum',
    invalidEmail: 'Ungültige E-Mail-Adresse',
    invalidUrl: 'Ungültige URL',
    tooLong: 'Höchstens 100 Zeichen',
    aboveMax: 'Höchstens 10',
    belowMin: 'Mindestens 1',
    nextPage: 'Nächste Seite',
    off: 'AUS',
    ok: 'Verstanden',
    on: 'AN',
    page: n => `Seite ${n}`,
    pagination: 'Seitennavigation',
    popup: 'Dialog',
    previousPage: 'Vorherige Seite',
    required: 'Pflichtfeld',
    select: 'Bitte wählen',
    selectName: 'colour wählen',
    selectOrDrop: 'Auswählen oder ablegen',
    sliderMaximum: 'Preis, Maximum',
    sliderMinimum: 'Preis, Minimum',
    tableHasNoData: 'Die Tabelle hat keine Daten!',
    report: 'Bericht',
    uploadFile: 'Datei hochladen',
    uploadReport: 'Bericht hochladen',
    uploadReportFile: 'Bericht-Datei hochladen',
    calendarOk: 'Übernehmen',
    chooseADecade: 'Jahrzehnt wählen',
    chooseAMonth: 'Monat wählen',
    chooseAYear: 'Jahr wählen',
    lastYear: 'Voriges Jahr (Strg + links)',
    nextMonth: 'Nächster Monat (Bild ab)',
    nextYear: 'Nächstes Jahr (Strg + rechts)',
    now: 'Jetzt',
    previousMonth: 'Voriger Monat (Bild auf)',
    today: 'Heute',
    week: 'Woche',
}
const SEEN_IN_ENGLISH = {
    downloadFailed: 'Download Failed!',
    error: 'Error',
    emptyPopup: 'Popup content is empty',
    file: 'File',
    files: 'Files',
    fileTooLarge: 'Maximum File Size Exceeded!',
    mustBeUnder: (file, size) => [file, 'must be under', size],
    uploadFailed: 'File Upload Failed!',
    filesOnly: formats => ['Upload', formats, 'files only'],
    invalidDate: 'Invalid date',
    invalidEmail: 'Invalid email address',
    invalidUrl: 'Invalid URL',
    tooLong: 'Must be less than 100 characters',
    aboveMax: 'Must be maximum 10',
    belowMin: 'Must be minimum 1',
    nextPage: 'Next page',
    off: 'OFF',
    ok: 'Ok',
    on: 'ON',
    page: n => `Page ${n}`,
    pagination: 'Pagination',
    popup: 'Popup',
    previousPage: 'Previous page',
    required: 'Required',
    select: 'Select',
    selectName: 'Select colour',
    selectOrDrop: 'Select or Drop',
    sliderMaximum: 'Price, maximum',
    sliderMinimum: 'Price, minimum',
    tableHasNoData: 'Table has no data!',
    report: 'Report',
    uploadFile: 'Upload File',
    uploadReport: 'Upload Report',
    uploadReportFile: 'Upload Report File',
    calendarOk: 'OK',
    chooseADecade: 'Choose a decade',
    chooseAMonth: 'Choose a month',
    chooseAYear: 'Choose a year',
    lastYear: 'Last year (Control + left)',
    nextMonth: 'Next month (PageDown)',
    nextYear: 'Next year (Control + right)',
    now: 'Now',
    previousMonth: 'Previous month (PageUp)',
    today: 'Today',
    week: 'Week',
}

beforeEach(() => {
    // The module global a component falls back to without a translator: what it is before any document sets it.
    Active.translate = value => value
})

describe.each([
    ['translates them', german, SEEN_IN_GERMAN],
    ['has no translation for them', echo, SEEN_IN_ENGLISH],
    ['passes no translate', undefined, SEEN_IN_ENGLISH],
])('the widget\'s own texts, for a host that %s', (_, translate, seen) => {
    const mount = (meta, data = {}, props = {}) => render(
        <UIRender meta={meta} data={data} initialValues={data} translate={translate} {...props}/>
    )

    describe('in fields', () => {
        it('a select\'s placeholder where the meta gives none', () => {
            // With options, a select shows its first one until the user picks another.
            mount({ view: 'Dropdown', name: 'colour', label: 'Colour', options: [] })
            expect(screen.getByRole('combobox')).toHaveTextContent(new RegExp(`^${seen.select}$`))
        })

        it('the name of a select with no label', () => {
            mount({ view: 'Dropdown', name: 'colour', options: ['Red', 'Blue'] })
            expect(screen.getByRole('combobox', { name: seen.selectName })).toBeInTheDocument()
        })

        it('a toggle\'s two sides where it has no label', () => {
            const { container } = mount({ view: 'Checkbox', type: 'toggle', id: 'flag', value: true, onChange: () => {} })
            expect(container.querySelector('.checkbox__true')).toHaveTextContent(new RegExp(`^${seen.on}$`))
            expect(container.querySelector('.checkbox__false')).toHaveTextContent(new RegExp(`^${seen.off}$`))
        })

        it('the names of a range slider\'s handles', () => {
            mount({ view: 'Input', type: 'slider', name: 'price', label: 'Price', min: 0, max: 100 }, { price: [10, 20] })
            const [lower, upper] = screen.getAllByRole('slider')
            expect(lower).toHaveAccessibleName(seen.sliderMinimum)
            expect(upper).toHaveAccessibleName(seen.sliderMaximum)
        })
    })

    describe('in validation messages', () => {
        /** The message the field `name` shows once the user types `value` in it, and leaves it unless `staying`. */
        const shownFor = (name, value, staying) => {
            const input = document.querySelector(`input[name="${name}"]`)
            fireEvent.focus(input)
            if (value !== undefined) fireEvent.change(input, { target: { value } })
            if (!staying) fireEvent.blur(input)
            return input.closest('.input--wrapper').querySelector('.field-help .error')
        }

        it('a required field left empty', () => {
            mount({ view: 'Input', name: 'title', label: 'Title', validate: 'required' })
            expect(shownFor('title')).toHaveTextContent(new RegExp(`^${seen.required}$`))
        })

        it('a field that holds no email address, and one that holds no URL', () => {
            mount({
                view: 'Col',
                items: [
                    { view: 'Input', name: 'mail', label: 'Mail', validate: 'email' },
                    { view: 'Input', name: 'site', label: 'Site', validate: 'url' },
                ],
            })
            expect(shownFor('mail', 'nobody')).toHaveTextContent(new RegExp(`^${seen.invalidEmail}$`))
            expect(shownFor('site', 'nowhere')).toHaveTextContent(new RegExp(`^${seen.invalidUrl}$`))
        })

        it('a date field left with text that is no date', async () => {
            mount({ view: 'Input', type: 'date', name: 'start', label: 'Start' })
            const shown = shownFor('start', '02-30-2021')
            // rc-picker closes a frame or two after the field is left: inside `act`, which React 16 and 17 ask for.
            await act(() => new Promise(resolve => setTimeout(resolve, 100)))
            expect(shown).toHaveTextContent(new RegExp(`^${seen.invalidDate}$`))
        })

        it('a field that holds more than 100 characters', () => {
            mount({ view: 'Input', name: 'note', label: 'Note', validate: 'maxLength' })
            expect(shownFor('note', 'x'.repeat(101))).toHaveTextContent(new RegExp(`^${seen.tooLong}$`))
        })

        it('a number field below its `min` and above its `max`', () => {
            // While the user types: leaving the field puts its value back between the two.
            mount({ view: 'Input', type: 'number', name: 'qty', label: 'Qty', min: 1, max: 10 })
            expect(shownFor('qty', '0', true)).toHaveTextContent(new RegExp(`^${seen.belowMin}$`))
            expect(shownFor('qty', '11', true)).toHaveTextContent(new RegExp(`^${seen.aboveMax}$`))
        })

        it('what the host\'s `getValidationErrors` is handed, and a required field as "<Field> is Required"', () => {
            const reports = []
            mount({
                view: 'Col',
                items: [
                    { view: 'Input', name: 'title', label: 'Title', validate: 'required' },
                    { view: 'Input', name: 'mail', label: 'Mail', validate: 'email' },
                ],
            }, {}, { getValidationErrors: errors => reports.push(errors) })
            shownFor('title')
            shownFor('mail', 'nobody')

            expect(reports[reports.length - 1]).toEqual({
                title: { messages: [{ text: 'Title is Required' }] },
                mail: { messages: [{ text: seen.invalidEmail }] },
            })
        })
    })

    describe('in a date field\'s calendar', () => {
        const field = { view: 'Input', type: 'date', name: 'start', label: 'Start' }

        /**
         * Opens the calendar of a document of the date field `meta` and hands it to `check`. rc-picker opens and closes
         * it with timers, and React 16, 17 and 19 report each step that lands outside `act`: the timers are fake, every
         * step runs inside one, and the document unmounts before the real timers come back.
         */
        const withCalendar = (meta, check) => {
            jest.useFakeTimers()
            try {
                const view = mount(meta, { start: '2024-03-15' })
                const input = view.container.querySelector('.ui-render-picker input')
                act(() => {
                    fireEvent.mouseDown(input)
                    fireEvent.click(input)
                })
                act(() => { jest.runAllTimers() })
                check(document.querySelector('.ui-render-picker-dropdown'))
                view.unmount()
                act(() => { jest.runAllTimers() })
            } finally {
                jest.useRealTimers()
            }
        }
        const headerNamesOf = calendar => Array.from(
            calendar.querySelectorAll('.ui-render-picker-header button'), button => button.getAttribute('aria-label'),
        )

        it('the names of the buttons over its days, and the link to today under them', () => {
            withCalendar(field, calendar => {
                expect(headerNamesOf(calendar)).toEqual([
                    seen.lastYear, seen.previousMonth, seen.chooseAMonth, seen.chooseAYear, seen.nextMonth, seen.nextYear,
                ])
                expect(calendar.querySelector('.ui-render-picker-footer')).toHaveTextContent(new RegExp(`^${seen.today}$`))
            })
        })

        it('the names of the buttons over its months and over its years', () => {
            withCalendar(field, calendar => {
                fireEvent.click(calendar.querySelector('.ui-render-picker-month-btn'))
                expect(headerNamesOf(calendar)).toEqual([seen.lastYear, seen.chooseAYear, seen.nextYear])

                fireEvent.click(calendar.querySelector('.ui-render-picker-year-btn'))
                expect(headerNamesOf(calendar)).toEqual([seen.lastYear, seen.chooseADecade, seen.nextYear])
            })
        })

        it('what it shows where its meta asks rc-picker for more: week numbers, a button that takes a date, a time', () => {
            withCalendar({ ...field, showWeek: true, needConfirm: true }, calendar => {
                expect(calendar.querySelector('.ui-render-picker-content thead th')).toHaveTextContent(new RegExp(`^${seen.week}$`))
                expect(within(calendar).getByRole('button', { name: seen.calendarOk })).toBeInTheDocument()
            })
            withCalendar({ ...field, showTime: true }, calendar => {
                expect(calendar.querySelector('.ui-render-picker-now-btn')).toHaveTextContent(new RegExp(`^${seen.now}$`))
            })
        })
    })

    describe('in tables', () => {
        it('a table with no headers and no rows', () => {
            const { container } = mount({ view: 'Table', name: 'rows' }, { rows: [] })
            expect(container).toHaveTextContent(seen.tableHasNoData)
        })

        it('the names of its page navigation and of its buttons', () => {
            mount(
                { view: 'Table', name: 'rows', usePagination: true, rowsPerPage: 1, headers: [{ id: 'n', label: 'N' }] },
                { rows: [{ n: 1 }, { n: 2 }, { n: 3 }] },
            )
            const pager = screen.getByRole('navigation', { name: seen.pagination })
            expect(within(pager).getAllByRole('button').map(button => button.getAttribute('aria-label'))).toEqual([
                seen.previousPage, seen.page(1), seen.page(2), seen.page(3), seen.nextPage,
            ])
        })
    })

    describe('in popups', () => {
        it('the Ok that closes one, and the name of one with no title and no message', () => {
            mount({
                view: 'Col',
                items: [
                    { view: 'Popup', id: 'info', items: [{ view: 'Text', children: 'Body' }] },
                    { view: 'Button', children: 'Open', onClick: 'popupOpen,info' },
                ],
            })
            fireEvent.click(screen.getByRole('button', { name: 'Open' }))

            const dialog = screen.getByRole('dialog', { name: seen.popup })
            expect(within(dialog).getByRole('button', { name: seen.ok })).toBeInTheDocument()
        })

        it('the title and the message of a template popup with no items', async () => {
            const consoleError = jest.spyOn(console, 'error').mockImplementation(() => {})
            mount({
                view: 'Table',
                name: 'notes',
                headers: [{ id: 'text', label: 'Note' }, { id: 'actions', label: 'Actions' }],
                renderItemCells: {
                    view: 'TableCells',
                    items: [
                        { view: 'Text', name: 'text' },
                        {
                            view: 'Col',
                            items: [
                                { view: 'Button', children: 'Open note', onClick: { name: 'popupOpen', args: ['note.{index}'] } },
                                { view: 'Popup', id: 'note.{index}', items: [] },
                            ],
                        },
                    ],
                },
            }, { notes: [{ text: 'First' }] })
            fireEvent.click(screen.getByRole('button', { name: 'Open note' }))

            const dialog = await screen.findByRole('dialog', { name: seen.error })
            expect(dialog).toHaveTextContent(seen.emptyPopup)
            expect(consoleError).toHaveBeenCalledWith('Popup items are empty or invalid:', [])
            consoleError.mockRestore()
        })

        it('the message of a failed download, under the reason the host gives', async () => {
            mount(
                { view: 'Button', children: 'Download', onClick: { name: 'download', args: ['report.csv'] } },
                {},
                { apiCalls: { downloadFile: () => Promise.reject(new Error('Offline')) } },
            )
            await act(async () => {
                fireEvent.click(screen.getByRole('button', { name: 'Download' }))
                await new Promise(resolve => setTimeout(resolve, 0))
            })

            const dialog = await screen.findByRole('dialog', { name: 'Offline' })
            expect(dialog).toHaveTextContent(seen.downloadFailed)
        })
    })

    describe('in uploads', () => {
        const dropzoneOf = container => container.querySelector('.upload__dropzone')
        const shownIn = container => dropzoneOf(container).querySelector('.text.p.margin-top-smallest')
        const hoverIn = container => dropzoneOf(container).querySelector('.dropzone__hover .margin-bottom-smaller')
        /** Each text a popup's body shows, in order. */
        const piecesOf = dialog => Array.from(dialog.querySelectorAll('.app__popup__box__body .text'), text => text.textContent)

        it('what one the meta names nothing takes: its header, its drop zone and its hover text', () => {
            const { container } = mount({ view: 'Input', type: 'file', name: 'attachment', hasHeader: true })

            expect(container.querySelector('.app__upload h2')).toHaveTextContent(new RegExp(`^${seen.uploadFile}$`))
            expect(shownIn(container).textContent).toBe(`${seen.selectOrDrop}${seen.files}`)
            // It read "Upload File File" until 2026-10-23.
            expect(hoverIn(container)).toHaveTextContent(new RegExp(`^${seen.uploadFile}$`))
        })

        it('what one that takes a single file takes', () => {
            const { container } = mount({ view: 'Input', type: 'file', name: 'attachment', multiple: false })
            expect(shownIn(container).textContent).toBe(`${seen.selectOrDrop}${seen.file}`)
        })

        it('a label the meta gives, translated, and not put in the English plural', () => {
            const { container } = mount({ view: 'Input', type: 'file', name: 'attachment', label: 'Report', hasHeader: true })

            expect(container.querySelector('.app__upload h2')).toHaveTextContent(new RegExp(`^${seen.uploadReport}$`))
            // It read "Reports" until 2026-10-23, and a translated label got the English plural ending too.
            expect(shownIn(container).textContent).toBe(`${seen.selectOrDrop}${seen.report}`)
            expect(hoverIn(container)).toHaveTextContent(new RegExp(`^${seen.uploadReportFile}$`))
        })

        /**
         * The popup a drop of `file` asks for, shown by the document's popup with the upload's translator. The upload
         * opens none in a document, as it never has: it hands the popup its title and content and leaves it closed.
         */
        const popupFor = (props, file) => {
            const states = []
            const { container } = render(
                <ConfigContext.Provider value={initialConfigState}>
                    <AppContext.Provider value={{ ...initialAppState, setPopupState: state => states.push(state) }}>
                        <Upload name="attachment" translate={translate} {...props}/>
                    </AppContext.Provider>
                </ConfigContext.Provider>
            )
            fireEvent.drop(dropzoneOf(container), { dataTransfer: { files: [file] } })
            expect(states).toHaveLength(1)
            // The popup's root is the container of what renders it, so the cleanup after each test removes both.
            const popupRoot = document.body.appendChild(document.createElement('div'))
            render(
                <ConfigContext.Provider value={initialConfigState}>
                    <AppContext.Provider value={{ ...initialAppState, ...states[0], isOpen: true, popupRoot }}>
                        <Modal translate={translate}/>
                    </AppContext.Provider>
                </ConfigContext.Provider>,
                { container: popupRoot },
            )
            return within(popupRoot).getByRole('dialog')
        }

        it('the popup a file larger than its `maxSize` asks for', () => {
            const dialog = popupFor(
                { formats: ['csv'], maxSize: 1024 },
                new File(['x'.repeat(2048)], 'big.csv', { type: 'text/csv' }),
            )

            expect(dialog).toHaveAccessibleName(seen.fileTooLarge)
            expect(piecesOf(dialog)).toEqual(seen.mustBeUnder('big.csv', '1kB'))
        })

        it('the popup a file of a type it does not take asks for', () => {
            const dialog = popupFor({ formats: ['png'] }, new File(['plain text'], 'notes.txt', { type: 'text/plain' }))

            expect(dialog).toHaveAccessibleName(seen.uploadFailed)
            expect(piecesOf(dialog)).toEqual(seen.filesOnly('.png'))
        })
    })
})

describe('the widget\'s own texts, as a host\'s translate is asked for them', () => {
    beforeEach(() => {
        Active.translate = value => value
    })

    it('is asked for each by its key, and no longer for the English words it was asked for', () => {
        const asked = []
        const translate = value => {
            asked.push(value)
            return value
        }
        render(
            <UIRender
                meta={{
                    view: 'Col',
                    items: [
                        { view: 'Select', name: 'colour', label: 'Colour', options: ['Red'] },
                        { view: 'Checkbox', type: 'toggle', id: 'flag', value: true, onChange: () => {} },
                        { view: 'Popup', id: 'info', items: [{ view: 'Text', children: 'Body' }] },
                        { view: 'Button', children: 'Open', onClick: 'popupOpen,info' },
                        { view: 'Input', name: 'title', label: 'Title', validate: 'required' },
                    ],
                }}
                data={{}}
                translate={translate}
            />
        )
        fireEvent.click(screen.getByRole('button', { name: 'Open' }))
        const input = document.querySelector('input[name="title"]')
        fireEvent.focus(input)
        fireEvent.blur(input)

        expect(asked).toEqual(expect.arrayContaining([
            'ui-render:SELECT', 'ui-render:ON', 'ui-render:OFF', 'ui-render:OK', 'ui-render:REQUIRED',
        ]))
        ;['Select', 'ON', 'OFF', 'Ok', 'Required'].forEach(word => expect(asked).not.toContain(word))
    })

    it('shows what it answers once: the answer is not translated again', async () => {
        const asked = []
        const translate = value => {
            asked.push(value)
            return value === 'ui-render:REQUIRED' ? 'Pflichtfeld' : value
        }
        render(<UIRender meta={{ view: 'Input', name: 'title', label: 'Title', validate: 'required' }} data={{}} translate={translate}/>)
        const input = document.querySelector('input[name="title"]')
        fireEvent.focus(input)
        fireEvent.blur(input)

        await waitFor(() => expect(document.querySelector('.field-help .error')).toHaveTextContent('Pflichtfeld'))
        expect(asked).not.toContain('Pflichtfeld')
    })
})
