import React from 'react'
import { render } from '@testing-library/react'
import '@testing-library/jest-dom'
import { Form } from 'react-final-form'
import arrayMutators from 'final-form-arrays'
// Force form module to fully load before mapper imports that hit the cycle.
import '../../../modules/form/utils'
import '../mapper' // side-effect: registers Render.Component and Render.Method
import Render from '../../../ui-render'
import { FIELD } from '../../../modules/variables'
import { AppContext } from '../../../contexts'
import { ConfigContext, initialConfigState } from '../../../contexts/ConfigContext'

const popup = { setPopupState: jest.fn(), popup: { setPopupState: jest.fn() } }
const wrap = (ui) => (
    <ConfigContext.Provider value={initialConfigState}>
        <AppContext.Provider value={popup}>{ui}</AppContext.Provider>
    </ConfigContext.Provider>
)

const defaultInstance = { state: { currencyCode: undefined } }

function r (meta, data = {}) {
    return render(wrap(Render({ instance: defaultInstance, ...meta, data })))
}

// For views (like TABLE) that internally use FieldArray, the Render() must be inside a Form.
function rForm (meta, data = {}, initialValues = {}) {
    return render(
        wrap(
            <Form
                onSubmit={() => {}}
                mutators={{ ...arrayMutators }}
                initialValues={initialValues}
                render={() => Render({ instance: defaultInstance, ...meta, data })}
            />
        )
    )
}

describe('mapper RenderComponent', () => {
    it('renders View for COL views', () => {
        const { container } = r({ view: FIELD.TYPE.COL, items: [] })
        expect(container.querySelector('.flex--col')).toBeInTheDocument()
    })

    it('renders Row for ROW view', () => {
        const { container } = r({ view: FIELD.TYPE.ROW, items: [] })
        expect(container.querySelector('.flex--row')).toBeInTheDocument()
    })

    it('renders Text for TEXT view', () => {
        const { container } = r({ view: FIELD.TYPE.TEXT, items: [], children: 'hello' })
        expect(container.textContent).toContain('hello')
    })

    it('renders Space for SPACE view', () => {
        const { container } = r({ view: FIELD.TYPE.SPACE, items: [] })
        expect(container.querySelector('.space')).toBeInTheDocument()
    })

    it('renders Button for BUTTON view, using label as children', () => {
        const { container } = r({ view: FIELD.TYPE.BUTTON, items: [], label: 'Save' })
        const button = container.querySelector('button')
        expect(button).toBeInTheDocument()
        expect(button.textContent).toContain('Save')
    })

    it('renders Icon for ICON view', () => {
        const { container } = r({ view: FIELD.TYPE.ICON, items: [], name: 'check' })
        expect(container.querySelector('.icon-check')).toBeInTheDocument()
    })

    it('renders Image for IMAGE view', () => {
        const { container } = r({ view: FIELD.TYPE.IMAGE, items: [], src: '/a.png', alt: 'a' })
        expect(container.querySelector('img')).toBeInTheDocument()
    })

    it('renders Checkbox for CHECKBOX view', () => {
        const { container } = r({ view: FIELD.TYPE.CHECKBOX, items: [], label: 'Agree', onChange: () => {} })
        expect(container.querySelector('input[type="checkbox"]')).toBeInTheDocument()
    })

    it('renders Expand for EXPAND view', () => {
        const { container } = r({ view: FIELD.TYPE.EXPAND, items: [], title: 'More', name: 'x' })
        expect(container.querySelector('.app__expand')).toBeInTheDocument()
    })

    it('renders List for LIST view (gets items from _data)', () => {
        const { container } = r({
            view: FIELD.TYPE.LIST,
            items: [],
            _data: [{ id: 1 }, { id: 2 }],
            renderItem: (item) => <span key={item.id}>{`item:${item.id}`}</span>,
        })
        // List passes items through renderItem
        expect(container.textContent).toContain('item:1')
    })

    it('renders nothing when showIf evaluates to false (string)', () => {
        const { container } = r({
            view: FIELD.TYPE.TEXT,
            items: [],
            showIf: 'missing.path',
        }, { foo: 1 })
        // showIf path is falsy → component returns null. With Render itself returning null,
        // the container should be empty (or only contain whitespace).
        expect(container.textContent.trim()).toBe('')
    })

    it('renders Label for LABEL view', () => {
        const { container } = r({ view: FIELD.TYPE.LABEL, items: [], children: 'Caption' })
        expect(container.querySelector('label')).toHaveTextContent('Caption')
    })

    it('renders Tabs for TABS view', () => {
        const { container } = r({
            view: FIELD.TYPE.TABS,
            items: [
                { tab: 'A', content: 'aaa' },
                { tab: 'B', content: 'bbb' },
            ],
        })
        expect(container.textContent).toContain('A')
        expect(container.textContent).toContain('aaa')
    })

    it('renders TabList for TAB_LIST view', () => {
        const { container } = r(
            {
                view: FIELD.TYPE.TAB_LIST,
                items: [],
                name: 'rows',
                renderLabel: (item) => item.label,
                renderItem: (item) => item.value,
            },
            { rows: [{ label: 'One', value: 'first' }, { label: 'Two', value: 'second' }] }
        )
        expect(container.querySelector('.tabs')).toBeInTheDocument()
        expect(container.textContent).toContain('One')
    })

    it('renders Title (Text with h3 class) for TITLE view', () => {
        const { container } = r({
            view: FIELD.TYPE.TITLE,
            items: [],
            children: 'My Title',
        })
        const text = container.querySelector('.h3')
        expect(text).toBeInTheDocument()
        expect(text.textContent).toContain('My Title')
    })

    it('TEXT view uses label as children when children is absent', () => {
        const { container } = r({
            view: FIELD.TYPE.TEXT,
            items: [],
            label: 'fallback',
        })
        expect(container.textContent).toContain('fallback')
    })

    it('TEXT view renders _data when name is set and no children', () => {
        const { container } = r(
            { view: FIELD.TYPE.TEXT, items: [], name: 'price' },
            { price: 99 }
        )
        expect(container.textContent).toContain('99')
    })

    it('renders Counter for COUNTER view', () => {
        jest.useFakeTimers()
        const { container } = r({
            view: FIELD.TYPE.COUNTER,
            items: [],
            start: 0,
            end: 100,
        })
        expect(container.firstChild).toBeInTheDocument()
        jest.useRealTimers()
    })

    it('renders ExpandList for EXPAND_LIST view', () => {
        const { container } = r({
            view: FIELD.TYPE.EXPAND_LIST,
            items: [],
            _data: [{ id: 1, label: 'X' }],
            renderLabel: (item) => item.label,
            renderItem: (item) => `expanded:${item.label}`,
        })
        expect(container.textContent).toContain('X')
    })

    it('renders ROW_LIST as List with row=true', () => {
        const { container } = r({
            view: FIELD.TYPE.ROW_LIST,
            items: [],
            _data: [{ id: 1 }],
            renderItem: (item) => <span key={item.id}>row{item.id}</span>,
        })
        expect(container.querySelector('.flex--row')).toBeInTheDocument()
    })

    it('Expand auto-derives title from name', () => {
        const { container } = r({
            view: FIELD.TYPE.EXPAND,
            items: [],
            name: 'derived',
        })
        expect(container.textContent).toContain('derived')
    })

    it('showIf with equal: matches → renders', () => {
        const { container } = r({
            view: FIELD.TYPE.TEXT,
            items: [],
            children: 'visible',
            showIf: { name: 'mode', equal: 'on' },
        }, { mode: 'on' })
        expect(container.textContent).toContain('visible')
    })

    it('showIf with equal: mismatches → hides', () => {
        const { container } = r({
            view: FIELD.TYPE.TEXT,
            items: [],
            children: 'visible',
            showIf: { name: 'mode', equal: 'on' },
        }, { mode: 'off' })
        expect(container.textContent.trim()).toBe('')
    })

    it('renders TABLE_CELLS as fragment of Table.Cells', () => {
        const { container } = r({
            view: FIELD.TYPE.TABLE_CELLS,
            items: [
                { view: FIELD.TYPE.TEXT, children: 'cell-1' },
                { view: FIELD.TYPE.TEXT, children: 'cell-2' },
            ],
        })
        expect(container.querySelectorAll('td').length).toBe(2)
        expect(container.textContent).toContain('cell-1')
    })

    it('TOOLTIP path runs without throwing', () => {
        // Semantic-UI Popup uses a portal and may not render trigger synchronously to DOM;
        // verify the mapper branch executes without errors.
        expect(() => r({
            view: FIELD.TYPE.TOOLTIP,
            items: [{ view: FIELD.TYPE.TEXT, children: 'tooltip-target' }],
            label: 'tip',
        })).not.toThrow()
    })

    // Note: the default case renders InputField which requires a Form context, so we test
    // that via the UIRender smoke tests instead.

    it('IMAGE view renders <img>', () => {
        const { container } = r({
            view: FIELD.TYPE.IMAGE,
            items: [],
            src: '/a.png',
            name: 'a.png',
            alt: 'a',
        })
        expect(container.querySelector('img')).toBeInTheDocument()
    })

    it('Button uses label as children when children not given', () => {
        const { container } = r({
            view: FIELD.TYPE.BUTTON,
            items: [],
            label: 'Click me',
        })
        expect(container.querySelector('button').textContent).toContain('Click me')
    })

    it('LIST with no _data renders no items', () => {
        const { container } = r({
            view: FIELD.TYPE.LIST,
            items: [],
            renderItem: () => null,
        })
        // List returns null when items is missing
        expect(container.querySelector('.flex--col, .flex--row')).toBeNull()
    })

    it('renders TABLE with simple items and headers', () => {
        const { container } = rForm(
            {
                view: FIELD.TYPE.TABLE,
                items: [],
                name: 'rows',
                headers: [{ id: 'name' }, { id: 'amount' }],
            },
            { rows: [{ name: 'A', amount: 1 }, { name: 'B', amount: 2 }] }
        )
        expect(container.querySelector('table')).toBeInTheDocument()
        expect(container.textContent).toContain('A')
    })

    it('renders TABLE with extraItems appended to data', () => {
        const { container } = rForm(
            {
                view: FIELD.TYPE.TABLE,
                items: [],
                name: 'rows',
                headers: [{ id: 'name' }],
                extraItems: [{ name: 'extra' }],
            },
            { rows: [{ name: 'a' }] }
        )
        expect(container.textContent).toContain('extra')
    })

    it('renders TABLE with group config to build matrix headers', () => {
        const data = {
            rows: [
                { period: 'Jan', region: 'EU', value: 1 },
                { period: 'Jan', region: 'US', value: 2 },
                { period: 'Feb', region: 'EU', value: 3 },
                { period: 'Feb', region: 'US', value: 4 },
            ],
        }
        const meta = {
            view: FIELD.TYPE.TABLE,
            items: [],
            name: 'rows',
            headers: [{ id: 'value', label: 'Value' }],
            group: {
                by: { id: 'region' },
                header: { id: 'period', label: 'Period' },
            },
        }
        const { container } = rForm(meta, data)
        expect(container.querySelector('table')).toBeInTheDocument()
    })

    it('renders DROPDOWN view via default branch', () => {
        const { container } = r({
            view: FIELD.TYPE.DROPDOWN,
            items: [],
            name: 'fruit',
            options: [
                { text: 'A', value: 'a' },
                { text: 'B', value: 'b' },
            ],
        })
        expect(container.querySelector('.ui.dropdown')).toBeInTheDocument()
    })
})

describe('mapper Render.Method', () => {
    it('renders CURRENCY values with symbol', () => {
        const fn = Render.Method(FIELD.RENDER.CURRENCY)
        const out = fn(123.45, 0, { decimals: 2 })
        expect(React.isValidElement(out)).toBe(true)
    })

    it('renders PERCENT values', () => {
        const fn = Render.Method(FIELD.RENDER.PERCENT)
        const out = fn(0.5, 0, { decimals: 0 })
        expect(React.isValidElement(out)).toBe(true)
    })

    it('renders FLOAT values', () => {
        const fn = Render.Method(FIELD.RENDER.FLOAT)
        const out = fn(1.5, 0, { decimals: 2 })
        expect(React.isValidElement(out)).toBe(true)
    })

    it('renders DOUBLE5 values', () => {
        const fn = Render.Method(FIELD.RENDER.DOUBLE5)
        expect(React.isValidElement(fn(1.123456789, 0))).toBe(true)
    })

    it('returns null for non-numeric CURRENCY input', () => {
        const fn = Render.Method(FIELD.RENDER.CURRENCY)
        expect(fn('abc', 0)).toBeNull()
    })

    it('renders STRING values', () => {
        const fn = Render.Method(FIELD.RENDER.STRING)
        const out = fn('hello')
        expect(React.isValidElement(out)).toBe(true)
    })

    it('renders DATE values when valid', () => {
        const fn = Render.Method(FIELD.RENDER.DATE)
        const out = fn('2024-01-15')
        expect(React.isValidElement(out)).toBe(true)
    })

    it('renders DATE values as null for empty input', () => {
        const fn = Render.Method(FIELD.RENDER.DATE)
        expect(fn('')).toBeNull()
        expect(fn(null)).toBeNull()
    })

    it('renders TITLE_n_INPUT values', () => {
        const fn = Render.Method(FIELD.RENDER.TITLE_n_INPUT)
        expect(React.isValidElement(fn('x'))).toBe(true)
    })

    it('falls back to Text for unknown renderer name', () => {
        const fn = Render.Method('Unknown')
        expect(React.isValidElement(fn('x'))).toBe(true)
    })
})
