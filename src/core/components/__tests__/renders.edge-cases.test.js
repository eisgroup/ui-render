import React from 'react'
import { render } from '@testing-library/react'
import '@testing-library/jest-dom'
import { ConfigContext, initialConfigState } from '../../contexts/ConfigContext'
import { renderFloat } from '../renders'

const wrap = ui => (
  <ConfigContext.Provider value={initialConfigState}>{ui}</ConfigContext.Provider>
)

describe('renders numeric formatting contracts', () => {
  it('rounds to an integer when renderFloat has no decimals, and trims only when told to', () => {
    // Without `decimals` the value was trimmed to its integer part, which `truncated` is for: 1234.75
    // printed 1,234, where `decimals: 0` printed 1,235.
    const { container } = render(wrap(renderFloat(1234.75)))

    expect(container.firstChild).toHaveTextContent('1,235')
    expect(container.firstChild).not.toHaveTextContent('75')
    expect(container.querySelector('.fade--quarter')).not.toBeInTheDocument()
    expect(render(wrap(renderFloat(1234.75, 0))).container.firstChild).toHaveTextContent('1,235')
    expect(render(wrap(renderFloat(1234.75, undefined, {truncated: true}))).container.firstChild).toHaveTextContent('1,234')
  })

  it('truncates a fraction without rounding and fades it by default', () => {
    const { container } = render(wrap(renderFloat(12.349, 2, {truncated: true})))

    expect(container.firstChild).toHaveTextContent('12.34')
    expect(container.querySelector('.fade--quarter')).toHaveTextContent('.34')
  })

  it('rounds a fraction without fading and forwards remaining Text props', () => {
    const { container, getByTitle } = render(wrap(renderFloat(12.349, 2, {
      faded: false,
      className: 'plain-fraction',
      title: 'Rounded amount'
    })))

    const output = getByTitle('Rounded amount')
    expect(output).toHaveClass('plain-fraction')
    expect(output).toHaveTextContent('12.35')
    expect(container.querySelector('.fade--quarter')).not.toBeInTheDocument()
  })

  it('pads a missing fraction to the requested precision', () => {
    const { container } = render(wrap(renderFloat(7, 3)))

    expect(container.firstChild).toHaveTextContent('7.000')
    expect(container.querySelector('.fade--quarter')).toHaveTextContent('.000')
  })

  it('makes one fraction formatter for a count of decimals, and formats every value with it as before', () => {
    // A count no other test here uses: the formatters are kept for the module's lifetime.
    const made = jest.spyOn(Intl, 'NumberFormat')
    try {
      const values = [0.5, 12.3456, 1234.1, 7, '3.14159']
      const { container } = render(wrap(<>{values.map((value, i) => <div key={i}>{renderFloat(value, 4)}</div>)}</>))
      expect(made).toHaveBeenCalledTimes(1)
      expect(Array.from(container.querySelectorAll('.fade--quarter'), node => node.textContent))
        .toEqual(['.5000', '.3456', '.1000', '.0000', '.1416'])
      expect(Array.from(container.children, node => node.textContent))
        .toEqual(['0.5000', '12.3456', '1,234.1000', '7.0000', '3.1416'])
    } finally {
      made.mockRestore()
    }
  })
})

describe('renderFloat in the locale a host configured', () => {
  const inLocale = (locale, ui) => (
    <ConfigContext.Provider value={{...initialConfigState, locale}}>{ui}</ConfigContext.Provider>
  )

  it('writes the locale\'s grouping and decimal separators, the fraction still faded', () => {
    const { container } = render(inLocale('de-DE', renderFloat(1234567.5, 2)))

    expect(container.firstChild).toHaveTextContent('1.234.567,50')
    expect(container.querySelector('.fade--quarter')).toHaveTextContent(',50')
  })

  it('rounds, truncates and pads as without a locale', () => {
    // Russian groups with a no-break space, U+00A0, which `toHaveTextContent` would read as a space.
    expect(render(inLocale('ru-RU', renderFloat(1234.75))).container.firstChild.textContent).toBe('1 235')
    expect(render(inLocale('de-DE', renderFloat(12.349, 2, {truncated: true}))).container.firstChild).toHaveTextContent('12,34')
    expect(render(inLocale('de-DE', renderFloat(7, 3))).container.firstChild).toHaveTextContent('7,000')
    expect(render(inLocale('de-DE', renderFloat(-1234.5, 1))).container.firstChild).toHaveTextContent('-1.234,5')
  })

  it('shows what it showed without one', () => {
    const { container } = render(inLocale(undefined, renderFloat(1234567.5, 2)))

    expect(container.firstChild).toHaveTextContent(new Intl.NumberFormat().format(1234567) + new Intl.NumberFormat(undefined, {minimumFractionDigits: 2}).format(0.5).slice(1))
  })
})
