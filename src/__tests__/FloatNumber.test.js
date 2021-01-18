import { render, screen } from '@testing-library/react'
import React from 'react'
import { FloatNumber } from '../FloatNumber'

// Setup test
beforeEach(() => {
  // jest.useFakeTimers()
})

// Cleanup test
afterEach(() => {
  // jest.runOnlyPendingTimers()
  // jest.useRealTimers()
})

describe(`<${FloatNumber.name}/>`, () => {
  it(`rounds down number to given decimals`, () => {
    render(<FloatNumber value={0.123451} decimals={5}/>)
    expect(screen.getByText('0')).toBeInTheDocument()
    expect(screen.getByText('.12345')).toBeInTheDocument()
  })
  it(`rounds up number to given decimals`, () => {
    render(<FloatNumber value={0.123456} decimals={5}/>)
    expect(screen.getByText('0')).toBeInTheDocument()
    expect(screen.getByText('.12346')).toBeInTheDocument()
  })
  it(`rounds to integer with 0 decimals`, () => {
    render(<FloatNumber value={0.123456} decimals={0}/>)
    expect(screen.getByText('0')).toBeInTheDocument()
    expect(screen.queryByText('.12345')).toBeNull()
  })
  it(`rounds up integer when float rounds up to whole number`, () => {
    render(<FloatNumber value={0.9999999} decimals={3}/>)
    expect(screen.getByText('1')).toBeInTheDocument()
    expect(screen.getByText('.000')).toBeInTheDocument()
    expect(screen.queryByText('0')).toBeNull()
  })
  it(`pads fraction part to fixed decimals length`, () => {
    render(<FloatNumber value={0.99} decimals={3}/>)
    expect(screen.getByText('0')).toBeInTheDocument()
    expect(screen.getByText('.990')).toBeInTheDocument()
  })
  it(`pads fraction part to fixed decimals length with 'truncated' option`, () => {
    render(<FloatNumber value={0.99} decimals={3} truncated/>)
    expect(screen.getByText('0')).toBeInTheDocument()
    expect(screen.getByText('.990')).toBeInTheDocument()
  })
  it(`truncates fraction without rounding`, () => {
    render(<FloatNumber value={0.9999999} decimals={3} truncated/>)
    expect(screen.getByText('0')).toBeInTheDocument()
    expect(screen.getByText('.999')).toBeInTheDocument()
  })
  it(`renders as whole text without faded fractions`, () => {
    render(<FloatNumber value={0.123451} decimals={5} faded={false}/>)
    expect(screen.queryByText('0')).toBeNull()
    expect(screen.queryByText('.12345')).toBeNull()
    expect(screen.getByText('0.12345')).toBeInTheDocument()
  })
})
