import React from 'react'
import { fireEvent, render } from '@testing-library/react'
import '@testing-library/jest-dom'
import { Input } from '../Input'
import { ConfigContext, initialConfigState } from '../../contexts/ConfigContext'

const wrap = ui => (
    <ConfigContext.Provider value={initialConfigState}>{ui}</ConfigContext.Provider>
)

const getInput = container => container.querySelector('input')
const getStickyPlaceholder = container => (
    container.querySelector('.input__unit[aria-hidden="true"]')
)

describe('Input hidden field contracts', () => {
    it('preserves identity, disabled state, form ownership and its submitted value', () => {
        const { container, rerender } = render(wrap(
            <>
                <form id="checkout" />
                <Input
                    type="hidden"
                    name="csrfToken"
                    id="csrf-token"
                    disabled
                    form="checkout"
                    value="old-token"
                    onChange={() => {}}
                    data-kind="security"
                />
            </>
        ))
        const input = getInput(container)

        expect(input).toHaveAttribute('name', 'csrfToken')
        expect(input).toHaveAttribute('id', 'csrf-token')
        expect(input).toBeDisabled()
        expect(input).toHaveAttribute('form', 'checkout')
        expect(input).toHaveAttribute('data-kind', 'security')

        rerender(wrap(
            <>
                <form id="checkout" />
                <Input
                    type="hidden"
                    name="csrfToken"
                    id="csrf-token"
                    form="checkout"
                    value="old-token"
                    onChange={() => {}}
                    data-kind="security"
                />
            </>
        ))
        expect(new FormData(container.querySelector('form')).get('csrfToken')).toBe('old-token')
    })

    it('uses the field name as the default id', () => {
        const { container } = render(wrap(<Input type="hidden" name="sessionId" />))

        expect(getInput(container)).toHaveAttribute('id', 'sessionId')
    })
})

describe('Input sticky placeholder contracts', () => {
    it('supports an uncontrolled default value', () => {
        const { container } = render(wrap(
            <Input name="code" defaultValue="AB" stickyPlaceholder placeholder="ABCDE" />
        ))

        expect(getStickyPlaceholder(container)).toHaveTextContent('ABCDE')
        expect(getInput(container)).toHaveValue('AB')
    })

    it.each([
        [0, '000', '000'],
        [12, '12345', '12345'],
        ['XY', 'XYZ', 'XYZ'],
    ])('uses the string length of value %p', (value, placeholder, expected) => {
        const { container } = render(wrap(
            <Input
                name="value"
                value={value}
                onChange={() => {}}
                stickyPlaceholder
                placeholder={placeholder}
            />
        ))

        expect(getStickyPlaceholder(container).textContent).toBe(expected)
    })

    it('tracks controlled value changes and disappears for an empty value', () => {
        const onChange = jest.fn()
        const { container, rerender } = render(wrap(
            <Input
                name="code"
                value="A"
                onChange={onChange}
                stickyPlaceholder
                placeholder="ABCD"
            />
        ))

        expect(getStickyPlaceholder(container).textContent).toBe('ABCD')

        rerender(wrap(
            <Input
                name="code"
                value="ABC"
                onChange={onChange}
                stickyPlaceholder
                placeholder="ABCD"
            />
        ))
        expect(getStickyPlaceholder(container).textContent).toBe('ABCD')

        rerender(wrap(
            <Input
                name="code"
                value=""
                onChange={onChange}
                stickyPlaceholder
                placeholder="ABCD"
            />
        ))
        expect(getStickyPlaceholder(container)).not.toBeInTheDocument()
    })
})

describe('Input interaction and presentation contracts', () => {
    it('activates for autofocus and follows focus and blur callbacks', () => {
        // Record what each callback observed instead of asserting on a retained event: React 16
        // returns the SyntheticEvent to its pool once the handler returns and nulls every field on
        // it, so a retained event asserts nothing on the declared peer floor. The event types and
        // the callback counts below are identical on 16, 17, 18 and 19.
        const focusEvents = []
        const blurEvents = []
        const onFocus = event => { focusEvents.push(event.type) }
        const onBlur = event => { blurEvents.push(event.type) }
        const { container } = render(wrap(
            <Input name="search" autofocus onFocus={onFocus} onBlur={onBlur} />
        ))
        const input = getInput(container)

        expect(input).toHaveFocus()
        expect(container.querySelector('.input')).toHaveClass('active')
        expect(focusEvents).toEqual(['focus'])

        fireEvent.blur(input)
        expect(blurEvents).toEqual(['blur'])
        expect(container.querySelector('.input')).not.toHaveClass('active')

        fireEvent.focus(input)
        expect(focusEvents).toEqual(['focus', 'focus'])
        expect(container.querySelector('.input')).toHaveClass('active')
    })

    it('translates a title on the input when there is no label', () => {
        const translate = jest.fn(value => value && `translated:${value}`)
        const { container } = render(wrap(
            <Input
                name="search"
                title="Search hint"
                placeholder="Search"
                translate={translate}
            />
        ))

        expect(getInput(container)).toHaveAttribute('title', 'translated:Search hint')
        expect(getInput(container)).toHaveAttribute('placeholder', 'translated:Search')
    })

    it('translates label text and title without duplicating the title on the input', () => {
        const translate = value => value && `translated:${value}`
        const { container } = render(wrap(
            <Input name="email" label="Email" title="Email hint" translate={translate} />
        ))
        const label = container.querySelector('label')

        expect(label).toHaveTextContent('translated:Email')
        expect(label).toHaveAttribute('title', 'translated:Email hint')
        expect(getInput(container)).not.toHaveAttribute('title')
    })

    it('wires string icons and preserves custom icon elements', () => {
        const onClickIcon = jest.fn()
        const { container, rerender } = render(wrap(
            <Input
                name="search"
                icon="search"
                classNameIcon="search-action"
                onClickIcon={onClickIcon}
            />
        ))

        fireEvent.click(container.querySelector('.icon-search'))
        expect(onClickIcon).toHaveBeenCalledTimes(1)
        expect(container.querySelector('.icon-search')).toHaveClass('search-action', 'pointer')

        const customClick = jest.fn()
        rerender(wrap(
            <Input
                name="search"
                icon={<button data-testid="custom-icon" onClick={customClick}>Find</button>}
                lefty
            />
        ))
        const row = container.querySelector('.input.lefty')
        const customIcon = container.querySelector('[data-testid="custom-icon"]')

        expect(row.firstElementChild).toBe(customIcon)
        fireEvent.click(customIcon)
        expect(customClick).toHaveBeenCalledTimes(1)

        rerender(wrap(
            <Input
                name="search"
                icon={<button data-testid="custom-icon" onClick={customClick}>Find</button>}
            />
        ))
        expect(container.querySelector('.input').lastElementChild).toBe(
            container.querySelector('[data-testid="custom-icon"]')
        )
    })

    it('keeps checkbox semantics and renders its label after the control', () => {
        const onChange = jest.fn()
        const { container } = render(wrap(
            <Input
                type="checkbox"
                name="accepted"
                label="Accepted"
                value={false}
                onChange={onChange}
            />
        ))
        const input = getInput(container)
        const row = container.querySelector('.input')

        expect(row.firstElementChild).toBe(input)
        expect(row.lastElementChild).toBe(container.querySelector('label'))
        expect(input).not.toBeChecked()

        fireEvent.click(input)
        expect(onChange).toHaveBeenCalledWith(true, 'accepted', expect.anything())
    })

    it('derives a float label and keeps the CSS placeholder sentinel', () => {
        const { container } = render(wrap(<Input name="accountName" float />))

        expect(container.querySelector('.input--wrapper')).toHaveClass('float')
        expect(container.querySelector('label')).toHaveTextContent('Accountname')
        expect(getInput(container)).toHaveAttribute('placeholder', ' ')
        expect(container.querySelector('.input').lastElementChild).toBe(container.querySelector('label'))
    })

    it('preserves explicit float props and an explicit incomplete state', () => {
        const { container } = render(wrap(
            <Input
                name="accountName"
                float
                label="Account"
                placeholder="Account ID"
                value="ABC"
                onChange={() => {}}
                done={false}
            />
        ))

        expect(container.querySelector('label')).toHaveTextContent('Account')
        expect(getInput(container)).toHaveAttribute('placeholder', 'Account ID')
        expect(container.querySelector('.input--wrapper')).not.toHaveClass('done')
    })

    it('uses an explicit id as the remove callback fallback', () => {
        const onRemove = jest.fn()
        const { container } = render(wrap(
            <Input id="standalone" label="Standalone" onRemove={onRemove} />
        ))

        fireEvent.click(container.querySelector('.input__delete'))
        expect(onRemove).toHaveBeenCalledWith('standalone')
    })

    it('sets the safe default maximum on date inputs', () => {
        const { container } = render(wrap(<Input name="expires" type="date" />))

        expect(getInput(container)).toHaveAttribute('max', '9999-01-01')
    })
})
