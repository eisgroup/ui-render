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
