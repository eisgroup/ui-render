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
})
