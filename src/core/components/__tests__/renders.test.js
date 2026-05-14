import React from 'react'
import { render } from '@testing-library/react'
import '@testing-library/jest-dom'
import {
    noSpellCheck,
    colorDropdownOptions,
    languageDropdownOptions,
    colorDropdownChoice,
    renderCurrency,
    renderFloat,
    renderFloatShort,
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

describe('colorDropdownOptions', () => {
    it('returns options indexed by language code', () => {
        const ACTIVE = { LANG: { _: 'en' } }
        const opts = colorDropdownOptions(
            { RED: { _: '255,0,0', en: 'Red' } },
            ACTIVE,
        )
        expect(opts.en[0].text).toBe('Red')
        expect(opts.en[0].value).toBe('255,0,0')
        expect(opts.items).toBe(opts.en)
    })
})

describe('languageDropdownOptions', () => {
    it('returns searchable text by default', () => {
        const langDef = { ENGLISH: { _: 'en', lang: 'English', en: 'English' } }
        const opts = languageDropdownOptions(langDef)
        expect(opts.en[0].text).toContain('English')
        expect(opts.en[0].value).toBe('en')
    })
    it('returns selection-style label when requested', () => {
        const langDef = { ENGLISH: { _: 'en', lang: 'English', en: 'English' } }
        const opts = languageDropdownOptions(langDef, { selection: true })
        // selection mode replaces text with a React element
        expect(React.isValidElement(opts.en[0].text)).toBe(true)
    })
})

describe('colorDropdownChoice', () => {
    it('wraps the option content in a React element', () => {
        const out = colorDropdownChoice({ value: '255,0,0', text: 'Red' })
        expect(React.isValidElement(out.content)).toBe(true)
    })
})

describe('renderCurrency / renderFloat / renderFloatShort', () => {
    it('renderCurrency renders an element', () => {
        const { container } = render(wrap(renderCurrency(1234.5, 2)))
        expect(container.textContent).toContain('1,234')
    })
    it('renderFloat with decimals prints a faded fraction part', () => {
        const { container } = render(wrap(renderFloat(1.23, 2)))
        expect(container.textContent).toContain('1')
    })
    it('renderFloatShort returns a Text element', () => {
        const out = renderFloatShort(1500)
        expect(React.isValidElement(out)).toBe(true)
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
