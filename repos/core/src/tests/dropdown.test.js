import { fireEvent, render, screen } from '@testing-library/react'
import React from 'react'
import Dropdown from 'ui-react-pack/Dropdown'

// Setup test
beforeEach(() => {
  // jest.useFakeTimers()
})

// Cleanup test
afterEach(() => {
  // jest.runOnlyPendingTimers()
  // jest.useRealTimers()
})

describe(`<${Dropdown.name}/>`, () => {
  const label = 'Dropdown'
  const optionsLabel = 'Dropdown Options'
  const placeholder = 'Select option'
  const text1 = 'Option1'
  const text2 = 'Option2'
  const value1 = 1
  const value2 = 2
  const options = [
    {text: text1, value: value1},
    {text: text2, value: value2},
  ]
  it(`renders 'options' when a list of objects given`, () => {
    render(<Dropdown options={options} lazyLoad={false}/>)
    expect(screen.getByText(text1)).toBeInTheDocument()
    expect(screen.getByText(text2)).toBeInTheDocument()
  })
  it(`renders 'options' when a list of strings given`, () => {
    const list = options.map(o => o.text)
    render(<Dropdown options={list} lazyLoad={false}/>)
    expect(screen.getByText(text1)).toBeInTheDocument()
    expect(screen.getByText(text2)).toBeInTheDocument()
  })
  it(`renders 'options' when a list of numbers given`, () => {
    const list = options.map(o => o.value)
    render(<Dropdown options={list} lazyLoad={false}/>)
    expect(screen.getByText(String(value1))).toBeInTheDocument()
    expect(screen.getByText(String(value2))).toBeInTheDocument()
  })
  it(`renders 'placeholder'`, () => {
    render(<Dropdown options={options} placeholder={placeholder}/>)
    expect(screen.getByText(placeholder)).toBeInTheDocument()
  })
  it(`renders 'error' and 'info'`, () => {
    const error = 'Dropdown Error!'
    const info = 'Dropdown Info!'
    render(<Dropdown options={options} error={error} info={info}/>)
    expect(screen.getByText(error)).toBeInTheDocument()
    expect(screen.getByText(info)).toBeInTheDocument()
  })
  it(`renders 'label' and 'optionsLabel'`, () => {
    render(<Dropdown options={options} label={label} optionsLabel={optionsLabel} lazyLoad={false}/>)
    expect(screen.getByText(label)).toBeInTheDocument()
    expect(screen.getByText(optionsLabel)).toBeInTheDocument()
  })
  it(`applies 'classname' and 'style'`, () => {
    const className = 'padding-h'
    const color = 'red'
    render(<Dropdown options={options} label={label} className={className} style={{color}}/>)
    const dropdown = screen.getByText(label).parentElement
    expect(dropdown).toHaveClass(className)
    expect(dropdown).toHaveStyle(`color: ${color}`)
  })
  test(`'onChange' gets called with correct arguments`, () => {
    let value
    const onChange = (arg) => value = arg
    render(<Dropdown options={options} onChange={onChange} lazyLoad={false}/>)
    fireEvent.click(screen.getByText(text1))
    expect(value).toEqual(value1)
  })
  test(`'options' array values get converted to string values (RGB Colors)`, () => {
    const rgba = [255, 255, 255, 0.5]
    const text = 'Color Option'
    const colors = [{text, value: rgba}]
    let value
    const onChange = (arg) => value = arg
    render(<Dropdown options={colors} onChange={onChange} lazyLoad={false}/>)
    fireEvent.click(screen.getByText(text))
    expect(value).toEqual(String(rgba))
  })
})
