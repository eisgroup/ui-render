// fetch is referenced in rules.js (FIELD.FUNC[FETCH] = fetch); stub it for jsdom before any import.
// eslint-disable-next-line no-undef
if (typeof global.fetch === 'undefined') {
    // eslint-disable-next-line no-undef
    global.fetch = () => Promise.resolve({ json: () => Promise.resolve({}) })
}
import React from 'react' // eslint-disable-line import/first
import { render } from '@testing-library/react' // eslint-disable-line import/first
import '@testing-library/jest-dom' // eslint-disable-line import/first
// Force form module to load before rules.js triggers the cycle via mapper → renders.js
import '../../../modules/form/utils' // eslint-disable-line import/first
import UIRender from '../rules' // eslint-disable-line import/first
import { ConfigContext, initialConfigState } from '../../../contexts/ConfigContext' // eslint-disable-line import/first
import { AppContext } from '../../../contexts' // eslint-disable-line import/first
import { Active } from '../../../utils' // eslint-disable-line import/first

const popup = { setPopupState: () => {}, popup: { setPopupState: () => {} } }
const originalTranslate = Active.translate
const wrap = (ui) => (
    <ConfigContext.Provider value={initialConfigState}>
        <AppContext.Provider value={popup}>{ui}</AppContext.Provider>
    </ConfigContext.Provider>
)

afterEach(() => {
    Active.translate = originalTranslate
})

describe('UIRender (smoke)', () => {
    it('renders a simple Text view from meta + data', () => {
        const meta = { view: 'Text', children: 'Hello' }
        const data = { foo: 'bar' }
        const { container } = render(wrap(<UIRender meta={meta} data={data} />))
        expect(container.textContent).toContain('Hello')
    })

    it('renders a Row with nested Text items', () => {
        const meta = {
            view: 'Row',
            items: [
                { view: 'Text', children: 'A' },
                { view: 'Text', children: 'B' },
            ],
        }
        const { container } = render(wrap(<UIRender meta={meta} data={{}} />))
        expect(container.textContent).toContain('A')
        expect(container.textContent).toContain('B')
        expect(container.querySelector('.flex--row')).toBeInTheDocument()
    })

    it('embedded mode renders without ScrollView wrapper', () => {
        const meta = { view: 'Text', children: 'Embedded' }
        const { container } = render(wrap(<UIRender meta={meta} data={{}} embedded />))
        expect(container.textContent).toContain('Embedded')
    })

    it('renders nothing when meta has no view', () => {
        const meta = { items: [] }
        const { container } = render(wrap(<UIRender meta={meta} data={{}} />))
        // Container renders ScrollView but content is empty
        expect(container.querySelector('.ui__render')).toBeInTheDocument()
    })

    it('passes initialValues through to Form', () => {
        const meta = { view: 'Text', children: 'X' }
        const { container } = render(
            wrap(<UIRender meta={meta} data={{ a: 1 }} initialValues={{ a: 1 }} />)
        )
        expect(container.textContent).toContain('X')
    })

    it('renders Title view with h3 class', () => {
        const meta = { view: 'Title', children: 'My Title' }
        const { container } = render(wrap(<UIRender meta={meta} data={{}} />))
        expect(container.querySelector('.h3')).toBeInTheDocument()
        expect(container.textContent).toContain('My Title')
    })

    it('handles meta.currencyCode by exposing it in state', () => {
        const meta = { view: 'Text', children: 'X', currencyCode: 'EUR' }
        const { container } = render(wrap(<UIRender meta={meta} data={{}} />))
        expect(container.textContent).toContain('X')
    })

    it('calls translate prop for strings', () => {
        const translate = (s) => `tr:${s}`
        const meta = { view: 'Text', children: 'Hello' }
        const { container } = render(wrap(<UIRender meta={meta} data={{}} translate={translate} />))
        expect(container.textContent).toContain('tr:Hello')
    })

    it('renders an Input field bound to a form (with initialValues)', () => {
        const meta = {
            view: 'Input',
            name: 'firstName',
            label: 'First name',
        }
        const { container } = render(
            wrap(
                <UIRender
                    meta={meta}
                    data={{ firstName: 'Alice' }}
                    initialValues={{ firstName: 'Alice' }}
                    form
                />
            )
        )
        expect(container.textContent).toContain('First name')
        const input = container.querySelector('input')
        expect(input).toBeInTheDocument()
    })

    it('renders a Table from meta with data items', () => {
        const meta = {
            view: 'Table',
            name: 'rows',
            headers: [
                { id: 'name', label: 'Name' },
                { id: 'amount', label: 'Amount' },
            ],
        }
        const data = { rows: [{ name: 'A', amount: 1 }, { name: 'B', amount: 2 }] }
        const { container } = render(wrap(<UIRender meta={meta} data={data} form />))
        expect(container.querySelector('table')).toBeInTheDocument()
        expect(container.textContent).toContain('Name')
        expect(container.textContent).toContain('A')
    })

    it('renders Checkbox', () => {
        const meta = {
            view: 'Checkbox',
            label: 'Agree',
            value: true,
            onChange: () => {},
        }
        const { container } = render(wrap(<UIRender meta={meta} data={{}} />))
        const input = container.querySelector('input[type="checkbox"]')
        expect(input).toBeInTheDocument()
        expect(input).toBeChecked()
    })

    it('applies className from props to scrollview wrapper', () => {
        const meta = { view: 'Text', children: 'X' }
        const { container } = render(
            wrap(<UIRender meta={meta} data={{}} className="my-render" />)
        )
        expect(container.querySelector('.my-render')).toBeInTheDocument()
    })

    it('passes through Dropdown field with options', () => {
        const meta = {
            view: 'Dropdown',
            name: 'color',
            options: [{ text: 'Red', value: 'red' }, { text: 'Blue', value: 'blue' }],
            mapOptions: { text: 'text', value: 'value' },
        }
        const { container } = render(
            wrap(<UIRender meta={meta} data={{ color: 'red' }} form />)
        )
        expect(container.querySelector('.ui.dropdown')).toBeInTheDocument()
    })

    it('respects showIf to hide a node', () => {
        const meta = {
            view: 'Row',
            items: [
                { view: 'Text', children: 'visible-always' },
                { view: 'Text', children: 'visible-conditionally', showIf: 'cond' },
            ],
        }
        const dataOn = { cond: true }
        const { container: con1 } = render(wrap(<UIRender meta={meta} data={dataOn} />))
        expect(con1.textContent).toContain('visible-conditionally')

        const dataOff = { cond: false }
        const { container: con2 } = render(wrap(<UIRender meta={meta} data={dataOff} />))
        expect(con2.textContent).not.toContain('visible-conditionally')
        expect(con2.textContent).toContain('visible-always')
    })

    it('invokes setState action via button onClick', () => {
        const meta = {
            view: 'Row',
            items: [
                { view: 'Button', label: 'Toggle', onClick: 'setState,toggle' },
                { view: 'Text', children: { name: 'toggle' } },
            ],
        }
        const { container } = render(wrap(<UIRender meta={meta} data={{ toggle: 'initial' }} />))
        const button = container.querySelector('button')
        expect(button).toBeInTheDocument()
    })

    it('renders childBefore/childAfter content', () => {
        const meta = { view: 'Text', children: 'X' }
        const { container } = render(
            wrap(
                <UIRender
                    meta={meta}
                    data={{}}
                    childBefore={<span data-testid="before">Before</span>}
                    childAfter={<span data-testid="after">After</span>}
                />
            )
        )
        expect(container.querySelector('[data-testid="before"]')).toBeInTheDocument()
        expect(container.querySelector('[data-testid="after"]')).toBeInTheDocument()
    })

    it('updates state when data prop changes', () => {
        const meta = { view: 'Text', children: { name: 'foo' } }
        const { container, rerender } = render(
            wrap(<UIRender meta={meta} data={{ foo: 'before' }} />)
        )
        expect(container.textContent).toContain('before')
        rerender(wrap(<UIRender meta={meta} data={{ foo: 'after' }} />))
        expect(container.textContent).toContain('after')
    })

    it('updates state when meta prop changes', () => {
        const { container, rerender } = render(
            wrap(<UIRender meta={{ view: 'Text', children: 'first' }} data={{}} />)
        )
        expect(container.textContent).toContain('first')
        rerender(
            wrap(<UIRender meta={{ view: 'Text', children: 'second' }} data={{}} />)
        )
        expect(container.textContent).toContain('second')
    })

    it('renders translate function results in Text', () => {
        const translate = (s) => s ? s.toUpperCase() : s
        const meta = { view: 'Text', children: 'hello' }
        const { container } = render(
            wrap(<UIRender meta={meta} data={{}} translate={translate} />)
        )
        expect(container.textContent).toContain('HELLO')
    })

    it('passes getFormData callback on mount', () => {
        const getFormData = jest.fn()
        const meta = { view: 'Text', children: 'X' }
        render(wrap(<UIRender meta={meta} data={{}} getFormData={getFormData} />))
        expect(getFormData).toHaveBeenCalled()
    })
})
