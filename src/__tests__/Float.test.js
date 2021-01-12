import { render, screen } from '@testing-library/react'
import React from 'react'
import { Float } from '../Float'

// Setup test
beforeEach(() => {
  // jest.useFakeTimers()
})

// Cleanup test
afterEach(() => {
  // jest.runOnlyPendingTimers()
  // jest.useRealTimers()
})

describe(`<${Float.name}/>`, () => {
  it(`rounds down number to given decimals`, () => {
    render(<Float value={0.123451} decimals={5}/>)
    expect(screen.getByText('0')).toBeInTheDocument()
    expect(screen.getByText('.12345')).toBeInTheDocument()
  })
  it(`rounds up number to given decimals`, () => {
    render(<Float value={0.123456} decimals={5}/>)
    expect(screen.getByText('0')).toBeInTheDocument()
    expect(screen.getByText('.12346')).toBeInTheDocument()
  })
  it(`rounds to integer with 0 decimals`, () => {
    render(<Float value={0.123456} decimals={0}/>)
    expect(screen.getByText('0')).toBeInTheDocument()
    expect(screen.queryByText('.12345')).toBeNull()
  })
  it(`rounds up integer when float rounds up to whole number`, () => {
    render(<Float value={0.9999999} decimals={3}/>)
    expect(screen.getByText('1')).toBeInTheDocument()
    expect(screen.getByText('.000')).toBeInTheDocument()
    expect(screen.queryByText('0')).toBeNull()
  })
  it(`pads fraction part to fixed decimals length`, () => {
    render(<Float value={0.99} decimals={3}/>)
    expect(screen.getByText('0')).toBeInTheDocument()
    expect(screen.getByText('.990')).toBeInTheDocument()
  })
  it(`pads fraction part to fixed decimals length with 'truncated' option`, () => {
    render(<Float value={0.99} decimals={3} truncated/>)
    expect(screen.getByText('0')).toBeInTheDocument()
    expect(screen.getByText('.990')).toBeInTheDocument()
  })
  it(`truncates fraction without rounding`, () => {
    render(<Float value={0.9999999} decimals={3} truncated/>)
    expect(screen.getByText('0')).toBeInTheDocument()
    expect(screen.getByText('.999')).toBeInTheDocument()
  })
})
