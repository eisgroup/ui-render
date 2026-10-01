import React from 'react'
import { render } from '@testing-library/react'
import '@testing-library/jest-dom'
import {
    noSpellCheck,
    renderFloat,
    renderSort,
    resizeToContent,
    toTextHeightFunc,
} from '../renders'
import { ConfigContext, initialConfigState } from '../../contexts/ConfigContext'

const wrap = (ui) => (
    <ConfigContext.Provider value={initialConfigState}>{ui}</ConfigContext.Provider>
)

describe('noSpellCheck', () => {
    it('exposes the expected attribute set', () => {
        expect(noSpellCheck.autoComplete).toBe('off')
        expect(noSpellCheck.spellCheck).toBe(false)
    })
})

describe('renderFloat', () => {
    it('renderFloat with decimals prints a faded fraction part', () => {
        const { container } = render(wrap(renderFloat(1.23, 2)))
        expect(container.textContent).toContain('1')
    })
})

describe('renderSort', () => {
    it('returns an Icon element', () => {
        const out = renderSort({ id: 1, order: 1 })
        expect(React.isValidElement(out)).toBe(true)
    })
    it('wires up onClick callback', () => {
        const onClick = jest.fn()
        const { container } = render(renderSort({ id: 7, order: 1 }, { onClick }))
        container.querySelector('i').click()
        expect(onClick).toHaveBeenCalledWith({ id: 7, order: 1 })
    })
})

describe('resizeToContent', () => {
    it('writes width to the style object in ch units', () => {
        const style = {}
        resizeToContent('hello', style, 1)
        expect(style.width).toBe('6ch')
        expect(style.boxSizing).toBe('content-box')
        expect(style.transition).toBe('200ms')
    })
    it('keeps existing transition', () => {
        const style = { transition: 'all 1s' }
        resizeToContent('a', style)
        expect(style.transition).toBe('all 1s')
    })
})

describe('toTextHeightFunc', () => {
    it('does nothing if event has no target', () => {
        expect(() => toTextHeightFunc({})).not.toThrow()
    })
    it('resizes target height based on scrollHeight', () => {
        const target = document.createElement('textarea')
        Object.defineProperty(target, 'scrollHeight', { value: 80, configurable: true })
        target.style.borderTopWidth = '1px'
        target.style.borderBottomWidth = '1px'
        document.body.appendChild(target)
        toTextHeightFunc({ target })
        expect(target.style.height).toMatch(/px$/)
        document.body.removeChild(target)
    })
})
