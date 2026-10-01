import React from 'react'
import { render } from '@testing-library/react'
import '@testing-library/jest-dom'
import { ConfigContext, initialConfigState } from '../../contexts/ConfigContext'
import { renderFloat } from '../renders'

const wrap = ui => (
  <ConfigContext.Provider value={initialConfigState}>{ui}</ConfigContext.Provider>
)

describe('renders numeric formatting contracts', () => {
  it('renders only the integer part when renderFloat has no decimals or props', () => {
    const { container } = render(wrap(renderFloat(1234.75)))

    expect(container.firstChild).toHaveTextContent('1,234')
    expect(container.firstChild).not.toHaveTextContent('75')
    expect(container.querySelector('.fade--quarter')).not.toBeInTheDocument()
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
