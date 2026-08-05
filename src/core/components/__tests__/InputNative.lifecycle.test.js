import React from 'react'
import { fireEvent, render } from '@testing-library/react'
import '@testing-library/jest-dom'
import InputNative from '../InputNative'

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

    it('does not forward form-only initialValues to the native element', () => {
        const { container } = render(
            <InputNative name="plain" initialValues={{ plain: 'internal' }} />
        )

        expect(container.querySelector('input')).not.toHaveAttribute('initialValues')
    })
})
