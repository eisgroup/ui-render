/**
 * A HOST SWITCHES LANGUAGE WHILE A DOCUMENT IS ON THE PAGE.
 * =============================================================================================
 *
 * An i18next-based host keeps one `t` for the life of the page and changes what it answers: the function a
 * document is handed never changes. So it passes its current language along, as `language`, and the
 * document renders again everything it translated, in the new language, without a remount: the form keeps
 * its values, its touched fields and the errors it shows.
 *
 * Measured on the code before 2026-10-23, with the host switching as it does here:
 * - the field's label, its placeholder and the select's options stayed in the old language. Every field is
 *   memoised, and its props, the translator among them, were the same objects as before;
 * - what a `Text` shows changed, only because `AppProvider` made new context values on every render, which
 *   rendered every `Text` again whenever the host rendered;
 * - a new `translate` was ignored: the document made its translator once, in its constructor;
 * - a remount through `key` showed the new language, and lost the typed values, the touched fields and the
 *   errors shown.
 */
import React from 'react'
import { fireEvent, render, screen, within } from '@testing-library/react'
import '@testing-library/jest-dom'
import UIRender from '../main'
import { Active } from '../../core/utils'

const RESOURCES = {
    en: {},
    de: {
        // The meta's texts.
        Colour: 'Farbe',
        Details: 'Einzelheiten',
        Done: 'Erledigt',
        Extra: 'Zusatz',
        Mail: 'E-Mail',
        Name: 'Bezeichnung',
        Note: 'Notiz',
        Open: 'Öffnen',
        Red: 'Rot',
        Blue: 'Blau',
        Title: 'Titel',
        'Type a title': 'Titel eingeben',
        // The built-in phrases.
        'ui-render:ERROR': 'Fehler',
        'ui-render:INVALID_EMAIL_ADDRESS': 'Ungültige E-Mail-Adresse',
        'ui-render:NO': 'Nein',
        'ui-render:OK': 'Verstanden',
        'ui-render:POPUP_CONTENT_IS_EMPTY': 'Der Dialog ist leer',
        'ui-render:REQUIRED': 'Pflichtfeld',
        'ui-render:TOTAL': 'Gesamt',
        'ui-render:YES': 'Ja',
    },
    fr: {
        Name: 'Nom',
        Title: 'Titre',
        'ui-render:TOTAL': 'Somme',
        'ui-render:YES': 'Oui',
    },
}

/** An i18next-based host's i18n: one `t`, which answers in the language the i18n is in now. */
function createI18n (language) {
    const i18n = { language }
    i18n.t = key => (key in RESOURCES[i18n.language] ? RESOURCES[i18n.language][key] : key)
    return i18n
}

/** A `t` fixed to one language, as i18next's `getFixedT` makes one: a host that hands a new one to switch. */
const fixedT = language => key => (key in RESOURCES[language] ? RESOURCES[language][key] : key)

const meta = {
    view: 'Col',
    items: [
        { view: 'Input', name: 'title', label: 'Title', placeholder: 'Type a title', validate: 'required' },
        { view: 'Input', name: 'note', label: 'Note' },
        { view: 'Input', name: 'mail', label: 'Mail', validate: 'email' },
        { view: 'Select', name: 'colour', label: 'Colour', options: ['Red', 'Blue'] },
        { view: 'Text', name: 'done' },
        { view: 'Table', name: 'rows', headers: [{ id: 'name', label: 'Name' }, { id: 'done', label: 'Done' }] },
        { view: 'PieChart', name: 'slices' },
        { view: 'Popup', id: 'details', title: 'Details', items: [{ view: 'Input', name: 'extra', label: 'Extra' }] },
        { view: 'Button', children: 'Open', onClick: 'popupOpen,details' },
    ],
}
const data = { done: true, rows: [{ name: 'First', done: false }], slices: [{ name: 'Part', value: 1 }] }

const input = name => document.querySelector(`input[name="${name}"]`)
const labelOf = name => document.querySelector(`label[for="${name}"]`)
const errorOf = name => input(name).closest('.input--wrapper').querySelector('.field-help .error')

/** What the user does before the switch: types a note, leaves the title empty, an address wrong, and opens the popup. */
function fillInAndOpen () {
    fireEvent.focus(input('title'))
    fireEvent.blur(input('title'))
    fireEvent.focus(input('note'))
    fireEvent.change(input('note'), { target: { value: 'Hello' } })
    fireEvent.blur(input('note'))
    fireEvent.focus(input('mail'))
    fireEvent.change(input('mail'), { target: { value: 'nobody' } })
    fireEvent.blur(input('mail'))
    fireEvent.click(screen.getByRole('button', { name: 'Open' }))
}

/** The texts the document shows, each where it shows it. */
function shown () {
    const select = screen.getByRole('combobox')
    const dialog = screen.getByRole('dialog')
    return {
        label: labelOf('title').textContent,
        placeholder: input('title').getAttribute('placeholder'),
        select: select.textContent,
        selectName: select.getAttribute('aria-label'),
        headers: screen.getAllByRole('columnheader').map(cell => cell.textContent),
        cell: screen.getAllByRole('cell').map(cell => cell.textContent),
        required: errorOf('title').textContent,
        invalidMail: errorOf('mail').textContent,
        dialogName: dialog.getAttribute('aria-labelledby') ? document.getElementById(dialog.getAttribute('aria-labelledby')).textContent : null,
        dialogOk: within(dialog).getAllByRole('button').map(button => button.textContent),
        dialogField: within(dialog).getByText(/^(Extra|Zusatz)$/).textContent,
    }
}

const IN_ENGLISH = {
    label: 'Title',
    placeholder: 'Type a title',
    select: 'Red',
    selectName: 'Colour',
    headers: ['Name', 'Done'],
    cell: ['First', 'No'],
    required: 'Required',
    invalidMail: 'Invalid email address',
    dialogName: 'Details',
    dialogOk: ['Ok'],
    dialogField: 'Extra',
}
const IN_GERMAN = {
    label: 'Titel',
    placeholder: 'Titel eingeben',
    select: 'Rot',
    selectName: 'Farbe',
    headers: ['Bezeichnung', 'Erledigt'],
    cell: ['First', 'Nein'],
    required: 'Pflichtfeld',
    invalidMail: 'Ungültige E-Mail-Adresse',
    dialogName: 'Einzelheiten',
    dialogOk: ['Verstanden'],
    dialogField: 'Zusatz',
}

beforeEach(() => {
    // The module global a component falls back to without a translator: what it is before any document sets it.
    Active.translate = value => value
})

describe.each([
    ['', React.Fragment],
    [' under StrictMode', React.StrictMode],
])('a switch of `language`%s', (_, Wrapper) => {
    it('shows every text the document translated in the new language', () => {
        const i18n = createI18n('en')
        const host = language => (
            <Wrapper>
                <UIRender meta={meta} data={data} initialValues={data} translate={i18n.t} language={language}/>
            </Wrapper>
        )
        const view = render(host('en'))
        fillInAndOpen()
        expect(shown()).toEqual(IN_ENGLISH)
        expect(screen.getByText('Yes')).toBeInTheDocument()
        expect(screen.getByText('Total')).toBeInTheDocument()

        i18n.language = 'de'
        view.rerender(host('de'))

        expect(shown()).toEqual(IN_GERMAN)
        expect(screen.getByText('Ja')).toBeInTheDocument()
        expect(screen.getByText('Gesamt')).toBeInTheDocument()
        // Each option, and not only the one the select shows.
        fireEvent.click(screen.getByRole('combobox'))
        expect(screen.getAllByRole('option').map(option => option.textContent)).toEqual(['Rot', 'Blau'])
    })

    it('keeps the form as it was: the values, the touched fields and the errors shown', () => {
        const i18n = createI18n('en')
        let readForms
        const changes = []
        const host = language => (
            <Wrapper>
                <UIRender
                    meta={meta} data={data} initialValues={data} translate={i18n.t} language={language}
                    getFormData={read => { readForms = read }} onDataChanged={() => changes.push('changed')}
                />
            </Wrapper>
        )
        const view = render(host('en'))
        fillInAndOpen()
        const note = input('note')
        const changed = changes.length

        i18n.language = 'de'
        view.rerender(host('de'))

        // The same element: nothing remounted.
        expect(input('note')).toBe(note)
        expect(note).toHaveValue('Hello')
        expect(readForms()).toEqual(expect.objectContaining({ note: 'Hello', mail: 'nobody' }))
        // A field shows its error once it is touched: these two still do, so they are still touched.
        expect(errorOf('title')).toHaveTextContent('Pflichtfeld')
        expect(errorOf('mail')).toHaveTextContent('Ungültige E-Mail-Adresse')
        // An untouched field still shows none.
        expect(input('extra').closest('.input--wrapper').querySelector('.field-help')).toBeNull()
        expect(changes).toHaveLength(changed)
    })
})

/**
 * The two ways a host switches: one `t` whose answers change, with `language`, and a new `translate` with no
 * `language`. What each mounts with, and what it rerenders with to switch to German.
 */
const SWITCHES = [
    ['a switch of `language`', () => {
        const i18n = createI18n('en')
        return { props: { translate: i18n.t, language: 'en' }, toGerman: () => { i18n.language = 'de'; return { translate: i18n.t, language: 'de' } } }
    }],
    ['a new `translate`', () => ({ props: { translate: fixedT('en') }, toGerman: () => ({ translate: fixedT('de') }) })],
]

describe.each(SWITCHES)('%s, in a table\'s draft row', (_, switching) => {
    it('shows the row\'s label, placeholder and button in the new language, and keeps what the user typed', () => {
        // A `localDraft` row keeps what the user types in its own state, and reads its document's translator.
        const draftMeta = {
            view: 'Table',
            name: 'rows',
            headers: [{ id: 'name', label: 'Name' }, { id: 'add', label: '' }],
            renderExtraItem: {
                view: 'Data',
                kind: 'rows',
                localDraft: true,
                meta: {
                    view: 'TableCells',
                    items: [
                        { view: 'Input', name: 'name', label: 'Title', placeholder: 'Type a title' },
                        { view: 'Button', onClick: 'addData', children: 'Open' },
                    ],
                },
            },
        }
        const draftData = { rows: [] }
        const { props, toGerman } = switching()
        const host = translation => <UIRender meta={draftMeta} data={draftData} initialValues={draftData} {...translation}/>
        const view = render(host(props))
        const draft = screen.getByRole('textbox')
        fireEvent.change(draft, { target: { value: 'Second' } })
        expect(labelOf(draft.id)).toHaveTextContent('Title')
        expect(draft).toHaveAttribute('placeholder', 'Type a title')
        expect(screen.getByRole('button')).toHaveTextContent('Open')

        view.rerender(host(toGerman()))

        expect(screen.getByRole('textbox')).toBe(draft)
        expect(draft).toHaveValue('Second')
        expect(labelOf(draft.id)).toHaveTextContent('Titel')
        expect(draft).toHaveAttribute('placeholder', 'Titel eingeben')
        expect(screen.getByRole('button')).toHaveTextContent('Öffnen')
    })
})

describe.each(SWITCHES)('%s, while a popup the engine opened is open', (_, switching) => {
    it('shows the message the engine wrote in it in the new language', () => {
        // A template popup with no items opens with the engine's own title and message.
        const consoleError = jest.spyOn(console, 'error').mockImplementation(() => {})
        const popupMeta = {
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
                            { view: 'Button', children: 'Open', onClick: { name: 'popupOpen', args: ['note.{index}'] } },
                            { view: 'Popup', id: 'note.{index}', items: [] },
                        ],
                    },
                ],
            },
        }
        const popupData = { notes: [{ text: 'First' }] }
        const { props, toGerman } = switching()
        const host = translation => <UIRender meta={popupMeta} data={popupData} initialValues={popupData} {...translation}/>
        const view = render(host(props))
        fireEvent.click(screen.getByRole('button', { name: 'Open' }))
        expect(screen.getByRole('dialog', { name: 'Error' })).toHaveTextContent('Popup content is empty')

        view.rerender(host(toGerman()))

        // Until 2026-10-23 the message kept the language the popup opened in.
        const dialog = screen.getByRole('dialog', { name: 'Fehler' })
        expect(dialog).toHaveTextContent('Der Dialog ist leer')
        expect(within(dialog).getByRole('button')).toHaveTextContent('Verstanden')
        expect(consoleError).toHaveBeenCalledWith('Popup items are empty or invalid:', [])
        consoleError.mockRestore()
    })
})

describe('a new `translate`, with no `language`', () => {
    it('shows every text the document translated in the language of the new one', () => {
        const host = translate => <UIRender meta={meta} data={data} initialValues={data} translate={translate}/>
        const view = render(host(fixedT('en')))
        fillInAndOpen()
        expect(shown()).toEqual(IN_ENGLISH)

        view.rerender(host(fixedT('de')))

        expect(shown()).toEqual(IN_GERMAN)
        expect(screen.getByText('Ja')).toBeInTheDocument()
        expect(screen.getByText('Gesamt')).toBeInTheDocument()
        expect(input('note')).toHaveValue('Hello')
    })
})

describe('what the host\'s `getValidationErrors` holds', () => {
    it('is told again in the new language, but for the required field, which reads the same in any', () => {
        const i18n = createI18n('en')
        const reports = []
        const host = language => (
            <UIRender
                meta={meta} data={data} initialValues={data} translate={i18n.t} language={language}
                getValidationErrors={errors => reports.push(errors)}
            />
        )
        const view = render(host('en'))
        fillInAndOpen()
        expect(reports[reports.length - 1]).toEqual({
            title: { messages: [{ text: 'Title is Required' }] },
            mail: { messages: [{ text: 'Invalid email address' }] },
        })
        const told = reports.length

        i18n.language = 'de'
        view.rerender(host('de'))

        expect(reports).toHaveLength(told + 1)
        expect(reports[told]).toEqual({
            title: { messages: [{ text: 'Title is Required' }] },
            mail: { messages: [{ text: 'Ungültige E-Mail-Adresse' }] },
        })
    })

    it('is not told again when it reads the same in the new language, or holds nothing', () => {
        const i18n = createI18n('en')
        const reports = []
        const requiredOnly = { view: 'Input', name: 'title', label: 'Title', validate: 'required' }
        const host = (language, shownMeta) => (
            <UIRender
                meta={shownMeta} data={{}} initialValues={{}} translate={i18n.t} language={language}
                getValidationErrors={errors => reports.push(errors)}
            />
        )
        const view = render(host('en', requiredOnly))
        fireEvent.focus(input('title'))
        fireEvent.blur(input('title'))
        expect(reports).toEqual([{ title: { messages: [{ text: 'Title is Required' }] } }])

        i18n.language = 'de'
        view.rerender(host('de', requiredOnly))
        expect(reports).toHaveLength(1)

        // A document whose host has heard nothing hears nothing of a switch either.
        view.unmount()
        const quiet = render(host('en', { view: 'Input', name: 'note', label: 'Note' }))
        reports.length = 0
        i18n.language = 'fr'
        quiet.rerender(host('fr', { view: 'Input', name: 'note', label: 'Note' }))
        expect(reports).toEqual([])
    })
})

describe('two documents in different languages', () => {
    const tableMeta = {
        view: 'Col',
        items: [
            { view: 'Input', name: 'title', label: 'Title' },
            { view: 'Table', name: 'rows', headers: [{ id: 'name', label: 'Name' }, { id: 'done', label: 'Done' }] },
            { view: 'PieChart', name: 'slices' },
        ],
    }
    const tableData = { rows: [{ name: 'First', done: true }], slices: [{ name: 'Part', value: 1 }] }
    const Page = ({ first, second }) => (
        <>
            <section data-testid="first">
                <UIRender meta={tableMeta} data={tableData} initialValues={tableData} translate={first.i18n.t} language={first.language}/>
            </section>
            <section data-testid="second">
                <UIRender meta={tableMeta} data={tableData} initialValues={tableData} translate={second.i18n.t} language={second.language}/>
            </section>
        </>
    )
    const textsOf = id => {
        const section = screen.getByTestId(id)
        return {
            label: section.querySelector('label').textContent,
            headers: within(section).getAllByRole('columnheader').map(cell => cell.textContent),
            // The boolean in the row, which its `Text` is handed no translator for.
            cells: within(section).getAllByRole('cell').map(cell => cell.textContent),
            total: section.textContent.includes('Gesamt') ? 'Gesamt' : (section.textContent.includes('Somme') ? 'Somme' : 'Total'),
        }
    }

    it('stay apart, at mount and when one of them switches', () => {
        const first = { i18n: createI18n('de'), language: 'de' }
        const second = { i18n: createI18n('fr'), language: 'fr' }
        const view = render(<Page first={first} second={second}/>)
        expect(textsOf('first')).toEqual({ label: 'Titel', headers: ['Bezeichnung', 'Erledigt'], cells: ['First', 'Ja'], total: 'Gesamt' })
        expect(textsOf('second')).toEqual({ label: 'Titre', headers: ['Nom', 'Done'], cells: ['First', 'Oui'], total: 'Somme' })

        first.i18n.language = 'en'
        view.rerender(<Page first={{ ...first, language: 'en' }} second={second}/>)

        expect(textsOf('first')).toEqual({ label: 'Title', headers: ['Name', 'Done'], cells: ['First', 'Yes'], total: 'Total' })
        expect(textsOf('second')).toEqual({ label: 'Titre', headers: ['Nom', 'Done'], cells: ['First', 'Oui'], total: 'Somme' })
    })

    it('stay apart when the page renders again', () => {
        // A value's `Text` took the module global, the translator of the document constructed last, until
        // 2026-10-23, and every `Text` rendered again whenever the host did: measured, the first document's
        // `Ja` read `Oui` once the page rendered again.
        const first = { i18n: createI18n('de'), language: 'de' }
        const second = { i18n: createI18n('fr'), language: 'fr' }
        const view = render(<Page first={first} second={second}/>)

        view.rerender(<Page first={first} second={second}/>)

        expect(textsOf('first').cells).toEqual(['First', 'Ja'])
        expect(textsOf('second').cells).toEqual(['First', 'Oui'])
    })
})
