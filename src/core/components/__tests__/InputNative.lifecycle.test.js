import React from 'react'
import { act, fireEvent, render } from '@testing-library/react'
import '@testing-library/jest-dom'
import InputNative from '../InputNative'
import * as domProps from '../domProps'

describe('InputNative lifecycle contracts', () => {
    it('sizes a compact input on mount and exposes the mounted element', () => {
        const onMount = jest.fn()
        const { container } = render(
            <InputNative name="code" compact={2} defaultValue="AB" onMount={onMount} />
        )
        const input = container.querySelector('input')

        expect(input).toHaveStyle({
            width: '4ch',
            boxSizing: 'content-box',
            transition: '200ms',
        })
        expect(onMount).toHaveBeenCalledWith(input)
    })

    it('resizes controlled compact values, including zero and an empty value', () => {
        const { container, rerender } = render(
            <InputNative name="amount" compact value="123" onChange={() => {}} />
        )
        const input = container.querySelector('input')
        expect(input).toHaveStyle({ width: '4ch' })

        rerender(<InputNative name="amount" compact value={0} onChange={() => {}} />)
        expect(input).toHaveStyle({ width: '2ch' })

        rerender(<InputNative name="amount" compact value="" onChange={() => {}} />)
        expect(input).toHaveStyle({ width: '1ch' })
    })

    it('can enable compact sizing after the input has already mounted', () => {
        const { container, rerender } = render(
            <InputNative name="reference" value="ABC" onChange={() => {}} />
        )

        expect(() => {
            rerender(<InputNative name="reference" compact={3} value="ABC" onChange={() => {}} />)
        }).not.toThrow()
        expect(container.querySelector('input')).toHaveStyle({ width: '6ch' })
    })

    it('recalculates compact width when only the offset changes', () => {
        const { container, rerender } = render(
            <InputNative name="reference" compact={1} value="ABC" onChange={() => {}} />
        )
        const input = container.querySelector('input')
        expect(input).toHaveStyle({ width: '4ch' })

        rerender(<InputNative name="reference" compact={4} value="ABC" onChange={() => {}} />)
        expect(input).toHaveStyle({ width: '7ch' })
    })

    it('updates the visual color when a controlled color value changes', () => {
        const { container, rerender } = render(
            <InputNative name="color" type="color" value="#112233" onChange={() => {}} />
        )
        const input = container.querySelector('input')
        expect(input).toHaveStyle({ backgroundColor: '#112233' })

        rerender(<InputNative name="color" type="color" value="#abcdef" onChange={() => {}} />)
        expect(input).toHaveStyle({ backgroundColor: '#abcdef' })
    })

    it('honors an explicit checkbox checked state instead of its fallback value', () => {
        const { container } = render(
            <InputNative
                name="enabled"
                type="checkbox"
                value
                checked={false}
                onChange={() => {}}
            />
        )

        expect(container.querySelector('input')).not.toBeChecked()
    })

    it('keeps explicit textarea rows and forwards non-Enter keyup events', () => {
        const onKeyUp = jest.fn()
        const { container } = render(
            <InputNative name="notes" resize rows={4} onKeyUp={onKeyUp} />
        )
        const textarea = container.querySelector('textarea')

        expect(textarea).toHaveAttribute('rows', '4')
        fireEvent.keyUp(textarea, { key: 'a', code: 'KeyA' })
        expect(onKeyUp).toHaveBeenCalledTimes(1)
    })

    it('calls onMount once, however often the input renders', () => {
        // The ref callbacks keep one identity; a new one on every render would run on every render.
        const onMount = jest.fn()
        const { rerender } = render(<InputNative name="a" compact value="AB" onMount={onMount} onChange={() => {}} />)
        rerender(<InputNative name="a" compact value="ABC" onMount={onMount} onChange={() => {}} />)
        rerender(<InputNative name="a" compact={3} value="ABC" onMount={onMount} onChange={() => {}} />)

        expect(onMount).toHaveBeenCalledTimes(1)
    })

    it('does not render again for a parent render with equal props', () => {
        // Counted through the DOM boundary filter, which every render of it runs once.
        const onChange = () => {}
        let rerenderParent
        const Parent = () => {
            const [, setCount] = React.useState(0)
            rerenderParent = () => setCount(count => count + 1)
            return <InputNative name="e" value="x" onChange={onChange} />
        }
        const filter = jest.spyOn(domProps, 'omitProps')
        try {
            render(<Parent />)
            const renders = filter.mock.calls.length
            act(() => rerenderParent())
            expect(filter.mock.calls.length).toBe(renders)
        } finally {
            filter.mockRestore()
        }
    })

    it('resizes a compact input as it is typed into and its parent echoes the value', () => {
        const Parent = () => {
            const [value, setValue] = React.useState('A')
            return <InputNative name="typed" compact value={value} onChange={next => setValue(next)} />
        }
        const { container } = render(<Parent />)
        const input = container.querySelector('input')
        expect(input).toHaveStyle({ width: '2ch' })

        fireEvent.change(input, { target: { value: 'ABCDE' } })
        expect(input).toHaveStyle({ width: '6ch' })
    })

    it('sizes an uncontrolled compact input to what was typed when only the offset changes', () => {
        const { container, rerender } = render(<InputNative name="free" compact={1} defaultValue="AB" />)
        const input = container.querySelector('input')
        fireEvent.change(input, { target: { value: 'ABCDE' } })

        rerender(<InputNative name="free" compact={3} defaultValue="AB" />)
        expect(input).toHaveStyle({ width: '8ch' })
    })

    it('keeps the picked background of an uncontrolled color input across renders', () => {
        const { container, rerender } = render(
            <InputNative name="picked" type="color" defaultValue="#123456" onChange={() => {}} />
        )
        const input = container.querySelector('input')
        fireEvent.change(input, { target: { value: '#654321' } })

        rerender(<InputNative name="picked" type="color" defaultValue="#123456" onChange={() => {}} className="again" />)
        expect(input).toHaveStyle({ backgroundColor: '#654321' })
    })

    it('colors an input that becomes a color input after it mounted', () => {
        const { container, rerender } = render(<InputNative name="later" value="#0000ff" onChange={() => {}} />)

        rerender(<InputNative name="later" type="color" value="#0000ff" onChange={() => {}} />)
        expect(container.querySelector('input')).toHaveStyle({ backgroundColor: '#0000ff' })
    })

    it('reports a change through the onChange of the latest render', () => {
        const first = jest.fn()
        const second = jest.fn()
        const { container, rerender } = render(<InputNative name="latest" onChange={first} />)
        rerender(<InputNative name="latest" onChange={second} />)

        fireEvent.change(container.querySelector('input'), { target: { value: 'typed' } })
        expect(first).not.toHaveBeenCalled()
        expect(second).toHaveBeenCalledWith('typed', 'latest', expect.anything())
    })

    it('renders under StrictMode without a warning', () => {
        // The class drew React's StrictMode warning about `UNSAFE_componentWillReceiveProps`.
        const errors = jest.spyOn(console, 'error').mockImplementation(() => {})
        try {
            render(<React.StrictMode><InputNative name="strict" compact value="AB" onChange={() => {}} /></React.StrictMode>)
            expect(errors).not.toHaveBeenCalled()
        } finally {
            errors.mockRestore()
        }
    })

    it('does not forward form-only initialValues to the native element', () => {
        const { container } = render(
            <InputNative name="plain" initialValues={{ plain: 'internal' }} />
        )

        expect(container.querySelector('input')).not.toHaveAttribute('initialValues')
    })
})
