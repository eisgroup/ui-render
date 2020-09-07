import { fireEvent, render, screen } from '@testing-library/react'
import React from 'react'
import Input from 'react-ui-pack/Input'
import { withMarkup } from '../common/utils/tests'

// Setup test
beforeEach(() => {
  // jest.useFakeTimers()
})

// Cleanup test
afterEach(() => {
  // jest.runOnlyPendingTimers()
  // jest.useRealTimers()
})

describe(`<${Input.name}/>`, () => {
  const label = 'Input Label'
  const placeholder = 'Select option'
  const value1 = 1
  it(`renders 'placeholder'`, () => {
    render(<Input placeholder={placeholder}/>)
    expect(screen.getByPlaceholderText(placeholder)).toBeInTheDocument()
  })
  it(`renders 'error' and 'info'`, () => {
    const error = 'Input Error!'
    const info = 'Input Info!'
    render(<Input error={error} info={info}/>)
    expect(screen.getByText(error)).toBeInTheDocument()
    expect(screen.getByText(info)).toBeInTheDocument()
  })
  it(`renders 'label'`, () => {
    render(<Input label={label}/>)
    expect(screen.getByText(label)).toBeInTheDocument()
  })
  it(`applies 'classname' and 'style'`, () => {
    const className = 'padding-h'
    const color = 'red'
    render(<Input label={label} className={className} style={{color}}/>)
    const input = screen.getByText(label).parentElement
    expect(input).toHaveClass(className)
    expect(input).toHaveStyle(`color: ${color}`)
  })
  test(`'onChange' gets called with correct arguments`, () => {
    let value
    const onChange = (arg) => value = arg
    render(<Input onChange={onChange} placeholder={placeholder}/>)
    fireEvent.change(screen.getByPlaceholderText(placeholder), {target: {value: value1}})
    expect(value).toEqual(String(value1))
  })
  it.skip(`renders 'unit' when input has value`, () => {
    const unit = '$'
    const unitValue = `${value1} ${unit}`
    render(<Input placeholder={placeholder} unit={unit}/>)
    // todo: find out why this isn't working
    const getByTextWithMarkup = withMarkup(screen.getByText)
    // expect(getByTextWithMarkup(unitValue)).toBeInTheDocument()
    fireEvent.change(screen.getByPlaceholderText(placeholder), {target: {value: value1}})
    console.warn('test', getByTextWithMarkup(unitValue))
  })
})
