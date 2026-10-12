/**
 * SEVERAL DOCUMENTS ON ONE PAGE, each mounted through the published entry, as a host mounts them.
 * =============================================================================================
 *
 * What one document owns, it must own on a page that holds another. The form, the validation errors and
 * the popup shell are pinned elsewhere (`rules.two-instances*.test.js`, `popup-root.two-instances.test.js`);
 * this file pins the two that leaked until 2026-10-09, both measured by the 2026-10-08 audit:
 *
 * - THE IDS A FIELD DERIVES FROM ITS NAME. `Input`, `InputNumber` and `InputDate` took `name` for an id,
 *   so two documents with the same fields rendered the same ids, and a `<label for>` finds the first
 *   element with its id: the second document's labels named the first document's fields, and clicking
 *   one changed the other document's data. Each derived id now stays unique on the page, as a
 *   `Checkbox`'s already did: the field that has it first keeps it, and another takes the next free
 *   `<id>-2`, `<id>-3`. A document that repeats no name renders the ids it rendered before; one that
 *   repeats one, as the nested rows of the `nestedDataKind` example do, numbers the repeats now. An id the
 *   meta gives is the host's, and is left as it is.
 * - THE POPUP'S OWN TEXT. A popup's title, message and Ok button were translated with the translator of
 *   the document constructed LAST, whichever document opened it, while its content used its own.
 */
import React from 'react'
import { fireEvent, render, within } from '@testing-library/react'
import '@testing-library/jest-dom'
import UIRender from '../main'

const fieldsMeta = {
    view: 'Col',
    items: [
        { view: 'Input', name: 'title', label: 'Title' },
        { view: 'Input', type: 'number', name: 'qty', label: 'Quantity' },
        { view: 'Input', type: 'date', name: 'start', label: 'Start' },
        { view: 'Input', type: 'checkbox', name: 'agree', label: 'Agree' },
        { view: 'Input', type: 'toggle', name: 'flag', label: 'Flag' },
    ],
}
const fieldsData = { agree: false, flag: false }

/** Documents with the same meta side by side, each in a section named after it: A and B, or the `single` one. */
const Page = ({ meta, propsOf = () => ({}), single }) => (
    <>
        {['A', 'B'].filter(id => !single || id === single).map(id => (
            <section key={id} id={id}>
                <UIRender meta={meta} data={fieldsData} initialValues={fieldsData} {...propsOf(id)} />
            </section>
        ))}
    </>
)
const renderTwo = (meta, propsOf) => render(<Page meta={meta} propsOf={propsOf} />)

const sectionOf = element => element && element.closest('section') && element.closest('section').id

describe('two documents with the same fields', () => {
    it('render no id twice on the page', () => {
        renderTwo(fieldsMeta)
        const ids = Array.from(document.querySelectorAll('[id]'), element => element.id)
        const repeated = ids.filter((id, index) => ids.indexOf(id) !== index)
        expect(repeated).toEqual([])
    })

    it('leave the first document the ids it renders alone', () => {
        renderTwo(fieldsMeta)
        const a = document.getElementById('A')
        expect(a.querySelector('input[name="title"]')).toHaveAttribute('id', 'title')
        expect(a.querySelector('input[name="qty"]')).toHaveAttribute('id', 'qty')
        expect(a.querySelector('input[name="agree"]')).toHaveAttribute('id', 'agree')
        expect(a.querySelector('.rc-picker input, .ui-render-picker input')).toHaveAttribute('id', 'start')
        expect(a.querySelector('[id^="render-popup-root"]')).toHaveAttribute('id', 'render-popup-root')

        const b = document.getElementById('B')
        expect(b.querySelector('input[name="title"]')).toHaveAttribute('id', 'title-2')
        expect(b.querySelector('[id^="render-popup-root"]')).toHaveAttribute('id', 'render-popup-root-2')
    })

    it('point every label at a field of its own document', () => {
        renderTwo(fieldsMeta)
        for (const id of ['A', 'B']) {
            const labels = Array.from(document.getElementById(id).querySelectorAll('label[for]'))
            expect(labels.length).toBeGreaterThanOrEqual(5)
            const targets = labels.map(label => `${label.htmlFor} -> ${sectionOf(document.getElementById(label.htmlFor))}`)
            expect(targets).toEqual(labels.map(label => `${label.htmlFor} -> ${id}`))
        }
    })

    it('change only their own data when a label is clicked', () => {
        renderTwo(fieldsMeta)
        const boxOf = id => within(document.getElementById(id)).getByRole('checkbox', { name: 'Agree' })

        fireEvent.click(within(document.getElementById('B')).getByText('Agree'))
        expect(boxOf('B')).toBeChecked()
        expect(boxOf('A')).not.toBeChecked()

        fireEvent.click(within(document.getElementById('A')).getByText('Agree'))
        expect(boxOf('A')).toBeChecked()
        expect(boxOf('B')).toBeChecked()
    })

    it('leave an id the meta gives as it is, even when it repeats', () => {
        const given = { view: 'Col', items: [{ view: 'Input', name: 'title', id: 'given', label: 'Title' }] }
        renderTwo(given)
        expect(document.querySelectorAll('[id="given"]')).toHaveLength(2)
    })

    it('keep the ids they took when the first document goes', () => {
        const { rerender } = renderTwo(fieldsMeta)
        // The second keeps the id it has: renaming a mounted field would move a host's references under it.
        rerender(<Page meta={fieldsMeta} single="B" />)
        expect(document.getElementById('A')).toBeNull()
        expect(document.getElementById('B').querySelector('input[name="title"]')).toHaveAttribute('id', 'title-2')
        expect(document.querySelectorAll('[id="title"]')).toHaveLength(0)
    })
})

describe('a popup on a page with two documents', () => {
    const popupMeta = {
        view: 'Col',
        items: [
            { view: 'Popup', id: 'p1', title: 'Heading', items: [{ view: 'Text', children: 'Body' }] },
            { view: 'Button', children: 'Open', onClick: 'popupOpen,p1' },
        ],
    }
    const translators = { A: value => `A:${value}`, B: value => `B:${value}` }

    it.each(['A', 'B'])('is translated by the document that opened it, %s', id => {
        renderTwo(popupMeta, name => ({ translate: translators[name] }))
        const section = document.getElementById(id)
        fireEvent.click(within(section).getByRole('button', { name: `${id}:Open` }))

        const dialog = within(section).getByRole('dialog')
        expect(dialog.querySelector('.app__popup__box__header__title')).toHaveTextContent(`${id}:Heading`)
        expect(dialog.querySelector('.app__popup__box__body')).toHaveTextContent(`${id}:Body`)
        expect(within(dialog).getByRole('button', { name: `${id}:Ok` })).toBeInTheDocument()
    })
})
